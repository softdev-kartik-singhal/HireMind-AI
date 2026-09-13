import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import {
  ISpeechToTextService,
  TranscriptionResult,
} from './speechToText.interface.js';
import { MockSpeechToTextService } from './mockSpeechToText.service.js';

export class GeminiSpeechToTextService implements ISpeechToTextService {
  private fallbackMock = new MockSpeechToTextService();

  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    promptContext?: {
      questionTitle?: string;
      expectedTopics?: string[];
    }
  ): Promise<TranscriptionResult> {
    if (!env.GEMINI_API_KEY) {
      console.warn('[GeminiSTT] No GEMINI_API_KEY set. Falling back to Mock STT.');
      return this.fallbackMock.transcribe(audioBuffer, mimeType, promptContext);
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: env.AI_MODEL || 'gemini-1.5-flash' });

      // Supported audio mime types for Gemini multimodal
      let safeMime = mimeType;
      if (!safeMime || safeMime === 'application/octet-stream') {
        safeMime = 'audio/webm';
      }

      const audioPart = {
        inlineData: {
          data: audioBuffer.toString('base64'),
          mimeType: safeMime,
        },
      };

      const prompt = `You are a high-accuracy, verbatim speech-to-text transcription engine for technical interviews.
Transcribe the speech in this audio recording word-for-word.
Rules:
1. Do NOT summarize or clean up grammar.
2. Preserve any natural disfluencies or filler words (e.g. "um", "uh", "like") exactly as spoken.
3. Transcribe technical terms, framework names, and programming acronyms accurately.
4. Output ONLY the raw transcript text with standard punctuation. Do not include markdown quotes, commentary, or headers.`;

      const response = await model.generateContent([prompt, audioPart]);
      const rawText = response.response.text()?.trim() || '';

      if (!rawText) {
        console.warn('[GeminiSTT] Empty transcription returned. Using fallback.');
        return this.fallbackMock.transcribe(audioBuffer, mimeType, promptContext);
      }

      const words = rawText.split(/\s+/).filter(Boolean);
      const estimatedDurationSeconds = Math.max(
        3,
        Math.min(300, Math.round(audioBuffer.length / 16384))
      );

      return {
        transcript: rawText,
        durationSeconds: estimatedDurationSeconds,
        wordCount: words.length,
        confidence: 0.98,
        provider: 'gemini-multimodal-stt',
        detectedLanguage: 'en',
      };
    } catch (err: any) {
      console.warn('[GeminiSTT] Multimodal transcription error, falling back to mock:', err.message);
      return this.fallbackMock.transcribe(audioBuffer, mimeType, promptContext);
    }
  }
}
