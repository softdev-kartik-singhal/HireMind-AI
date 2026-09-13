import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { getSpeechToTextService } from './index.js';
import { CommunicationMetricsService } from './communicationMetrics.service.js';
import { SubmitVoiceResponseInput } from '../../validations/voiceValidations.js';

export class VoiceService {
  /**
   * Transcribe an uploaded audio buffer and compute real-time communication metrics
   */
  static async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    questionId?: string
  ) {
    let question = null;
    if (questionId) {
      question = await prisma.interviewQuestion.findUnique({
        where: { id: questionId },
      });
    }

    const sttService = getSpeechToTextService();
    const result = await sttService.transcribe(audioBuffer, mimeType, {
      questionTitle: question?.title,
      expectedTopics: question?.expectedTopics || [],
    });

    const metrics = CommunicationMetricsService.computeMetrics({
      transcript: result.transcript,
      durationSeconds: result.durationSeconds,
      expectedTopics: question?.expectedTopics || [],
      questionDescription: question?.description,
      questionTitle: question?.title,
    });

    return {
      transcript: result.transcript,
      durationSeconds: result.durationSeconds,
      wordCount: result.wordCount,
      confidence: result.confidence,
      provider: result.provider,
      metrics,
    };
  }

  /**
   * Finalize and persist a candidate's verbal response with communication metrics
   */
  static async submitVoiceResponse(
    candidateId: string,
    input: SubmitVoiceResponseInput
  ) {
    const { interviewId, questionId, transcript, durationSeconds, audioUrl } = input;

    // Verify interview exists and candidate matches
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        session: true,
      },
    });

    if (!interview) {
      throw ApiError.notFound('Interview not found');
    }

    if (interview.candidateId !== candidateId) {
      throw ApiError.forbidden('You are not authorized to submit responses for this interview');
    }

    const question = interview.questions.find((q: any) => q.id === questionId);
    if (!question) {
      throw ApiError.notFound('Interview question not found');
    }

    // Compute comprehensive communication metrics
    const metrics = CommunicationMetricsService.computeMetrics({
      transcript,
      durationSeconds,
      expectedTopics: question.expectedTopics || [],
      questionDescription: question.description,
      questionTitle: question.title,
    });

    // Upsert InterviewResponse record
    const response = await prisma.interviewResponse.upsert({
      where: {
        interviewId_questionId: {
          interviewId,
          questionId,
        },
      },
      create: {
        interviewId,
        questionId,
        candidateId,
        answerText: transcript,
        transcript,
        audioUrl,
        speakingDurationSeconds: durationSeconds,
        fillerWordCount: metrics.fillerWordCount,
        fillerWords: metrics.fillerBreakdown as any,
        answerRelevanceScore: metrics.answerRelevanceScore,
        responseCompletenessScore: metrics.responseCompletenessScore,
        communicationMetrics: metrics as any,
        timeSpentSeconds: Math.round(durationSeconds),
        isSubmitted: true,
        submittedAt: new Date(),
      },
      update: {
        answerText: transcript,
        transcript,
        audioUrl,
        speakingDurationSeconds: durationSeconds,
        fillerWordCount: metrics.fillerWordCount,
        fillerWords: metrics.fillerBreakdown as any,
        answerRelevanceScore: metrics.answerRelevanceScore,
        responseCompletenessScore: metrics.responseCompletenessScore,
        communicationMetrics: metrics as any,
        timeSpentSeconds: Math.round(durationSeconds),
        isSubmitted: true,
        submittedAt: new Date(),
      },
    });

    // Find next question index
    const currentQIndex = interview.questions.findIndex((q: any) => q.id === questionId);
    const nextQuestionIndex =
      currentQIndex < interview.questions.length - 1 ? currentQIndex + 1 : currentQIndex;

    // Update interview session progress
    if (interview.session) {
      await prisma.interviewSession.update({
        where: { id: interview.session.id },
        data: {
          currentQuestionIndex: nextQuestionIndex,
          lastActiveAt: new Date(),
        },
      });
    }

    return {
      response,
      metrics,
      nextQuestionIndex,
      isLastQuestion: currentQIndex === interview.questions.length - 1,
    };
  }
}
