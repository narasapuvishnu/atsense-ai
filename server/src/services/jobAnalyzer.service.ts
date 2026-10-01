export interface JobRequirement {
  text: string;
  type: 'required_skill' | 'preferred_skill' | 'responsibility' | 'experience' | 'education';
  importance: 'high' | 'medium' | 'low';
}

export interface ParsedJobDescription {
  rawText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
  allRequirements: JobRequirement[];
  keywords: string[];
}

const TECH_SKILLS_PATTERN = /\b(JavaScript|TypeScript|Python|Java|React|Angular|Vue|Node\.js|Express|Django|Flask|FastAPI|Spring|AWS|Azure|GCP|Docker|Kubernetes|Git|SQL|PostgreSQL|MySQL|MongoDB|Redis|GraphQL|REST|API|HTML|CSS|Sass|Webpack|Vite|Jest|Cypress|CI\/CD|DevOps|Linux|Agile|Scrum|Machine Learning|ML|AI|TensorFlow|PyTorch|scikit-learn|pandas|NumPy|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin|R|Scala|Spark|Hadoop|Kafka|Elasticsearch|Jenkins|Terraform|Ansible|Bash|PowerShell|Next\.js|NestJS|FastAPI|Tailwind|Bootstrap|Material UI|Redux|GraphQL|tRPC|Prisma|Sequelize|Mongoose|Firebase|Supabase|Vercel|Netlify|Heroku|Microservices|Serverless|OpenAI|LangChain|RAG|Vector|Embedding|NLP|Computer Vision|SDLC|Software Development Life Cycle|MERN|Full Stack|Data Structures|Algorithms|OOP|Object.Oriented|DBMS|Operating Systems|Computer Networks|TCP\/IP)\b/gi;

const SOFT_SKILLS_PATTERN = /\b(communication|leadership|teamwork|collaboration|problem.solving|critical.thinking|time.management|adaptability|creativity|mentoring|analytical|detail.oriented|interpersonal)\b/gi;

/**
 * Patterns that identify sections which should be SKIPPED entirely during
 * skill/responsibility extraction. These sections contain eligibility criteria,
 * company information, work-location lists, etc. that are NOT job requirements.
 */
const SKIP_SECTION_PATTERNS = [
  /eligibility\s*criteria/i,
  /work\s*location/i,
  /about\s+(the\s+company|us|ibm|google|microsoft|amazon|meta|apple)/i,
  /^about\s+\w+/i,
  /company\s*(overview|description|profile)/i,
  /equal\s*opportunity/i,
  /benefits|perks|compensation/i,
];

/**
 * Lines that look like eligibility noise (batch year, branch lists, location
 * lists, backlog requirements, etc.) and should be filtered out even if they
 * appear inside a "required" section.
 */
const ELIGIBILITY_NOISE_PATTERNS = [
  /graduating\s*batch/i,
  /\b\d{4}\b\s*(graduating|batch|passout)/i,
  /branches?\s*:/i,
  /allied\s*branches/i,
  /\b(CSE|AIML|CSBS|IOT|DS)\b.*\b(branch|stream)/i,
  /all\s*cs\s*branches/i,
  /no\s*active\s*backlogs?/i,
  /must\s*(be\s*in|obtain)\s*(their|your)\s*(final|last)\s*year/i,
  /entry\s*level\s*(on.campus|hiring|position)/i,
  /on.campus\s*hiring/i,
  /minimum\s*academic\s*score/i,
  /CGPA\s*\d|GPA\s*\d|\d+\s*%\s*and\s*above/i,
  /flexible\s*to\s*work\s*from\s*anywhere/i,
  /work\s*location\s*[-–:]/i,
  /^(Mysore|Ahmedabad|Coimbatore|Lucknow|Hyderabad|Kolkata|Mumbai|Pune|Bangalore|Chennai|Noida)/i,
  /fluent\s*communication/i,
  /good\s*interpersonal/i,
];

export class JobAnalyzerService {
  parseJobDescription(text: string): ParsedJobDescription {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];
    const responsibilities: string[] = [];
    const experienceRequirements: string[] = [];
    const educationRequirements: string[] = [];

    let currentContext: 'required' | 'preferred' | 'responsibilities' | 'experience' | 'education' | 'skip' | 'general' = 'general';

