import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { InterviewService } from '../services/interviewService.js';
import { ApiError } from '../utils/apiError.js';

export class InterviewController {
  /**
   * List interviews for logged-in user
   * GET /api/v1/interviews
   */
  static getInterviews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const interviews = await InterviewService.getInterviews(req.user.id, req.user.role);
    return ApiResponse.success({
      res,
      message: 'Interviews retrieved successfully',
      data: { interviews },
    });
  });

  /**
   * Get single interview details with questions and session
   * GET /api/v1/interviews/:id
   */
  static getInterviewById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const interview = await InterviewService.getInterviewById(id, req.user.id, req.user.role);

    return ApiResponse.success({
      res,
      message: 'Interview details retrieved successfully',
      data: { interview },
    });
  });

  /**
   * Schedule new interview session (Recruiter or Admin)
   * POST /api/v1/interviews
   */
  static createInterview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const interview = await InterviewService.createInterview(req.user.id, req.body);
    return ApiResponse.created({
      res,
      message: 'Interview session scheduled successfully',
      data: { interview },
    });
  });

  /**
   * Update interview status (Recruiter or Admin)
   * PATCH /api/v1/interviews/:id/status
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const { status, notes } = req.body;
    const interview = await InterviewService.updateStatus(id, req.user.id, req.user.role, status, notes);

    return ApiResponse.success({
      res,
      message: `Interview status updated to ${status}`,
      data: { interview },
    });
  });

  /**
   * Delete / Cancel interview
   * DELETE /api/v1/interviews/:id
   */
  static deleteInterview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const result = await InterviewService.deleteInterview(id, req.user.id, req.user.role);

    return ApiResponse.success({
      res,
      message: result.message,
      data: result,
    });
  });

  // ==========================================
  // CANDIDATE INTERVIEW SESSION CONTROLLERS
  // ==========================================

  /**
   * Start or resume candidate session
   * POST /api/v1/interviews/:id/session/start
   */
  static startSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const sessionData = await InterviewService.startSession(id, req.user.id);

    return ApiResponse.success({
      res,
      message: 'Interview session started',
      data: sessionData,
    });
  });

  /**
   * Get session state (Crucial for page reload survival)
   * GET /api/v1/interviews/:id/session
   */
  static getSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const sessionData = await InterviewService.getSession(id, req.user.id);

    return ApiResponse.success({
      res,
      message: 'Interview session state retrieved',
      data: sessionData,
    });
  });

  /**
   * Autosave session progress (Draft answers, buffers, current question index)
   * PUT /api/v1/interviews/:id/session/progress
   */
  static saveProgress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const updated = await InterviewService.saveSessionProgress(id, req.user.id, req.body);

    return ApiResponse.success({
      res,
      message: 'Interview progress saved to server',
      data: { session: updated },
    });
  });

  /**
   * Submit response to a specific question
   * POST /api/v1/interviews/:id/questions/:questionId/submit
   */
  static submitQuestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id, questionId } = req.params;
    const response = await InterviewService.submitQuestionResponse(
      id,
      questionId,
      req.user.id,
      req.body
    );

    return ApiResponse.success({
      res,
      message: 'Question response submitted successfully',
      data: { response },
    });
  });

  /**
   * Complete interview session
   * POST /api/v1/interviews/:id/session/complete
   */
  static completeSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const result = await InterviewService.completeSession(id, req.user.id);

    return ApiResponse.success({
      res,
      message: 'Interview completed successfully',
      data: result,
    });
  });

  // ==========================================
  // QUESTION MANAGEMENT & REVIEW HANDLERS
  // ==========================================

  /**
   * Get persisted questions for review
   * GET /api/v1/interviews/:id/questions
   */
  static getQuestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const questions = await InterviewService.getQuestions(id, req.user.id, req.user.role);

    return ApiResponse.success({
      res,
      message: 'Interview questions retrieved successfully',
      data: { questions },
    });
  });

  /**
   * Generate questions using AI engine (or return cached if already generated)
   * POST /api/v1/interviews/:id/questions/generate
   */
  static generateQuestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const forceRefresh = req.query.forceRefresh === 'true';

    const result = await InterviewService.generateQuestionsForInterview(
      id,
      req.user.id,
      req.user.role,
      forceRefresh
    );

    return ApiResponse.success({
      res,
      message: result.cached
        ? 'Retrieved persisted interview questions'
        : 'AI questions generated and persisted successfully',
      data: result,
    });
  });

  /**
   * Recruiter adds a custom question
   * POST /api/v1/interviews/:id/questions
   */
  static addQuestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const question = await InterviewService.addQuestion(id, req.user.id, req.body);

    return ApiResponse.created({
      res,
      message: 'Custom question added successfully',
      data: { question },
    });
  });

  /**
   * Recruiter updates an existing question
   * PATCH /api/v1/interviews/:id/questions/:questionId
   */
  static updateQuestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id, questionId } = req.params;
    const question = await InterviewService.updateQuestion(
      id,
      questionId,
      req.user.id,
      req.body
    );

    return ApiResponse.success({
      res,
      message: 'Question updated successfully',
      data: { question },
    });
  });

  /**
   * Recruiter deletes a question
   * DELETE /api/v1/interviews/:id/questions/:questionId
   */
  static deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id, questionId } = req.params;
    const result = await InterviewService.deleteQuestion(id, questionId, req.user.id);

    return ApiResponse.success({
      res,
      message: result.message,
    });
  });

  /**
   * Recruiter reorders questions
   * PUT /api/v1/interviews/:id/questions/reorder
   */
  static reorderQuestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const { questionIds } = req.body;
    const questions = await InterviewService.reorderQuestions(
      id,
      req.user.id,
      questionIds
    );

    return ApiResponse.success({
      res,
      message: 'Questions reordered successfully',
      data: { questions },
    });
  });
}
