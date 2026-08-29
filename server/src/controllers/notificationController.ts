import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotificationService } from '../services/notificationService.js';
import { ApiError } from '../utils/apiError.js';

export class NotificationController {
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const notifications = await NotificationService.getNotifications(req.user.id);
    return ApiResponse.success({
      res,
      message: 'Notifications retrieved successfully',
      data: { notifications },
    });
  });

  static markRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    await NotificationService.markRead(id, req.user.id);
    return ApiResponse.success({
      res,
      message: 'Notification marked as read',
    });
  });

  static markAllRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    await NotificationService.markAllRead(req.user.id);
    return ApiResponse.success({
      res,
      message: 'All notifications marked as read',
    });
  });
}
