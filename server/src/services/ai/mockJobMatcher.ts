import {
  IAiJobMatcher,
  JobMatchInput,
  CandidateMatchInput,
} from './jobMatcher.interface.js';
import {
  JobMatchResult,
  MatchRecommendationType,
} from '../../validations/jobMatch.schema.js';

export class MockJobMatcher implements IAiJobMatcher {
  async matchCandidateToJob(
    job: JobMatchInput,
    candidate: CandidateMatchInput
  ): Promise<JobMatchResult> {
    // 1. Gather all candidate skills from skill list, work experience tech, and project tech
    const candidateSkillPool = new Set<string>();

    (candidate.skills || []).forEach((s) => {
      if (s.name) candidateSkillPool.add(s.name.trim().toLowerCase());
    });

    (candidate.workExperiences || []).forEach((exp) => {
      (exp.technologies || []).forEach((t) => {
        if (t) candidateSkillPool.add(t.trim().toLowerCase());
      });
    });

    (candidate.projects || []).forEach((proj) => {
      (proj.technologies || []).forEach((t) => {
        if (t) candidateSkillPool.add(t.trim().toLowerCase());
      });
    });

    // Helper for fuzzy/contains check with regex escaping
    const hasSkill = (target: string): boolean => {
      const normalizedTarget = target.trim().toLowerCase();
      if (!normalizedTarget) return false;

      for (const candSkill of candidateSkillPool) {
        if (candSkill === normalizedTarget) return true;
        if (candSkill.includes(normalizedTarget) || normalizedTarget.includes(candSkill)) {
          return true;
        }
      }

      // Also check full text summary, headline, or resumeText if present
      const corpus = [
        candidate.headline || '',
        candidate.summary || '',
        candidate.resumeText || '',
        ...(candidate.workExperiences || []).map((w) => `${w.position} ${w.description || ''}`),
        ...(candidate.projects || []).map((p) => `${p.title} ${p.description || ''}`),
      ].join(' ').toLowerCase();

      const escaped = normalizedTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(corpus);
    };

    // 2. Evaluate Required Skills (Weight: 35%)
    const requiredSkills = job.requiredSkills || [];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach((skill) => {
      if (hasSkill(skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const requiredSkillScore =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 85;

    // 3. Evaluate Preferred Skills (Weight: 15%)
    const preferredSkills = job.preferredSkills || [];
    let matchedPreferredCount = 0;

    preferredSkills.forEach((skill) => {
      if (hasSkill(skill)) {
        matchedPreferredCount++;
        if (!matchedSkills.includes(skill)) {
          matchedSkills.push(skill);
        }
      }
    });

    const preferredSkillScore =
      preferredSkills.length > 0
        ? Math.round((matchedPreferredCount / preferredSkills.length) * 100)
        : 85;

    // 4. Evaluate Experience Relevance (Weight: 25%)
    const targetYearsMap: Record<string, number> = {
      ENTRY: 1,
      MID: 3,
      SENIOR: 5,
      LEAD: 7,
      EXECUTIVE: 10,
    };
    const targetYears = targetYearsMap[job.experienceLevel] || 3;
    const candidateYears = candidate.yearsOfExperience ?? 0;

    let experienceScore = 70;
    let experienceSummary = '';

    if (candidateYears >= targetYears) {
      // Full or high points
      const ratio = Math.min(1.2, candidateYears / Math.max(1, targetYears));
      experienceScore = Math.min(100, Math.round(85 * ratio));
      experienceSummary = `Candidate has ${candidateYears.toFixed(1)} years of experience, meeting or exceeding the ${job.experienceLevel} target of ${targetYears} years.`;
    } else {
      const ratio = Math.max(0.3, candidateYears / Math.max(1, targetYears));
      experienceScore = Math.round(75 * ratio);
      experienceSummary = `Candidate has ${candidateYears.toFixed(1)} years of experience, below the recommended ${targetYears} years for a ${job.experienceLevel} role.`;
    }

    // Boost experience relevance if titles align with job title or department
    const jobTitleLower = job.title.toLowerCase();
    const relevantExpTitles = (candidate.workExperiences || []).filter((w) => {
      const pos = (w.position || '').toLowerCase();
      return (
        pos.includes(jobTitleLower) ||
        jobTitleLower.includes(pos) ||
        pos.includes('engineer') ||
        pos.includes('developer')
      );
    });

    if (relevantExpTitles.length > 0) {
      experienceScore = Math.min(100, experienceScore + 10);
      experienceSummary += ` Identified ${relevantExpTitles.length} directly related prior role(s).`;
    }

    // 5. Evaluate Education Relevance (Weight: 10%)
    let educationScore = 70;
    const educations = candidate.educations || [];
    if (educations.length > 0) {
      const csKeywords = ['computer', 'software', 'data', 'information', 'technology', 'engineering', 'math', 'science'];
      const hasRelevantDegree = educations.some((edu) => {
        const field = `${edu.degree} ${edu.fieldOfStudy || ''}`.toLowerCase();
        return csKeywords.some((kw) => field.includes(kw));
      });

      if (hasRelevantDegree) {
        educationScore = 95;
      } else {
        educationScore = 80;
      }
    } else {
      educationScore = 65; // No formal education listed
    }

    // 6. Evaluate Project Relevance (Weight: 15%)
    let projectScore = 60;
    const projects = candidate.projects || [];
    if (projects.length > 0) {
      let matchedProjectTech = 0;
      projects.forEach((proj) => {
        (proj.technologies || []).forEach((t) => {
          if (requiredSkills.some((req) => req.toLowerCase() === t.toLowerCase())) {
            matchedProjectTech++;
          }
        });
      });

      if (projects.length >= 2 && matchedProjectTech > 0) {
        projectScore = 90;
      } else if (projects.length >= 1) {
        projectScore = 75;
      }
    }

    // 7. Calculate Overall Fit (0 - 100)
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          requiredSkillScore * 0.35 +
            experienceScore * 0.25 +
            preferredSkillScore * 0.15 +
            projectScore * 0.15 +
            educationScore * 0.10
        )
      )
    );

    // 8. Determine Recommendation
    let recommendation: MatchRecommendationType = 'PARTIAL_MATCH';
    if (overallScore >= 85) {
      recommendation = 'STRONG_MATCH';
    } else if (overallScore >= 70) {
      recommendation = 'GOOD_MATCH';
    } else if (overallScore >= 50) {
      recommendation = 'PARTIAL_MATCH';
    } else {
      recommendation = 'WEAK_MATCH';
    }

    // 9. Synthesize Strengths and Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (matchedSkills.length > 0) {
      strengths.push(
        `Strong alignment on key skills: ${matchedSkills.slice(0, 4).join(', ')}.`
      );
    }
    if (candidateYears >= targetYears) {
      strengths.push(
        `Proven track record with ${candidateYears.toFixed(1)} years in relevant technology domains.`
      );
    }
    if (projects.length >= 2) {
      strengths.push(
        `Active portfolio demonstrating hands-on implementation across ${projects.length} distinct projects.`
      );
    }
    if (educationScore >= 90) {
      strengths.push('Formal technical degree in Computer Science or related engineering discipline.');
    }

    if (missingSkills.length > 0) {
      weaknesses.push(
        `Missing verified evidence for required skill(s): ${missingSkills.slice(0, 3).join(', ')}.`
      );
    }
    if (candidateYears < targetYears) {
      weaknesses.push(
        `Total professional experience (${candidateYears.toFixed(1)} yrs) is lower than preferred ${job.experienceLevel} level benchmark (${targetYears} yrs).`
      );
    }
    if (projects.length === 0) {
      weaknesses.push('No documented technical projects found on candidate profile.');
    }

    if (strengths.length === 0) {
      strengths.push('Candidate profile contains foundational technical competencies.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('No critical skill or experience deficiencies identified.');
    }

    const summary = `${candidate.fullName || 'Candidate'} scored ${overallScore}/100 for ${job.title}. ${
      recommendation === 'STRONG_MATCH'
        ? 'High suitability with strong skill and experience alignment.'
        : recommendation === 'GOOD_MATCH'
        ? 'Solid candidate profile with majority of required competencies.'
        : recommendation === 'PARTIAL_MATCH'
        ? 'Partial match with transferable skills but noticeable gaps in required criteria.'
        : 'Low compatibility with core job requirements; candidate may require substantial onboarding.'
    }`;

    return {
      overallScore,
      matchedSkills,
      missingSkills,
      strengths,
      weaknesses,
      experienceMatch: {
        score: experienceScore,
        summary: experienceSummary,
        candidateYears,
        requiredLevel: job.experienceLevel,
        relevanceExplanation: `Position requires ${job.experienceLevel} level depth. Evaluated against ${candidate.workExperiences?.length || 0} career positions.`,
      },
      recommendation,
      summary,
      scoringBreakdown: {
        requiredSkills: {
          weight: 35,
          score: requiredSkillScore,
          details: `${matchedSkills.length} of ${requiredSkills.length} required skills verified.`,
        },
        experience: {
          weight: 25,
          score: experienceScore,
          details: experienceSummary,
        },
        preferredSkills: {
          weight: 15,
          score: preferredSkillScore,
          details: `${matchedPreferredCount} of ${preferredSkills.length} preferred skills matched.`,
        },
        projects: {
          weight: 15,
          score: projectScore,
          details: `${projects.length} project(s) reviewed for technical relevance.`,
        },
        education: {
          weight: 10,
          score: educationScore,
          details: `Academic credentials evaluated for software/engineering relevance.`,
        },
      },
      disclaimer:
        'This AI compatibility evaluation is an advisory decision-support tool. It does not constitute an automated hiring decision. All employment actions must be reviewed and decided by authorized human recruiters.',
    };
  }
}
