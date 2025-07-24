const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String
}, { _id: false });

const dsaProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  constraints: String,
  tags: [String],
  testCases: [testCaseSchema]
});

module.exports = mongoose.model('DSAProblem', dsaProblemSchema); 