import { IAiResumeParser, ResumeParserMetadata } from './aiParser.interface.js';
import {
  candidateProfileParsedSchema,
  ParsedCandidateProfile,
} from '../../validations/resumeParser.schema.js';

export class MockResumeParser implements IAiResumeParser {
  async parseResumeText(
    rawText: string,
    metadata?: ResumeParserMetadata
  ): Promise<ParsedCandidateProfile> {
    const text = rawText || '';

    // 1. Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Extract Phone Number
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // 3. Extract Full Name
    let fullName = 'Candidate';
    if (metadata?.fileName) {
      // Try extract from filename e.g. "Alex_Rivers_Resume.pdf" -> "Alex Rivers"
      const cleanName = metadata.fileName
        .replace(/(\.pdf|resume|cv|_|-|\d)/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanName.length > 2) {
        fullName = cleanName;
      }
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 50 && !lines[0].includes('@') && !lines[0].includes('http')) {
      fullName = lines[0].replace(/[^a-zA-Z\s.-]/g, '').trim() || fullName;
    }

    // 4. Extract Skills
    const knownLanguages = [
      'TypeScript', 'JavaScript', 'Python', 'Go', 'Golang', 'Java', 'C++', 'C#',
      'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML5', 'CSS3', 'Bash', 'R',
    ];
    const knownFrameworks = [
      'React', 'Next.js', 'NextJS', 'Node.js', 'Express', 'Express.js', 'NestJS',
      'Vue', 'Angular', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'TailwindCSS',
      'GraphQL', 'Redux', 'Prisma', 'TypeORM',
    ];
    const knownDatabases = [
      'PostgreSQL', 'Postgres', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch',
      'Supabase', 'Firebase', 'DynamoDB', 'Cassandra', 'Neo4j', 'SQLite',
    ];
    const knownTools = [
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'GitHub', 'CI/CD',
      'Terraform', 'Linux', 'Jest', 'Mocha', 'Cypress', 'Vite', 'Webpack', 'Postman',
    ];

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const matchSkills = (list: string[]) =>
      list.filter((s) => {
        try {
          const escaped = escapeRegex(s);
          const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, 'i');
          return regex.test(text);
        } catch {
          return text.toLowerCase().includes(s.toLowerCase());
        }
      });

    const languages = matchSkills(knownLanguages);
    const frameworks = matchSkills(knownFrameworks);
    const databases = matchSkills(knownDatabases);
    const tools = matchSkills(knownTools);

    // Default tech skills if text is very short/synthetic
    if (languages.length === 0) languages.push('TypeScript', 'JavaScript', 'Python', 'SQL');
    if (frameworks.length === 0) frameworks.push('React', 'Next.js', 'Node.js', 'Express');
    if (databases.length === 0) databases.push('PostgreSQL', 'Redis', 'Supabase');
    if (tools.length === 0) tools.push('Docker', 'Git', 'AWS', 'Linux');

    // 5. Calculate Years of Experience
    let yearsOfExperience = 3.5;
    const expMatches = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)/i);
    if (expMatches && expMatches[1]) {
      yearsOfExperience = parseFloat(expMatches[1]);
    }

    // 6. Extract Education
    const education = [
      {
        institution: text.includes('University')
          ? 'Stanford University'
          : 'University of Engineering and Technology',
        degree: 'Bachelor of Science (B.S.)',
        fieldOfStudy: 'Computer Science & Software Engineering',
        startDate: '2018',
        endDate: '2022',
        grade: '3.8 GPA',
      },
    ];

    // 7. Work Experience
    const workExperience = [
      {
        company: 'CloudScale Technologies',
        position: 'Senior Software Engineer',
        startDate: '2023-01',
        endDate: 'Present',
        isCurrent: true,
        description:
          'Led architecture and delivery of distributed microservices processing 10M+ events/day with 99.99% uptime. Optimized database query latencies by 40%.',
        technologies: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
      },
      {
        company: 'Apex Systems Corp',
        position: 'Full Stack Engineer',
        startDate: '2021-06',
        endDate: '2022-12',
        isCurrent: false,
        description:
          'Engineered responsive web applications and RESTful APIs. Implemented CI/CD pipelines and automated integration test suites.',
        technologies: ['React', 'Express', 'SQL', 'AWS', 'Git'],
      },
    ];

    // 8. Projects
    const projects = [
      {
        title: 'HireMind Distributed Evaluation Engine',
        description:
          'Real-time automated code assessment platform with sandbox execution and rubric telemetry.',
        technologies: ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker'],
        url: 'https://github.com/hiremind-ai',
        highlights: [
          'Sub-second code execution runtime',
          'Automated rubric grading system',
        ],
      },
      {
        title: 'High-Throughput Event Streaming Pipeline',
        description:
          'Scalable message ingestion engine handling high-volume telemetry with zero message loss.',
        technologies: ['Node.js', 'Redis', 'PostgreSQL', 'AWS'],
        url: 'https://github.com/cloudscale/telemetry',
        highlights: [
          'Reduced ingestion lag by 65%',
          'Zero-downtime rolling deployments',
        ],
      },
    ];

    const rawResult = {
      fullName,
      email: email || `${fullName.toLowerCase().replace(/[^a-z]/g, '.')}@hiremind.ai`,
      phone: phone || '+1 (555) 382-9104',
      location: 'San Francisco, CA (Open to Remote)',
      headline: 'Senior Full Stack & Distributed Systems Engineer',
      summary:
        'Passionate software engineer specialized in distributed systems, scalable web applications, and AI integrations. Experienced with TypeScript, PostgreSQL, cloud architectures, and high-performance microservices.',
      yearsOfExperience,
      skills: {
        languages: Array.from(new Set(languages)),
        frameworks: Array.from(new Set(frameworks)),
        databases: Array.from(new Set(databases)),
        tools: Array.from(new Set(tools)),
        other: ['System Design', 'Microservices', 'Clean Architecture', 'Agile'],
      },
      education,
      workExperience,
      projects,
      certifications: [
        'AWS Certified Solutions Architect – Associate',
        'Certified Kubernetes Application Developer (CKAD)',
      ],
      achievements: [
        'Won 1st Place at National Cloud Computing Hackathon 2023',
        'Published technical research paper on Distributed Cache Invalidation',
      ],
    };

    // Strict validation via Zod
    return candidateProfileParsedSchema.parse(rawResult);
  }
}
