// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pipeline, env } = require('@xenova/transformers');

// Configure transformers.js to use local cache
env.cacheDir = './.cache';
env.allowRemoteModels = true;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;

let embeddingPipeline: ((texts: string | string[], options?: Record<string, unknown>) => Promise<{ data: Float32Array }[]>) | null = null;

export class EmbeddingService {
  private static instance: EmbeddingService;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  async initialize(): Promise<void> {
    if (embeddingPipeline) return;
    if (this.isLoading && this.loadPromise) {
      await this.loadPromise;
      return;
    }

    this.isLoading = true;
    this.loadPromise = this.loadModel();
    await this.loadPromise;
    this.isLoading = false;
  }

  private async loadModel(): Promise<void> {
    console.log(`[Embeddings] Loading model: ${MODEL_NAME}...`);
    try {
      embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
        quantized: true,
      });
      console.log(`[Embeddings] Model loaded successfully. Dimension: ${EMBEDDING_DIMENSION}`);
    } catch (err) {
      console.error('[Embeddings] Failed to load model:', err);
      throw new Error(`Failed to initialize embedding model: ${MODEL_NAME}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.initialize();

    if (!embeddingPipeline) {
      throw new Error('Embedding pipeline not initialized');
    }

    const cleanText = text.trim().slice(0, 512); // MiniLM max token limit safety

    try {
      const output = await embeddingPipeline(cleanText, {
        pooling: 'mean',
        normalize: true,
      });

      return Array.from(output[0].data as Float32Array);
    } catch (err) {
      console.error('[Embeddings] Error generating embedding:', err);
      throw new Error('Failed to generate embedding for text chunk');
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  getModelName(): string {
    return MODEL_NAME;
  }

  getDimension(): number {
    return EMBEDDING_DIMENSION;
  }
}
