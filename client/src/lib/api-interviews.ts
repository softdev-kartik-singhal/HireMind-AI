import { apiClient } from './api-client';
import {
  Interview,
  InterviewStatus,
  SessionDataResponse,
  CreateInterviewDto,
  InterviewResponse,
  InterviewQuestion,
} from '@/types/interview';

export class InterviewApi {
  /**
   * Get all interviews for logged-in user (candidate or recruiter)
   */
  static async getInterviews(): Promise<Interview[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: { interviews: Interview[] };
    }>('/interviews');
    return res.data.data.interviews;
  }

  /**
   * Get single interview by ID
   */
  static async getInterviewById(id: string): Promise<Interview> {
    const res = await apiClient.get<{
      success: boolean;
      data: { interview: Interview };
    }>(`/interviews/${id}`);
    return res.data.data.interview;
  }

  /**
   * Schedule new interview (Recruiter / Admin)
   */
  static async createInterview(dto: CreateInterviewDto): Promise<Interview> {
    const res = await apiClient.post<{
      success: boolean;
      data: { interview: Interview };
    }>('/interviews', dto);
    return res.data.data.interview;
  }

  /**
   * Update interview status
   */
  static async updateStatus(
    id: string,
    status: InterviewStatus,
    notes?: string
  ): Promise<Interview> {
    const res = await apiClient.patch<{
      success: boolean;
      data: { interview: Interview };
    }>(`/interviews/${id}/status`, { status, notes });
    return res.data.data.interview;
  }

  /**
   * Cancel / Delete interview
   */
  static async deleteInterview(id: string): Promise<void> {
    await apiClient.delete(`/interviews/${id}`);
  }

  // ==========================================
  // CANDIDATE INTERVIEW SESSION CALLS
  // ==========================================

  /**
   * Start or resume candidate session
   */
  static async startSession(interviewId: string): Promise<SessionDataResponse> {
    const res = await apiClient.post<{
      success: boolean;
      data: SessionDataResponse;
    }>(`/interviews/${interviewId}/session/start`);
    return res.data.data;
  }

  /**
   * Get session state (Crucial for page reload survival)
   */
  static async getSession(interviewId: string): Promise<SessionDataResponse> {
    const res = await apiClient.get<{
      success: boolean;
      data: SessionDataResponse;
    }>(`/interviews/${interviewId}/session`);
    return res.data.data;
  }

  /**
   * Autosave session progress (Draft answers, buffers, current question index)
   */
  static async saveProgress(
    interviewId: string,
    payload: {
      currentQuestionIndex: number;
      clientState?: Record<string, any>;
      proctorLogs?: Record<string, any>;
      activeResponse?: {
        questionId: string;
        answerText?: string | null;
        codeAnswer?: string | null;
        codeLanguage?: string;
        timeSpentSeconds?: number;
      };
    }
  ): Promise<void> {
    await apiClient.put(`/interviews/${interviewId}/session/progress`, payload);
  }

  /**
   * Submit single question response
   */
  static async submitQuestion(
    interviewId: string,
    questionId: string,
    payload: {
      answerText?: string | null;
      codeAnswer?: string | null;
      codeLanguage?: string;
      executionResults?: any;
      timeSpentSeconds?: number;
    }
  ): Promise<InterviewResponse> {
    const res = await apiClient.post<{
      success: boolean;
      data: { response: InterviewResponse };
    }>(`/interviews/${interviewId}/questions/${questionId}/submit`, payload);
    return res.data.data.response;
  }

  /**
   * Finalize / Complete interview session
   */
  static async completeSession(interviewId: string): Promise<SessionDataResponse> {
    const res = await apiClient.post<{
      success: boolean;
      data: SessionDataResponse;
    }>(`/interviews/${interviewId}/session/complete`);
    return res.data.data;
  }

  // ==========================================
  // RECRUITER QUESTION MANAGEMENT & REVIEW
  // ==========================================

  /**
   * Get persisted questions for an interview
   */
  static async getQuestions(interviewId: string): Promise<InterviewQuestion[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: { questions: InterviewQuestion[] };
    }>(`/interviews/${interviewId}/questions`);
    return res.data.data.questions;
  }

  /**
   * Generate or retrieve persisted interview questions
   */
  static async generateQuestions(
    interviewId: string,
    forceRefresh = false
  ): Promise<{ cached: boolean; count: number; questions: InterviewQuestion[] }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { cached: boolean; count: number; questions: InterviewQuestion[] };
    }>(`/interviews/${interviewId}/questions/generate${forceRefresh ? '?forceRefresh=true' : ''}`);
    return res.data.data;
  }

  /**
   * Add a custom question to an interview
   */
  static async addQuestion(
    interviewId: string,
    data: any
  ): Promise<InterviewQuestion> {
    const res = await apiClient.post<{
      success: boolean;
      data: { question: InterviewQuestion };
    }>(`/interviews/${interviewId}/questions`, data);
    return res.data.data.question;
  }

  /**
   * Update an existing interview question
   */
  static async updateQuestion(
    interviewId: string,
    questionId: string,
    data: any
  ): Promise<InterviewQuestion> {
    const res = await apiClient.patch<{
      success: boolean;
      data: { question: InterviewQuestion };
    }>(`/interviews/${interviewId}/questions/${questionId}`, data);
    return res.data.data.question;
  }

  /**
   * Delete a question from an interview
   */
  static async deleteQuestion(
    interviewId: string,
    questionId: string
  ): Promise<void> {
    await apiClient.delete(`/interviews/${interviewId}/questions/${questionId}`);
  }

  /**
   * Reorder questions in an interview
   */
  static async reorderQuestions(
    interviewId: string,
    questionIds: string[]
  ): Promise<InterviewQuestion[]> {
    const res = await apiClient.put<{
      success: boolean;
      data: { questions: InterviewQuestion[] };
    }>(`/interviews/${interviewId}/questions/reorder`, { questionIds });
    return res.data.data.questions;
  }
}
