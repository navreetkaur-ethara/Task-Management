require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Serve frontend in production
const path = require('path');
const frontendPath = path.join(__dirname, '../client/dist');
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const startServer = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (process.env.NODE_ENV === 'production' && !databaseUrl) {
      console.error('DATABASE_URL environment variable is not set for production');
      process.exit(1);
    }

    // Connect Database
    await sequelize.authenticate();
    console.log(`Connected to ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'} database`);
    
    // Sync models
    await sequelize.sync({ alter: true }); // Automatically updates schema
    console.log('Database synced');

    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

startServer();