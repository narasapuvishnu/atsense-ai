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

const TECH_SKILLS_PATTERN = /\b(JavaScript|TypeScript|Python|Java|React|Angular|Vue|Node\.js|Express|Django|Flask|FastAPI|Spring|AWS|Azure|GCP|Docker|Kubernetes|Git|SQL|PostgreSQL|MySQL|MongoDB|Redis|GraphQL|REST|API|HTML|CSS|Sass|Webpack|Vite|Jest|Cypress|CI\/CD|DevOps|Linux|Agile|Scrum|Machine Learning|ML|AI|TensorFlow|PyTorch|scikit-learn|pandas|NumPy|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin|R|Scala|Spark|Hadoop|Kafka|Elasticsearch|Jenkins|Terraform|Ansible|Bash|PowerShell|Next\.js|NestJS|FastAPI|Tailwind|Bootstrap|Material UI|Redux|GraphQL|tRPC|Prisma|Sequelize|Mongoose|Firebase|Supabase|Vercel|Netlify|Heroku|Microservices|Serverless|OpenAI|LangChain|RAG|Vector|Embedding|NLP|Computer Vision)\b/gi;

const SOFT_SKILLS_PATTERN = /\b(communication|leadership|teamwork|collaboration|problem.solving|critical.thinking|time.management|adaptability|creativity|mentoring|analytical|detail.oriented)\b/gi;

export class JobAnalyzerService {
  parseJobDescription(text: string): ParsedJobDescription {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];
    const responsibilities: string[] = [];
    const experienceRequirements: string[] = [];
    const educationRequirements: string[] = [];

    let currentContext: 'required' | 'preferred' | 'responsibilities' | 'experience' | 'education' | 'general' = 'general';

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Detect section context
      if (/required|must have|essential|minimum qualifications/i.test(lower)) {
        currentContext = 'required';
        continue;
      } else if (/preferred|nice to have|bonus|desired|plus/i.test(lower) && lower.length < 80) {
        currentContext = 'preferred';
        continue;
      } else if (/responsibilities|duties|what you.ll do|role|you will/i.test(lower) && lower.length < 80) {
        currentContext = 'responsibilities';
        continue;
      } else if (/experience|background/i.test(lower) && lower.length < 60) {
        currentContext = 'experience';
        continue;
      } else if (/education|degree|qualification/i.test(lower) && lower.length < 60) {
        currentContext = 'education';
        continue;
      }

      // Clean bullet points
      const cleaned = line.replace(/^[-•*►▸◦·]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned.length < 10) continue;

      // Categorize based on context and content
      if (this.isEducationLine(lower)) {
        educationRequirements.push(cleaned);
      } else if (this.isExperienceLine(lower)) {
        experienceRequirements.push(cleaned);
      } else if (currentContext === 'responsibilities' || this.isResponsibilityLine(lower)) {
        if (responsibilities.length < 15) responsibilities.push(cleaned);
      } else if (currentContext === 'preferred') {
        if (preferredSkills.length < 15) preferredSkills.push(cleaned);
      } else if (currentContext === 'required' || this.isSkillLine(lower)) {
        if (requiredSkills.length < 20) requiredSkills.push(cleaned);
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
