import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { VoiceService } from '../services/voice/voiceService.js';
import { submitVoiceResponseSchema } from '../validations/voiceValidations.js';

export class VoiceController {
  /**
   * Transcribe recorded audio file into text with real-time metrics
   * POST /api/v1/voice/transcribe
   */
  static transcribe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest('Audio file is required for transcription');
    }

    const questionId = (req.body.questionId || req.query.questionId) as string | undefined;

    const result = await VoiceService.transcribeAudio(
      req.file.buffer,
      req.file.mimetype,
      questionId
    );

    return ApiResponse.success({
      res,
      message: 'Audio transcribed successfully',
      data: result,
    });
  });

  /**
   * Submit and persist verbal answer response with communication metrics
   * POST /api/v1/voice/submit-response
   */
  static submitResponse = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const validatedInput = submitVoiceResponseSchema.parse(req.body);

    const result = await VoiceService.submitVoiceResponse(
      req.user.id,
      validatedInput
    );

    return ApiResponse.created({
      res,
      message: 'Voice response recorded and evaluated successfully',
      data: result,
    });
  });
}
