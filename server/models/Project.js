const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  tech: { type: String, default: '' },
  screenshot: { type: String, default: '' }, // URL or file path
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 