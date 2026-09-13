import { IAiResumeParser } from './aiParser.interface.js';
import { GeminiResumeParser } from './geminiResumeParser.js';
import { MockResumeParser } from './mockResumeParser.js';
import { IAiJobMatcher } from './jobMatcher.interface.js';
import { GeminiJobMatcher } from './geminiJobMatcher.js';
import { MockJobMatcher } from './mockJobMatcher.js';
import { env } from '../../config/env.js';

import { IAiQuestionGenerator } from './questionGenerator.interface.js';
import { GeminiQuestionGenerator } from './geminiQuestionGenerator.js';
import { MockQuestionGenerator } from './mockQuestionGenerator.js';

let aiParserInstance: IAiResumeParser | null = null;
let aiMatcherInstance: IAiJobMatcher | null = null;
let aiQuestionGenInstance: IAiQuestionGenerator | null = null;

export const getAiResumeParser = (): IAiResumeParser => {
  if (!aiParserInstance) {
    const provider = env.AI_PROVIDER || 'gemini';

    switch (provider) {
      case 'mock':
        aiParserInstance = new MockResumeParser();
        break;
      case 'gemini':
      default:
        aiParserInstance = new GeminiResumeParser();
        break;
    }
  }
  return aiParserInstance;
};

export const getAiJobMatcher = (): IAiJobMatcher => {
  if (!aiMatcherInstance) {
    const provider = env.AI_PROVIDER || 'gemini';

    switch (provider) {
      case 'mock':
        aiMatcherInstance = new MockJobMatcher();
        break;
      case 'gemini':
      default:
        aiMatcherInstance = new GeminiJobMatcher();
        break;
    }
  }
  return aiMatcherInstance;
};

export const getAiQuestionGenerator = (): IAiQuestionGenerator => {
  if (!aiQuestionGenInstance) {
    const provider = env.AI_PROVIDER || 'gemini';

    switch (provider) {
      case 'mock':
        aiQuestionGenInstance = new MockQuestionGenerator();
        break;
      case 'gemini':
      default:
        aiQuestionGenInstance = new GeminiQuestionGenerator();
        break;
    }
  }
  return aiQuestionGenInstance;
};

export * from './aiParser.interface.js';
export * from './geminiResumeParser.js';
export * from './mockResumeParser.js';
export * from './jobMatcher.interface.js';
export * from './geminiJobMatcher.js';
export * from './mockJobMatcher.js';
export * from './questionGenerator.interface.js';
export * from './geminiQuestionGenerator.js';
export * from './mockQuestionGenerator.js';

