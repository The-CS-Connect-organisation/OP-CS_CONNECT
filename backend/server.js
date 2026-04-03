import app from './app.js';
import { connectDatabase, closeDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { setSocketServer } from './app.js';
import { bootstrapDefaultUsers } from './seed/bootstrapDefaults.js';

let server;
let io;

const start = async () => {
  await connectDatabase();
  await bootstrapDefaultUsers();
  const httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });
  io.on('connection', (socket) => {
    logger.info('Socket client connected', { id: socket.id });
    socket.on('join:class', (classId) => socket.join(`class:${classId}`));
    socket.on('disconnect', () => logger.info('Socket client disconnected', { id: socket.id }));
  });
  setSocketServer(io);
  server = httpServer.listen(env.PORT, () => {
    logger.info(`API server running on port ${env.PORT}`);
  });
};

const shutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (io) io.close();
  await closeDatabase();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  logger.error('Failed to start API server', { message: error.message });
  process.exit(1);
});
