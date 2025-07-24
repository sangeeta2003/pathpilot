const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for screenshot uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all projects for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user }).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, link, tech } = req.body;
    const project = await Project.create({
      user: req.user,
      title,
      description,
      link,
      tech
    });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, link, tech } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title, description, link, tech },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Upload screenshot for a project
router.post('/:id/screenshot', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { screenshot: req.file ? `/uploads/${req.file.filename}` : '' },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload screenshot' });
  }
});

module.exports = router; 