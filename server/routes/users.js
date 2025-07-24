const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/me
// @desc    Get current user's profile (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
router.get('/:id', (req, res) => {
  // TODO: Get user profile logic
  res.send('Get user profile endpoint');
});

// @route   PUT /api/users/:id
// @desc    Update user profile
router.put('/:id', (req, res) => {
  // TODO: Update user profile logic
  res.send('Update user profile endpoint');
});

// @route   GET /api/users/:id/stats
// @desc    Get user stats
router.get('/:id/stats', (req, res) => {
  // TODO: Get user stats logic
  res.send('Get user stats endpoint');
});

module.exports = router; 