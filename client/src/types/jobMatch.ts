export type MatchRecommendation =
  | 'STRONG_MATCH'
  | 'GOOD_MATCH'
  | 'PARTIAL_MATCH'
  | 'WEAK_MATCH';

export interface ExperienceMatch {
  score: number;
  summary: string;
  candidateYears?: number;
  requiredLevel?: string;
  relevanceExplanation?: string;
}

export interface ScoringBreakdownItem {
  weight: number;
  score: number;
  details?: string;
}

export interface ScoringBreakdown {
  requiredSkills: ScoringBreakdownItem;
  experience: ScoringBreakdownItem;
  preferredSkills: ScoringBreakdownItem;
  projects: ScoringBreakdownItem;
  education: ScoringBreakdownItem;
}

export interface JobMatchAnalysis {
  id: string;
  jobId: string;
  candidateId: string;
  overallScore: number;
  requiredSkillScore: number;
  preferredSkillScore: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  experienceMatch: ExperienceMatch;
  recommendation: MatchRecommendation;
  summary: string;
  scoringBreakdown?: ScoringBreakdown;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    department: string;
    experienceLevel: string;
    requiredSkills: string[];
    preferredSkills: string[];
  };
  candidate?: {
    id: string;
    name: string;
    email: string;
    headline?: string | null;
    avatar?: string | null;
  };
}

export interface JobMatchResponse {
  cached: boolean;
  match: JobMatchAnalysis;
}