    for (const line of lines) {
      const lower = line.toLowerCase();
      const cleaned = line.replace(/^[-•*►▸◦·]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      const cleanedLower = cleaned.toLowerCase();

      // --- Section header detection (order matters) ---

      // Skip sections that contain eligibility / company info / locations
      if (this.isSkipSection(cleanedLower)) {
        currentContext = 'skip';
        continue;
      }

      // Detect section context based on cleaned text to avoid matching inline bullet labels
      if (/^(required\s*(professional|technical)?\s*(expertise|skills|qualifications)|must have|essential|minimum qualifications)/i.test(cleanedLower) && cleanedLower.length < 80) {
        currentContext = 'required';
        continue;
      } else if (/^(preferred\s*(professional|technical)?\s*(expertise|skills|qualifications)|nice to have|bonus|desired|plus)/i.test(cleanedLower) && cleanedLower.length < 80) {
        currentContext = 'preferred';
        continue;
      } else if (/^(responsibilities|duties|what you.ll do|your\s*role|you will|primary\s*responsibilities)/i.test(cleanedLower) && cleanedLower.length < 100) {
        currentContext = 'responsibilities';
        continue;
      } else if (/^(experience|background)/i.test(cleanedLower) && cleanedLower.length < 60) {
        currentContext = 'experience';
        continue;
      } else if (/^(education|academic\s+background|qualifications)/i.test(cleanedLower) && cleanedLower.length < 60) {
        currentContext = 'education';
        continue;
      }

      // If we're in a skip section, ignore lines
      if (currentContext === 'skip') {
        continue;
      }

      if (cleaned.length < 10) continue;

      // Filter out eligibility noise lines (batch year, branch lists, etc.)
      if (this.isEligibilityNoise(cleaned)) {
        continue;
      }

      // Handle "preferably" qualifier — route to preferred instead of required
      if (/preferably|preferred|ideally/i.test(lower) && currentContext === 'required') {
        // Extract individual skills from the line if it's a skill list
        const extractedSkills = this.extractInlineSkills(cleaned);
        if (extractedSkills.length > 0) {
          for (const skill of extractedSkills) {
            if (preferredSkills.length < 15 && !preferredSkills.includes(skill)) {
              preferredSkills.push(skill);
            }
          }
        } else if (preferredSkills.length < 15) {
          preferredSkills.push(cleaned);
        }
        continue;
      }

      // Categorize based on context and content
      if (this.isEducationLine(lower) && !this.isBranchListLine(lower)) {
        educationRequirements.push(cleaned);
      } else if (this.isExperienceLine(lower)) {
        experienceRequirements.push(cleaned);
      } else if (currentContext === 'responsibilities' || this.isResponsibilityLine(lower)) {
        if (responsibilities.length < 15) responsibilities.push(cleaned);
      } else if (currentContext === 'preferred') {
        // Extract individual skills from comma-separated lists
        const extractedSkills = this.extractInlineSkills(cleaned);
        if (extractedSkills.length > 1) {
          for (const skill of extractedSkills) {
            if (preferredSkills.length < 15 && !preferredSkills.includes(skill)) {
              preferredSkills.push(skill);
            }
          }
        } else if (preferredSkills.length < 15) {
          preferredSkills.push(cleaned);
        }
      } else if (currentContext === 'required' || this.isSkillLine(lower)) {
        // Extract individual skills from comma-separated lists
        const extractedSkills = this.extractInlineSkills(cleaned);
        if (extractedSkills.length > 1) {
          for (const skill of extractedSkills) {
            if (requiredSkills.length < 20 && !requiredSkills.includes(skill)) {
              requiredSkills.push(skill);
            }
          }
        } else if (requiredSkills.length < 20) {
          requiredSkills.push(cleaned);
        }
      } else {
        // Infer from content
        if (responsibilities.length < 15) responsibilities.push(cleaned);
      }
    }

    // Extract keywords
    const keywords = this.extractKeywords(text);

    // Build structured requirements for RAG
    const allRequirements: JobRequirement[] = [
      ...requiredSkills.slice(0, 10).map(s => ({
        text: s,
        type: 'required_skill' as const,
        importance: 'high' as const,
      })),
      ...preferredSkills.slice(0, 8).map(s => ({
        text: s,
        type: 'preferred_skill' as const,
        importance: 'medium' as const,
      })),
      ...responsibilities.slice(0, 8).map(r => ({
        text: r,
        type: 'responsibility' as const,
        importance: 'high' as const,
      })),
      ...experienceRequirements.slice(0, 5).map(e => ({
        text: e,
        type: 'experience' as const,
        importance: 'high' as const,
      })),
      ...educationRequirements.slice(0, 3).map(e => ({
        text: e,
        type: 'education' as const,
        importance: 'medium' as const,
      })),
    ];

    return {
      rawText: text,
      requiredSkills,
      preferredSkills,
      responsibilities,
      experienceRequirements,
      educationRequirements,
      allRequirements,
      keywords,
    };
  }

