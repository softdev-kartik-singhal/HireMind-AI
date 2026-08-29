import { apiClient } from './api-client';

export interface LiveInterview {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMins: number;
  meetingLink?: string | null;
  chamberRoomId?: string | null;
  notes?: string | null;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    headline?: string | null;
    phone?: string | null;
  };
  recruiter: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface LiveCodingTest {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  durationMinutes: number;
  category: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score?: number | null;
  passingScore: number;
  testCasesCount: number;
  deadline?: string | null;
  job?: {
    id: string;
    title: string;
    department: string;
  } | null;
}

export interface LiveAssessmentResult {
  id: string;
  overallScore: number;
  complexityScore: number;
  modularityScore: number;
  systemDesignScore: number;
  rubricSummary: string;
  interviewerNotes?: string | null;
  recommendation: string;
  evaluator: {
    id: string;
    name: string;
    email: string;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  application?: {
    job?: {
      id: string;
      title: string;
      department: string;
    } | null;
  } | null;
  createdAt: string;
}

export interface LiveNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export const DashboardApi = {
  /**
   * Recruiter live statistics
   */
  async getRecruiterAnalytics() {
    try {
      const res = await apiClient.get('/analytics/recruiter');
      return res.data?.data?.analytics;
    } catch {
      return null;
    }
  },

  /**
   * Candidate live statistics
   */
  async getCandidateAnalytics() {
    try {
      const res = await apiClient.get('/analytics/candidate');
      return res.data?.data?.analytics;
    } catch {
      return null;
    }
  },

  /**
   * Admin live platform statistics
   */
  async getAdminAnalytics() {
    try {
      const res = await apiClient.get('/analytics/admin');
      return res.data?.data?.analytics;
    } catch {
      return null;
    }
  },

  /**
   * Live interviews
   */
  async getInterviews(): Promise<LiveInterview[]> {
    try {
      const res = await apiClient.get('/interviews');
      return res.data?.data?.interviews || [];
    } catch {
      return [];
    }
  },

  /**
   * Schedule new interview
   */
  async scheduleInterview(payload: {
    title: string;
    jobId: string;
    candidateId: string;
    scheduledAt: string;
    durationMins?: number;
    notes?: string;
    type?: string;
  }): Promise<LiveInterview> {
    const res = await apiClient.post('/interviews', payload);
    return res.data?.data?.interview;
  },

  /**
   * Coding tests
   */
  async getCodingTests(): Promise<LiveCodingTest[]> {
    try {
      const res = await apiClient.get('/assessments/tests');
      return res.data?.data?.tests || [];
    } catch {
      return [];
    }
  },

  /**
   * Scorecard evaluation results
   */
  async getAssessmentResults(): Promise<LiveAssessmentResult[]> {
    try {
      const res = await apiClient.get('/assessments/results');
      return res.data?.data?.results || [];
    } catch {
      return [];
    }
  },

  /**
   * Live notifications
   */
  async getNotifications(): Promise<LiveNotification[]> {
    try {
      const res = await apiClient.get('/notifications');
      return res.data?.data?.notifications || [];
    } catch {
      return [];
    }
  },

  /**
   * Mark single notification read
   */
  async markNotificationRead(id: string) {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {}
  },

  /**
   * Mark all notifications read
   */
  async markAllNotificationsRead() {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch {}
  },
};
