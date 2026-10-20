import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { ApiError } from '../errors/api-error.js';
import { TaskModel, TaskRecord } from '../models/task.model.js';
import { createTaskSchema, updateTaskSchema } from '../validation/task.validation.js';

function serializeTask(task: TaskRecord & { _id: Types.ObjectId }) {
  return {
    id: task._id.toString(),
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function parseTaskId(id: string | string[] | undefined): Types.ObjectId {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
    throw new ApiError(400, 'Task id must be a valid MongoDB ObjectId');
  }

  return new Types.ObjectId(id);
}

export async function listTasks(_request: Request, response: Response): Promise<void> {
  const tasks = await TaskModel.find().sort({ createdAt: -1 }).exec();
  response.json(tasks.map(serializeTask));
}

export async function createTask(request: Request, response: Response): Promise<void> {
  const input = createTaskSchema.parse(request.body);
  const task = await TaskModel.create({ title: input.title });
  response.status(201).json(serializeTask(task));
}

export async function updateTask(request: Request, response: Response): Promise<void> {
  const id = parseTaskId(request.params['id']);
  const changes = updateTaskSchema.parse(request.body);
  const task = await TaskModel.findByIdAndUpdate(id, changes, {
    new: true,
    runValidators: true,
  }).exec();

  if (!task) throw new ApiError(404, 'Task not found');
  response.json(serializeTask(task));
}

export async function deleteTask(request: Request, response: Response): Promise<void> {
  const id = parseTaskId(request.params['id']);
  const task = await TaskModel.findByIdAndDelete(id).exec();
  if (!task) throw new ApiError(404, 'Task not found');
  response.status(204).end();
}
