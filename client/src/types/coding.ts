export type SupportedCodingLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export interface CodeTestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

export interface CodingQuestion {
  id: string;
  interviewId?: string | null;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  constraints?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases?: CodeTestCase[];
  starterCode?: Record<SupportedCodingLanguage, string>;
  supportedLanguages?: SupportedCodingLanguage[];
  category?: string;
  timeLimitMins?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  executionTimeMs: number;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIME_LIMIT_EXCEEDED';
  error?: string;
  isHidden?: boolean;
}

export interface CodeExecutionResult {
  success: boolean;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR';
  language: SupportedCodingLanguage;
  passedTests: number;
  totalTests: number;
  totalExecutionTimeMs: number;
  results: TestCaseResult[];
  stdout?: string;
  stderr?: string;
  isSandboxed: boolean;
  sandboxProvider: string;
  timestamp: string;
}

export interface CodingSubmission {
  id: string;
  candidateId: string;
  interviewId?: string | null;
  questionId: string;
  language: SupportedCodingLanguage;
  code: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | string;
  testResults?: TestCaseResult[];
  passedTests: number;
  totalTests: number;
  executionTime: number;
  memoryUsage?: number | null;
  submittedAt: string;
}

export interface RunCodePayload {
  questionId?: string;
  interviewId?: string;
  language: SupportedCodingLanguage;
  code: string;
  customTestCases?: CodeTestCase[];
}

export interface SubmitCodePayload {
  questionId: string;
  interviewId?: string;
  language: SupportedCodingLanguage;
  code: string;
}
