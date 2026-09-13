export type SupportedCodingLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export interface CodeTestCaseInput {
  id?: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

export interface ExecuteCodeInput {
  language: SupportedCodingLanguage;
  code: string;
  testCases: CodeTestCaseInput[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
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

export interface ICodeExecutionService {
  execute(input: ExecuteCodeInput): Promise<CodeExecutionResult>;
}
