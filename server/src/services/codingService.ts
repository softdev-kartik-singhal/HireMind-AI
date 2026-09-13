import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { getCodeExecutionService } from './execution/index.js';
import {
  RunCodeInput,
  SubmitCodeInput,
  CreateCodingQuestionInput,
} from '../validations/codingValidations.js';
import { InterviewDifficulty } from '@prisma/client';

export class CodingService {
  /**
   * Default starter codes per language for standard problems
   */
  static getDefaultStarterCodes(functionName = 'solve') {
    return {
      javascript: `/**
 * @param {any} input
 * @return {any}
 */
function ${functionName}(input) {
  // Write your solution here
  return null;
}
`,
      python: `def ${functionName}(input_data):
    """
    Write your solution here
    """
    return None
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    string ${functionName}(const string& input) {
        // Write your solution here
        return "";
    }
};
`,
      java: `import java.util.*;

public class Solution {
    public Object ${functionName}(Object input) {
        // Write your solution here
        return null;
    }
}
`,
    };
  }

  /**
   * Seed curated LeetCode-style coding questions if table is empty
   */
  static async seedDefaultCodingQuestions() {
    const count = await prisma.codingQuestion.count();
    if (count > 0) return;

    const questions = [
      {
        title: 'Two Sum Target Pairs',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order. Optimal time complexity: O(n).`,
        difficulty: InterviewDifficulty.EASY,
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
          'Only one valid answer exists.',
        ],
        examples: [
          {
            input: 'nums = [2, 7, 11, 15], target = 9',
            output: '[0, 1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          },
          {
            input: 'nums = [3, 2, 4], target = 6',
            output: '[1, 2]',
            explanation: 'nums[1] + nums[2] == 6, we return [1, 2].',
          },
        ],
        testCases: [
          {
            id: 'tc-1',
            input: '[2, 7, 11, 15], 9',
            expectedOutput: '[0, 1]',
            isHidden: false,
            description: 'Basic target pair at start of array',
          },
          {
            id: 'tc-2',
            input: '[3, 2, 4], 6',
            expectedOutput: '[1, 2]',
            isHidden: false,
            description: 'Unsorted elements',
          },
          {
            id: 'tc-3',
            input: '[3, 3], 6',
            expectedOutput: '[0, 1]',
            isHidden: false,
            description: 'Duplicate values',
          },
          {
            id: 'tc-4',
            input: '[-1, -2, -3, -4, -5], -8',
            expectedOutput: '[2, 4]',
            isHidden: true,
            description: 'Negative integers',
          },
        ],
        starterCode: {
          javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
          python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
          cpp: `#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (seen.find(diff) != seen.end()) {
                return {seen[diff], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
          java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
        },
        supportedLanguages: ['javascript', 'python', 'cpp', 'java'],
        category: 'Algorithms & Hash Maps',
        timeLimitMins: 20,
      },
      {
        title: 'LRU (Least Recently Used) Cache',
        description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\`: Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in O(1) average time complexity.`,
        difficulty: InterviewDifficulty.MEDIUM,
        constraints: [
          '1 <= capacity <= 3000',
          '0 <= key <= 10^4',
          '0 <= value <= 10^5',
          'At most 2 * 10^5 calls will be made to get and put.',
        ],
        examples: [
          {
            input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
            output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
            explanation: 'Key 2 is evicted when key 3 is added. Key 1 is evicted when key 4 is added.',
          },
        ],
        testCases: [
          {
            id: 'lru-1',
            input: 'capacity: 2, operations: put(1,1), put(2,2), get(1)',
            expectedOutput: '1',
            isHidden: false,
            description: 'Get existing item updates recency',
          },
          {
            id: 'lru-2',
            input: 'capacity: 2, operations: put(3,3), get(2)',
            expectedOutput: '-1',
            isHidden: false,
            description: 'Key 2 should be evicted',
          },
          {
            id: 'lru-3',
            input: 'capacity: 1, operations: put(2,1), get(2), put(3,2), get(2), get(3)',
            expectedOutput: '[1, null, -1, 2]',
            isHidden: true,
            description: 'Edge capacity = 1',
          },
        ],
        starterCode: {
          javascript: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
          python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
          cpp: `#include <unordered_map>
#include <list>

using namespace std;

class LRUCache {
    int capacity;
    list<pair<int, int>> dll;
    unordered_map<int, list<pair<int, int>>::iterator> map;
public:
    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        auto it = map.find(key);
        if (it == map.end()) return -1;
        dll.splice(dll.begin(), dll, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = map.find(key);
        if (it != map.end()) {
            dll.splice(dll.begin(), dll, it->second);
            it->second->second = value;
            return;
        }
        if (dll.size() == capacity) {
            int evictKey = dll.back().first;
            dll.pop_back();
            map.erase(evictKey);
        }
        dll.emplace_front(key, value);
        map[key] = dll.begin();
    }
};`,
          java: `import java.util.*;

public class LRUCache {
    private final int capacity;
    private final LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > capacity;
            }
        };
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
    }
}`,
        },
        supportedLanguages: ['javascript', 'python', 'cpp', 'java'],
        category: 'Data Structures & Concurrency',
        timeLimitMins: 30,
      },
    ];

    for (const q of questions) {
      await prisma.codingQuestion.create({
        data: q as any,
      });
    }
  }

