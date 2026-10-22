import pdfParse from 'pdf-parse';

export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported file type: ${mimeType}. Supported types: PDF, Markdown, Plain Text, PNG, JPG, WebP.`);
    this.name = 'UnsupportedFileTypeError';
  }
}

export class FileSizeLimitError extends Error {
  constructor(sizeBytes: number, maxBytes: number) {
    super(`File size (${Math.round(sizeBytes / 1024 / 1024)}MB) exceeds maximum allowed limit of ${Math.round(maxBytes / 1024 / 1024)}MB.`);
    this.name = 'FileSizeLimitError';
  }
}

export class CorruptedFileError extends Error {
  constructor(message: string) {
    super(`Failed to process document: ${message}`);
    this.name = 'CorruptedFileError';
  }
}

export interface ExtractionParams {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
  maxSizeBytes?: number;
}

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  estimatedTokens: number;
  title: string;
}

export interface ChunkOptions {
  maxChunkTokens?: number;
  overlapTokens?: number;
}

export interface TextChunk {
  chunkIndex: number;
  text: string;
  tokenCount: number;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

/**
 * Estimates token count based on standard English lexical heuristic (~4 chars per token).
 */
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0;
  return Math.ceil(text.trim().length / 4);
}

/**
 * Normalizes extracted text: standardizes linebreaks to \n and removes excessive consecutive spaces.
 */
function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Chunks long text for token budgeting and LLM ingestion.
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const maxChunkTokens = options.maxChunkTokens ?? 800;
  const overlapTokens = options.overlapTokens ?? 100;

  if (estimateTokens(normalized) <= maxChunkTokens) {
    return [
      {
        chunkIndex: 0,
        text: normalized,
        tokenCount: estimateTokens(normalized),
      },
    ];
  }

  const words = normalized.split(/\s+/);
  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIdx = 0;

  while (startIndex < words.length) {
    const currentWords: string[] = [];
    let endIndex = startIndex;

    while (endIndex < words.length) {
      const candidate = [...currentWords, words[endIndex]].join(' ');
      if (currentWords.length > 0 && estimateTokens(candidate) > maxChunkTokens) {
        break;
      }
      currentWords.push(words[endIndex]);
      endIndex++;
    }

    const chunkContent = currentWords.join(' ');
    chunks.push({
      chunkIndex: chunkIdx++,
      text: chunkContent,
      tokenCount: estimateTokens(chunkContent),
    });

    if (endIndex >= words.length) break;

    // Calculate overlap by stepping backwards from endIndex
    let overlapWordsCount = 0;
    let overlapTokenSum = 0;
    for (let i = endIndex - 1; i > startIndex; i--) {
      const tokenLen = estimateTokens(words[i] + ' ');
      if (overlapTokenSum + tokenLen > overlapTokens) break;
      overlapTokenSum += tokenLen;
      overlapWordsCount++;
    }

    startIndex = Math.max(startIndex + 1, endIndex - overlapWordsCount);
  }

  return chunks;
}

/**
 * Extracts and cleans text from PDF, Text, Markdown, or Image files.
 */
export async function extractTextFromDocument(params: ExtractionParams): Promise<ExtractionResult> {
  const { buffer, mimeType, filename = 'document.txt', maxSizeBytes = DEFAULT_MAX_SIZE } = params;

  if (buffer.length > maxSizeBytes) {
    throw new FileSizeLimitError(buffer.length, maxSizeBytes);
  }

  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();
  if (!SUPPORTED_MIME_TYPES.has(normalizedMime)) {
    throw new UnsupportedFileTypeError(mimeType);
  }

  let extractedText = '';
  let pageCount: number | undefined;

  switch (normalizedMime) {
    case 'text/plain':
    case 'text/markdown': {
      extractedText = buffer.toString('utf-8');
      break;
    }

    case 'application/pdf': {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text;
        pageCount = parsed.numpages;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new CorruptedFileError(`PDF extraction error: ${msg}`);
      }
      break;
    }

    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/webp': {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const ret = await worker.recognize(buffer);
        await worker.terminate();
        extractedText = ret.data.text;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new CorruptedFileError(`OCR extraction error: ${msg}`);
      }
      break;
    }

    default:
      throw new UnsupportedFileTypeError(mimeType);
  }

  const cleaned = normalizeText(extractedText);
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];

  return {
    text: cleaned,
    pageCount,
    wordCount: words.length,
    estimatedTokens: estimateTokens(cleaned),
    title: filename,
  };
}
