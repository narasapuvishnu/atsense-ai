import { Request, Response, NextFunction } from 'express';
import { ResumeParserService } from '../services/resumeParser.service';
import { JobAnalyzerService } from '../services/jobAnalyzer.service';

const resumeParser = new ResumeParserService();
const jobAnalyzer = new JobAnalyzerService();

export const processJobDescriptionText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Job description text is required and must be at least 10 characters.',
      });
      return;
    }

    const parsed = jobAnalyzer.parseJobDescription(text);

    res.json({
      success: true,
      message: 'Job description processed successfully.',
      data: {
        requiredSkillsCount: parsed.requiredSkills.length,
        preferredSkillsCount: parsed.preferredSkills.length,
        responsibilitiesCount: parsed.responsibilities.length,
        keywordsCount: parsed.keywords.length,
        preview: {
          requiredSkills: parsed.requiredSkills.slice(0, 5),
          keywords: parsed.keywords.slice(0, 10),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const processJobDescriptionFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const { buffer, originalname } = req.file;

    let text: string;

    if (originalname.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      const parsed = await resumeParser.parseFile(buffer, originalname);
      text = parsed.text;
    }

    if (!text || text.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Could not extract text from the job description file.',
      });
      return;
    }

    const analyzed = jobAnalyzer.parseJobDescription(text);

    res.json({
      success: true,
      message: 'Job description file processed successfully.',
      extractedText: text,
      data: {
        requiredSkillsCount: analyzed.requiredSkills.length,
        preferredSkillsCount: analyzed.preferredSkills.length,
        responsibilitiesCount: analyzed.responsibilities.length,
        keywordsCount: analyzed.keywords.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
