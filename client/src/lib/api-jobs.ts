import { apiClient } from './api-client';
import { Job, Application, CreateJobDto, ApplyJobDto, JobStatus, ApplicationStatus } from '@/types/job';

// Initial realistic seed jobs
const INITIAL_SEED_JOBS: Job[] = [
  {
    id: 'job-101',
    title: 'Senior Backend Engineer (Distributed Systems)',
    department: 'Engineering',
    description:
      'We are looking for a Senior Backend Engineer to architect high-throughput event-driven microservices, optimize database query execution plans, and build scalable streaming infrastructure.',
    responsibilities:
      '• Design, build, and maintain high-volume REST and gRPC microservices in TypeScript/Node.js and Go.\n• Optimize PostgreSQL database performance, table partitioning, and Redis caching layers.\n• Collaborate with AI research engineers to deploy LLM evaluation pipelines with sub-50ms latency.\n• Mentor junior and mid-level engineers through code reviews and architecture design documents.',
    requiredSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Distributed Systems'],
    preferredSkills: ['Go', 'Kafka', 'Kubernetes', 'gRPC', 'AWS/GCP'],
    experienceLevel: 'SENIOR',
    location: 'Remote (US/EU)',
    employmentType: 'FULL_TIME',
    salaryRange: '$160,000 - $210,000 + Equity',
    status: 'ACTIVE',
    applicationDeadline: '2026-09-30T00:00:00.000Z',
    recruiter: {
      id: 'rec-1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@hiremind.ai',
    },
    _count: {
      applications: 18,
    },
    createdAt: '2026-08-15T09:30:00.000Z',
  },
  {
    id: 'job-102',
    title: 'Staff AI/ML Infrastructure Engineer',
    department: 'Data & AI',
    description:
      'Join our core AI platform team to build low-latency inference gateways, model distillation workflows, and automated evaluation engines for coding interviews.',
    responsibilities:
      '• Scale vLLM / TensorRT-LLM inference clusters on multi-node GPU clusters.\n• Build prompt evaluation frameworks, automated rubric graders, and live telemetry for candidate assessments.\n• Implement zero-downtime model weight hot-swapping and model version fallback logic.\n• Ensure enterprise-grade security and PII redaction across all candidate voice and code streams.',
    requiredSkills: ['Python', 'PyTorch', 'Kubernetes', 'CUDA', 'LLM Serving (vLLM/Ollama)', 'Ray'],
    preferredSkills: ['Triton Inference Server', 'Rust', 'Kafka', 'LangChain/LlamaIndex'],
    experienceLevel: 'LEAD',
    location: 'San Francisco, CA (Hybrid / Remote)',
    employmentType: 'FULL_TIME',
    salaryRange: '$210,000 - $280,000 + Equity',
    status: 'ACTIVE',
    applicationDeadline: '2026-10-15T00:00:00.000Z',
    recruiter: {
      id: 'rec-2',
      name: 'David Chen',
      email: 'david.chen@hiremind.ai',
    },
    _count: {
      applications: 9,
    },
    createdAt: '2026-08-18T14:20:00.000Z',
  },
  {
    id: 'job-103',
    title: 'Frontend Platform Lead (Next.js & Web Performance)',
    department: 'Engineering',
    description:
      'Lead our frontend engineering initiatives to craft fluid, real-time collaboration environments including live Monaco code editors, WebRTC video chambers, and interactive assessment dashboards.',
    responsibilities:
      '• Architect responsive Next.js 14+ App Router client applications with sub-second Core Web Vitals.\n• Build interactive live coding sandbox components with real-time cursor synchronisation.\n• Maintain and scale our bespoke design system with Tailwind CSS and Radix/shadcn primitives.\n• Champion frontend unit, integration, and end-to-end testing with Vitest and Playwright.',
    requiredSkills: ['React 18/19', 'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    preferredSkills: ['WebSockets', 'WebRTC', 'Monaco Editor API', 'TanStack Query', 'Zustand'],
    experienceLevel: 'LEAD',
    location: 'New York, NY (Remote friendly)',
    employmentType: 'FULL_TIME',
    salaryRange: '$175,000 - $225,000 + Equity',
    status: 'ACTIVE',
    applicationDeadline: '2026-09-25T00:00:00.000Z',
    recruiter: {
      id: 'rec-1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@hiremind.ai',
    },
    _count: {
      applications: 24,
    },
    createdAt: '2026-08-10T11:00:00.000Z',
  },
  {
    id: 'job-104',
    title: 'Cloud Security & DevOps Architect',
    department: 'DevOps',
    description:
      'Lead our infrastructure security, automated CI/CD pipelines, container orchestration, and multi-region failover architecture on AWS and Cloudflare.',
    responsibilities:
      '• Maintain Terraform infrastructure as code across multiple AWS regions.\n• Implement zero-trust network access, secrets management with Vault, and strict IAM governance.\n• Optimize multi-tenant PostgreSQL replication and backup recovery testing.',
    requiredSkills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Linux/Bash', 'Docker'],
    preferredSkills: ['Cloudflare Workers', 'HashiCorp Vault', 'Prometheus/Grafana', 'SOC2 Compliance'],
    experienceLevel: 'SENIOR',
    location: 'Remote',
    employmentType: 'CONTRACT',
    salaryRange: '$90 - $130 / hr',
    status: 'DRAFT',
    applicationDeadline: '2026-10-01T00:00:00.000Z',
    recruiter: {
      id: 'rec-3',
      name: 'Kiran Patel',
      email: 'kiran.patel@hiremind.ai',
    },
    _count: {
      applications: 0,
    },
    createdAt: '2026-08-25T16:45:00.000Z',
  },
];

// Initial mock applications
const INITIAL_SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-seed-1',
    jobId: 'job-101',
    job: INITIAL_SEED_JOBS[0],
    candidateId: 'cand-current',
    status: 'INTERVIEW',
    resumeUrl: 'https://hiremind.ai/resumes/alex-rivera-cv.pdf',
    coverLetter: 'I have 7+ years of experience engineering high-scale distributed backend systems in TypeScript and Go.',
    matchScore: 95,
    notes: 'Strong candidate with deep knowledge of PostgreSQL indexing and concurrency primitives.',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'app-seed-2',
    jobId: 'job-103',
    job: INITIAL_SEED_JOBS[2],
    candidateId: 'cand-current',
    status: 'SHORTLISTED',
    resumeUrl: 'https://hiremind.ai/resumes/alex-rivera-cv.pdf',
    coverLetter: 'Passionate about building blazing-fast developer tooling and real-time collaboration platforms.',
    matchScore: 92,
    createdAt: '2026-08-22T14:30:00.000Z',
  },
];

