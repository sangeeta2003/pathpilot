const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// AI Chatbot endpoint (OpenRouter)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Please enter a message." });
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't process your request.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
});

// Generate AI mock interview questions from uploaded resume or saved resume data (OpenRouter)
router.post('/mockinterview', auth, upload.single('resume'), async (req, res) => {
  try {
    let resumeData = null;
    if (req.file) {
      // Placeholder: parse the uploaded resume file (PDF/DOCX)
      resumeData = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '2 years at Example Corp',
        education: 'B.Tech in Computer Science',
      };
    } else {
      // Use saved resume data
      const user = await User.findById(req.user);
      resumeData = user.resumeData;
      if (!resumeData) return res.status(400).json({ message: 'No resume data found. Please scan your resume first.' });
    }
    const prompt = `You are an expert technical interviewer. Based on this candidate's resume: ${JSON.stringify(resumeData)}, generate 5 personalized technical and behavioral interview questions.`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      return res.status(500).json({ message: 'Malformed OpenRouter response', raw: data });
    }
    const raw = data.choices[0].message.content;
    const questions = raw
      .split('\n')
      .filter(q => q.trim())
      .map(q => q.replace(/^[0-9]+[.)]?\s*/, '').trim());
    if (!questions.length) {
      return res.status(500).json({ message: 'No questions generated from OpenRouter response', raw });
    }
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate mock interview questions', error: err.message });
  }
});

// AI feedback for a user's answer to a mock interview question (OpenRouter)
router.post('/interview-feedback', auth, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required.' });
    }
    const prompt = `You are an expert interview coach. Here is a question: "${question}". Here is the candidate's answer: "${answer}". Give constructive, specific feedback and suggestions for improvement.`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't process your request.";
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate feedback.', error: err.message });
  }
});

// @route   POST /api/ai/roadmap
// @desc    Generate roadmap and project ideas from resume text
router.post('/roadmap', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'No resume text provided' });
    const prompt = `Here is a resume. Extract current skills and compare with the required skills for a Frontend Developer at Meta. Identify gaps and generate a personalized 30-day skill roadmap including 3 courses, 2 projects, and 1 DSA sheet.\nResume: ${text}`;

    // Prefer OPENAI_API_KEY, fallback to OPENROUTER_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    let apiKey = openaiKey || openrouterKey;
    let useOpenRouter = false;
    let apiUrl = '';
    let model = 'gpt-3.5-turbo';

    if (apiKey && apiKey.startsWith('sk-or-')) {
      useOpenRouter = true;
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      model = 'openai/gpt-3.5-turbo';
    } else if (apiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-3.5-turbo';
    } else {
      throw new Error('No API key found for OpenAI or OpenRouter');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a career coach and AI assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }
    const aiResponse = data.choices[0].message.content;
    res.json({ roadmap: aiResponse });
  } catch (err) {
    console.error('AI Roadmap Error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message });
  }
});

module.exports = router; 