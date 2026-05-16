const express = require('express');
const { Task, Project, User } = require('../models');
const auth = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

// @route GET /api/dashboard
// @desc Get dashboard statistics
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const projects = await user.getProjects();
    const projectIds = projects.map(p => p.id);

    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        doneTasks: 0,
        myTasks: 0,
        overdueTasks: 0
      });
    }

    const tasks = await Task.findAll({
      where: {
        projectId: { [Op.in]: projectIds }
      }
    });

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    
    const myTasks = tasks.filter(t => t.assignedToId === req.user.id).length;
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
