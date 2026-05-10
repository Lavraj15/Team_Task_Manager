# Team Task Manager

A MERN stack team task management app with authentication, project membership, role-based access, task assignment, status tracking, and dashboard metrics.

## Tech Stack

- MongoDB, Mongoose
- Express.js, Node.js
- React, Vite
- JWT authentication

## Setup

1. Install dependencies:

```bash
npm.cmd run install:all
```

2. Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

3. Start MongoDB locally, then run the app:

```bash
npm.cmd run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Main Features

- Signup and login with hashed passwords and JWT
- Project creation where the creator becomes Admin
- Admins can add or remove project members
- Admins can create, update, delete, and assign tasks
- Members can view assigned projects and update only their assigned tasks
- Dashboard totals for task status, tasks per user, and overdue tasks

