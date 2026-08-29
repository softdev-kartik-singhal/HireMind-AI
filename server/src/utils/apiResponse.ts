import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/statusCodes.js';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: HttpStatusCode;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>({
    res,
    statusCode = HTTP_STATUS.OK,
    message = 'Success',
    data,
    meta,
  }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data: data ?? null,
      ...(meta && { meta }),
    });
  }

  static created<T>({
    res,
    message = 'Resource created successfully',
    data,
    meta,
  }: Omit<ApiResponseOptions<T>, 'statusCode'>) {
    return this.success({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message,
      data,
      meta,
    });
  }

  static noContent(res: Response) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
