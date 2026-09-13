import { JobMatchResult } from '../../validations/jobMatch.schema.js';

export interface CandidateMatchInput {
  candidateId: string;
  fullName?: string | null;
  headline?: string | null;
  summary?: string | null;
  yearsOfExperience?: number;
  skills: { name: string; category?: string }[];
  workExperiences: {
    company: string;
    position: string;
    description?: string | null;
    technologies: string[];
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean;
  }[];
  educations: {
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
  }[];
  projects: {
    title: string;
    description?: string | null;
    technologies: string[];
    highlights?: string[];
  }[];
  certifications?: string[];
  resumeText?: string;
}

export interface JobMatchInput {
  jobId: string;
  title: string;
  department: string;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string; // ENTRY, MID, SENIOR, LEAD, EXECUTIVE
  location?: string;
}

export interface IAiJobMatcher {
  /**
   * Evaluate compatibility between job requirements and candidate profile/resume.
   */
  matchCandidateToJob(
    job: JobMatchInput,
    candidate: CandidateMatchInput
  ): Promise<JobMatchResult>;
}