  extractKeywords(text: string): string[] {
    const techMatches = text.match(TECH_SKILLS_PATTERN) || [];
    const softMatches = text.match(SOFT_SKILLS_PATTERN) || [];

    const all = [...techMatches, ...softMatches];
    const unique = [...new Set(all.map(k => k.toLowerCase()))];

    return unique.map(k => k.charAt(0).toUpperCase() + k.slice(1));
  }

  /**
   * Extract individual skills from a line that contains a comma/slash-separated
   * skill list, e.g. "Programming (preferably in Java, C++, Python, Node.js)."
   * Returns an empty array if the line doesn't look like a skill list.
   */
  private extractInlineSkills(line: string): string[] {
    // Strip parenthetical wrapping: "Programming (preferably in Java, C++, Python)"
    // → "Java, C++, Python"
    const parenMatch = line.match(/\((?:preferably\s+(?:in\s+)?|e\.?g\.?\s*)?([^)]+)\)/i);
    const candidate = parenMatch ? parenMatch[1] : line;

    // Only split if there are commas or slashes suggesting a list
    if (!/[,\/]/.test(candidate)) return [];

    const parts = candidate
      .split(/[,\/]/)
      .map(s => s.replace(/^[-•*►▸◦·]\s*/, '').replace(/[.)]+$/, '').trim())
      .filter(s => s.length >= 2 && s.length < 60);

    // Only consider it a skill list if at least 2 items and items are short
    if (parts.length >= 2 && parts.every(p => p.split(/\s+/).length <= 6)) {
      return parts;
    }

    return [];
  }

  /**
   * Detect section headers that should be skipped entirely (eligibility,
   * company info, locations, etc.).
   */
  private isSkipSection(line: string): boolean {
    return SKIP_SECTION_PATTERNS.some(p => p.test(line));
  }

  /**
   * Detect individual lines that are eligibility noise (batch requirements,
   * branch name lists, location lists, etc.) and should not be treated as
   * job skills or responsibilities.
   */
  private isEligibilityNoise(line: string): boolean {
    return ELIGIBILITY_NOISE_PATTERNS.some(p => p.test(line));
  }

  /**
   * Detect lines that list degree branches/streams rather than actual
   * education requirements. E.g. "Branches: Computer Science and Allied
   * Branches (All CS branches like CSE, AIML, DS...)".
   */
  private isBranchListLine(line: string): boolean {
    return /branches?\s*:/i.test(line) || /all\s*cs\s*branches/i.test(line) ||
      /allied\s*branches/i.test(line) || /\b(CSE|CSBS|AIML)\b/i.test(line);
  }

  private isSkillLine(line: string): boolean {
    return TECH_SKILLS_PATTERN.test(line) || /proficiency|experience with|knowledge of|familiar with/i.test(line);
  }

  private isResponsibilityLine(line: string): boolean {
    return /^(develop|build|design|implement|maintain|collaborate|work with|create|manage|lead|ensure|support|provide|analyze|optimize)/i.test(line);
  }

  private isExperienceLine(line: string): boolean {
    return /\d+\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i.test(line) ||
      /years?\s+of\s+(experience|exp)/i.test(line);
  }

  private isEducationLine(line: string): boolean {
    return /bachelor|master|phd|doctorate|degree|computer science|engineering|diploma|b\.s\.|m\.s\.|b\.e\.|m\.e\./i.test(line);
  }
}
