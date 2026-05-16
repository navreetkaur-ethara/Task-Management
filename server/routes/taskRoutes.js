const express = require('express');
const { Task, Project, User } = require('../models');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/tasks
// @desc Create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, project: projectId, assignedTo } = req.body;
    
    const projectDoc = await Project.findByPk(projectId);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    if (projectDoc.adminId !== req.user.id) {
       return res.status(401).json({ message: 'Only admin can create tasks' });
    }

    const task = await Task.create({
      title, 
      description, 
      dueDate: dueDate || null, 
      priority, 
      status, 
      projectId, 
      assignedToId: assignedTo || null
    });

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/tasks/project/:projectId
// @desc Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const isMember = await project.hasMember(req.user.id);
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }]
    });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/tasks/:id
// @desc Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findByPk(task.projectId);
    const isAdmin = project.adminId === req.user.id;
    const isAssigned = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssigned) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Members can only update status. Admins can update anything.
    if (!isAdmin) {
      task.status = status || task.status;
    } else {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (assignedTo !== undefined) task.assignedToId = assignedTo || null;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
