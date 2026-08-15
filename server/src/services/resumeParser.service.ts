import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

export interface ParsedResume {
  text: string;
  pageCount?: number;
  fileType: 'pdf' | 'docx' | 'unknown';
}

export class ResumeParserService {
  async parseFile(buffer: Buffer, filename: string): Promise<ParsedResume> {
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.pdf') {
      return this.parsePDF(buffer);
    } else if (ext === '.docx') {
      return this.parseDOCX(buffer);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Please upload a PDF or DOCX file.`);
    }
  }

  private async parsePDF(buffer: Buffer): Promise<ParsedResume> {
    try {
      const data = await pdfParse(buffer);
      const text = this.cleanText(data.text);

      if (!text || text.trim().length < 50) {
        throw new Error('The PDF appears to be empty or contains only images. Please upload a text-based PDF.');
      }

      return {
        text,
        pageCount: data.numpages,
        fileType: 'pdf',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('empty or contains')) {
        throw err;
      }
      throw new Error('Failed to parse PDF. Please ensure the file is a valid, text-based PDF.');
    }
  }

  private async parseDOCX(buffer: Buffer): Promise<ParsedResume> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = this.cleanText(result.value);

      if (!text || text.trim().length < 50) {
        throw new Error('The DOCX file appears to be empty. Please upload a valid resume document.');
      }

      return {
        text,
        fileType: 'docx',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('empty')) {
        throw err;
      }
      throw new Error('Failed to parse DOCX. Please ensure the file is a valid Word document.');
    }
  }

  private cleanText(raw: string): string {
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .trim();
  }
}
