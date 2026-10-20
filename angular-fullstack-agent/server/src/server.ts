import 'dotenv/config';
import { createApp } from './app.js';
import { connectToDatabase } from './config/database.js';

const port = Number(process.env['PORT'] ?? 3000);
const mongoUri = process.env['MONGODB_URI'];
const clientOrigins = (process.env['CLIENT_ORIGIN'] ?? 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function startServer(): Promise<void> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port number');
  }
  if (!mongoUri) {
    throw new Error('MONGODB_URI must be configured');
  }

  await connectToDatabase(mongoUri);
  createApp({ clientOrigins }).listen(port, () => {
    console.info(`Task API listening on http://localhost:${port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start the Task API:', error);
  process.exitCode = 1;
});
