# Team Task Management Application

A full-stack Team Task Management Web Application built with the PERN stack (PostgreSQL, Express, React, Node.js) and Tailwind CSS.

## Features

- **Authentication**: Signup, Login, and JWT-based authentication.
- **Projects**: Create projects, add members (Admin only).
- **Tasks**: Create tasks within projects, assign them to members, set priorities and due dates.
- **Kanban Board**: Update task statuses seamlessly.
- **Dashboard**: Track overall task statistics across all your projects.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (local server or cloud service like Neon/Supabase)

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Environment Variables**:
   In `server/.env`, ensure you have:
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:password@localhost:5432/taskmanager
   JWT_SECRET=supersecretjwtkey_change_in_production
   ```
   *Replace `DATABASE_URL` with your PostgreSQL connection string if using a cloud database.*

3. **Start the Application**:
   ```bash
   npm run dev
   ```
   This command starts both the backend (on port 5000) and the frontend Vite server (usually on port 5173).

## Deployment (Railway)

This repository is pre-configured for deployment on [Railway](https://railway.app/).

1. Push this repository to GitHub.
2. Log into Railway and create a new project.
3. Add a **PostgreSQL** plugin on Railway to act as your production database.
4. Add a **GitHub Repo** service, selecting this repository.
5. In the service's Variables section, add:
   - `DATABASE_URL` (Use the connection URL from the Railway PostgreSQL service)
   - `JWT_SECRET` (A strong random string)
   - `NODE_ENV` (Set to `production`)
6. Railway will automatically detect the `railway.toml` and `package.json` build scripts, installing all dependencies, building the Vite frontend, and starting the Express server, which will serve the frontend build from `/client/dist`.

## Demo Video Requirement

For your assignment submission, use a screen recording tool (like OBS or Loom) to walk through:
1. Creating an account.
2. Creating a project and adding a mock user.
3. Creating a task and updating its status.
4. Viewing the dashboard.
5. Briefly showing pgAdmin, DBeaver, or your cloud database dashboard to prove database integration.
