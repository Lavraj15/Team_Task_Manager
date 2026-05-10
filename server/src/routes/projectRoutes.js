import express from 'express';
import {
  addMember,
  createProject,
  getProject,
  listProjects,
  removeMember
} from '../controllers/projectController.js';
import {
  loadProject,
  protect,
  requireProjectAdmin,
  requireProjectMember
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listProjects).post(createProject);
router
  .route('/:id')
  .get(loadProject, requireProjectMember, getProject);
router
  .route('/:id/members')
  .post(loadProject, requireProjectAdmin, addMember);
router
  .route('/:id/members/:userId')
  .delete(loadProject, requireProjectAdmin, removeMember);

export default router;
