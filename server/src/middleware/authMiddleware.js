import jwt from 'jsonwebtoken';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const loadProject = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  req.project = project;
  next();
};

export const requireProjectMember = (req, res, next) => {
  const member = req.project.members.find(
    (entry) => entry.user.toString() === req.user.id
  );

  if (!member) {
    return res.status(403).json({ message: 'Project access denied' });
  }

  req.projectRole = member.role;
  next();
};

export const requireProjectAdmin = (req, res, next) => {
  const member = req.project.members.find(
    (entry) => entry.user.toString() === req.user.id && entry.role === 'Admin'
  );

  if (!member) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.projectRole = 'Admin';
  next();
};
