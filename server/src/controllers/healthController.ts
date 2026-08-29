import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export class HealthController {
  static check = async (_req: Request, res: Response) => {
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'disconnected';
    }

    return ApiResponse.success({
      res,
      message: 'HireMind API Server is operational',
      data: {
        service: 'hiremind-server',
        status: dbStatus === 'healthy' ? 'UP' : 'DEGRADED',
        database: {
          status: dbStatus,
          latency: `${dbLatencyMs}ms`,
        },
        environment: env.NODE_ENV,
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
      },
    });
  };
}
