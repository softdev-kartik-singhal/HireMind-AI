import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 HireMind AI Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📡 API endpoint: http://localhost:${env.PORT}/api/v1`);
  logger.info(`🩺 Health check: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force close after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error | unknown) => {
  logger.error('UNHANDLED REJECTION! 💥', reason);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});
