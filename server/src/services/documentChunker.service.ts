export interface ResumeChunk {
  section: string;
  chunkIndex: number;
  text: string;
}

const SECTION_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  {
    name: 'summary',
    patterns: [
      /^(professional\s+summary|summary|profile|objective|about\s+me|career\s+objective|executive\s+summary)/im,
    ],
  },
  {
    name: 'skills',
    patterns: [
      /^(skills|technical\s+skills|core\s+competencies|competencies|technologies|tools\s+&\s+technologies|key\s+skills)/im,
    ],
  },
  {
    name: 'experience',
    patterns: [
      /^(work\s+experience|experience|professional\s+experience|employment\s+history|career\s+history|work\s+history)/im,
    ],
  },
  {
    name: 'projects',
    patterns: [
      /^(projects|personal\s+projects|key\s+projects|notable\s+projects|portfolio)/im,
    ],
  },
  {
    name: 'education',
    patterns: [
      /^(education|academic\s+background|academic\s+qualifications|qualifications)/im,
    ],
  },
  {
    name: 'certifications',
    patterns: [
      /^(certifications|certificates|licenses|credentials)/im,
    ],
  },
  {
    name: 'achievements',
    patterns: [
      /^(achievements|accomplishments|awards|honors|recognition)/im,
    ],
  },
];

const MAX_CHUNK_SIZE = 400;
const MIN_CHUNK_SIZE = 30;

export class DocumentChunkerService {
  chunkResume(text: string): ResumeChunk[] {
    const sections = this.detectSections(text);
    const chunks: ResumeChunk[] = [];
    let globalIndex = 0;

    for (const [sectionName, sectionText] of Object.entries(sections)) {
      const sectionChunks = this.chunkSection(sectionName, sectionText, globalIndex);
      chunks.push(...sectionChunks);
      globalIndex += sectionChunks.length;
    }

    // Fallback: if no sections detected or very few chunks, chunk by paragraph
    if (chunks.length < 3) {
      return this.fallbackChunking(text);
    }

    return chunks.filter(c => c.text.trim().length >= MIN_CHUNK_SIZE);
  }

  private detectSections(text: string): Record<string, string> {
    const lines = text.split('\n');
    const sections: Record<string, string> = {};
    let currentSection = 'general';
    let currentLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const detectedSection = this.identifySection(trimmed);

      if (detectedSection && trimmed.length < 60) {
        // Save previous section
        if (currentLines.length > 0) {
          const content = currentLines.join('\n').trim();
          if (content.length >= MIN_CHUNK_SIZE) {
            sections[currentSection] = (sections[currentSection] || '') + '\n' + content;
          }
        }
        currentSection = detectedSection;
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    }

    // Save last section
    if (currentLines.length > 0) {
      const content = currentLines.join('\n').trim();
      if (content.length >= MIN_CHUNK_SIZE) {
        sections[currentSection] = (sections[currentSection] || '') + '\n' + content;
      }
    }

    return sections;
  }

  private identifySection(line: string): string | null {
    for (const { name, patterns } of SECTION_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          return name;
        }
      }
    }
    return null;
  }

  private chunkSection(section: string, text: string, startIndex: number): ResumeChunk[] {
    const chunks: ResumeChunk[] = [];
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length >= MIN_CHUNK_SIZE);

    let chunkBuffer = '';
    let localIndex = startIndex;

    for (const para of paragraphs) {
      const trimmed = para.trim();

      if ((chunkBuffer + '\n' + trimmed).trim().length > MAX_CHUNK_SIZE && chunkBuffer.length > 0) {
        chunks.push({
          section,
          chunkIndex: localIndex++,
          text: chunkBuffer.trim(),
        });
        chunkBuffer = trimmed;
      } else {
        chunkBuffer = chunkBuffer ? chunkBuffer + '\n' + trimmed : trimmed;
      }
    }

    if (chunkBuffer.trim().length >= MIN_CHUNK_SIZE) {
      chunks.push({
        section,
        chunkIndex: localIndex,
        text: chunkBuffer.trim(),
      });
    }

    return chunks;
  }

  private fallbackChunking(text: string): ResumeChunk[] {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length >= MIN_CHUNK_SIZE);
    const chunks: ResumeChunk[] = [];

    let buffer = '';
    let index = 0;

    for (const para of paragraphs) {
      if ((buffer + para).length > MAX_CHUNK_SIZE && buffer.length > 0) {
        chunks.push({ section: 'general', chunkIndex: index++, text: buffer.trim() });
        buffer = para;
      } else {
        buffer = buffer ? buffer + '\n' + para : para;
      }
    }

    if (buffer.trim().length >= MIN_CHUNK_SIZE) {
      chunks.push({ section: 'general', chunkIndex: index, text: buffer.trim() });
    }

    return chunks;
  }
}
