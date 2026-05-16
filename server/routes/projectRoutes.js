const express = require('express');
const { Project, User } = require('../models');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/projects
// @desc Create a project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      adminId: req.user.id
    });
    
    // Add admin as a member automatically
    await project.addMember(req.user.id);
    
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
    const user = await User.findByPk(req.user.id);
    const projects = await user.getProjects({
      include: [
        { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id'] } // just fetch members to count them in frontend
      ],
      order: [['createdAt', 'DESC']]
    });
    
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
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is a member
    const isMember = project.members.some(m => m.id === req.user.id);
    if (!isMember) {
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
    const project = await Project.findByPk(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.adminId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAlreadyMember = await project.hasMember(user);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User already in project' });
    }

    await project.addMember(user);
    
    // Fetch project again to return updated members
    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