// In-Memory store for reactive state
let memoryJobs: Job[] = [...INITIAL_SEED_JOBS];
let memoryApplications: Application[] = [...INITIAL_SEED_APPLICATIONS];

export const JobApi = {
  /**
   * Fetch list of jobs with query filters
   */
  async getJobs(params?: {
    search?: string;
    department?: string;
    location?: string;
    experienceLevel?: string;
    employmentType?: string;
    status?: string;
  }): Promise<{ jobs: Job[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.set('search', params.search);
      if (params?.department && params.department !== 'All') queryParams.set('department', params.department);
      if (params?.status && params.status !== 'ALL') queryParams.set('status', params.status);

      const res = await apiClient.get(`/jobs?${queryParams.toString()}`);
      if (res.data?.data) {
        return {
          jobs: res.data.data,
          total: res.data.meta?.total || res.data.data.length,
        };
      }
    } catch {
      // Fallback to local memory store
    }

    let filtered = [...memoryJobs];
    if (params?.department && params.department !== 'All') {
      filtered = filtered.filter((j) => j.department.toLowerCase() === params.department?.toLowerCase());
    }
    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((j) => j.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return { jobs: filtered, total: filtered.length };
  },

  /**
   * Get single job details by ID
   */
  async getJobById(id: string): Promise<Job> {
    try {
      const res = await apiClient.get(`/jobs/${id}`);
      if (res.data?.data?.job) {
        return res.data.data.job;
      }
    } catch {
      // fallback
    }

    const found = memoryJobs.find((j) => j.id === id);
    if (!found) throw new Error('Job not found');
    return found;
  },

  /**
   * Create a new job requisition (Recruiter/Admin)
   */
  async createJob(data: CreateJobDto): Promise<Job> {
    try {
      const res = await apiClient.post('/jobs', data);
      if (res.data?.data?.job) {
        const createdJob = res.data.data.job;
        memoryJobs.unshift(createdJob);
        return createdJob;
      }
    } catch {
      // fallback
    }

    const fallbackJob: Job = {
      id: `job-${Date.now()}`,
      title: data.title,
      department: data.department,
      description: data.description,
      responsibilities: data.responsibilities,
      requiredSkills: data.requiredSkills,
      preferredSkills: data.preferredSkills || [],
      experienceLevel: data.experienceLevel,
      location: data.location,
      employmentType: data.employmentType,
      salaryRange: data.salaryRange || null,
      status: data.status || 'ACTIVE',
      applicationDeadline: data.applicationDeadline || null,
      recruiter: {
        id: 'rec-current',
        name: 'Current Recruiter',
        email: 'recruiter@hiremind.ai',
      },
      _count: {
        applications: 0,
      },
      createdAt: new Date().toISOString(),
    };

    memoryJobs.unshift(fallbackJob);
    return fallbackJob;
  },

  /**
   * Update an existing job requisition
   */
  async updateJob(id: string, data: Partial<CreateJobDto>): Promise<Job> {
    try {
      const res = await apiClient.put(`/jobs/${id}`, data);
      if (res.data?.data?.job) {
        const updated = res.data.data.job;
        memoryJobs = memoryJobs.map((j) => (j.id === id ? { ...j, ...updated } : j));
        return updated;
      }
    } catch {
      // fallback
    }

    memoryJobs = memoryJobs.map((j) => (j.id === id ? ({ ...j, ...data, updatedAt: new Date().toISOString() } as Job) : j));
    const found = memoryJobs.find((j) => j.id === id);
    if (!found) throw new Error('Job not found');
    return found;
  },

  /**
   * Update job status (ACTIVE, PAUSED, CLOSED, DRAFT)
   */
  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      const res = await apiClient.patch(`/jobs/${id}/status`, { status });
      if (res.data?.data?.job) {
        const updated = res.data.data.job;
        memoryJobs = memoryJobs.map((j) => (j.id === id ? { ...j, status } : j));
        return updated;
      }
    } catch {
      // fallback
    }

    memoryJobs = memoryJobs.map((j) => (j.id === id ? { ...j, status } : j));
    const found = memoryJobs.find((j) => j.id === id);
    if (!found) throw new Error('Job not found');
    return found;
  },

  /**
   * Delete job requisition
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/jobs/${id}`);
    } catch {
      // fallback
    }

    memoryJobs = memoryJobs.filter((j) => j.id !== id);
    memoryApplications = memoryApplications.filter((a) => a.jobId !== id);
    return true;
  },

  /**
   * Get applicants for a job (Recruiter/Admin)
   */
  async getJobApplicants(jobId: string): Promise<Application[]> {
    try {
      const res = await apiClient.get(`/jobs/${jobId}/applications`);
      if (res.data?.data?.applicants) {
        return res.data.data.applicants;
      }
    } catch {
      // fallback
    }

    return memoryApplications.filter((a) => a.jobId === jobId);
  },

  /**
   * Candidate applies for a job
   */
  async applyForJob(data: ApplyJobDto): Promise<Application> {
    try {
      const res = await apiClient.post('/applications', data);
      if (res.data?.data?.application) {
        const newApp = res.data.data.application;
        memoryApplications.unshift(newApp);
        // increment job count
        memoryJobs = memoryJobs.map((j) =>
          j.id === data.jobId ? { ...j, _count: { applications: (j._count?.applications || 0) + 1 }, hasApplied: true } : j
        );
        return newApp;
      }
    } catch {
      // fallback
    }

    const targetJob = memoryJobs.find((j) => j.id === data.jobId) || INITIAL_SEED_JOBS[0];
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: data.jobId,
      job: targetJob,
      candidateId: 'cand-current',
      status: 'APPLIED',
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || null,
      matchScore: Math.floor(Math.random() * 15) + 85, // 85-99%
      createdAt: new Date().toISOString(),
    };

    memoryApplications.unshift(newApp);
    memoryJobs = memoryJobs.map((j) =>
      j.id === data.jobId ? { ...j, _count: { applications: (j._count?.applications || 0) + 1 }, hasApplied: true } : j
    );

    return newApp;
  },

  /**
   * Get candidate's submitted applications
   */
  async getMyApplications(): Promise<Application[]> {
    try {
      const res = await apiClient.get('/applications/my');
      if (res.data?.data?.applications) {
        return res.data.data.applications;
      }
    } catch {
      // fallback
    }

    return memoryApplications;
  },

  /**
   * Update candidate application stage (Recruiter/Admin)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> {
    try {
      const res = await apiClient.patch(`/applications/${applicationId}/status`, { status, notes });
      if (res.data?.data?.application) {
        const updated = res.data.data.application;
        memoryApplications = memoryApplications.map((a) => (a.id === applicationId ? { ...a, status, notes } : a));
        return updated;
      }
    } catch {
      // fallback
    }

    memoryApplications = memoryApplications.map((a) =>
      a.id === applicationId ? { ...a, status, notes, updatedAt: new Date().toISOString() } : a
    );
    const found = memoryApplications.find((a) => a.id === applicationId);
    if (!found) throw new Error('Application not found');
    return found;
  },
};
