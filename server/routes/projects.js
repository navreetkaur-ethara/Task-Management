const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/projects
// @desc Create a project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id] // Admin is also a member
    });
    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/projects
// @desc Get all projects for a user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id }).populate('admin', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/projects/:id
// @desc Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is a member
    if (!project.members.some(m => m.id === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/projects/:id/members
// @desc Add a member to a project
router.put('/:id/members', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(user.id)) {
      return res.status(400).json({ message: 'User already in project' });
    }

    project.members.push(user.id);
    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
