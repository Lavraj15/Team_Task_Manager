import express from 'express';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listTasks).post(createTask);
router.route('/:id').patch(updateTask).delete(deleteTask);

export default router;
