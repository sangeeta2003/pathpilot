const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/skills
// @desc    List all skills
router.get('/', (req, res) => {
  // TODO: List skills logic
  res.send('List skills endpoint');
});

// @route   POST /api/skills/match
// @desc    Match users based on skills
router.post('/match', auth, async (req, res) => {
  try {
    // Get the current user
    const currentUser = await User.findById(req.user);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Find users who offer what the current user wants, and want what the current user offers
    const matches = await User.find({
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: currentUser.skillsWanted },
      skillsWanted: { $in: currentUser.skillsOffered },
    }).select('name email skillsOffered skillsWanted bio');

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/skills/endorse
// @desc    Endorse a user's skill
router.post('/endorse', (req, res) => {
  // TODO: Endorse skill logic
  res.send('Endorse skill endpoint');
});

module.exports = router; 