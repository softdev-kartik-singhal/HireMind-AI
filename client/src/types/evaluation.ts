export type EvaluationRecommendation =
  | 'STRONG_HIRE'
  | 'HIRE'
  | 'MAYBE'
  | 'NO_HIRE';

export interface InterviewEvaluationData {
  id: string;
  interviewId: string;
  evaluatorId?: string | null;

  // 7 Dimensions (0 - 100)
  overallScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  codingScore: number;
  codeQualityScore?: number;
  communicationScore: number;
  answerRelevanceScore: number;
  skillAlignmentScore: number;

  // Recommendations
  recommendation: EvaluationRecommendation;
  summary: string;

  // Qualitative Feedback
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  technicalSummary: string;
  communicationSummary: string;
  improvementAreas: string[];
  growthAreas?: string[];
  rubricBreakdown?: Record<string, any> | null;
  notes?: string | null;

  // Recruiter Overrides
  recruiterRecommendation?: EvaluationRecommendation | null;
  recruiterNotes?: string | null;
  isOverridden: boolean;
  overriddenAt?: string | null;
  overriddenById?: string | null;
  decisionSupportDisclaimer: string;

  createdAt: string;
  updatedAt: string;
}

export interface RecruiterOverrideDto {
  recommendation: EvaluationRecommendation;
  recruiterNotes?: string;
}
