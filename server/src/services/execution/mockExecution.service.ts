import {
  ICodeExecutionService,
  ExecuteCodeInput,
  CodeExecutionResult,
  TestCaseResult,
} from './codeExecution.interface.js';

export class MockExecutionService implements ICodeExecutionService {
  /**
   * Safe Sandboxed Code Execution Simulator
   * IMPORTANT: Never executes arbitrary candidate code directly on the host backend server.
   */
  async execute(input: ExecuteCodeInput): Promise<CodeExecutionResult> {
    const { language, code, testCases } = input;
    const trimmed = code.trim();

    // 1. Basic Static Code & Syntax Analysis per Language
    if (!trimmed || trimmed.length < 5) {
      return {
        success: false,
        status: 'COMPILATION_ERROR',
        language,
        passedTests: 0,
        totalTests: testCases.length,
        totalExecutionTimeMs: 0,
        results: testCases.map((tc, idx) => ({
          testCaseIndex: idx,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          passed: false,
          executionTimeMs: 0,
          status: 'ERROR',
          error: 'Empty code or insufficient implementation provided.',
          isHidden: tc.isHidden,
        })),
        stderr: 'Compilation Error: Solution buffer is empty or incomplete.',
        isSandboxed: true,
        sandboxProvider: 'mock-isolated-sandbox',
        timestamp: new Date().toISOString(),
      };
    }

    // Check bracket/brace balance
    let balance = 0;
    for (const char of trimmed) {
      if (char === '{' || char === '(' || char === '[') balance++;
      if (char === '}' || char === ')' || char === ']') balance--;
      if (balance < 0) break;
    }

    if (balance !== 0) {
      return {
        success: false,
        status: 'COMPILATION_ERROR',
        language,
        passedTests: 0,
        totalTests: testCases.length,
        totalExecutionTimeMs: 5,
        results: testCases.map((tc, idx) => ({
          testCaseIndex: idx,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          passed: false,
          executionTimeMs: 0,
          status: 'ERROR',
          error: 'SyntaxError: Unexpected token or unmatched brackets/parentheses.',
          isHidden: tc.isHidden,
        })),
        stderr: 'SyntaxError: Unmatched delimiters detected in source code.',
        isSandboxed: true,
        sandboxProvider: 'mock-isolated-sandbox',
        timestamp: new Date().toISOString(),
      };
    }

    // Check language-specific structural keywords
    let syntaxValid = false;
    switch (language) {
      case 'python':
        syntaxValid = trimmed.includes('def ') || trimmed.includes('return') || trimmed.includes('class ');
        break;
      case 'javascript':
        syntaxValid = trimmed.includes('function') || trimmed.includes('return') || trimmed.includes('=>') || trimmed.includes('class ');
        break;
      case 'cpp':
        syntaxValid = trimmed.includes('#include') || trimmed.includes('class ') || trimmed.includes('vector') || trimmed.includes('return') || trimmed.includes('int ');
        break;
      case 'java':
        syntaxValid = trimmed.includes('class ') || trimmed.includes('public ') || trimmed.includes('return') || trimmed.includes('static ');
        break;
      default:
        syntaxValid = true;
    }

    if (!syntaxValid) {
      return {
        success: false,
        status: 'COMPILATION_ERROR',
        language,
        passedTests: 0,
        totalTests: testCases.length,
        totalExecutionTimeMs: 8,
        results: testCases.map((tc, idx) => ({
          testCaseIndex: idx,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          passed: false,
          executionTimeMs: 0,
          status: 'ERROR',
          error: `CompilationError: Expected valid ${language} function or method declaration.`,
          isHidden: tc.isHidden,
        })),
        stderr: `CompilationError: Missing valid ${language} declaration or return statement.`,
        isSandboxed: true,
        sandboxProvider: 'mock-isolated-sandbox',
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Simulate Safe Test Execution against Test Cases
    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let totalTime = 0;

    // Detect if the code looks like a complete solution or placeholder
    const isMinimalOrPlaceholder =
      trimmed.includes('// TODO') ||
      trimmed.includes('# TODO') ||
      trimmed.includes('return null;') ||
      trimmed.includes('return None') ||
      trimmed.includes('return false;') ||
      trimmed.includes('return 0;') ||
      trimmed.length < 50;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execTime = Math.floor(Math.random() * 25) + 12; // 12ms - 37ms
      totalTime += execTime;

      let passed = true;
      let actualOutput = tc.expectedOutput;
      let status: 'PASSED' | 'FAILED' = 'PASSED';
      let errorMsg: string | undefined = undefined;

      // If solution is just placeholder starter code, fail some or all test cases
      if (isMinimalOrPlaceholder) {
        if (i > 0) {
          passed = false;
          status = 'FAILED';
          actualOutput = language === 'python' ? 'None' : 'null';
          errorMsg = `Expected: ${tc.expectedOutput}, Received: ${actualOutput}`;
        }
      }

      if (passed) {
        passedCount++;
      }

      results.push({
        testCaseIndex: i,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        executionTimeMs: execTime,
        status,
        error: errorMsg,
        isHidden: tc.isHidden,
      });
    }

    const allPassed = passedCount === testCases.length;

    return {
      success: true,
      status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
      language,
      passedTests: passedCount,
      totalTests: testCases.length,
      totalExecutionTimeMs: totalTime,
      results,
      stdout: allPassed
        ? `[Sandboxed Isolated Runner (${language})]\n✓ All ${testCases.length} test cases passed.\nTotal execution time: ${totalTime}ms`
        : `[Sandboxed Isolated Runner (${language})]\nPassed: ${passedCount}/${testCases.length} tests.\nTest ${passedCount + 1} failed assertion.`,
      isSandboxed: true,
      sandboxProvider: 'mock-isolated-sandbox',
      timestamp: new Date().toISOString(),
    };
  }
}
