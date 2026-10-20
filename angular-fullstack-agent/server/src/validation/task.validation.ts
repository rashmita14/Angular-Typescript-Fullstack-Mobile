import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
}).strict();

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  completed: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one task field must be provided',
});
