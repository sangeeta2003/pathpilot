const mongoose = require('mongoose');

const skillSwapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offer: { type: String, required: true },
  request: { type: String, required: true },
  status: { type: String, enum: ['open', 'pending', 'matched'], default: 'open' },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillSwap', default: null },
}, { timestamps: true });

module.exports = mongoose.model('SkillSwap', skillSwapSchema); 