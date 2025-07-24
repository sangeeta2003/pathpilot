const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const DSAProblem = require('../models/DSAProblem');

const upload = multer({ dest: 'uploads/' });

// @route   POST /api/resume/upload
// @desc    Upload a resume (PDF), parse and return text + recommended DSA problems
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = path.join(__dirname, '..', req.file.path);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    fs.unlinkSync(filePath); // Clean up uploaded file
    const resumeText = data.text;

    // Use OpenAI/OpenRouter to extract weak/missing DSA topics
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    let apiKey = openaiKey || openrouterKey;
    let apiUrl = '';
    let model = 'gpt-3.5-turbo';
    const isOpenRouterKey = (key) => key && key.startsWith('sk-or-');
    if (isOpenRouterKey(apiKey)) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      model = 'openai/gpt-3.5-turbo';
    } else if (apiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-3.5-turbo';
    } else {
      throw new Error('No API key found for OpenAI or OpenRouter');
    }

    const prompt = `Given the following resume, list 3-5 DSA (Data Structures & Algorithms) topics the candidate should focus on to improve their coding interview skills. Only output a JSON array of topic strings.\nResume:\n${resumeText}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a career coach and DSA expert.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
      }),
    });
    const aiData = await response.json();
    let topics = [];
    try {
      let content = aiData.choices[0].message.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      }
      topics = JSON.parse(content);
    } catch {
      topics = [];
    }

    // Query DSAProblem for recommended problems by tag
    let recommendedProblems = [];
    if (topics.length > 0) {
      recommendedProblems = await DSAProblem.find({ tags: { $in: topics.map(t => new RegExp(t, 'i')) } })
        .select('title difficulty tags');
    }

    res.json({ text: resumeText, recommendedProblems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to parse resume', error: err.message });
  }
});

module.exports = router; 