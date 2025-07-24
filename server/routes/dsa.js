const express = require('express');
const router = express.Router();
const DSAProblem = require('../models/DSAProblem');
const auth = require('../middleware/auth');
const User = require('../models/User');
const fetch = require('node-fetch');

// Get all problems (with optional filters)
router.get('/', async (req, res) => {
  const { difficulty, tag, search } = req.query;
  let filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = tag;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const problems = await DSAProblem.find(filter);
  res.json(problems);
});

// Get user's DSA progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('dsaProgress.problem', 'title difficulty');
    if (!user || !user.dsaProgress) {
      return res.json({ progress: [] });
    }
    res.json({ progress: user.dsaProgress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress', progress: [] });
  }
});

// Get single problem by ID
router.get('/:id', async (req, res) => {
  const problem = await DSAProblem.findById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Not found' });
  res.json(problem);
});

// Add a new DSA problem (admin/protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, difficulty, tags, solution, testCases } = req.body;
    if (!title || !description || !difficulty) {
      return res.status(400).json({ message: 'Title, description, and difficulty are required.' });
    }
    const problem = await DSAProblem.create({ title, description, difficulty, tags, solution, testCases });
    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add problem' });
  }
});

// (Optional) Submit a solution (auto-checking with code execution)
router.post('/:id/solve', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problem = await DSAProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases for this problem.' });
    }
    if (!code || !language) return res.status(400).json({ message: 'Code and language required.' });

    // Map language to Judge0 language_id (example: python = 71, javascript = 63)
    const langMap = { python: 71, javascript: 63 };
    const language_id = langMap[language];
    if (!language_id) return res.status(400).json({ message: 'Unsupported language.' });

    // Run code for each test case
    const results = [];
    for (const tc of problem.testCases) {
      const judgeRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: code,
          language_id,
          stdin: tc.input,
        }),
      });
      const judgeData = await judgeRes.json();
      results.push({
        input: tc.input,
        expected: tc.output,
        output: judgeData.stdout ? judgeData.stdout.trim() : '',
        passed: judgeData.stdout && judgeData.stdout.trim() === tc.output.trim(),
        status: judgeData.status && judgeData.status.description,
      });
    }
    const allPassed = results.every(r => r.passed);
    // Track attempt in user progress
    const user = await User.findById(req.user);
    if (user) {
      user.dsaProgress = user.dsaProgress.filter(p => p.problem.toString() !== req.params.id);
      user.dsaProgress.push({ problem: req.params.id, status: allPassed ? 'solved' : 'bookmarked', lastAttempt: new Date() });
      await user.save();
    }
    res.json({ allPassed, results });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check solution', error: err.message });
  }
});

// Mark a DSA problem as solved or bookmarked
router.post('/:id/mark', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'solved' or 'bookmarked'
    if (!['solved', 'bookmarked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Remove any existing entry for this problem
    user.dsaProgress = user.dsaProgress.filter(p => p.problem.toString() !== req.params.id);
    // Add new entry
    user.dsaProgress.push({ problem: req.params.id, status, lastAttempt: new Date() });
    await user.save();
    res.json({ message: `Problem marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

module.exports = router; 