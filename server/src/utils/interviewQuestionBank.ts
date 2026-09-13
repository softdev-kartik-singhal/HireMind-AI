import { InterviewDifficulty, InterviewType } from '@prisma/client';

export interface GeneratedQuestion {
  title: string;
  description: string;
  type: string; // TECHNICAL, BEHAVIORAL, CODING, SYSTEM_DESIGN
  difficulty: InterviewDifficulty;
  category: string;
  starterCode?: string;
  testCases?: Array<{ input: string; expectedOutput: string; description: string }>;
  expectedOutput?: string;
  rubricCriteria: {
    keyConcepts: string[];
    passingScore: number;
    evaluationTips: string;
  };
  timeLimitMins: number;
}

export class InterviewQuestionBank {
  /**
   * Generates a curated set of questions matching the job skills, interview type, difficulty, and requested count.
   */
  static generateQuestions(params: {
    jobTitle: string;
    requiredSkills: string[];
    interviewType: InterviewType;
    difficulty: InterviewDifficulty;
    count: number;
  }): GeneratedQuestion[] {
    const { jobTitle, requiredSkills, interviewType, difficulty, count } = params;
    const targetSkills = requiredSkills.length > 0 ? requiredSkills : ['JavaScript', 'Algorithms', 'System Design'];

    const pool: GeneratedQuestion[] = [];

    // 1. Coding questions
    if (interviewType === InterviewType.CODING || interviewType === InterviewType.MIXED || interviewType === InterviewType.TECHNICAL) {
      pool.push(
        {
          title: 'Two Sum with Target Index Lookup',
          description:
            'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You must provide an optimal O(n) solution using a hash map.',
          type: 'CODING',
          difficulty: InterviewDifficulty.EASY,
          category: 'Data Structures & Algorithms',
          starterCode: `function twoSum(nums: number[], target: number): number[] {\n  // Your implementation here\n  return [];\n}`,
          testCases: [
            { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', description: 'Basic pair at start' },
            { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', description: 'Pair in middle' },
            { input: '[3, 3], 6', expectedOutput: '[0, 1]', description: 'Duplicates with target' },
          ],
          rubricCriteria: {
            keyConcepts: ['Hash Table / Map lookup', 'Single-pass O(n) time complexity', 'O(n) space complexity', 'Edge cases'],
            passingScore: 70,
            evaluationTips: 'Check if candidate handles negative numbers and duplicate elements without nested loops.',
          },
          timeLimitMins: 15,
        },
        {
          title: 'LRU (Least Recently Used) Cache Implementation',
          description:
            'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get(key)` and `put(key, value)` methods. Both operations must run in O(1) average time complexity.',
          type: 'CODING',
          difficulty: InterviewDifficulty.MEDIUM,
          category: 'System Design & Data Structures',
          starterCode: `class LRUCache {\n  private capacity: number;\n  \n  constructor(capacity: number) {\n    this.capacity = capacity;\n  }\n\n  get(key: number): number {\n    // O(1) get implementation\n    return -1;\n  }\n\n  put(key: number, value: number): void {\n    // O(1) put with eviction\n  }\n}`,
          testCases: [
            { input: 'put(1,1), put(2,2), get(1), put(3,3), get(2)', expectedOutput: '[null, null, 1, null, -1]', description: 'Eviction of least recently used key 2' },
          ],
          rubricCriteria: {
            keyConcepts: ['Doubly Linked List', 'Hash Map lookup', 'O(1) eviction logic', 'Memory safety'],
            passingScore: 75,
            evaluationTips: 'Observe whether doubly linked list pointer updates are executed cleanly without orphan nodes.',
          },
          timeLimitMins: 25,
        },
        {
          title: 'Concurrent Task Scheduler with Rate Limiting',
          description:
            `In production applications like ${jobTitle}, backend workers must process asynchronous tasks with strict concurrency limits and exponential backoff on failure.\n\nImplement a \`TaskQueue\` class that executes up to \`maxConcurrency\` promises simultaneously and queues remaining tasks until a worker slot is freed.`,
          type: 'CODING',
          difficulty: InterviewDifficulty.HARD,
          category: 'Concurrency & Async Programming',
          starterCode: `type Task<T> = () => Promise<T>;\n\nclass TaskQueue {\n  private maxConcurrency: number;\n\n  constructor(maxConcurrency: number) {\n    this.maxConcurrency = maxConcurrency;\n  }\n\n  async enqueue<T>(task: Task<T>): Promise<T> {\n    // Concurrency queue implementation\n    return task();\n  }\n}`,
          testCases: [
            { input: '5 parallel tasks with maxConcurrency=2', expectedOutput: 'All resolved in controlled batches', description: 'Batch execution without exceeding limit' },
          ],
          rubricCriteria: {
            keyConcepts: ['Promise management', 'Queue data structure', 'Error propagation', 'Graceful drain'],
            passingScore: 80,
            evaluationTips: 'Evaluate how rejections are caught and whether queue starvation is prevented.',
          },
          timeLimitMins: 30,
        }
      );
    }

    // 2. Technical Architecture & Domain Knowledge questions
    if (interviewType === InterviewType.TECHNICAL || interviewType === InterviewType.MIXED) {
      targetSkills.forEach((skill) => {
        pool.push({
          title: `${skill} Deep Dive & Architecture Best Practices`,
          description:
            `Describe how you leverage ${skill} within a scalable production system for a ${jobTitle} position.\n\nDiscuss:\n1. Core architectural advantages and trade-offs.\n2. How you address performance bottlenecks, memory overhead, or latency issues.\n3. A concrete incident or challenging engineering problem you solved using this technology.`,
          type: 'TECHNICAL',
          difficulty: difficulty,
          category: `${skill} Engineering`,
          rubricCriteria: {
            keyConcepts: [`${skill} internals`, 'Production debugging', 'System trade-offs', 'Scalability patterns'],
            passingScore: 75,
            evaluationTips: 'Look for depth of practical production experience rather than textbook definitions.',
          },
          timeLimitMins: 15,
        });
      });

      pool.push(
        {
          title: 'High-Throughput Database Optimization & Locking Strategies',
          description:
            'Explain how you diagnose and remediate high database lock contention and connection pool exhaustion in a distributed microservices environment. Compare optimistic locking versus pessimistic locking, and detail how table partitioning affects query execution plans.',
          type: 'TECHNICAL',
          difficulty: InterviewDifficulty.MEDIUM,
          category: 'Database Architecture',
          rubricCriteria: {
            keyConcepts: ['ACID isolation levels', 'Index query planning (EXPLAIN ANALYZE)', 'Connection pooling', 'Deadlock prevention'],
            passingScore: 70,
            evaluationTips: 'Candidate should explain real-world mitigation strategies (e.g. pgBouncer, read replicas, idempotency keys).',
          },
          timeLimitMins: 15,
        },
        {
          title: 'Distributed Consistency, Idempotency & Fault Tolerance',
          description:
            'Design a distributed payment or workflow state machine that guarantees exactly-once semantics across unreliable third-party APIs. How do you handle network partitions, split-brain conditions, and replay attacks?',
          type: 'TECHNICAL',
          difficulty: InterviewDifficulty.HARD,
          category: 'Distributed Systems',
          rubricCriteria: {
            keyConcepts: ['Two-phase commit / Sagas', 'Idempotency tokens', 'Dead letter queues', 'CAP theorem trade-offs'],
            passingScore: 80,
            evaluationTips: 'Check whether out-of-order webhook delivery and reconciliation worker patterns are addressed.',
          },
          timeLimitMins: 20,
        }
      );
    }

    // 3. Behavioral questions
    if (interviewType === InterviewType.BEHAVIORAL || interviewType === InterviewType.MIXED) {
      pool.push(
        {
          title: 'Handling Technical Disagreements & Engineering Trade-offs',
          description:
            'Describe a situation where you strongly disagreed with an architectural decision, code review comment, or product deadline. How did you advocate for your perspective, what trade-offs were evaluated, and what was the ultimate resolution?',
          type: 'BEHAVIORAL',
          difficulty: InterviewDifficulty.EASY,
          category: 'Communication & Leadership',
          rubricCriteria: {
            keyConcepts: ['STAR method', 'Empathy & collaboration', 'Data-driven advocacy', 'Alignment with team velocity'],
            passingScore: 75,
            evaluationTips: 'Assess whether candidate prioritizes team mission and objective data over personal ego.',
          },
          timeLimitMins: 10,
        },
        {
          title: 'Production Incident Response & Post-Mortem Accountability',
          description:
            'Walk us through a critical production outage or severe regression that you directly caused or had to urgently triage. How did you communicate with stakeholders, contain the blast radius, and implement safeguards to prevent recurrence?',
          type: 'BEHAVIORAL',
          difficulty: InterviewDifficulty.MEDIUM,
          category: 'Ownership & Resilience',
          rubricCriteria: {
            keyConcepts: ['Root cause analysis', 'Blameless post-mortem culture', 'Customer communication', 'Defensive engineering'],
            passingScore: 75,
            evaluationTips: 'Look for vulnerability, genuine ownership, and concrete automated preventive actions.',
          },
          timeLimitMins: 10,
        },
        {
          title: 'Mentorship, Code Standards & Engineering Culture',
          description:
            'How have you contributed to raising engineering standards, onboarding junior developers, or building psychological safety on your teams? Give a specific example of mentoring an engineer through a challenging career milestone.',
          type: 'BEHAVIORAL',
          difficulty: InterviewDifficulty.EASY,
          category: 'Mentorship & Culture',
          rubricCriteria: {
            keyConcepts: ['Mentorship cadence', 'Pair programming', 'Constructive PR reviews', 'Team enablement'],
            passingScore: 70,
            evaluationTips: 'Check if candidate fosters autonomy rather than dictating solutions.',
          },
          timeLimitMins: 10,
        }
      );
    }

    // Filter questions matching requested difficulty (or fallback to pool)
    const filteredByDifficulty = pool.filter((q) => q.difficulty === difficulty);
    const candidateList = filteredByDifficulty.length >= count ? filteredByDifficulty : pool;

    // Slice to requested count
    const selected = candidateList.slice(0, Math.max(1, count));

    // If requested count exceeds available unique items, loop with index suffix
    while (selected.length < count && pool.length > 0) {
      const template = pool[selected.length % pool.length];
      selected.push({
        ...template,
        title: `${template.title} (Part ${Math.floor(selected.length / pool.length) + 1})`,
      });
    }

    return selected;
  }
}
