import { Router } from 'express';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '../controllers/task.controller.js';

export const taskRoutes = Router();

taskRoutes.get('/', listTasks);
taskRoutes.post('/', createTask);
taskRoutes.patch('/:id', updateTask);
taskRoutes.delete('/:id', deleteTask);
