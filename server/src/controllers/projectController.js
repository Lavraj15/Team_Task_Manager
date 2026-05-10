import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

const populateProject = (query) =>
  query.populate('members.user', 'name email').populate('createdBy', 'name email');

export const listProjects = async (req, res, next) => {
  try {
    const projects = await populateProject(
      Project.find({ 'members.user': req.user.id }).sort({ updatedAt: -1 })
    );

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'Admin' }]
    });

    const populated = await populateProject(Project.findById(project.id));
    res.status(201).json({ project: populated });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await populateProject(Project.findById(req.project.id));
    res.json({ project, role: req.projectRole });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email, role = 'Member' } = req.body;

    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Admin or Member' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const exists = req.project.members.some((entry) => entry.user.toString() === user.id);

    if (exists) {
      return res.status(409).json({ message: 'User is already a project member' });
    }

    req.project.members.push({ user: user.id, role });
    await req.project.save();

    const project = await populateProject(Project.findById(req.project.id));
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.project.createdBy.toString()) {
      return res.status(400).json({ message: 'Project creator cannot be removed' });
    }

    req.project.members = req.project.members.filter(
      (entry) => entry.user.toString() !== userId
    );
    await req.project.save();

    await Task.deleteMany({ project: req.project.id, assignedTo: userId });
    const project = await populateProject(Project.findById(req.project.id));
    res.json({ project });
  } catch (error) {
    next(error);
  }
};
