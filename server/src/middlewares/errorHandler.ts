import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: unknown[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      statusCode = HTTP_STATUS.CONFLICT;
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      message = `A record with this ${target} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = HTTP_STATUS.NOT_FOUND;
      message = 'Requested record was not found';
    } else {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = 'Database operation failed';
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token expired';
  } else if (err.name === 'SyntaxError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON in request body';
  } else {
    message = err.message || 'Internal Server Error';
  }

  logger.error(`${statusCode} - ${message} - ${err.stack ?? ''}`);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
