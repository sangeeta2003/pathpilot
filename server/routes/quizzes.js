const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const isOpenRouterKey = (key) => key && key.startsWith('sk-or-');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/quizzes/generate
// @desc    Generate 15 quiz questions for a topic using AI
router.post('/generate', async (req, res) => {
  try {
    console.log('--- /generate called ---');
    console.log('Received body:', req.body); // Debug log
    let { topic } = req.body;
    topic = (topic || '').trim();
    console.log('Parsed topic:', topic); // Debug log
    if (!topic) return res.status(400).json({ message: 'Topic is required and cannot be empty or whitespace.' });
    const prompt = `Generate 15 quiz questions and their correct answers for the topic: "${topic}". Format as JSON array: [{"question": "...", "correctAnswer": "..."}, ...]`;
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      }),
    });
    const aiData = await aiRes.json();
    console.log('AI raw response:', aiData.choices?.[0]?.message?.content); // Debug log
    let quiz = [];
    try {
      // Try to parse JSON from AI response
      const match = aiData.choices?.[0]?.message?.content.match(/\[.*\]/s);
      quiz = match ? JSON.parse(match[0]) : [];
    } catch {}
    if (!Array.isArray(quiz) || quiz.length === 0) {
      return res.status(500).json({ message: 'Failed to generate quiz questions', raw: aiData });
    }
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate quiz', error: err.message });
  }
});

// Debug: Test body parsing
router.post('/test-body', (req, res) => {
  console.log('Test body:', req.body);
  res.json({ received: req.body });
});

// @route   POST /api/quizzes
// @desc    Save a new quiz
router.post('/', auth, async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required.' });
    }
    const quiz = await Quiz.create({
      title,
      questions,
      author: req.user,
    });
    // Add recent activity
    const user = await User.findById(req.user);
    if (user) {
      user.recentActivity.unshift({
        type: 'quiz',
        description: `Created quiz: ${title}`,
        date: new Date(),
      });
      user.recentActivity = user.recentActivity.slice(0, 10); // keep only 10
      await user.save();
    }
    res.status(201).json({ quiz });
  } catch (err) {
    console.error('Quiz Save Error:', err);
    res.status(500).json({ message: 'Failed to save quiz', error: err.message });
  }
});

// @route   GET /api/quizzes
// @desc    List all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title author createdAt').populate('author', 'name');
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get a quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// @route   POST /api/quizzes/:id/take
// @desc    Take a quiz
router.post('/:id/take', (req, res) => {
  // TODO: Take quiz logic
  res.send('Take quiz endpoint');
});

// @route   GET /api/quizzes/leaderboard
// @desc    Get quiz leaderboard
router.get('/leaderboard', (req, res) => {
  // TODO: Quiz leaderboard logic
  res.send('Quiz leaderboard endpoint');
});

// Submit a quiz answer and check with AI
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answer } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Use AI to check answer
    const prompt = `Question: ${quiz.question}\nCorrect Answer: ${quiz.correctAnswer}\nUser's Answer: ${answer}\nIs the user's answer correct? Reply with 'Correct', 'Partially Correct', or 'Incorrect' and a brief explanation.`;
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
    const aiData = await aiRes.json();
    const feedback = aiData.choices?.[0]?.message?.content || "";
    // Parse AI result
    let isCorrect = /\bcorrect\b/i.test(feedback) && !/incorrect/i.test(feedback);
    // Update user score if correct
    if (isCorrect) {
      const user = await User.findById(req.user);
      user.quizScore = (user.quizScore || 0) + 1;
      await user.save();
    }
    res.json({ feedback, isCorrect });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check answer', error: err.message });
  }
});

// AI-powered answer checking for in-memory quizzes
router.post('/ai-check', async (req, res) => {
  try {
    const { question, correctAnswer, userAnswer } = req.body;
    if (!question || !correctAnswer || !userAnswer) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const prompt = `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}\nIs the user's answer correct? Reply with 'Correct', 'Partially Correct', or 'Incorrect' and a brief explanation.`;
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
    const aiData = await aiRes.json();
    const feedback = aiData.choices?.[0]?.message?.content || "";
    let isCorrect = /\bcorrect\b/i.test(feedback) && !/incorrect/i.test(feedback);
    res.json({ feedback, isCorrect });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check answer', error: err.message });
  }
});

module.exports = router; 