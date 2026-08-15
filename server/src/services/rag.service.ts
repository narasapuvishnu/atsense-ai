import { EmbeddingService } from './embedding.service';
import { QdrantService, SearchResult } from './qdrant.service';
import { JobRequirement } from './jobAnalyzer.service';

export interface RAGEvidence {
  requirement: string;
  requirementType: string;
  retrievedChunks: SearchResult[];
  topSimilarity: number;
  averageSimilarity: number;
}

export interface RAGResult {
  evidence: RAGEvidence[];
  totalChunksIndexed: number;
  chunksRetrieved: number;
  topSimilarity: number;
  averageSimilarity: number;
  topK: number;
}

export class RAGService {
  private embeddingService: EmbeddingService;
  private qdrantService: QdrantService;

  constructor() {
    this.embeddingService = EmbeddingService.getInstance();
    this.qdrantService = QdrantService.getInstance();
  }

  async retrieveEvidenceForRequirements(
    documentId: string,
    requirements: JobRequirement[],
    topK: number = 5
  ): Promise<RAGResult> {
    console.log(`[RAG] Retrieving evidence for ${requirements.length} requirements, documentId: ${documentId}`);

    const evidenceList: RAGEvidence[] = [];
    let totalRetrieved = 0;
    const allSimilarities: number[] = [];

    // Limit requirements to avoid too many LLM tokens
    const reqsToProcess = requirements.slice(0, 12);

    for (const req of reqsToProcess) {
      try {
        // Generate embedding for this requirement
        const queryEmbedding = await this.embeddingService.generateEmbedding(req.text);

        // Search Qdrant for similar resume chunks
        const results = await this.qdrantService.searchSimilar(queryEmbedding, documentId, topK);

        if (results.length > 0) {
          const topSim = results[0].similarity;
          const avgSim = results.reduce((acc, r) => acc + r.similarity, 0) / results.length;

          evidenceList.push({
            requirement: req.text,
            requirementType: req.type,
            retrievedChunks: results,
            topSimilarity: topSim,
            averageSimilarity: avgSim,
          });

          allSimilarities.push(...results.map(r => r.similarity));
          totalRetrieved += results.length;
        }
      } catch (err) {
        console.error(`[RAG] Error retrieving evidence for requirement: "${req.text}"`, err);
      }
    }

    const totalChunksIndexed = await this.qdrantService.countDocumentChunks(documentId);
    const overallTopSimilarity = allSimilarities.length > 0 ? Math.max(...allSimilarities) : 0;
    const overallAvgSimilarity =
      allSimilarities.length > 0
        ? allSimilarities.reduce((a, b) => a + b, 0) / allSimilarities.length
        : 0;

    console.log(`[RAG] Retrieved ${totalRetrieved} chunks across ${evidenceList.length} requirements`);
    console.log(`[RAG] Top similarity: ${overallTopSimilarity.toFixed(3)}, Avg: ${overallAvgSimilarity.toFixed(3)}`);

    return {
      evidence: evidenceList,
      totalChunksIndexed,
      chunksRetrieved: totalRetrieved,
      topSimilarity: parseFloat(overallTopSimilarity.toFixed(3)),
      averageSimilarity: parseFloat(overallAvgSimilarity.toFixed(3)),
      topK,
    };
  }

  buildContextForLLM(ragResult: RAGResult, maxTokenEstimate: number = 3000): string {
    const lines: string[] = ['=== RETRIEVED RESUME EVIDENCE ===\n'];
    let charCount = 0;
    const charLimit = maxTokenEstimate * 4; // ~4 chars per token

    for (const ev of ragResult.evidence) {
      if (charCount >= charLimit) break;

      const header = `\n[Requirement: ${ev.requirement}]\n`;
      lines.push(header);
      charCount += header.length;

      for (const chunk of ev.retrievedChunks.slice(0, 3)) {
        if (charCount >= charLimit) break;

        const chunkText = `  - [Section: ${chunk.section}, Similarity: ${chunk.similarity.toFixed(3)}]\n    "${chunk.text.slice(0, 300)}"\n`;
        lines.push(chunkText);
        charCount += chunkText.length;
      }
    }

    return lines.join('');
  }
}
