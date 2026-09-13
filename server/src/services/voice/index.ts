import { env } from '../../config/env.js';
import { ISpeechToTextService } from './speechToText.interface.js';
import { MockSpeechToTextService } from './mockSpeechToText.service.js';
import { GeminiSpeechToTextService } from './geminiSpeechToText.service.js';

let sttInstance: ISpeechToTextService | null = null;

export function getSpeechToTextService(): ISpeechToTextService {
  if (sttInstance) {
    return sttInstance;
  }

  const provider = env.STT_PROVIDER;

  switch (provider) {
    case 'gemini':
      sttInstance = new GeminiSpeechToTextService();
      break;
    case 'mock':
    default:
      sttInstance = new MockSpeechToTextService();
      break;
  }

  return sttInstance;
}

export * from './speechToText.interface.js';
export * from './communicationMetrics.service.js';
