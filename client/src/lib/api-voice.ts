import { apiClient } from './api-client';
import {
  TranscriptionResponse,
  SubmitVoiceResponseDto,
  VoiceSubmissionResult,
} from '@/types/voice';

export class VoiceApi {
  /**
   * Upload audio blob to backend speech-to-text service
   */
  static async transcribeAudio(
    audioBlob: Blob,
    questionId?: string
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    const extension = audioBlob.type.includes('wav')
      ? 'wav'
      : audioBlob.type.includes('mp4')
      ? 'mp4'
      : 'webm';
    formData.append('audio', audioBlob, `response.${extension}`);

    if (questionId) {
      formData.append('questionId', questionId);
    }

    const response = await apiClient.post<TranscriptionResponse>(
      '/voice/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Submit candidate's finalized voice transcript with evaluated metrics
   */
  static async submitVoiceResponse(
    dto: SubmitVoiceResponseDto
  ): Promise<VoiceSubmissionResult> {
    const response = await apiClient.post<VoiceSubmissionResult>(
      '/voice/submit-response',
      dto
    );
    return response.data;
  }
}
