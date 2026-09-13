import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiResumeParser, ResumeParserMetadata } from './aiParser.interface.js';
import {
  candidateProfileParsedSchema,
  ParsedCandidateProfile,
} from '../../validations/resumeParser.schema.js';
import { env } from '../../config/env.js';
import { MockResumeParser } from './mockResumeParser.js';

export class GeminiResumeParser implements IAiResumeParser {
  private fallbackParser = new MockResumeParser();

  private sanitizeJsonText(rawJson: string): string {
    let clean = rawJson.trim();
    // Remove markdown code blocks if wrapped by model
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean.trim();
  }

  async parseResumeText(
    rawText: string,
    metadata?: ResumeParserMetadata
  ): Promise<ParsedCandidateProfile> {
    if (!env.GEMINI_API_KEY) {
      console.warn(
        '[GeminiResumeParser] GEMINI_API_KEY not set. Using intelligent fallback parser.'
      );
      return this.fallbackParser.parseResumeText(rawText, metadata);
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const modelName = env.AI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `You are an expert technical recruiter and resume parsing AI.
Analyze the following resume text and extract structured information in strictly valid JSON format.

JSON Structure to return:
{
  "fullName": string (Full candidate name),
  "email": string (Email address or empty string),
  "phone": string (Phone number or empty string),
  "location": string (City, State, Country or Remote),
  "headline": string (Professional title or summary headline),
  "summary": string (2-3 sentence executive profile summary),
  "yearsOfExperience": number (Numeric years of professional experience),
  "skills": {
    "languages": string[] (e.g. ["TypeScript", "Python", "Go", "Java"]),
    "frameworks": string[] (e.g. ["Next.js", "React", "Node.js", "Express"]),
    "databases": string[] (e.g. ["PostgreSQL", "Redis", "MongoDB"]),
    "tools": string[] (e.g. ["Docker", "Kubernetes", "AWS", "Git"]),
    "other": string[] (Other technical or soft skills)
  },
  "education": [
    {
      "institution": string (University or College name),
      "degree": string (e.g. "Bachelor of Science in Computer Science"),
      "fieldOfStudy": string (e.g. "Computer Science"),
      "startDate": string (e.g. "2018"),
      "endDate": string (e.g. "2022"),
      "grade": string (GPA or Honors)
    }
  ],
  "workExperience": [
    {
      "company": string (Company name),
      "position": string (Job title),
      "startDate": string (e.g. "2022-01"),
      "endDate": string (e.g. "Present" or "2024-03"),
      "isCurrent": boolean,
      "description": string (Key achievements and responsibilities),
      "technologies": string[] (Tech stack used in this role)
    }
  ],
  "projects": [
    {
      "title": string (Project name),
      "description": string (Project summary),
      "technologies": string[] (Tech stack),
      "url": string (GitHub / live link),
      "highlights": string[] (Key features or metrics)
    }
  ],
  "certifications": string[] (Certifications achieved),
  "achievements": string[] (Awards, publications, hackathons)
}

Resume Text:
---
${rawText}
---`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedJson = this.sanitizeJsonText(responseText);
      const parsedData = JSON.parse(cleanedJson);

      // Validate against strict Zod schema
      return candidateProfileParsedSchema.parse(parsedData);
    } catch (err: any) {
      console.error(
        '[GeminiResumeParser] Gemini API parsing failed or schema mismatch:',
        err.message
      );
      console.warn('[GeminiResumeParser] Falling back to heuristic parser.');
      return this.fallbackParser.parseResumeText(rawText, metadata);
    }
  }
}
