import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  EvaluationContext,
  IAiEvaluationEngine,
} from './evaluationEngine.interface.js';
import {
  AiEvaluationOutput,
  aiEvaluationOutputSchema,
} from '../../validations/evaluationValidations.js';
import { env } from '../../config/env.js';
import { MockEvaluationEngine } from './mockEvaluationEngine.js';

export class GeminiEvaluationEngine implements IAiEvaluationEngine {
  private fallbackEngine = new MockEvaluationEngine();

  private sanitizeJsonText(rawJson: string): string {
    let clean = rawJson.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean.trim();
  }

  async evaluateInterview(context: EvaluationContext): Promise<AiEvaluationOutput> {
    if (!env.GEMINI_API_KEY) {
      console.warn(
        '[GeminiEvaluationEngine] GEMINI_API_KEY not configured. Falling back to deterministic evaluation engine.'
      );
      return this.fallbackEngine.evaluateInterview(context);
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

      const prompt = `You are a principal technical hiring manager and evaluator at a premier software company.
You are evaluating a candidate's completed interview session for a specific job opening.

CANDIDATE:
- Name: ${context.candidate.name}
- Known Skills: ${context.candidate.skills.join(', ')}

TARGET JOB:
- Title: ${context.job.title}
- Description: ${context.job.description.slice(0, 1000)}
- Required Skills: ${context.job.requiredSkills.join(', ')}
- Preferred Skills: ${(context.job.preferredSkills || []).join(', ')}

INTERVIEW DETAILS:
- Title: ${context.interviewTitle}
- Type: ${context.interviewType}
- Difficulty: ${context.interviewDifficulty}
- Duration: ${context.durationMinutes} minutes

QUESTIONS AND CANDIDATE RESPONSES:
${context.questions
  .map((q, idx) => {
    const resp = q.response;
    return `Question #${idx + 1} (${q.category}, Difficulty: ${q.difficulty}):
Prompt: ${q.question}
Expected Topics: ${(q.expectedTopics || []).join(', ')}
Evaluation Criteria: ${(q.evaluationCriteria || []).join(', ')}
Candidate Answer: ${resp?.answerText ? resp.answerText : '(No verbal answer provided)'}
Candidate Code: ${resp?.codeAnswer ? resp.codeAnswer.slice(0, 1500) : '(No code submitted)'}
Execution Results: ${resp?.executionResults ? JSON.stringify(resp.executionResults) : 'N/A'}
Speech Metrics: ${
      resp?.speakingDurationSeconds
        ? `${resp.speakingDurationSeconds}s, WPM: ${resp.speakingWpm || 140}, Fillers: ${resp.fillerWordCount}, Relevance: ${resp.answerRelevanceScore}%`
        : 'N/A'
    }
`;
  })
  .join('\n---\n')}

PROCTORING INTEGRITY SIGNALS:
${
  context.proctoring
    ? `Total Signals: ${context.proctoring.totalEvents}, Clean Time: ${context.proctoring.cleanTimePercentage}%, Rating: ${context.proctoring.integrityRating}`
    : 'No anomalies recorded'
}

EVALUATION INSTRUCTIONS:
1. Provide objective, evidence-based evaluations based on what the candidate actually produced and demonstrated.
2. Score each dimension from 0 to 100:
   - technicalScore (Technical Knowledge)
   - problemSolvingScore (Problem Solving)
   - codingScore (Coding Performance)
   - communicationScore (Communication)
   - answerRelevanceScore (Answer Relevance)
   - skillAlignmentScore (Job Skill Alignment)
   - overallScore (Overall Interview Performance)
3. Select an overall recommendation from: ["STRONG_HIRE", "HIRE", "MAYBE", "NO_HIRE"].
4. Provide structured qualitative feedback:
   - strengths: Array of 3-5 specific strengths observed in answers/code
   - weaknesses: Array of 2-4 concrete areas needing improvement
   - missingSkills: Array of required job skills not demonstrated in the interview
   - technicalSummary: 2-3 sentences summarizing technical competence and architecture
   - communicationSummary: 2-3 sentences summarizing clarity, pace, and relevance
   - improvementAreas: Array of actionable recommendations for the candidate
   - summary: 2-3 sentence executive summary for the hiring manager

Format your output STRICTLY as a JSON object matching this schema:
{
  "overallScore": number,
  "technicalScore": number,
  "problemSolvingScore": number,
  "codingScore": number,
  "communicationScore": number,
  "answerRelevanceScore": number,
  "skillAlignmentScore": number,
  "recommendation": "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE",
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "technicalSummary": string,
  "communicationSummary": string,
  "improvementAreas": string[]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const sanitized = this.sanitizeJsonText(responseText);
      const parsedJson = JSON.parse(sanitized);

      const validated = aiEvaluationOutputSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      console.warn(
        '[GeminiEvaluationEngine] AI generation failed or returned invalid schema. Falling back to deterministic engine:',
        err
      );
      return this.fallbackEngine.evaluateInterview(context);
    }
  }
}
