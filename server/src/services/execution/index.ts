import { ICodeExecutionService } from './codeExecution.interface.js';
import { MockExecutionService } from './mockExecution.service.js';
import { env } from '../../config/env.js';

let executionServiceInstance: ICodeExecutionService | null = null;

export const getCodeExecutionService = (): ICodeExecutionService => {
  if (!executionServiceInstance) {
    // Pluggable architecture: Supports 'mock' or future sandboxes (e.g. Judge0 / Piston / Docker containers)
    const provider = env.CODE_EXECUTION_PROVIDER || 'mock';

    switch (provider) {
      case 'mock':
      default:
        executionServiceInstance = new MockExecutionService();
        break;
    }
  }

  return executionServiceInstance;
};

export * from './codeExecution.interface.js';
export * from './mockExecution.service.js';
