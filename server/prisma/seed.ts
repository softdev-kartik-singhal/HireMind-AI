import { PrismaClient, UserRole, JobStatus, JobExperienceLevel, JobEmploymentType, ApplicationStatus, InterviewStatus, InterviewType, TestDifficulty, TestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Live Supabase PostgreSQL Database for HireMind AI...');

  // 1. Clean existing records
  await prisma.notification.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.codingTest.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123', 12);

  // 2. Create Core Users
  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Kartik Singhal',
      email: 'kartiksinghal28032006@gmail.com',
      passwordHash,
      role: UserRole.ADMIN,
      headline: 'Platform Super Administrator & Lead Architect',
      bio: 'Overseeing platform infrastructure, AI evaluation engines, and security governance.',
    },
  });

  const recruiterSarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@hiremind.ai',
      passwordHash,
      role: UserRole.RECRUITER,
      headline: 'Principal Technical Recruiter @ HireMind',
      bio: 'Specializing in Distributed Systems, Core AI Infrastructure, and Engineering Leadership.',
    },
  });

  const recruiterDavid = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.chen@hiremind.ai',
      passwordHash,
      role: UserRole.RECRUITER,
      headline: 'Lead Talent Partner - AI / ML Platforms',
      bio: 'Scaling deep tech infrastructure and LLM research teams globally.',
    },
  });

  const candidateAlex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@hiremind.ai',
      passwordHash,
      role: UserRole.CANDIDATE,
      headline: 'Senior Distributed Systems Engineer (7+ YOE)',
      bio: 'Ex-Stripe engineer specializing in high-throughput Go/TypeScript event streams and PostgreSQL query plan optimization.',
      phone: '+1 (555) 234-8765',
    },
  });

  const candidateElena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@hiremind.ai',
      passwordHash,
      role: UserRole.CANDIDATE,
      headline: 'Staff Machine Learning Infrastructure Engineer',
      bio: 'Passionate about GPU cluster orchestration, vLLM serving gateways, and distributed training pipelines.',
      phone: '+1 (555) 876-1234',
    },
  });

  const candidateMarcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@hiremind.ai',
      passwordHash,
      role: UserRole.CANDIDATE,
      headline: 'Frontend Platform & Web Performance Lead',
      bio: 'Specialist in Next.js App Router, Monaco Editor integrations, and real-time collaboration engines.',
      phone: '+1 (555) 432-9876',
    },
  });

  // 3. Create Live Technical Jobs
  console.log('Creating technical jobs...');
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Backend Engineer (Distributed Systems)',
      department: 'Engineering',
      description: 'We are seeking a Senior Backend Engineer to architect high-throughput event-driven microservices, optimize database query execution plans, and build scalable streaming infrastructure.',
      responsibilities: '• Design, build, and maintain high-volume REST and gRPC microservices in TypeScript/Node.js and Go.\n• Optimize PostgreSQL database performance, table partitioning, and Redis caching layers.\n• Collaborate with AI research engineers to deploy LLM evaluation pipelines with sub-50ms latency.\n• Mentor junior and mid-level engineers through code reviews and architecture design documents.',
      requiredSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Distributed Systems'],
      preferredSkills: ['Go', 'Kafka', 'Kubernetes', 'gRPC', 'AWS/GCP'],
      experienceLevel: JobExperienceLevel.SENIOR,
      location: 'Remote (US/EU)',
      employmentType: JobEmploymentType.FULL_TIME,
      salaryRange: '$160,000 - $210,000 + Equity',
      status: JobStatus.ACTIVE,
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      recruiterId: recruiterSarah.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Staff AI/ML Infrastructure Engineer',
      department: 'Data & AI',
      description: 'Join our core AI platform team to build low-latency inference gateways, model distillation workflows, and automated evaluation engines for coding interviews.',
      responsibilities: '• Scale vLLM / TensorRT-LLM inference clusters on multi-node GPU clusters.\n• Build prompt evaluation frameworks, automated rubric graders, and live telemetry for candidate assessments.\n• Implement zero-downtime model weight hot-swapping and model version fallback logic.\n• Ensure enterprise-grade security and PII redaction across all candidate voice and code streams.',
      requiredSkills: ['Python', 'PyTorch', 'Kubernetes', 'CUDA', 'LLM Serving (vLLM/Ollama)', 'Ray'],
      preferredSkills: ['Triton Inference Server', 'Rust', 'Kafka', 'LangChain/LlamaIndex'],
      experienceLevel: JobExperienceLevel.LEAD,
      location: 'San Francisco, CA (Hybrid / Remote)',
      employmentType: JobEmploymentType.FULL_TIME,
      salaryRange: '$210,000 - $280,000 + Equity',
      status: JobStatus.ACTIVE,
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      recruiterId: recruiterDavid.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Frontend Platform Lead (Next.js & Web Performance)',
      department: 'Engineering',
      description: 'Lead our frontend engineering initiatives to craft fluid, real-time collaboration environments including live Monaco code editors, WebRTC video chambers, and interactive assessment dashboards.',
      responsibilities: '• Architect responsive Next.js 14+ App Router client applications with sub-second Core Web Vitals.\n• Build interactive live coding sandbox components with real-time cursor synchronisation.\n• Maintain and scale our bespoke design system with Tailwind CSS and Radix primitives.\n• Champion frontend unit, integration, and end-to-end testing with Vitest and Playwright.',
      requiredSkills: ['React 18/19', 'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
      preferredSkills: ['WebSockets', 'WebRTC', 'Monaco Editor API', 'TanStack Query', 'Zustand'],
      experienceLevel: JobExperienceLevel.LEAD,
      location: 'New York, NY (Remote friendly)',
      employmentType: JobEmploymentType.FULL_TIME,
      salaryRange: '$175,000 - $225,000 + Equity',
      status: JobStatus.ACTIVE,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      recruiterId: recruiterSarah.id,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: 'Cloud Security & DevOps Architect',
      department: 'DevOps',
      description: 'Lead our infrastructure security, automated CI/CD pipelines, container orchestration, and multi-region failover architecture on AWS and Cloudflare.',
      responsibilities: '• Maintain Terraform infrastructure as code across multiple AWS regions.\n• Implement zero-trust network access, secrets management with Vault, and strict IAM governance.\n• Optimize multi-tenant PostgreSQL replication and backup recovery testing.',
      requiredSkills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Linux/Bash', 'Docker'],
      preferredSkills: ['Cloudflare Workers', 'HashiCorp Vault', 'Prometheus/Grafana', 'SOC2 Compliance'],
      experienceLevel: JobExperienceLevel.SENIOR,
      location: 'Remote',
      employmentType: JobEmploymentType.CONTRACT,
      salaryRange: '$90 - $130 / hr',
      status: JobStatus.ACTIVE,
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      recruiterId: recruiterDavid.id,
    },
  });

  // 4. Create Live Candidate Applications
  console.log('Creating candidate applications...');
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateId: candidateAlex.id,
      status: ApplicationStatus.INTERVIEW,
      resumeUrl: 'https://hiremind.ai/resumes/alex-rivera-cv.pdf',
      coverLetter: 'I have 7+ years of experience engineering high-scale distributed backend systems in TypeScript and Go. Built high throughput pipelines at Stripe.',
      matchScore: 96.0,
      notes: 'Exceptional candidate with deep knowledge of PostgreSQL table partitioning and Go concurrency primitives.',
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: job3.id,
      candidateId: candidateMarcus.id,
      status: ApplicationStatus.SHORTLISTED,
      resumeUrl: 'https://hiremind.ai/resumes/marcus-vance.pdf',
      coverLetter: 'Passionate about building blazing-fast developer tooling and real-time collaboration platforms with Monaco and Next.js.',
      matchScore: 92.5,
      notes: 'Strong frontend portfolio with custom component design systems and web performance benchmarks.',
    },
  });

  const app3 = await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateId: candidateElena.id,
      status: ApplicationStatus.SCREENING,
      resumeUrl: 'https://hiremind.ai/resumes/elena-rostova.pdf',
      coverLetter: 'Deep background in distributed PyTorch training, CUDA kernel optimization, and low-latency LLM serving.',
      matchScore: 98.0,
    },
  });

  // 5. Create Live Interviews
  console.log('Creating live interviews...');
  await prisma.interview.create({
    data: {
      title: 'Distributed State & Concurrency Technical Round',
      type: InterviewType.LIVE_CODING,
      status: InterviewStatus.SCHEDULED,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      durationMins: 60,
      meetingLink: 'https://hiremind.ai/room/live-chamber-8821',
      chamberRoomId: 'room-dist-8821',
      notes: 'Focus on thread-safe cache invalidation and distributed lock acquisition.',
      jobId: job1.id,
      candidateId: candidateAlex.id,
      recruiterId: recruiterSarah.id,
      applicationId: app1.id,
    },
  });

  await prisma.interview.create({
    data: {
      title: 'High-Throughput Streaming & Event Log System Design',
      type: InterviewType.SYSTEM_DESIGN,
      status: InterviewStatus.SCHEDULED,
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      durationMins: 75,
      meetingLink: 'https://hiremind.ai/room/live-chamber-4419',
      chamberRoomId: 'room-sys-4419',
      notes: 'System design for multi-region active-active messaging queue.',
      jobId: job1.id,
      candidateId: candidateAlex.id,
      recruiterId: recruiterSarah.id,
      applicationId: app1.id,
    },
  });

  // 6. Create Live Coding Tests
  console.log('Creating coding assessments...');
  await prisma.codingTest.create({
    data: {
      title: 'LRU Cache with TTL Expiry & Thread-Safe Lock Acquisition',
      description: 'Implement a highly concurrent Least-Recently-Used (LRU) Cache in TypeScript/Go supporting constant time O(1) get/put operations and millisecond-level key expiration.',
      difficulty: TestDifficulty.MEDIUM,
      durationMinutes: 45,
      category: 'Data Structures & Concurrency',
      status: TestStatus.ASSIGNED,
      passingScore: 75.0,
      testCasesCount: 8,
      candidateId: candidateAlex.id,
      jobId: job1.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.codingTest.create({
    data: {
      title: 'Distributed Rate Limiter (Token Bucket Algorithm)',
      description: 'Design and write a Redis-backed sliding window rate limiter that handles burst traffic up to 10,000 RPS per tenant without race conditions.',
      difficulty: TestDifficulty.HARD,
      durationMinutes: 60,
      category: 'Distributed Algorithms',
      status: TestStatus.ASSIGNED,
      passingScore: 80.0,
      testCasesCount: 12,
      candidateId: candidateAlex.id,
      jobId: job1.id,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Create Assessment Results (Rubric Scorecards)
  console.log('Creating assessment results...');
  await prisma.assessmentResult.create({
    data: {
      overallScore: 94.5,
      complexityScore: 96.0,
      modularityScore: 92.0,
      systemDesignScore: 95.0,
      rubricSummary: 'Alex demonstrated deep mastery of asymptotic time complexity, lock-free queue primitives, and graceful connection pooling under heavy simulated load.',
      interviewerNotes: 'Strong hire recommendation. Clean code structure, wrote thorough unit test cases addressing concurrent edge cases.',
      recommendation: 'STRONG_HIRE',
      candidateId: candidateAlex.id,
      evaluatorId: recruiterSarah.id,
      applicationId: app1.id,
    },
  });

  // 8. Create Live Notifications
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Supabase PostgreSQL Synchronized',
        message: 'Live database connection active with 100% telemetry coverage.',
        type: 'SUCCESS',
        read: false,
      },
      {
        userId: recruiterSarah.id,
        title: 'New Candidate Application Received',
        message: 'Alex Rivera applied for Senior Backend Engineer (Distributed Systems).',
        type: 'APPLICATION',
        read: false,
      },
      {
        userId: candidateAlex.id,
        title: 'Interview Chamber Scheduled',
        message: 'Your Distributed State Technical Round is confirmed for Thursday.',
        type: 'INTERVIEW',
        read: false,
      },
    ],
  });

  console.log('✅ Live Supabase PostgreSQL database seeded successfully with real production data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
