export type RecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'paused'
  | 'transcribing'
  | 'reviewing'
  | 'submitting'
  | 'submitted'
  | 'error';

export interface FillerWordItem {
  word: string;
  count: number;
}

export interface CommunicationMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  paceRating: 'DELIBERATE' | 'OPTIMAL' | 'RAPID';
  fillerWordCount: number;
  fillerPercentage: number;
  fillerCategory: 'EXCEPTIONAL' | 'NATURAL' | 'ELEVATED';
  fillerBreakdown: FillerWordItem[];
  answerRelevanceScore: number;
  responseCompletenessScore: number;
  matchedTopics: string[];
  missingTopics: string[];
  disclaimer: string;
}

export interface TranscriptionResponse {
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  confidence: number;
  provider: string;
  metrics: CommunicationMetrics;
}

export interface SubmitVoiceResponseDto {
  interviewId: string;
  questionId: string;
  transcript: string;
  durationSeconds: number;
  audioUrl?: string;
  autoAdvance?: boolean;
}

export interface VoiceSubmissionResult {
  response: any;
  metrics: CommunicationMetrics;
  nextQuestionIndex: number;
  isLastQuestion: boolean;
}
