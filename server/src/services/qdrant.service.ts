import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'atsense_resume_chunks';
const VECTOR_SIZE = 384;

export interface ResumePoint {
  documentId: string;
  section: string;
  chunkIndex: number;
  text: string;
  documentType: 'resume';
  filename?: string;
}

export interface SearchResult {
  id: string | number;
  score: number;
  payload: ResumePoint;
  text: string;
  section: string;
  similarity: number;
}

export class QdrantService {
  private client: QdrantClient;
  private static instance: QdrantService;
  // Tracks whether the `documentId` keyword payload index is confirmed, so we
  // only check/create it once per process instead of on every operation.
  private documentIdIndexEnsured = false;

  constructor() {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url) {
      throw new Error('QDRANT_URL environment variable is required');
    }

    this.client = new QdrantClient({
      url,
      apiKey: apiKey || undefined,
    });
  }

  static getInstance(): QdrantService {
    if (!QdrantService.instance) {
      QdrantService.instance = new QdrantService();
    }
    return QdrantService.instance;
  }

  async ensureCollection(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

      if (!exists) {
        console.log(`[Qdrant] Creating collection: ${COLLECTION_NAME}`);
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log(`[Qdrant] Collection created successfully`);
      } else {
        console.log(`[Qdrant] Collection ${COLLECTION_NAME} already exists`);
      }

      // Resume RAG queries filter on the `documentId` payload field (count,
      // search, delete). Qdrant requires a payload index on a field before it
      // can be used in a filter, so idempotently ensure a `keyword` index exists.
      if (!this.documentIdIndexEnsured) {
        await this.ensureDocumentIdIndex();
      }
    } catch (err) {
      console.error('[Qdrant] Error ensuring collection:', err);
      throw new Error('Failed to connect to Qdrant. Please check your QDRANT_URL and QDRANT_API_KEY.');
    }
  }

  private async ensureDocumentIdIndex(): Promise<void> {
    const info = (await this.client.getCollection(COLLECTION_NAME)) as unknown as {
      payload_schema?: Record<string, unknown>;
    };
    const hasIndex = Boolean(info.payload_schema && info.payload_schema['documentId']);

    if (hasIndex) {
      this.documentIdIndexEnsured = true;
      console.log(`[Qdrant] Payload index on "documentId" is already present`);
      return;
    }

    console.log(`[Qdrant] Creating keyword payload index on "documentId" for ${COLLECTION_NAME}`);
    await this.client.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'documentId',
      field_schema: 'keyword',
      wait: true,
    });
    this.documentIdIndexEnsured = true;
    console.log(`[Qdrant] Payload index on "documentId" ready`);
  }

  async upsertChunks(
    documentId: string,
    chunks: Array<{ section: string; chunkIndex: number; text: string }>,
    embeddings: number[][],
    filename?: string
  ): Promise<void> {
    await this.ensureCollection();

    const points = chunks.map((chunk, i) => ({
      id: this.generatePointId(documentId, chunk.chunkIndex),
      vector: embeddings[i],
      payload: {
        documentId,
        section: chunk.section,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        documentType: 'resume' as const,
        filename: filename || 'unknown',
      },
    }));

    await this.client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    console.log(`[Qdrant] Upserted ${points.length} chunks for document: ${documentId}`);
  }

  async searchSimilar(
    queryEmbedding: number[],
    documentId: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    await this.ensureCollection();

    const results = await this.client.query(COLLECTION_NAME, {
      query: queryEmbedding,
      limit: topK,
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId },
          },
        ],
      },
    });

    return results.points.map((r) => {
      const payload = r.payload as unknown as ResumePoint;
      return {
        id: r.id,
        score: r.score,
        payload,
        text: payload?.text ?? '',
        section: payload?.section ?? '',
        similarity: r.score,
      };
    });
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    await this.ensureCollection();

    await this.client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId },
          },
        ],
      },
    });

    console.log(`[Qdrant] Deleted chunks for document: ${documentId}`);
  }

  async countDocumentChunks(documentId: string): Promise<number> {
    await this.ensureCollection();

    const result = await this.client.count(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId },
          },
        ],
      },
    });

    return result.count;
  }

  private generatePointId(documentId: string, chunkIndex: number): number {
    // Create a deterministic numeric ID from documentId + chunkIndex
    let hash = 0;
    const str = `${documentId}_${chunkIndex}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
