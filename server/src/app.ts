import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/apiError.js';
import { ApiResponse } from './utils/apiResponse.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS setup
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Root health endpoint
  app.get('/health', (_req: Request, res: Response) => {
    return ApiResponse.success({
      res,
      message: 'HireMind AI Backend Server is running',
      data: {
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // API v1 routes
  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
