export type InterviewStatus =
  | 'SCHEDULED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type InterviewType =
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'CODING'
  | 'MIXED'
  | 'SYSTEM_DESIGN'
  | 'LIVE_CODING'
  | 'AI_SCREENING';

export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionCategory =
  | 'Fundamentals'
  | 'Technical'
  | 'Scenario-based'
  | 'Problem-solving'
  | 'Project-based'
  | 'Behavioral';

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  orderIndex: number;
  title: string;
  description: string;
  type: string;
  difficulty: InterviewDifficulty;
  category: QuestionCategory | string;
  expectedTopics?: string[];
  evaluationCriteria?: string[];
  isAiGenerated?: boolean;
  starterCode?: string | null;
  testCases?: Array<{ input: string; expectedOutput: string; description?: string }> | null;
  expectedOutput?: string | null;
  rubricCriteria?: {
    keyConcepts?: string[];
    passingScore?: number;
    evaluationTips?: string;
    [key: string]: any;
  } | null;
  timeLimitMins?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateQuestionDto {
  title: string;
  description: string;
  category: QuestionCategory;
  difficulty: InterviewDifficulty;
  type?: string;
  expectedTopics: string[];
  evaluationCriteria: string[];
  starterCode?: string;
  testCases?: Array<{ input: string; expectedOutput: string; description?: string }>;
  timeLimitMins?: number;
}

export interface UpdateQuestionDto {
  title?: string;
  description?: string;
  category?: QuestionCategory;
  difficulty?: InterviewDifficulty;
  type?: string;
  expectedTopics?: string[];
  evaluationCriteria?: string[];
  starterCode?: string;
  testCases?: Array<{ input: string; expectedOutput: string; description?: string }>;
  timeLimitMins?: number;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  candidateId: string;
  status: InterviewStatus;
  currentQuestionIndex: number;
  startedAt?: string | null;
  resumedAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  timeRemainingSeconds?: number | null;
  lastActiveAt?: string;
  clientState?: Record<string, any> | null;
  proctorLogs?: Record<string, any> | null;
}

export interface InterviewResponse {
  id: string;
  interviewId: string;
  questionId: string;
  candidateId: string;
  answerText?: string | null;
  codeAnswer?: string | null;
  codeLanguage?: string | null;
  executionResults?: any;
  timeSpentSeconds: number;
  isSubmitted: boolean;
  submittedAt?: string | null;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  codeQualityScore: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  rubricBreakdown?: any;
  notes?: string | null;
}

export interface Interview {
  id: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  scheduledAt: string;
  durationMins: number;
  numQuestions: number;
  meetingLink?: string | null;
  chamberRoomId?: string | null;
  notes?: string | null;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  applicationId?: string | null;
  createdAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    headline?: string | null;
    phone?: string | null;
  };
  recruiter?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  job?: {
    id: string;
    title: string;
    department: string;
    location: string;
    experienceLevel: string;
    requiredSkills?: string[];
  };
  questions?: InterviewQuestion[];
  session?: InterviewSession | null;
  responses?: InterviewResponse[];
  evaluation?: InterviewEvaluation | null;
  _count?: {
    questions: number;
    responses: number;
  };
}

export interface SessionDataResponse {
  interview: {
    id: string;
    title: string;
    type: InterviewType;
    status: InterviewStatus;
    difficulty: InterviewDifficulty;
    durationMins: number;
    numQuestions: number;
    job?: {
      id: string;
      title: string;
      department: string;
    };
  };
  session: InterviewSession;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
}

export interface CreateInterviewDto {
  title: string;
  type?: InterviewType;
  difficulty?: InterviewDifficulty;
  durationMins?: number;
  numQuestions?: number;
  scheduledAt: string;
  jobId: string;
  candidateId: string;
  applicationId?: string;
  notes?: string;
}
