import { Router } from 'express';
import {
  createTaskController,
  getTasksByUserController,
  updateTaskController,
  deleteTaskController
} from '../controllers/taskController.js';

const router = Router();

router.post('/tasks', createTaskController);
router.get('/tasks/:user_email', getTasksByUserController);  // Verifique esta linha
router.put('/tasks/:id', updateTaskController);
router.delete('/tasks/:id', deleteTaskController);

export default router;
