import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ResumeParserService } from '../services/resumeParser.service';
import { DocumentChunkerService } from '../services/documentChunker.service';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';

const resumeParser = new ResumeParserService();
const documentChunker = new DocumentChunkerService();
const embeddingService = EmbeddingService.getInstance();
const qdrantService = QdrantService.getInstance();

export const uploadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded. Please provide a PDF or DOCX resume.' });
      return;
    }

    const { buffer, originalname, size, mimetype } = req.file;
    const documentId = uuidv4();

    console.log(`[Resume] Processing: ${originalname} (${(size / 1024).toFixed(1)}KB)`);

    // Step 1: Parse the resume
    const parsed = await resumeParser.parseFile(buffer, originalname);

    // Step 2: Chunk the resume
    const chunks = documentChunker.chunkResume(parsed.text);

    if (chunks.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Could not extract meaningful content from the resume. Please ensure the file contains readable text.',
      });
      return;
    }

    console.log(`[Resume] Created ${chunks.length} chunks from ${parsed.fileType.toUpperCase()}`);

    // Step 3: Generate embeddings
    const texts = chunks.map(c => c.text);
    const embeddings = await embeddingService.generateEmbeddings(texts);

    // Step 4: Store in Qdrant
    await qdrantService.upsertChunks(documentId, chunks, embeddings, originalname);

    res.status(200).json({
      success: true,
      documentId,
      message: 'Resume uploaded, parsed, and indexed successfully.',
      metadata: {
        filename: originalname,
        fileType: parsed.fileType,
        fileSize: size,
        mimeType: mimetype,
        pageCount: parsed.pageCount,
        chunksCreated: chunks.length,
        sections: [...new Set(chunks.map(c => c.section))],
      },
    });
  } catch (err) {
    next(err);
  }
};
