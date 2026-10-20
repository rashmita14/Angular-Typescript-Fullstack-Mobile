import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { taskRoutes } from './routes/task.routes.js';

export interface AppOptions {
  clientOrigins?: string[];
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const allowedOrigins = options.clientOrigins ?? ['http://localhost:4200'];

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed'));
    },
  }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_request, response) => {
    const connected = mongoose.connection.readyState === 1;
    response.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'disconnected',
    });
  });
  app.use('/api/tasks', taskRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
