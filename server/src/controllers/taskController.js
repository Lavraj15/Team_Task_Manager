import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name');

const isProjectMember = (project, userId) =>
  project.members.some((entry) => entry.user.toString() === userId.toString());

const isProjectAdmin = (project, userId) =>
  project.members.some(
    (entry) => entry.user.toString() === userId.toString() && entry.role === 'Admin'
  );

export const listTasks = async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const query = {};

    if (projectId) {
      const project = await Project.findById(projectId);

      if (!project || !isProjectMember(project, req.user.id)) {
        return res.status(403).json({ message: 'Project access denied' });
      }

      query.project = projectId;

      if (!isProjectAdmin(project, req.user.id)) {
        query.assignedTo = req.user.id;
      }
    } else {
      const projects = await Project.find({ 'members.user': req.user.id });
      const adminProjectIds = projects
        .filter((project) => isProjectAdmin(project, req.user.id))
        .map((project) => project.id);
      const memberProjectIds = projects
        .filter((project) => !isProjectAdmin(project, req.user.id))
        .map((project) => project.id);

      query.$or = [
        { project: { $in: adminProjectIds } },
        { project: { $in: memberProjectIds }, assignedTo: req.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const tasks = await populateTask(Task.find(query).sort({ dueDate: 1 }));
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, project, assignedTo } = req.body;
    const targetProject = await Project.findById(project);

    if (!targetProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectAdmin(targetProject, req.user.id)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!isProjectMember(targetProject, assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      project,
      assignedTo,
      createdBy: req.user.id
    });

    const populated = await populateTask(Task.findById(task.id));
    res.status(201).json({ task: populated });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const admin = isProjectAdmin(project, req.user.id);
    const assigned = task.assignedTo.toString() === req.user.id;

    if (!admin && !assigned) {
      return res.status(403).json({ message: 'Task access denied' });
    }

    const allowedFields = admin
      ? ['title', 'description', 'dueDate', 'priority', 'status', 'assignedTo']
      : ['status'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    }

    if (admin && req.body.assignedTo && !isProjectMember(project, req.body.assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    await task.save();
    const populated = await populateTask(Task.findById(task.id));
    res.json({ task: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    if (!isProjectAdmin(project, req.user.id)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
