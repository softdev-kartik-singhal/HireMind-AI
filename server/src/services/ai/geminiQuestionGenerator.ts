import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  IAiQuestionGenerator,
  QuestionGenerationInput,
} from './questionGenerator.interface.js';
import {
  AiQuestionGenerationResult,
  aiQuestionGenerationResultSchema,
} from '../../validations/questionGenerator.schema.js';
import { env } from '../../config/env.js';
import { MockQuestionGenerator } from './mockQuestionGenerator.js';

export class GeminiQuestionGenerator implements IAiQuestionGenerator {
  private fallbackGenerator = new MockQuestionGenerator();

  private sanitizeJsonText(rawJson: string): string {
    let clean = rawJson.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean.trim();
  }

  async generateQuestions(input: QuestionGenerationInput): Promise<AiQuestionGenerationResult> {
    if (!env.GEMINI_API_KEY) {
      console.warn(
        '[GeminiQuestionGenerator] GEMINI_API_KEY not set. Using intelligent fallback question generator.'
      );
      return this.fallbackGenerator.generateQuestions(input);
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const modelName = env.AI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `You are an elite technical interview designer and principal engineering assessor at a top-tier technology company.
Generate exactly ${input.numQuestions} tailored interview questions for a candidate being interviewed for the position of "${input.job.title}".

CRITICAL INSTRUCTIONS:
1. Every question MUST fall strictly into one of the following 6 categories:
   - "Fundamentals"
   - "Technical"
   - "Scenario-based"
   - "Problem-solving"
   - "Project-based"
   - "Behavioral"
2. Each question object MUST include:
   - "title": A concise, engaging title for the question.
   - "question": The full, detailed question description/scenario prompt.
   - "category": Exactly one of ("Fundamentals" | "Technical" | "Scenario-based" | "Problem-solving" | "Project-based" | "Behavioral").
   - "difficulty": "${input.difficulty}" (Must be one of "EASY" | "MEDIUM" | "HARD").
   - "expectedTopics": An array of at least 3-4 specific concepts, algorithms, tools, or architectural principles the candidate is expected to mention.
   - "evaluationCriteria": An array of at least 3 tangible grading benchmarks to evaluate candidate competency.
   - "type": "TECHNICAL" | "BEHAVIORAL" | "CODING" | "SYSTEM_DESIGN".
   - "starterCode": Optional starter code snippet if it's a coding or implementation question.
   - "testCases": Optional array of test cases with { "input": string, "expectedOutput": string, "description": string } for coding questions.
   - "timeLimitMins": Recommended completion time (10 to 30 mins).
3. If the interview type is "CODING", prioritize "Problem-solving", "Fundamentals", and "Technical" with starter code.
4. If the interview type is "BEHAVIORAL", prioritize "Behavioral", "Project-based", and "Scenario-based".
5. Tailor the questions specifically to the candidate's resume background and the job requisition requirements below.

JOB DETAILS:
- Title: ${input.job.title}
- Department: ${input.job.department || 'Engineering'}
- Experience Level: ${input.job.experienceLevel}
- Required Skills: ${JSON.stringify(input.job.requiredSkills)}
- Preferred Skills: ${JSON.stringify(input.job.preferredSkills || [])}
- Description: ${input.job.description}

CANDIDATE PROFILE:
- Full Name: ${input.candidate.fullName || 'Candidate'}
- Headline: ${input.candidate.headline || 'Software Engineer'}
- Years of Experience: ${input.candidate.yearsOfExperience || 0}
- Skills: ${JSON.stringify(input.candidate.skills || [])}
- Projects: ${JSON.stringify(input.candidate.projects || [])}
- Work Experience: ${JSON.stringify(input.candidate.experiences || [])}

INTERVIEW CONFIGURATION:
- Interview Type: ${input.interviewType}
- Target Difficulty: ${input.difficulty}
- Total Questions Needed: ${input.numQuestions}

Return ONLY valid JSON matching this schema:
{
  "summary": "Brief summary of question distribution and focus areas",
  "questions": [
    {
      "title": string,
      "question": string,
      "category": "Fundamentals" | "Technical" | "Scenario-based" | "Problem-solving" | "Project-based" | "Behavioral",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "expectedTopics": [string],
      "evaluationCriteria": [string],
      "type": "TECHNICAL" | "BEHAVIORAL" | "CODING" | "SYSTEM_DESIGN",
      "starterCode": string or null,
      "testCases": [{ "input": string, "expectedOutput": string, "description": string }] or null,
      "timeLimitMins": number
    }
  ]
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const sanitized = this.sanitizeJsonText(text);
      const parsedJson = JSON.parse(sanitized);

      const validated = aiQuestionGenerationResultSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      console.error(
        '[GeminiQuestionGenerator] AI Generation encountered an error. Falling back to intelligent question generator:',
        err
      );
      return this.fallbackGenerator.generateQuestions(input);
    }
  }
}
