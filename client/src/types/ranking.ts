export interface RankingWeights {
  resumeWeight: number; // default: 20
  codingWeight: number; // default: 30
  technicalWeight: number; // default: 25
  communicationWeight: number; // default: 15
  otherWeight: number; // default: 10
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  resumeWeight: 20,
  codingWeight: 30,
  technicalWeight: 25,
  communicationWeight: 15,
  otherWeight: 10,
};

export interface ScoreContribution {
  dimension: string;
  rawScore: number;
  weightPercentage: number;
  weightedContribution: number;
}

export interface CandidateRankRecord {
  rank: number;
  applicationId: string;
  candidateId: string;
  name: string;
  email: string;
  avatar: string | null;
  headline: string;
  status: string;
  notes: string | null;
  appliedAt: string;

  // Raw component scores (0 - 100)
  resumeScore: number;
  codingScore: number;
  technicalScore: number;
  communicationScore: number;
  otherScore: number;

  // Calibrated overall score
  overallScore: number;

  // Transparent mathematical breakdown
  breakdown: ScoreContribution[];

  // Deterministic Merit Recommendation
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE';
  recommendationBadge: {
    label: string;
    variant: 'success' | 'primary' | 'warning' | 'danger';
  };

  interviewId: string | null;
  interviewStatus: string | null;
}

export interface JobRankingResponse {
  job: {
    id: string;
    title: string;
    department: string;
    experienceLevel: string;
    requiredSkills: string[];
    preferredSkills: string[];
  };
  weights: RankingWeights;
  totalCandidates: number;
  rankings: CandidateRankRecord[];
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export type CandidatePipelineAction = 'SHORTLIST' | 'REJECT' | 'MOVE_TO_INTERVIEW' | 'ADD_NOTES';
