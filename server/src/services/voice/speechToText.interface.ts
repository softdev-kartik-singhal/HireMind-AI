/**
 * Speech to Text Provider Interface & Data Contracts
 */

export interface TranscriptionResult {
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  confidence: number;
  provider: string;
  detectedLanguage?: string;
  words?: Array<{
    word: string;
    startSeconds?: number;
    endSeconds?: number;
    confidence?: number;
  }>;
}

export interface ISpeechToTextService {
  /**
   * Transcribe an audio buffer into text.
   * @param audioBuffer The raw audio data
   * @param mimeType e.g., 'audio/webm', 'audio/wav', 'audio/mp4', 'audio/ogg'
   * @param promptContext Optional contextual hints (e.g. expected technical concepts or question title)
   */
  transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    promptContext?: {
      questionTitle?: string;
      expectedTopics?: string[];
    }
  ): Promise<TranscriptionResult>;
}
