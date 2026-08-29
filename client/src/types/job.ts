export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type JobExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
export type JobEmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: JobExperienceLevel;
  location: string;
  employmentType: JobEmploymentType;
  salaryRange?: string | null;
  status: JobStatus;
  applicationDeadline?: string | null;
  recruiterId?: string;
  recruiter?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  _count?: {
    applications: number;
  };
  hasApplied?: boolean;
  userApplication?: {
    id: string;
    status: ApplicationStatus;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  candidateId: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    headline?: string | null;
    bio?: string | null;
    phone?: string | null;
  };
  status: ApplicationStatus;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  matchScore?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobDto {
  title: string;
  department: string;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel: JobExperienceLevel;
  location: string;
  employmentType: JobEmploymentType;
  salaryRange?: string;
  status?: JobStatus;
  applicationDeadline?: string;
}

export interface ApplyJobDto {
  jobId: string;
  resumeUrl?: string;
  coverLetter?: string;
  phone?: string;
}
