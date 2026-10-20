import { ErrorRequestHandler, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../errors/api-error.js';

export const notFoundHandler = (request: Request, response: Response): void => {
  response.status(404).json({ error: `Route not found: ${request.method} ${request.path}` });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Invalid request',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    response.status(400).json({ error: 'Task validation failed' });
    return;
  }

  if (error instanceof MongooseError.CastError) {
    response.status(400).json({ error: 'Invalid task identifier' });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    response.status(400).json({ error: 'Malformed JSON request body' });
    return;
  }

  if (error instanceof Error && error.message === 'Origin not allowed') {
    response.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  console.error('Unhandled API error:', error);
  response.status(500).json({ error: 'An unexpected server error occurred' });
};
