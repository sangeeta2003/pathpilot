const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  hours: { type: Number, default: 1 },
  endorsement: {
    comment: String,
    rating: Number,
    endorsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Swap', swapSchema); 