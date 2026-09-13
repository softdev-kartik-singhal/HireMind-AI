export type ResumeParsingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ParsedWorkExperience {
  company: string;
  position: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  technologies?: string[];
}

export interface ParsedEducationRecord {
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
}

export interface ParsedCandidateSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  other: string[];
}

export interface ParsedCandidateProject {
  title: string;
  description?: string | null;
  technologies: string[];
  url?: string | null;
  highlights: string[];
}

export interface ParsedCandidateProfile {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  yearsOfExperience: number;
  skills: ParsedCandidateSkills;
  education: ParsedEducationRecord[];
  workExperience: ParsedWorkExperience[];
  projects: ParsedCandidateProject[];
  certifications: string[];
  achievements: string[];
}

export interface NormalizedSkill {
  id?: string;
  name: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL' | 'OTHER' | string;
}

export interface CandidateProfileResponse {
  id: string | null;
  userId: string;
  fullName: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  yearsOfExperience: number;
  certifications: string[];
  achievements: string[];
  workExperiences: ParsedWorkExperience[];
  educations: ParsedEducationRecord[];
  skills: NormalizedSkill[];
  projects: ParsedCandidateProject[];
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    headline?: string | null;
    bio?: string | null;
    phone?: string | null;
  };
}

export interface Resume {
  id: string;
  candidateId: string;
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isPrimary: boolean;
  parsingStatus: ResumeParsingStatus;
  parsingError?: string | null;
  parsedData?: ParsedCandidateProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResumeOptions {
  setPrimary?: boolean;
  onProgress?: (percentage: number) => void;
}
