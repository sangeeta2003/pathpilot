const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  quizzesTaken: { type: Number, default: 0 },
  swapsCompleted: { type: Number, default: 0 },
  hoursTaught: { type: Number, default: 0 },
  hoursLearned: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  avgAccuracy: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
});

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
  rating: Number,
  date: { type: Date, default: Date.now },
});

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'quiz', 'badge', 'swap'
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  skillsOffered: [{ type: String }],
  skillsWanted: [{ type: String }],
  badges: [{ type: String }],
  stats: { type: statsSchema, default: () => ({}) },
  reviews: [reviewSchema],
  recentActivity: [activitySchema],
  dsaProgress: [{
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' },
    status: { type: String, enum: ['solved', 'bookmarked'], required: true },
    lastAttempt: { type: Date, default: Date.now },
  }],
  resumeData: {
    type: Object,
    default: null
  },
}, { timestamps: true });

userSchema.methods.awardBadge = function(badge) {
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
  }
};

module.exports = mongoose.model('User', userSchema); 