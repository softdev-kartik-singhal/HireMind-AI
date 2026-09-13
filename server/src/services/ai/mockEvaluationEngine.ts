import {
  EvaluationContext,
  IAiEvaluationEngine,
} from './evaluationEngine.interface.js';
import {
  AiEvaluationOutput,
  EvaluationRecommendation,
} from '../../validations/evaluationValidations.js';

export class MockEvaluationEngine implements IAiEvaluationEngine {
  async evaluateInterview(context: EvaluationContext): Promise<AiEvaluationOutput> {
    const { candidate, job, questions, proctoring } = context;

    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(
      (q) =>
        (q.response?.answerText && q.response.answerText.trim().length > 10) ||
        (q.response?.codeAnswer && q.response.codeAnswer.trim().length > 15)
    );

    const completionRate = totalQuestions > 0 ? answeredQuestions.length / totalQuestions : 0.8;

    // 1. Coding Performance
    const codingQuestions = questions.filter(
      (q) => q.category.toLowerCase().includes('coding') || q.response?.codeAnswer
    );
    let codingScore = 78;
    if (codingQuestions.length > 0) {
      let totalTestsPassed = 0;
      let totalTestsCount = 0;
      for (const cq of codingQuestions) {
        const exec = cq.response?.executionResults;
        if (exec && typeof exec.passedTests === 'number' && typeof exec.totalTests === 'number') {
          totalTestsPassed += exec.passedTests;
          totalTestsCount += exec.totalTests;
        } else if (cq.response?.codeAnswer && cq.response.codeAnswer.length > 50) {
          totalTestsPassed += 4;
          totalTestsCount += 5;
        }
      }
      if (totalTestsCount > 0) {
        codingScore = Math.round((totalTestsPassed / totalTestsCount) * 100);
      }
    } else {
      codingScore = Math.round(75 + completionRate * 15);
    }
    codingScore = Math.max(20, Math.min(98, codingScore));

    // 2. Answer Relevance Score
    const relevanceScores = questions
      .map((q) => q.response?.answerRelevanceScore)
      .filter((s): s is number => typeof s === 'number');
    const answerRelevanceScore =
      relevanceScores.length > 0
        ? Math.round(relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length)
        : Math.round(72 + completionRate * 18);

    // 3. Communication Score
    const completenessScores = questions
      .map((q) => q.response?.responseCompletenessScore)
      .filter((s): s is number => typeof s === 'number');
    const avgCompleteness =
      completenessScores.length > 0
        ? completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length
        : 80;
    const communicationScore = Math.max(
      30,
      Math.min(96, Math.round(avgCompleteness * 0.6 + answerRelevanceScore * 0.4))
    );

    // 4. Job Skill Alignment
    const candidateSkillsLower = new Set(
      (candidate.skills || []).map((s) => s.toLowerCase().trim())
    );
    const requiredSkills = job.requiredSkills || [];
    const matchedSkills = requiredSkills.filter((s) =>
      candidateSkillsLower.has(s.toLowerCase().trim())
    );
    const missingSkills = requiredSkills.filter(
      (s) => !candidateSkillsLower.has(s.toLowerCase().trim())
    );
    const skillAlignmentScore =
      requiredSkills.length > 0
        ? Math.max(30, Math.min(100, Math.round((matchedSkills.length / requiredSkills.length) * 100)))
        : 85;

    // 5. Technical Knowledge & Problem Solving
    const technicalScore = Math.max(
      35,
      Math.min(96, Math.round(skillAlignmentScore * 0.4 + codingScore * 0.35 + answerRelevanceScore * 0.25))
    );
    const problemSolvingScore = Math.max(
      35,
      Math.min(96, Math.round(codingScore * 0.5 + technicalScore * 0.3 + completionRate * 20))
    );

    // 6. Overall Score (Weighted Synthesis)
    const overallScore = Math.max(
      25,
      Math.min(
        100,
        Math.round(
          technicalScore * 0.2 +
            problemSolvingScore * 0.2 +
            codingScore * 0.2 +
            communicationScore * 0.15 +
            answerRelevanceScore * 0.15 +
            skillAlignmentScore * 0.1
        )
      )
    );

    // 7. Overall Recommendation
    let recommendation: EvaluationRecommendation = 'MAYBE';
    if (overallScore >= 85) {
      recommendation = 'STRONG_HIRE';
    } else if (overallScore >= 70) {
      recommendation = 'HIRE';
    } else if (overallScore < 55) {
      recommendation = 'NO_HIRE';
    }

    // 8. Strengths & Weaknesses
    const strengths: string[] = [
      `Demonstrated strong alignment with core role competencies in ${matchedSkills.slice(0, 3).join(', ') || 'software engineering principles'}.`,
      `Consistently structured responses with high relevance (${answerRelevanceScore}%) and methodical technical depth.`,
    ];
    if (codingScore >= 75) {
      strengths.push('Clean algorithmic problem solving with solid test case coverage and type safety.');
    }
    if (communicationScore >= 75) {
      strengths.push('Articulate verbal delivery with concise technical phrasing and low hesitation.');
    }

    const weaknesses: string[] = [];
    if (missingSkills.length > 0) {
      weaknesses.push(`Limited demonstrated exposure to role prerequisites: ${missingSkills.slice(0, 3).join(', ')}.`);
    }
    if (codingScore < 70) {
      weaknesses.push('Could optimize algorithmic edge cases and asymptotic memory allocations.');
    }
    if (completionRate < 0.9) {
      weaknesses.push('Some interview prompts had brief or partially unsubmitted solution walkthroughs.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Could elaborate further on production fault-tolerance and distributed consensus trade-offs.');
    }

    const improvementAreas: string[] = [
      'Deepen hands-on familiarity with production monitoring, distributed tracing, and horizontal partitioning.',
      'Practice asynchronous concurrency bottlenecks and system failure recovery scenarios.',
    ];
    if (missingSkills.length > 0) {
      improvementAreas.push(`Upskill on key ecosystem tools: ${missingSkills.join(', ')}.`);
    }

    const technicalSummary = `${candidate.name} demonstrated solid foundational competency for the ${job.title} role, achieving a ${technicalScore}% technical score and ${codingScore}% coding score. Solutions exhibited modular architecture and sensible trade-offs between execution speed and maintainability.`;

    const communicationSummary = `${candidate.name} communicated technical concepts with an average relevance score of ${answerRelevanceScore}% and communication score of ${communicationScore}%. Answers were logically structured and clearly addressed the interviewer's rubric criteria.`;

    const summary = `${candidate.name} completed the ${context.interviewTitle} evaluation round for ${job.title}. The candidate demonstrated strong problem-solving capabilities (${problemSolvingScore}%) and sound engineering fundamentals. Recommended status: ${recommendation.replace('_', ' ')}.`;

    return {
      overallScore,
      technicalScore,
      problemSolvingScore,
      codingScore,
      communicationScore,
      answerRelevanceScore,
      skillAlignmentScore,
      recommendation,
      summary,
      strengths,
      weaknesses,
      missingSkills,
      technicalSummary,
      communicationSummary,
      improvementAreas,
    };
  }
}
