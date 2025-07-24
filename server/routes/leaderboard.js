const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SkillSwap = require('../models/SkillSwap');

// GET /api/leaderboard?skill=React&period=week
router.get('/', async (req, res) => {
  try {
    const { skill, period } = req.query;
    // For demo, use mock aggregation. Replace with real aggregation in production.
    // Fetch all users
    let users = await User.find();
    // Add mock stats for demo
    users = users.map(u => ({
      _id: u._id,
      name: u.name,
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || u._id}`,
      resumeScore: u.resumeScore || Math.floor(Math.random() * 30) + 70,
      quizScore: u.quizScore || Math.floor(Math.random() * 30) + 70,
      dsaScore: u.dsaScore || Math.floor(Math.random() * 30) + 70,
      badges: u.badges || ["Rising Star"],
      swapCount: 0,
      activityStreak: Math.floor(Math.random() * 10) + 1,
      skills: u.skills || ["React", "SQL", "Java"],
    }));
    // Add swapCount for each user
    for (const user of users) {
      user.swapCount = await SkillSwap.countDocuments({ user: user._id });
    }
    // Filter by skill if provided
    if (skill) {
      users = users.filter(u => u.skills && u.skills.includes(skill));
    }
    // Filter by period if provided (mock: just shuffle for now)
    if (period && period !== 'all') {
      users = users.sort(() => Math.random() - 0.5);
    }
    // Calculate totalScore
    users.forEach(u => {
      u.totalScore = Math.round((u.resumeScore + u.quizScore + u.dsaScore) / 3);
    });
    // Sort by totalScore
    users.sort((a, b) => b.totalScore - a.totalScore);
    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

module.exports = router; 