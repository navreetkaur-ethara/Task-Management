const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
  }
});

const User = require('./User')(sequelize);
const Project = require('./Project')(sequelize);
const Task = require('./Task')(sequelize);

// Define Associations
// User <-> Project (Admin)
User.hasMany(Project, { foreignKey: 'adminId', as: 'administeredProjects' });
Project.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// User <-> Project (Members Many-to-Many)
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'projects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: 'ProjectMembers', as: 'members', foreignKey: 'projectId' });

// Project <-> Task
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User <-> Task (Assigned To)
User.hasMany(Task, { foreignKey: 'assignedToId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

module.exports = {
  sequelize,
  User,
  Project,
  Task
};
