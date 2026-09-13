import { z } from 'zod';

export const workExperienceSchema = z.object({
  company: z.string().default('Unknown Company'),
  position: z.string().default('Software Engineer'),
  startDate: z.string().optional().nullable().default(''),
  endDate: z.string().optional().nullable().default(''),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().optional().nullable().default(''),
  technologies: z.array(z.string()).default([]),
});

export const educationRecordSchema = z.object({
  institution: z.string().default('University / Institute'),
  degree: z.string().default('Degree / Diploma'),
  fieldOfStudy: z.string().optional().nullable().default(''),
  startDate: z.string().optional().nullable().default(''),
  endDate: z.string().optional().nullable().default(''),
  grade: z.string().optional().nullable().default(''),
});

export const candidateSkillsSchema = z.object({
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  other: z.array(z.string()).default([]),
});

export const candidateProjectSchema = z.object({
  title: z.string().default('Project'),
  description: z.string().optional().nullable().default(''),
  technologies: z.array(z.string()).default([]),
  url: z.string().optional().nullable().default(''),
  highlights: z.array(z.string()).default([]),
});

export const candidateProfileParsedSchema = z.object({
  fullName: z.string().min(1, 'Candidate full name is required').default('Candidate Name'),
  email: z.string().optional().nullable().default(''),
  phone: z.string().optional().nullable().default(''),
  location: z.string().optional().nullable().default(''),
  headline: z.string().optional().nullable().default(''),
  summary: z.string().optional().nullable().default(''),
  yearsOfExperience: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10;
    })
    .default(0),
  skills: candidateSkillsSchema.default({
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    other: [],
  }),
  education: z.array(educationRecordSchema).default([]),
  workExperience: z.array(workExperienceSchema).default([]),
  projects: z.array(candidateProjectSchema).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

export type ParsedCandidateProfile = z.infer<typeof candidateProfileParsedSchema>;
export type ParsedWorkExperience = z.infer<typeof workExperienceSchema>;
export type ParsedEducationRecord = z.infer<typeof educationRecordSchema>;
export type ParsedCandidateSkills = z.infer<typeof candidateSkillsSchema>;
export type ParsedCandidateProject = z.infer<typeof candidateProjectSchema>;
