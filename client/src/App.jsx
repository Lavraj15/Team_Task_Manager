import {
  ClipboardList,
  LogOut,
  Plus,
  RefreshCcw,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api.js';
import { useAuth } from './state/AuthContext.jsx';

const statuses = ['To Do', 'In Progress', 'Done'];
const priorities = ['Low', 'Medium', 'High'];

const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  status: 'To Do',
  assignedTo: ''
};

export const App = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <main className="centered">Loading...</main>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Team Task Manager</p>
          <h1>Projects and tasks</h1>
        </div>
        <div className="identity">
          <span>{user.name}</span>
          <button className="icon-button" onClick={logout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <Workspace />
    </main>
  );
};

const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await (mode === 'login' ? login : signup)(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">Team Task Manager</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <form onSubmit={submit} className="form">
          {mode === 'signup' && (
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={6}
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit">
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <button
          className="text-button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </section>
    </main>
  );
};

const Workspace = () => {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [projectDetail, setProjectDetail] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'Member' });
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [error, setError] = useState('');

  const activeProject = projectDetail?.project;
  const role = projectDetail?.role;
  const isAdmin = role === 'Admin';

  const loadProjects = async () => {
    const data = await apiRequest('/projects');
    setProjects(data.projects);

    if (!selectedId && data.projects[0]) {
      setSelectedId(data.projects[0]._id);
    }
  };

  const loadDashboard = async () => {
    const data = await apiRequest('/dashboard');
    setDashboard(data);
  };

  const loadProject = async (projectId) => {
    if (!projectId) return;

    const [projectData, taskData] = await Promise.all([
      apiRequest(`/projects/${projectId}`),
      apiRequest(`/tasks?projectId=${projectId}`)
    ]);
    setProjectDetail(projectData);
    setTasks(taskData.tasks);

    const firstMember = projectData.project.members[0]?.user?._id;
    setTaskForm((current) => ({ ...current, assignedTo: current.assignedTo || firstMember || '' }));
  };

  const refresh = async () => {
    setError('');
    try {
      await Promise.all([loadProjects(), loadDashboard()]);
      if (selectedId) {
        await loadProject(selectedId);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    loadProject(selectedId).catch((err) => setError(err.message));
  }, [selectedId]);

  const createProject = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectForm)
      });
      setProjectForm({ name: '', description: '' });
      setSelectedId(data.project._id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await apiRequest(`/projects/${selectedId}/members`, {
        method: 'POST',
        body: JSON.stringify(memberForm)
      });
      setMemberForm({ email: '', role: 'Member' });
      await loadProject(selectedId);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeMember = async (userId) => {
    setError('');

    try {
      await apiRequest(`/projects/${selectedId}/members/${userId}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...taskForm, project: selectedId })
      });
      setTaskForm({ ...emptyTask, assignedTo: taskForm.assignedTo });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (taskId, status) => {
    setError('');

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    setError('');

    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusCounts = useMemo(
    () =>
      statuses.map((status) => ({
        label: status,
        count: dashboard?.byStatus?.[status] || 0
      })),
    [dashboard]
  );

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="panel">
          <div className="section-title">
            <ClipboardList size={18} />
            <h2>Projects</h2>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <button
                key={project._id}
                className={project._id === selectedId ? 'project-link active' : 'project-link'}
                onClick={() => setSelectedId(project._id)}
              >
                <span>{project.name}</span>
                <small>{project.members.length} members</small>
              </button>
            ))}
          </div>
          <form onSubmit={createProject} className="form compact">
            <input
              required
              placeholder="New project"
              value={projectForm.name}
              onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
            />
            <textarea
              placeholder="Description"
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm({ ...projectForm, description: event.target.value })
              }
            />
            <button className="primary" type="submit">
              <Plus size={16} />
              Create
            </button>
          </form>
        </div>
      </aside>

      <section className="content">
        {error && <p className="error">{error}</p>}
        <Dashboard dashboard={dashboard} statusCounts={statusCounts} />

        {activeProject ? (
          <div className="grid">
            <section className="panel wide">
              <div className="project-head">
                <div>
                  <h2>{activeProject.name}</h2>
                  <p>{activeProject.description || 'No description yet.'}</p>
                  <span className="role">{role}</span>
                </div>
                <button className="icon-button" onClick={refresh} title="Refresh">
                  <RefreshCcw size={18} />
                </button>
              </div>

              <TaskBoard
                tasks={tasks}
                isAdmin={isAdmin}
                onStatusChange={updateStatus}
                onDelete={deleteTask}
              />
            </section>

            <section className="panel">
              <div className="section-title">
                <Users size={18} />
                <h2>Team</h2>
              </div>
              <div className="member-list">
                {activeProject.members.map((member) => (
                  <div className="member-row" key={member.user._id}>
                    <div>
                      <strong>{member.user.name}</strong>
                      <small>{member.user.email}</small>
                    </div>
                    <span>{member.role}</span>
                    {isAdmin && member.user._id !== activeProject.createdBy._id && (
                      <button
                        className="icon-button danger"
                        onClick={() => removeMember(member.user._id)}
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <form onSubmit={addMember} className="form compact">
                  <input
                    required
                    type="email"
                    placeholder="Member email"
                    value={memberForm.email}
                    onChange={(event) =>
                      setMemberForm({ ...memberForm, email: event.target.value })
                    }
                  />
                  <select
                    value={memberForm.role}
                    onChange={(event) =>
                      setMemberForm({ ...memberForm, role: event.target.value })
                    }
                  >
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                  <button className="secondary" type="submit">
                    <UserPlus size={16} />
                    Add member
                  </button>
                </form>
              )}
            </section>

            {isAdmin && (
              <section className="panel">
                <h2>Create task</h2>
                <form onSubmit={createTask} className="form compact">
                  <input
                    required
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, description: event.target.value })
                    }
                  />
                  <input
                    required
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                  />
                  <select
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, priority: event.target.value })
                    }
                  >
                    {priorities.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, assignedTo: event.target.value })
                    }
                  >
                    {activeProject.members.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                  <button className="primary" type="submit">
                    <Plus size={16} />
                    Add task
                  </button>
                </form>
              </section>
            )}
          </div>
        ) : (
          <section className="empty panel">Create your first project to begin.</section>
        )}
      </section>
    </div>
  );
};

const Dashboard = ({ dashboard, statusCounts }) => (
  <section className="metrics">
    <article>
      <strong>{dashboard?.totalTasks || 0}</strong>
      <span>Total tasks</span>
    </article>
    {statusCounts.map((item) => (
      <article key={item.label}>
        <strong>{item.count}</strong>
        <span>{item.label}</span>
      </article>
    ))}
    <article>
      <strong>{dashboard?.overdueTasks?.length || 0}</strong>
      <span>Overdue</span>
    </article>
  </section>
);

const TaskBoard = ({ tasks, isAdmin, onStatusChange, onDelete }) => (
  <div className="task-board">
    {statuses.map((status) => (
      <section className="column" key={status}>
        <h3>{status}</h3>
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <article className="task-card" key={task._id}>
              <div className="task-card-head">
                <h4>{task.title}</h4>
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
              <p>{task.description || 'No description.'}</p>
              <div className="task-meta">
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                <span>{task.assignedTo?.name}</span>
              </div>
              <div className="task-actions">
                <select value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)}>
                  {statuses.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                {isAdmin && (
                  <button
                    className="icon-button danger"
                    onClick={() => onDelete(task._id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </article>
          ))}
      </section>
    ))}
  </div>
);
