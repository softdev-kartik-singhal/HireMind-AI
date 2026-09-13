import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { CodingService } from '../services/codingService.js';

export class CodingController {
  /**
   * Execute code in sandboxed runner (Run Code)
   * POST /api/v1/coding/run
   */
  static runCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const result = await CodingService.runCode(req.user.id, req.body);
    return ApiResponse.success({
      res,
      message: 'Code executed in sandboxed runner successfully',
      data: result,
    });
  });

  /**
   * Submit solution against all test cases and record submission
   * POST /api/v1/coding/submit
   */
  static submitCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const result = await CodingService.submitSolution(req.user.id, req.body);
    return ApiResponse.created({
      res,
      message:
        result.executionResult.status === 'ACCEPTED'
          ? 'Solution accepted! All test cases passed.'
          : `Solution submitted: ${result.executionResult.status}`,
      data: result,
    });
  });

  /**
   * Get single coding question details with starter codes & test cases
   * GET /api/v1/coding/questions/:id
   */
  static getQuestionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const question = await CodingService.getQuestionById(id);

    return ApiResponse.success({
      res,
      message: 'Coding question details retrieved successfully',
      data: { question },
    });
  });

  /**
   * Get all coding questions
   * GET /api/v1/coding/questions
   */
  static getQuestions = asyncHandler(async (req: Request, res: Response) => {
    const interviewId = req.query.interviewId as string | undefined;
    const questions = await CodingService.getQuestions(interviewId);

    return ApiResponse.success({
      res,
      message: 'Coding questions retrieved successfully',
      data: { questions },
    });
  });

  /**
   * Get submission history for candidate
   * GET /api/v1/coding/submissions
   */
  static getSubmissions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const questionId = req.query.questionId as string;
    if (!questionId) {
      throw ApiError.badRequest('Question ID is required');
    }
    const interviewId = req.query.interviewId as string | undefined;

    const submissions = await CodingService.getSubmissions(
      questionId,
      req.user.id,
      interviewId
    );

    return ApiResponse.success({
      res,
      message: 'Coding submission history retrieved successfully',
      data: { submissions },
    });
  });
}
