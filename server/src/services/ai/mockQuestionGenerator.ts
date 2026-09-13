import {
  IAiQuestionGenerator,
  QuestionGenerationInput,
} from './questionGenerator.interface.js';
import {
  AiGeneratedQuestion,
  AiQuestionGenerationResult,
  aiQuestionGenerationResultSchema,
  QuestionCategory,
} from '../../validations/questionGenerator.schema.js';

export class MockQuestionGenerator implements IAiQuestionGenerator {
  async generateQuestions(input: QuestionGenerationInput): Promise<AiQuestionGenerationResult> {
    const { job, candidate, interviewType, difficulty, numQuestions } = input;

    const primarySkill = job.requiredSkills[0] || 'Software Architecture';
    const secondarySkill = job.requiredSkills[1] || job.preferredSkills?.[0] || 'Distributed Systems';
    const tertiarySkill = job.requiredSkills[2] || 'Database Design';
    const candidateSkill = candidate.skills[0] || primarySkill;
    const candidateProject = candidate.projects?.[0]?.title || 'Cloud Infrastructure Engine';
    const candidateCompany = candidate.experiences?.[0]?.company || 'Previous Tech Enterprise';

    // Bank of curated questions matching the 6 required categories
    const categories: QuestionCategory[] = [
      'Fundamentals',
      'Technical',
      'Scenario-based',
      'Problem-solving',
      'Project-based',
      'Behavioral',
    ];

    const questionPool: AiGeneratedQuestion[] = [
      // 1. Fundamentals
      {
        title: `${primarySkill} Memory Model & Concurrency Guarantees`,
        question: `Explain how ${primarySkill} manages memory allocation, thread synchronization, and concurrency primitives under high throughput. Compare optimistic locking versus pessimistic locking in distributed data stores, and explain how race conditions can be prevented at both the application and database layers.`,
        category: 'Fundamentals',
        difficulty,
        expectedTopics: [
          'Memory lifecycle & garbage collection / allocation',
          'Thread synchronization & locking primitives',
          'Optimistic vs pessimistic concurrency control',
          'ACID transaction isolation levels',
        ],
        evaluationCriteria: [
          'Articulates clear understanding of thread safety and memory hazards',
          'Compares isolation levels (Read Committed, Repeatable Read, Serializable)',
          'Provides real-world examples of deadlocks and resolution strategies',
        ],
        type: 'TECHNICAL',
        timeLimitMins: 15,
      },

      // 2. Technical
      {
        title: `Deep Dive: Resilient Microservices with ${secondarySkill}`,
        question: `When building high-scale services using ${secondarySkill} for a ${job.title} role, how do you implement zero-downtime rolling deployments, distributed tracing, and graceful degradation during downstream service failures? Discuss circuit breakers, exponential backoff with jitter, and bulkhead isolation patterns.`,
        category: 'Technical',
        difficulty,
        expectedTopics: [
          'Circuit Breaker Pattern (Netflix Hystrix/Resilience4j concept)',
          'Distributed tracing headers (OpenTelemetry/W3C Trace Context)',
          'Graceful degradation & fallback mechanisms',
          'Idempotency keys for distributed APIs',
        ],
        evaluationCriteria: [
          'Explains difference between retry storm and exponential backoff with jitter',
          'Demonstrates architectural depth in distributed telemetry and observability',
          'Knows how to safeguard stateful transactions across microservice boundaries',
        ],
        type: 'TECHNICAL',
        timeLimitMins: 20,
      },

      // 3. Problem-solving (Coding / Algorithmic)
      {
        title: `High-Throughput Rate Limiter & Token Bucket`,
        question: `Design and implement an in-memory Rate Limiter supporting the Token Bucket or Sliding Window Log algorithm. The implementation must be thread-safe or async-safe, support customizable window bursts, and prevent unauthorized client spamming with sub-millisecond overhead.`,
        category: 'Problem-solving',
        difficulty,
        expectedTopics: [
          'Token Bucket / Sliding Window Counter algorithm',
          'Time-complexity bounds (O(1) lookups & token replenishment)',
          'Handling clock skew and edge conditions',
          'Space optimization under high cardinality client keys',
        ],
        evaluationCriteria: [
          'Produces clean, production-grade code with error handling',
          'Accurately tracks token refills based on elapsed timestamp deltas',
          'Discusses horizontal scaling via Redis atomicity (Lua scripts)',
        ],
        type: interviewType === 'BEHAVIORAL' ? 'TECHNICAL' : 'CODING',
        starterCode: `class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSec: number;
  private currentTokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.currentTokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public allowRequest(tokensRequested = 1): boolean {
    // TODO: Refill tokens based on elapsed time and determine if request is allowed
    return true;
  }
}`,
        testCases: [
          {
            input: 'capacity: 5, rate: 2/s, burst of 5 requests',
            expectedOutput: 'All 5 allowed',
            description: 'Burst allowance within max capacity',
          },
          {
            input: 'capacity: 5, rate: 2/s, 6th request immediately following',
            expectedOutput: 'Request rejected (false)',
            description: 'Exceeding token capacity without refill time',
          },
        ],
        timeLimitMins: 25,
      },

      // 4. Scenario-based
      {
        title: `Incident Response: Database Connection Pool Exhaustion`,
        question: `During peak traffic hours for our ${job.department || 'Engineering'} platform, response latency spikes from 45ms to 8,500ms, and alerts report PostgreSQL connection pool exhaustion (all 150 pool connections saturated). Walk through your live troubleshooting checklist, short-term mitigation steps, and long-term architectural remediations.`,
        category: 'Scenario-based',
        difficulty,
        expectedTopics: [
          'pg_stat_activity analysis & slow query isolation',
          'Transaction duration auditing and connection leakage detection',
          'Connection pooling middleware (PgBouncer / Supabase Supavisor)',
          'Read-replica offloading and caching layers (Redis/Memcached)',
        ],
        evaluationCriteria: [
          'Approaches troubleshooting systematically without causing secondary outages',
          'Differentiates between database locks, unindexed table scans, and pool misconfigurations',
          'Proposes permanent safeguards (statement timeouts, read replicas, pooling proxies)',
        ],
        type: 'SYSTEM_DESIGN',
        timeLimitMins: 20,
      },

      // 5. Project-based
      {
        title: `Architectural Reflection: ${candidateProject}`,
        question: `In your background, you worked on projects involving ${candidateSkill} such as "${candidateProject}". Can you explain the biggest architectural trade-off or technical bottleneck you encountered in that system? If you were to rebuild it from scratch today with the scale of this ${job.title} role in mind, what would you change?`,
        category: 'Project-based',
        difficulty,
        expectedTopics: [
          'System architecture and component dependencies',
          'Trade-offs (CAP theorem, consistency vs latency, operational complexity)',
          'Performance profiling and bottleneck remediation',
          'Lessons learned and evolution of engineering judgment',
        ],
        evaluationCriteria: [
          'Speaks with authentic technical ownership and depth about their past engineering work',
          'Clearly contrasts alternative architectures and defends their technical decisions',
          'Acknowledges past constraints with constructive hindsight',
        ],
        type: 'TECHNICAL',
        timeLimitMins: 15,
      },

      // 6. Behavioral
      {
        title: `Cross-Functional Disagreement & Technical Debt Negotiation`,
        question: `Describe a situation at ${candidateCompany} or a previous team where product leadership pushed for a rapid delivery timeline that risked introducing critical security or architectural debt. How did you negotiate the trade-off, communicate the risks to non-technical stakeholders, and deliver value without compromising core engineering integrity?`,
        category: 'Behavioral',
        difficulty,
        expectedTopics: [
          'STAR Method (Situation, Task, Action, Result)',
          'Constructive conflict resolution and stakeholder communication',
          'Quantifying technical debt in terms of business impact and user trust',
          'Pragmatic compromise and post-launch remediation plans',
        ],
        evaluationCriteria: [
          'Demonstrates high emotional intelligence and collaborative mindset',
          'Avoids dogma and balances technical excellence with business delivery',
          'Takes accountability for outcomes and shared team goals',
        ],
        type: 'BEHAVIORAL',
        timeLimitMins: 15,
      },
    ];

    // Filter or adjust pool based on interviewType
    let selected: AiGeneratedQuestion[] = [];

    if (interviewType === 'BEHAVIORAL') {
      selected = questionPool.filter((q) => q.category === 'Behavioral' || q.category === 'Project-based' || q.category === 'Scenario-based');
    } else if (interviewType === 'CODING') {
      selected = questionPool.filter((q) => q.category === 'Problem-solving' || q.category === 'Fundamentals' || q.category === 'Technical');
    } else {
      selected = questionPool;
    }

    // Ensure we return exactly numQuestions by repeating or slicing
    const resultQuestions: AiGeneratedQuestion[] = [];
    for (let i = 0; i < numQuestions; i++) {
      const template = selected[i % selected.length];
      resultQuestions.push({
        ...template,
        title: i >= selected.length ? `${template.title} (Part ${Math.floor(i / selected.length) + 1})` : template.title,
      });
    }

    const payload: AiQuestionGenerationResult = {
      summary: `AI Generated ${resultQuestions.length} comprehensive interview questions covering ${categories.join(', ')} tailored to ${job.title} and candidate background.`,
      questions: resultQuestions,
    };

    return aiQuestionGenerationResultSchema.parse(payload);
  }
}
