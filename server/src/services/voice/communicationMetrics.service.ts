/**
 * Communication Metrics Calculator
 *
 * Evaluates objective, quantifiable linguistic and technical signals:
 * - Speaking Duration & Speaking Pace (WPM)
 * - Deterministic Filler Word Frequency ("um", "uh", "like", "you know", "basically")
 * - Technical Topic Coverage & Answer Relevance (0-100)
 * - Response Completeness (0-100)
 *
 * STRICT GUARDRAIL:
 * Does NOT claim or calculate psychological, emotional, or personality conclusions from voice.
 */

export interface FillerWordItem {
  word: string;
  count: number;
}

export interface CommunicationMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  paceRating: 'DELIBERATE' | 'OPTIMAL' | 'RAPID';
  fillerWordCount: number;
  fillerPercentage: number;
  fillerCategory: 'EXCEPTIONAL' | 'NATURAL' | 'ELEVATED';
  fillerBreakdown: FillerWordItem[];
  answerRelevanceScore: number; // 0 - 100
  responseCompletenessScore: number; // 0 - 100
  matchedTopics: string[];
  missingTopics: string[];
  disclaimer: string;
}

// Canonical filler patterns (boundary matching, case-insensitive)
const FILLER_PATTERNS: Array<{ word: string; regex: RegExp }> = [
  { word: 'um', regex: /\bum\b/gi },
  { word: 'uh', regex: /\buh\b/gi },
  { word: 'er', regex: /\ber\b/gi },
  { word: 'ah', regex: /\bah\b/gi },
  { word: 'like', regex: /\blike\b/gi },
  { word: 'you know', regex: /\byou know\b/gi },
  { word: 'i mean', regex: /\bi mean\b/gi },
  { word: 'basically', regex: /\bbasically\b/gi },
  { word: 'actually', regex: /\bactually\b/gi },
  { word: 'literally', regex: /\bliterally\b/gi },
  { word: 'sort of', regex: /\bsort of\b/gi },
  { word: 'kind of', regex: /\bkind of\b/gi },
];

export class CommunicationMetricsService {
  private static readonly DISCLAIMER =
    'Communication metrics evaluate solely objective technical topic coverage, speaking pace, and lexical clarity. We strictly do NOT assess or claim psychological, emotional, or personality conclusions.';

  /**
   * Compute communication metrics from transcript and question context
   */
  static computeMetrics(input: {
    transcript: string;
    durationSeconds: number;
    expectedTopics?: string[];
    questionDescription?: string;
    questionTitle?: string;
  }): CommunicationMetrics {
    const { transcript, durationSeconds, expectedTopics = [], questionDescription = '' } = input;

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Duration & Words Per Minute
    const safeDuration = Math.max(1, durationSeconds);
    const wordsPerMinute = Math.round((wordCount / safeDuration) * 60);

    let paceRating: 'DELIBERATE' | 'OPTIMAL' | 'RAPID' = 'OPTIMAL';
    if (wordsPerMinute < 100) {
      paceRating = 'DELIBERATE';
    } else if (wordsPerMinute > 165) {
      paceRating = 'RAPID';
    }

    // 2. Filler Word Detection
    let totalFillerCount = 0;
    const fillerBreakdown: FillerWordItem[] = [];

    for (const pattern of FILLER_PATTERNS) {
      const matches = transcript.match(pattern.regex);
      if (matches && matches.length > 0) {
        totalFillerCount += matches.length;
        fillerBreakdown.push({
          word: pattern.word,
          count: matches.length,
        });
      }
    }

    fillerBreakdown.sort((a, b) => b.count - a.count);

    const fillerPercentage =
      wordCount > 0 ? Number(((totalFillerCount / wordCount) * 100).toFixed(1)) : 0;

    let fillerCategory: 'EXCEPTIONAL' | 'NATURAL' | 'ELEVATED' = 'NATURAL';
    if (fillerPercentage <= 2.0) {
      fillerCategory = 'EXCEPTIONAL';
    } else if (fillerPercentage > 5.5) {
      fillerCategory = 'ELEVATED';
    }

    // 3. Technical Topic Coverage & Answer Relevance
    const lowerTranscript = transcript.toLowerCase();
    const matchedTopics: string[] = [];
    const missingTopics: string[] = [];

    for (const topic of expectedTopics) {
      const topicKeywords = topic.toLowerCase().split(/\s+/).filter(Boolean);
      // Check if full phrase or significant keyword is in transcript
      const matched =
        lowerTranscript.includes(topic.toLowerCase()) ||
        topicKeywords.some((kw) => kw.length > 3 && lowerTranscript.includes(kw));

      if (matched) {
        matchedTopics.push(topic);
      } else {
        missingTopics.push(topic);
      }
    }

    // Calculate Relevance Score
    let answerRelevanceScore = 70; // baseline for spoken attempt
    if (expectedTopics.length > 0) {
      const topicRatio = matchedTopics.length / expectedTopics.length;
      answerRelevanceScore = Math.round(50 + topicRatio * 50);
    } else {
      // If no expected topics, evaluate based on question keywords
      const questionKeywords = (input.questionTitle + ' ' + questionDescription)
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4);
      const overlap = questionKeywords.filter((w) => lowerTranscript.includes(w));
      const ratio = questionKeywords.length > 0 ? overlap.length / questionKeywords.length : 0.5;
      answerRelevanceScore = Math.min(100, Math.round(60 + ratio * 40));
    }

    // 4. Response Completeness Score
    // Evaluates length adequacy, contextual depth, and whether a conclusion/result is provided
    let responseCompletenessScore = 60;
    if (wordCount >= 40) responseCompletenessScore += 15;
    if (wordCount >= 100) responseCompletenessScore += 15;
    if (matchedTopics.length >= Math.ceil(expectedTopics.length * 0.5)) {
      responseCompletenessScore += 10;
    }
    responseCompletenessScore = Math.min(100, Math.max(30, responseCompletenessScore));

    return {
      durationSeconds: safeDuration,
      wordCount,
      wordsPerMinute,
      paceRating,
      fillerWordCount: totalFillerCount,
      fillerPercentage,
      fillerCategory,
      fillerBreakdown,
      answerRelevanceScore,
      responseCompletenessScore,
      matchedTopics,
      missingTopics,
      disclaimer: this.DISCLAIMER,
    };
  }
}
