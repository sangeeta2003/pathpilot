const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Placeholder route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const quizRoutes = require('./routes/quizzes');
const leaderboardRoutes = require('./routes/leaderboard');
const swapsRoutes = require('./routes/swaps');
const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');
const dsaRoutes = require('./routes/dsa');
const projectsRoutes = require('./routes/projects');
const skillSwapRoutes = require('./routes/skillswap');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/swaps', swapsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skillswap', skillSwapRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

module.exports = app; 