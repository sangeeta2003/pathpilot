const express = require('express');
const router = express.Router();
const SkillSwap = require('../models/SkillSwap');
const auth = require('../middleware/auth');

// Get all open skill swap offers (not matched)
router.get('/', auth, async (req, res) => {
  try {
    const offers = await SkillSwap.find({ status: 'open' }).populate('user', 'name email');
    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch skill swaps' });
  }
});

// Create a new skill swap offer and find matches
router.post('/', auth, async (req, res) => {
  try {
    const { offer, request } = req.body;
    if (!offer || !request) return res.status(400).json({ message: 'Offer and request are required.' });
    const skillSwap = await SkillSwap.create({
      user: req.user,
      offer,
      request
    });
    // Find complementary open offers
    const matches = await SkillSwap.find({
      offer: request,
      request: offer,
      status: 'open',
      user: { $ne: req.user }
    }).populate('user', 'name email');
    res.status(201).json({ skillSwap, matches });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create skill swap' });
  }
});

// Propose a swap (set status to pending for both offers)
router.post('/:id/propose', auth, async (req, res) => {
  try {
    const { targetId } = req.body; // targetId is the offer to propose to
    const myOffer = await SkillSwap.findOne({ _id: req.params.id, user: req.user, status: 'open' });
    const targetOffer = await SkillSwap.findOne({ _id: targetId, status: 'open' });
    if (!myOffer || !targetOffer) return res.status(404).json({ message: 'Offer not found or already matched' });
    myOffer.status = 'pending';
    myOffer.matchedWith = targetOffer._id;
    targetOffer.status = 'pending';
    targetOffer.matchedWith = myOffer._id;
    await myOffer.save();
    await targetOffer.save();
    res.json({ message: 'Swap proposed', myOffer, targetOffer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to propose swap' });
  }
});

// Accept a swap (set status to matched for both offers)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const myOffer = await SkillSwap.findOne({ _id: req.params.id, user: req.user, status: 'pending' });
    if (!myOffer || !myOffer.matchedWith) return res.status(404).json({ message: 'Offer not found or not pending' });
    const otherOffer = await SkillSwap.findOne({ _id: myOffer.matchedWith, status: 'pending' });
    if (!otherOffer) return res.status(404).json({ message: 'Matched offer not found' });
    myOffer.status = 'matched';
    otherOffer.status = 'matched';
    await myOffer.save();
    await otherOffer.save();
    res.json({ message: 'Swap accepted', myOffer, otherOffer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept swap' });
  }
});

// Decline a swap (reset both offers to open)
router.post('/:id/decline', auth, async (req, res) => {
  try {
    const myOffer = await SkillSwap.findOne({ _id: req.params.id, user: req.user, status: 'pending' });
    if (!myOffer || !myOffer.matchedWith) return res.status(404).json({ message: 'Offer not found or not pending' });
    const otherOffer = await SkillSwap.findOne({ _id: myOffer.matchedWith, status: 'pending' });
    if (!otherOffer) return res.status(404).json({ message: 'Matched offer not found' });
    myOffer.status = 'open';
    myOffer.matchedWith = null;
    otherOffer.status = 'open';
    otherOffer.matchedWith = null;
    await myOffer.save();
    await otherOffer.save();
    res.json({ message: 'Swap declined', myOffer, otherOffer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to decline swap' });
  }
});

// Delete a skill swap offer (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const skillSwap = await SkillSwap.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!skillSwap) return res.status(404).json({ message: 'Skill swap not found or not authorized' });
    res.json({ message: 'Skill swap deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete skill swap' });
  }
});

module.exports = router; 