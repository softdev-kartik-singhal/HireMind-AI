import { AiEvaluationOutput } from '../../validations/evaluationValidations.js';

export interface EvaluationCandidateContext {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experienceYears?: number;
}

export interface EvaluationJobContext {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel?: string;
}

export interface EvaluationQuestionContext {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  expectedTopics?: string[];
  evaluationCriteria?: string[];
  response?: {
    answerText?: string | null;
    codeAnswer?: string | null;
    codeLanguage?: string | null;
    executionResults?: any;
    speakingDurationSeconds?: number | null;
    speakingWpm?: number | null;
    fillerWordCount?: number | null;
    answerRelevanceScore?: number | null;
    responseCompletenessScore?: number | null;
    isSubmitted?: boolean;
  };
}

export interface EvaluationProctoringContext {
  totalEvents: number;
  cleanTimePercentage: number;
  integrityRating: string;
  counts: Record<string, number>;
}

export interface EvaluationContext {
  interviewTitle: string;
  interviewType: string;
  interviewDifficulty: string;
  durationMinutes: number;
  candidate: EvaluationCandidateContext;
  job: EvaluationJobContext;
  questions: EvaluationQuestionContext[];
  proctoring?: EvaluationProctoringContext;
}

export interface IAiEvaluationEngine {
  evaluateInterview(context: EvaluationContext): Promise<AiEvaluationOutput>;
}
