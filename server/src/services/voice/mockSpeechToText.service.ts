import {
  ISpeechToTextService,
  TranscriptionResult,
} from './speechToText.interface.js';

export class MockSpeechToTextService implements ISpeechToTextService {
  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    promptContext?: {
      questionTitle?: string;
      expectedTopics?: string[];
    }
  ): Promise<TranscriptionResult> {
    // Estimate audio duration based on byte size and typical recording bitrates (e.g. 64 kbps WebM / 128 kbps Opus)
    const bytes = audioBuffer.length;
    // Assume average 16 KB/sec for voice WebM
    const estimatedDurationSeconds = Math.max(5, Math.min(300, Math.round(bytes / 16384)));

    const topics = promptContext?.expectedTopics || [
      'system architecture',
      'scalability',
      'resilience',
    ];
    const topic1 = topics[0] || 'asynchronous processing';
    const topic2 = topics[1] || 'database consistency';

    // Generates a realistic engineering verbal answer containing natural speech patterns & fillers
    const transcript = `In my previous project, um, we had to address this directly. We designed our architecture around ${topic1}, which allowed us to decouple our background worker queues. Basically, we used ${topic2} to maintain reliable state across nodes. Like, whenever latency spiked, we implemented exponential backoff and circuit breakers so the downstream services wouldn't cascade into failure. Overall, this reduced our p99 latency by over forty percent.`;

    const words = transcript.split(/\s+/).filter(Boolean);

    return {
      transcript,
      durationSeconds: estimatedDurationSeconds,
      wordCount: words.length,
      confidence: 0.94,
      provider: 'mock-stt-engine',
      detectedLanguage: 'en-US',
      words: words.map((w, idx) => ({
        word: w,
        startSeconds: Number((idx * 0.45).toFixed(2)),
        endSeconds: Number(((idx + 1) * 0.45).toFixed(2)),
        confidence: 0.95,
      })),
    };
  }
}
