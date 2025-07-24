require('dotenv').config();
const mongoose = require('mongoose');
const DSAProblem = require('../models/DSAProblem');
const fs = require('fs');
const path = require('path');

async function seedDSAProblems() {
  await mongoose.connect(process.env.MONGO_URI);

  const dataPath = path.join(__dirname, 'ProblemSiteData.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Filter out entries without a valid 'problem' field
  const validProblems = raw.filter(p => p.problem && typeof p.problem === 'string' && p.problem.trim() !== '');
  console.log('Valid problems:', validProblems.length, 'of', raw.length);

  const problems = validProblems.map(p => ({
    title: p.problem, // Use the 'problem' field as the title
    description: '', // No description in your data
    difficulty: p.difficulty,
    tags: [p.pattern].filter(Boolean), // Use pattern as a tag
    link: p.link || '',
    video: p.video || '',
    // Add other fields as needed
  }));

  await DSAProblem.deleteMany({});
  await DSAProblem.insertMany(problems);

  console.log('DSA problems seeded!');
  mongoose.disconnect();
}

seedDSAProblems(); 