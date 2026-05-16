const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/tasks
// @desc Create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, project, assignedTo } = req.body;
    
    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    // Only admin can create tasks in this basic version, or members too. Let's allow admins to create.
    if (projectDoc.admin.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Only admin can create tasks' });
    }

    const task = new Task({
      title, description, dueDate, priority, status, project, assignedTo
    });

    await task.save();
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
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (!project.members.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email');
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
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.user.id;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isAssigned) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Members can only update status. Admins can update anything.
    if (!isAdmin) {
      task.status = status || task.status;
    } else {
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/tasks/dashboard
// @desc Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Find all projects the user is part of
    const projects = await Project.find({ members: req.user.id });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    
    const myTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === req.user.id).length;
    const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()).length;

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      myTasks,
      overdueTasks
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
