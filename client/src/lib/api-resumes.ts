import { apiClient } from './api-client';
import { Resume, UploadResumeOptions } from '@/types/resume';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const resumeApi = {
  /**
   * Upload a resume PDF with progress tracking.
   */
  async uploadResume(file: File, options?: UploadResumeOptions): Promise<Resume> {
    const formData = new FormData();
    formData.append('resume', file);

    const query = options?.setPrimary ? '?setPrimary=true' : '';

    const response = await apiClient.post(`/resumes/upload${query}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options?.onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    });

    return response.data.data;
  },

  /**
   * Get all resumes belonging to the authenticated candidate.
   */
  async getMyResumes(): Promise<Resume[]> {
    const response = await apiClient.get('/resumes');
    return response.data.data || [];
  },

  /**
   * Get metadata for a specific resume.
   */
  async getResumeById(id: string): Promise<Resume> {
    const response = await apiClient.get(`/resumes/${id}`);
    return response.data.data;
  },

  /**
   * Set a specific resume as the primary version.
   */
  async setPrimaryResume(id: string): Promise<Resume> {
    const response = await apiClient.patch(`/resumes/${id}/primary`);
    return response.data.data;
  },

  /**
   * Delete a resume version.
   */
  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },

  /**
   * Fetch PDF blob securely for inline preview.
   */
  async getResumeBlobUrl(id: string): Promise<string> {
    const response = await apiClient.get(`/resumes/${id}/view`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  },

  /**
   * Securely download the resume PDF.
   */
  async downloadResumeFile(id: string, fileName: string): Promise<void> {
    const response = await apiClient.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'resume.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Trigger AI Resume Parsing for a specific resume.
   */
  async parseResume(id: string): Promise<{ resume: Resume; profileId: string; parsedData: any }> {
    const response = await apiClient.post(`/resumes/${id}/parse`);
    return response.data.data;
  },

  /**
   * Fetch structured candidate profile by user ID.
   */
  async getCandidateProfile(candidateId: string): Promise<any> {
    const response = await apiClient.get(`/candidates/${candidateId}/profile`);
    return response.data.data;
  },

  /**
   * Return direct authenticated view endpoint (for embeds/iframes if headers supported).
   */
  getDirectViewUrl(id: string): string {
    return `${API_BASE_URL}/api/v1/resumes/${id}/view`;
  },
};
