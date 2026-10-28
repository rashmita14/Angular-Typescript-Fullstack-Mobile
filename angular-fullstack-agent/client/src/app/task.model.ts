import type {
  CreateTask as CreateTaskPayload,
  Task,
  UpdateTask as UpdateTaskPayload,
} from './api/generated';

export type { Task, CreateTaskPayload, UpdateTaskPayload };
export type TaskFilter = 'all' | 'active' | 'completed';
