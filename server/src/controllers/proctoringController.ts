import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { ProctoringService } from '../services/proctoringService.js';
import {
  recordProctoringEventSchema,
  recordBatchProctoringEventsSchema,
} from '../validations/proctoringValidations.js';

export class ProctoringController {
  /**
   * Log single or batch integrity events from candidate browser
   * POST /api/v1/proctoring/events
   */
  static recordEvents = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Support both single event or batch events payload
    if (Array.isArray(req.body.events)) {
      const parsed = recordBatchProctoringEventsSchema.parse(req.body);
      const result = await ProctoringService.recordEvents(
        req.user.id,
        parsed.interviewId,
        parsed.events
      );
      return ApiResponse.created({
        res,
        message: `${result.recordedCount} integrity event(s) recorded successfully`,
        data: result,
      });
    } else {
      const parsed = recordProctoringEventSchema.parse(req.body);
      const result = await ProctoringService.recordEvents(req.user.id, parsed.interviewId, [
        {
          eventType: parsed.eventType,
          timestamp: parsed.timestamp,
          durationMs: parsed.durationMs,
          metadata: parsed.metadata,
        },
      ]);
      return ApiResponse.created({
        res,
        message: 'Integrity event recorded successfully',
        data: result,
      });
    }
  });

  /**
   * Retrieve proctoring timeline and calculated integrity signals for an interview
   * GET /api/v1/proctoring/interviews/:interviewId/events
   */
  static getTimeline = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { interviewId } = req.params;
    if (!interviewId) {
      throw ApiError.badRequest('interviewId parameter is required');
    }

    const timeline = await ProctoringService.getInterviewTimeline(
      interviewId,
      req.user.id
    );

    return ApiResponse.success({
      res,
      message: 'Interview proctoring timeline retrieved successfully',
      data: timeline,
    });
  });
}
