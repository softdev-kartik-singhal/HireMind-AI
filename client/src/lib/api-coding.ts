import { apiClient } from './api-client';
import {
  CodingQuestion,
  CodingSubmission,
  CodeExecutionResult,
  RunCodePayload,
  SubmitCodePayload,
} from '@/types/coding';

export class CodingApi {
  /**
   * Run code against visible test cases in isolated runner
   */
  static async runCode(payload: RunCodePayload): Promise<CodeExecutionResult> {
    const res = await apiClient.post<{
      success: boolean;
      data: CodeExecutionResult;
    }>('/coding/run', payload);
    return res.data.data;
  }

  /**
   * Submit solution and record permanent submission in PostgreSQL
   */
  static async submitSolution(payload: SubmitCodePayload): Promise<{
    submission: CodingSubmission;
    executionResult: CodeExecutionResult;
  }> {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        submission: CodingSubmission;
        executionResult: CodeExecutionResult;
      };
    }>('/coding/submit', payload);
    return res.data.data;
  }

  /**
   * Get single coding question by ID
   */
  static async getQuestion(id: string): Promise<CodingQuestion> {
    const res = await apiClient.get<{
      success: boolean;
      data: { question: CodingQuestion };
    }>(`/coding/questions/${id}`);
    return res.data.data.question;
  }

  /**
   * Get all coding questions (optionally for an interview)
   */
  static async getQuestions(interviewId?: string): Promise<CodingQuestion[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: { questions: CodingQuestion[] };
    }>('/coding/questions', {
      params: interviewId ? { interviewId } : undefined,
    });
    return res.data.data.questions;
  }

  /**
   * Get candidate submission history for a question
   */
  static async getSubmissions(
    questionId: string,
    interviewId?: string
  ): Promise<CodingSubmission[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: { submissions: CodingSubmission[] };
    }>('/coding/submissions', {
      params: {
        questionId,
        ...(interviewId ? { interviewId } : {}),
      },
    });
    return res.data.data.submissions;
  }
}
