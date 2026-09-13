export type ProctoringEventType =
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES'
  | 'LOOKING_AWAY'
  | 'CAMERA_DISCONNECTED'
  | 'TAB_HIDDEN'
  | 'FULLSCREEN_EXIT';

export interface ProctoringEvent {
  id: string;
  eventType: ProctoringEventType;
  timestamp: string;
  durationMs: number | null;
  metadata?: Record<string, any> | null;
}

export interface ProctoringTimelineSummary {
  interviewId: string;
  totalEvents: number;
  integrityScore: number;
  integrityRating: 'HIGH' | 'MODERATE' | 'REVIEW_RECOMMENDED';
  cleanTimePercentage: number;
  eventCounts: Record<ProctoringEventType, number>;
  totalAwayTimeSeconds: number;
  totalTabHiddenTimeSeconds: number;
  disclaimer: string;
  events: ProctoringEvent[];
}

export interface ProctoringStatus {
  cameraActive: boolean;
  faceDetected: boolean;
  multipleFaces: boolean;
  lookingAway: boolean;
  tabVisible: boolean;
  isFullscreen: boolean;
  lastEvent?: ProctoringEventType;
}
