const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Swap = require('../models/Swap');

// @route   POST /api/swaps/request
// @desc    Request a new swap
router.post('/request', auth, async (req, res) => {
  try {
    const { responderId, skill, hours } = req.body;
    const swap = await Swap.create({
      requester: req.user,
      responder: responderId,
      skill,
      hours: hours || 1,
    });
    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/swaps
// @desc    List swaps for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { requester: req.user },
        { responder: req.user },
      ],
    }).populate('requester responder', 'name email');
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/swaps/:id/endorse
// @desc    Endorse a completed swap
router.post('/:id/endorse', auth, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.status !== 'completed') return res.status(400).json({ message: 'Swap not completed yet' });
    swap.endorsement = {
      comment,
      rating,
      endorsedBy: req.user,
      date: new Date(),
    };
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 