import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

const isProjectAdmin = (project, userId) =>
  project.members.some(
    (entry) => entry.user.toString() === userId.toString() && entry.role === 'Admin'
  );

export const getDashboard = async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.user': req.user.id });
    const adminProjectIds = projects
      .filter((project) => isProjectAdmin(project, req.user.id))
      .map((project) => project._id);
    const memberProjectIds = projects
      .filter((project) => !isProjectAdmin(project, req.user.id))
      .map((project) => project._id);

    const visibilityQuery = {
      $or: [
        { project: { $in: adminProjectIds } },
        { project: { $in: memberProjectIds }, assignedTo: req.user.id }
      ]
    };

    const [totalTasks, byStatus, perUser, overdueTasks] = await Promise.all([
      Task.countDocuments(visibilityQuery),
      Task.aggregate([
        { $match: visibilityQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: visibilityQuery },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $project: { count: 1, name: '$user.name', email: '$user.email' } }
      ]),
      Task.find({
        ...visibilityQuery,
        dueDate: { $lt: new Date() },
        status: { $ne: 'Done' }
      })
        .populate('assignedTo', 'name email')
        .populate('project', 'name')
        .sort({ dueDate: 1 })
    ]);

    res.json({
      totalTasks,
      byStatus: byStatus.reduce((acc, entry) => ({ ...acc, [entry._id]: entry.count }), {}),
      perUser,
      overdueTasks
    });
  } catch (error) {
    next(error);
  }
};
