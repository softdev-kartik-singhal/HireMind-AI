export interface CandidateApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  stage: 'Applied' | 'Screening' | 'Technical Round' | 'System Design' | 'Offer' | 'Rejected';
  appliedDate: string;
  matchScore: number;
}

export interface CandidateInterview {
  id: string;
  role: string;
  company: string;
  round: 'Technical Coding' | 'System Architecture' | 'Behavioral & Culture';
  scheduledAt: string;
  interviewer: string;
  duration: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  meetingLink: string;
}

export interface CandidateTest {
  id: string;
  title: string;
  category: 'Algorithms & Data Structures' | 'Full Stack System' | 'Database Architecture';
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score?: number;
  status: 'Pending' | 'Completed' | 'In Review';
  dueDate: string;
}

export interface RecruiterJob {
  id: string;
  title: string;
  department: 'Engineering' | 'Product' | 'Data & AI' | 'DevOps';
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  applicantsCount: number;
  interviewsCount: number;
  status: 'Active' | 'Draft' | 'Closed';
  createdAt: string;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  matchScore: number;
  stage: 'New' | 'Screening' | 'Interviewing' | 'Offered' | 'Archived';
  experienceYears: number;
  topSkills: string[];
  appliedDate: string;
}

export interface RecruiterInterviewSession {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewerName: string;
  scheduledTime: string;
  type: 'Live Coding' | 'System Design' | 'AI Screening';
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'interview' | 'application' | 'system' | 'result';
}

// Initial Mock Seed Data
export const INITIAL_CANDIDATE_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'app-1',
    jobTitle: 'Senior Full Stack Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA (Remote)',
    stage: 'Technical Round',
    appliedDate: '2026-08-20',
    matchScore: 94,
  },
  {
    id: 'app-2',
    jobTitle: 'Distributed Systems Architect',
    company: 'Cloudflare',
    location: 'Austin, TX',
    stage: 'System Design',
    appliedDate: '2026-08-15',
    matchScore: 89,
  },
  {
    id: 'app-3',
    jobTitle: 'AI Platform Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    stage: 'Screening',
    appliedDate: '2026-08-24',
    matchScore: 96,
  },
  {
    id: 'app-4',
    jobTitle: 'Lead Backend Developer (Node/Go)',
    company: 'Vercel',
    location: 'Remote',
    stage: 'Offer',
    appliedDate: '2026-08-01',
    matchScore: 92,
  },
];

export const INITIAL_CANDIDATE_INTERVIEWS: CandidateInterview[] = [
  {
    id: 'int-1',
    role: 'Senior Full Stack Engineer',
    company: 'Stripe',
    round: 'Technical Coding',
    scheduledAt: 'Tomorrow at 2:00 PM EST',
    interviewer: 'David Chen (Staff Engineer)',
    duration: '60 mins',
    status: 'Upcoming',
    meetingLink: 'https://hiremind.ai/room/stripe-892',
  },
  {
    id: 'int-2',
    role: 'Distributed Systems Architect',
    company: 'Cloudflare',
    round: 'System Architecture',
    scheduledAt: 'Sep 2, 2026 at 11:00 AM EST',
    interviewer: 'Elena Rostova (Principal Architect)',
    duration: '75 mins',
    status: 'Upcoming',
    meetingLink: 'https://hiremind.ai/room/cloudflare-311',
  },
];

export const INITIAL_CANDIDATE_TESTS: CandidateTest[] = [
  {
    id: 'test-1',
    title: 'High-Concurrency In-Memory Key-Value Store',
    category: 'Full Stack System',
    durationMinutes: 90,
    difficulty: 'Hard',
    status: 'Pending',
    dueDate: 'Sep 3, 2026',
  },
  {
    id: 'test-2',
    title: 'Dynamic Graph Traversal & Rate Limiter',
    category: 'Algorithms & Data Structures',
    durationMinutes: 60,
    difficulty: 'Medium',
    score: 95,
    status: 'Completed',
    dueDate: 'Aug 26, 2026',
  },
  {
    id: 'test-3',
    title: 'Multi-Tenant PostgreSQL Index Tuning',
    category: 'Database Architecture',
    durationMinutes: 45,
    difficulty: 'Medium',
    score: 91,
    status: 'Completed',
    dueDate: 'Aug 22, 2026',
  },
];

