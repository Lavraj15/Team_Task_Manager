# Team Task Manager

A full-stack MERN task management application for teams. Users can create projects, invite members, assign tasks, update task progress, and track project activity from a simple dashboard.

## Features

- User signup and login with JWT authentication
- Password hashing with `bcryptjs`
- Project creation and member management
- Role-based permissions for Admins and Members
- Task creation, assignment, priority, due date, and status tracking
- Kanban-style task board with `To Do`, `In Progress`, and `Done` columns
- Dashboard metrics for total tasks, task status counts, and overdue tasks
- Protected API routes with token-based authorization
- Responsive React UI built with Vite

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS
- Lucide React icons

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
TaskManagement/
|-- client/                 # React + Vite frontend
|   |-- src/
|   |   |-- App.jsx
|   |   |-- api.js
|   |   `-- state/
|   `-- package.json
|-- server/                 # Express + MongoDB backend
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- package.json
`-- README.md
```

## Getting Started

### Prerequisites

Make sure you have these installed:

- Node.js
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

Clone the repository and install dependencies:

```bash
git clone <your-repository-url>
cd TaskManagement
npm run install:all
```

### Environment Variables

Create a `.env` file inside the `server` folder:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Update `server/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

For the frontend, the API URL defaults to `http://localhost:5000/api`. If needed, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run the App

Start both frontend and backend:

```bash
npm run dev
```

Open the app:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Available Scripts

Run from the root folder:

```bash
npm run install:all
```

Installs dependencies for both `client` and `server`.

```bash
npm run dev
```

Runs the React frontend and Express backend together.

```bash
npm run client
```

Runs only the frontend.

```bash
npm run server
```

Runs only the backend.

Run from the `client` folder:

```bash
npm run build
```

Builds the frontend for production.

## API Overview

Base URL:

```text
http://localhost:5000/api
```

Main route groups:

- `POST /auth/signup` - create a new account
- `POST /auth/login` - login and receive a JWT
- `GET /projects` - get user projects
- `POST /projects` - create a project
- `GET /projects/:id` - get project details
- `POST /projects/:id/members` - add a project member
- `DELETE /projects/:id/members/:userId` - remove a project member
- `GET /tasks?projectId=<id>` - get project tasks
- `POST /tasks` - create a task
- `PATCH /tasks/:id` - update task status or details
- `DELETE /tasks/:id` - delete a task
- `GET /dashboard` - get dashboard metrics

Protected routes require an authorization header:

```text
Authorization: Bearer <token>
```

## Roles and Permissions

**Admin**

- Create projects
- Add or remove project members
- Create, update, assign, and delete tasks
- View project dashboard data

**Member**

- View assigned projects
- View project tasks
- Update status for assigned tasks

## Deployment Notes

- Set `MONGO_URI` to your production MongoDB connection string.
- Set a strong `JWT_SECRET`.
- Set `CLIENT_URL` to your deployed frontend URL.
- Set `VITE_API_URL` in the frontend to your deployed backend API URL.
- Build the frontend with `npm run build` inside the `client` folder.

## License

This project is open for learning and portfolio use. Add a license file if you plan to distribute it publicly.
