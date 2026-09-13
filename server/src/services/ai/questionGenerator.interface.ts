import {
  AiQuestionGenerationResult,
  QuestionDifficulty,
  QuestionType,
} from '../../validations/questionGenerator.schema.js';

export interface QuestionJobContext {
  title: string;
  department?: string;
  description: string;
  responsibilities?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel: string;
}

export interface QuestionCandidateContext {
  fullName?: string;
  headline?: string;
  summary?: string;
  yearsOfExperience?: number;
  skills: string[];
  experiences?: Array<{
    company: string;
    position: string;
    description?: string;
    technologies?: string[];
  }>;
  projects?: Array<{
    title: string;
    description?: string;
    technologies?: string[];
  }>;
}

export interface QuestionGenerationInput {
  job: QuestionJobContext;
  candidate: QuestionCandidateContext;
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'CODING' | 'MIXED';
  difficulty: QuestionDifficulty;
  numQuestions: number;
}

export interface IAiQuestionGenerator {
  generateQuestions(input: QuestionGenerationInput): Promise<AiQuestionGenerationResult>;
}
