import { ParsedCandidateProfile } from '../../validations/resumeParser.schema.js';

export interface ResumeParserMetadata {
  fileName?: string;
  candidateId?: string;
}

export interface IAiResumeParser {
  /**
   * Parse extracted raw resume text into a structured, validated candidate profile.
   */
  parseResumeText(
    rawText: string,
    metadata?: ResumeParserMetadata
  ): Promise<ParsedCandidateProfile>;
}