export const INITIAL_RECRUITER_JOBS: RecruiterJob[] = [
  {
    id: 'job-1',
    title: 'Senior Backend Engineer (Node/TS)',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    applicantsCount: 38,
    interviewsCount: 6,
    status: 'Active',
    createdAt: '2026-08-10',
  },
  {
    id: 'job-2',
    title: 'Staff AI/ML Infrastructure Engineer',
    department: 'Data & AI',
    location: 'San Francisco, CA',
    type: 'Full-time',
    applicantsCount: 24,
    interviewsCount: 4,
    status: 'Active',
    createdAt: '2026-08-14',
  },
  {
    id: 'job-3',
    title: 'Frontend Platform Lead (Next.js)',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Full-time',
    applicantsCount: 45,
    interviewsCount: 8,
    status: 'Active',
    createdAt: '2026-08-01',
  },
  {
    id: 'job-4',
    title: 'Cloud Security & DevOps Architect',
    department: 'DevOps',
    location: 'Remote',
    type: 'Contract',
    applicantsCount: 12,
    interviewsCount: 2,
    status: 'Draft',
    createdAt: '2026-08-25',
  },
];

export const INITIAL_RECRUITER_CANDIDATES: RecruiterCandidate[] = [
  {
    id: 'cand-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'Senior Backend Engineer',
    matchScore: 96,
    stage: 'Interviewing',
    experienceYears: 7,
    topSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
    appliedDate: '2026-08-22',
  },
  {
    id: 'cand-2',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    role: 'Staff AI/ML Infrastructure Engineer',
    matchScore: 92,
    stage: 'Screening',
    experienceYears: 9,
    topSkills: ['Python', 'Kubernetes', 'PyTorch', 'vLLM', 'Ray'],
    appliedDate: '2026-08-25',
  },
  {
    id: 'cand-3',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'Frontend Platform Lead',
    matchScore: 95,
    stage: 'Offered',
    experienceYears: 8,
    topSkills: ['React', 'Next.js', 'Web Performance', 'Design Systems'],
    appliedDate: '2026-08-12',
  },
  {
    id: 'cand-4',
    name: 'Sophie Tanaka',
    email: 'sophie.t@example.com',
    role: 'Senior Backend Engineer',
    matchScore: 88,
    stage: 'New',
    experienceYears: 5,
    topSkills: ['Go', 'TypeScript', 'GraphQL', 'AWS'],
    appliedDate: '2026-08-28',
  },
];

export const INITIAL_RECRUITER_INTERVIEWS: RecruiterInterviewSession[] = [
  {
    id: 'rec-int-1',
    candidateName: 'Alex Rivera',
    jobTitle: 'Senior Backend Engineer',
    interviewerName: 'Sarah Jenkins (Tech Lead)',
    scheduledTime: 'Today at 3:30 PM EST',
    type: 'Live Coding',
    status: 'Confirmed',
  },
  {
    id: 'rec-int-2',
    candidateName: 'Maya Lin',
    jobTitle: 'Staff AI/ML Infrastructure Engineer',
    interviewerName: 'Kiran Patel (VP Eng)',
    scheduledTime: 'Tomorrow at 10:00 AM EST',
    type: 'System Design',
    status: 'Confirmed',
  },
  {
    id: 'rec-int-3',
    candidateName: 'Marcus Vance',
    jobTitle: 'Frontend Platform Lead',
    interviewerName: 'Emily Clark (Head of Design)',
    scheduledTime: 'Aug 28, 2026 (Completed)',
    type: 'AI Screening',
    status: 'Completed',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Interview Confirmed',
    message: 'Your live coding interview with Stripe is scheduled for tomorrow at 2:00 PM EST.',
    time: '10m ago',
    read: false,
    type: 'interview',
  },
  {
    id: 'notif-2',
    title: 'Coding Assessment Evaluated',
    message: 'Your solution for Dynamic Graph Traversal scored 95/100 (Top 5%).',
    time: '2h ago',
    read: false,
    type: 'result',
  },
  {
    id: 'notif-3',
    title: 'Application Status Update',
    message: 'Cloudflare advanced your application to the System Architecture round.',
    time: '1d ago',
    read: true,
    type: 'application',
  },
  {
    id: 'notif-4',
    title: 'Platform System Alert',
    message: 'PostgreSQL database connection latency running optimally (<3ms).',
    time: '2d ago',
    read: true,
    type: 'system',
  },
];