  /**
   * Get single coding question by ID
   */
  static async getQuestionById(questionId: string) {
    await this.seedDefaultCodingQuestions();

    const question = await prisma.codingQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw ApiError.notFound('Coding question not found');
    }

    return question;
  }

  /**
   * Get all coding questions (optionally filtered by interview)
   */
  static async getQuestions(interviewId?: string) {
    await this.seedDefaultCodingQuestions();

    const where: any = {};
    if (interviewId) {
      where.OR = [{ interviewId }, { interviewId: null }];
    }

    const questions = await prisma.codingQuestion.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return questions;
  }

  /**
   * Execute code against visible test cases (Run Code)
   * SECURITY: Executed exclusively through isolated sandbox service abstraction.
   */
  static async runCode(userId: string, input: RunCodeInput) {
    await this.seedDefaultCodingQuestions();

    let testCasesToRun: any[] = [];

    if (input.customTestCases && input.customTestCases.length > 0) {
      testCasesToRun = input.customTestCases;
    } else if (input.questionId) {
      const q = await prisma.codingQuestion.findUnique({
        where: { id: input.questionId },
      });
      if (q && Array.isArray(q.testCases)) {
        // Run only visible test cases for "Run Code" button
        testCasesToRun = (q.testCases as any[]).filter((tc) => !tc.isHidden);
      }
    }

    if (testCasesToRun.length === 0) {
      testCasesToRun = [
        {
          input: 'Sample Input 1',
          expectedOutput: 'Sample Output 1',
          description: 'Default validation test',
        },
      ];
    }

    const executionService = getCodeExecutionService();
    const result = await executionService.execute({
      language: input.language,
      code: input.code,
      testCases: testCasesToRun,
    });

    return result;
  }

  /**
   * Submit solution against all test cases and persist submission
   */
  static async submitSolution(candidateId: string, input: SubmitCodeInput) {
    await this.seedDefaultCodingQuestions();

    const question = await prisma.codingQuestion.findUnique({
      where: { id: input.questionId },
    });

    if (!question) {
      throw ApiError.notFound('Coding question not found');
    }

    const allTestCases = (question.testCases as any[]) || [
      { input: 'Default 1', expectedOutput: 'Default 1' },
    ];

    // Execute against all test cases (both visible and hidden)
    const executionService = getCodeExecutionService();
    const result = await executionService.execute({
      language: input.language,
      code: input.code,
      testCases: allTestCases,
    });

    // Persist submission record in PostgreSQL
    const submission = await prisma.codingSubmission.create({
      data: {
        candidateId,
        interviewId: input.interviewId || null,
        questionId: input.questionId,
        language: input.language,
        code: input.code,
        status: result.status,
        testResults: result.results as any,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.totalExecutionTimeMs,
        memoryUsage: 12.4, // KB simulated
      },
    });

    // If linked to an interview, update the interview response record
    if (input.interviewId) {
      const existingQ = await prisma.interviewQuestion.findFirst({
        where: { interviewId: input.interviewId },
      });

      if (existingQ) {
        await prisma.interviewResponse.upsert({
          where: {
            interviewId_questionId: {
              interviewId: input.interviewId,
              questionId: existingQ.id,
            },
          },
          create: {
            interviewId: input.interviewId,
            questionId: existingQ.id,
            candidateId,
            codeAnswer: input.code,
            codeLanguage: input.language,
            executionResults: result as any,
            isSubmitted: result.status === 'ACCEPTED',
            submittedAt: new Date(),
          },
          update: {
            codeAnswer: input.code,
            codeLanguage: input.language,
            executionResults: result as any,
            isSubmitted: result.status === 'ACCEPTED',
            submittedAt: new Date(),
          },
        }).catch((err) => {
          console.warn('[CodingService] InterviewResponse sync deferred:', err);
        });
      }
    }

    return {
      submission,
      executionResult: result,
    };
  }

  /**
   * Get candidate submission history for a coding question
   */
  static async getSubmissions(
    questionId: string,
    candidateId: string,
    interviewId?: string
  ) {
    const where: any = { questionId, candidateId };
    if (interviewId) {
      where.interviewId = interviewId;
    }

    const submissions = await prisma.codingSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: 20,
    });

    return submissions;
  }
}
