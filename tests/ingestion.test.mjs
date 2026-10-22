import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  estimateTokens, 
  chunkText, 
  extractTextFromDocument,
  UnsupportedFileTypeError,
  FileSizeLimitError
} from '../src/lib/ingestion/extractor.ts';

describe('Document Ingestion & Text Extraction Engine (TDD)', () => {
  describe('estimateTokens', () => {
    test('returns 0 for empty or whitespace-only text', () => {
      assert.equal(estimateTokens(''), 0);
      assert.equal(estimateTokens('   \n\t  '), 0);
    });

    test('accurately estimates tokens using standard ~4 chars/token heuristic', () => {
      const text = 'Distributed consensus protocols require majority quorum to guarantee safety.';
      const tokens = estimateTokens(text);
      assert.ok(tokens > 10 && tokens < 30, `Tokens (${tokens}) should be within reasonable bounds`);
    });
  });

  describe('chunkText', () => {
    test('returns single chunk when text is below chunk threshold', () => {
      const text = 'Introduction to Raft consensus algorithm.';
      const chunks = chunkText(text, { maxChunkTokens: 100 });
      assert.equal(chunks.length, 1);
      assert.equal(chunks[0].chunkIndex, 0);
      assert.equal(chunks[0].text, text);
      assert.ok(chunks[0].tokenCount > 0);
    });

    test('splits long text into multiple sequential chunks with overlap', () => {
      // Create a 500-word paragraph
      const paragraph = 'Consensus in distributed systems requires safety and liveness guarantees. '.repeat(40);
      const chunks = chunkText(paragraph, { maxChunkTokens: 50, overlapTokens: 10 });
      
      assert.ok(chunks.length > 1, 'Should produce multiple chunks');
      assert.equal(chunks[0].chunkIndex, 0);
      assert.equal(chunks[1].chunkIndex, 1);
      
      for (const chunk of chunks) {
        assert.ok(chunk.tokenCount <= 60, `Chunk tokens (${chunk.tokenCount}) should be bounded`);
        assert.ok(chunk.text.length > 0);
      }
    });

    test('handles empty text gracefully', () => {
      const chunks = chunkText('');
      assert.deepEqual(chunks, []);
    });
  });

  describe('extractTextFromDocument', () => {
    test('extracts plain text correctly and normalizes CRLF line breaks', async () => {
      const rawText = 'Line 1\r\nLine 2\r\n\r\nLine 3 with   extra   spaces';
      const buffer = Buffer.from(rawText, 'utf-8');

      const result = await extractTextFromDocument({
        buffer,
        mimeType: 'text/plain',
        filename: 'notes.txt',
      });

      assert.ok(result.text.includes('Line 1\nLine 2'));
      assert.equal(result.wordCount, 9);
      assert.ok(result.estimatedTokens > 0);
      assert.equal(result.title, 'notes.txt');
    });

    test('extracts markdown documents preserving headers and structure', async () => {
      const md = '# Cellular Biology\n\n## Mitochondria\n\nThe powerhouse of the cell produces ATP.';
      const buffer = Buffer.from(md, 'utf-8');

      const result = await extractTextFromDocument({
        buffer,
        mimeType: 'text/markdown',
        filename: 'biology.md',
      });

      assert.ok(result.text.includes('# Cellular Biology'));
      assert.ok(result.text.includes('ATP'));
      assert.ok(result.wordCount >= 10);
    });

    test('extracts text and page count from valid PDF buffer', async () => {
      // Minimal valid PDF 1.4 document
      const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 55 >> stream
BT
/F1 12 Tf
100 700 Td
(Distributed Systems Lecture 1) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
424
%%EOF`;
      const buffer = Buffer.from(minimalPdf, 'utf-8');

      const result = await extractTextFromDocument({
        buffer,
        mimeType: 'application/pdf',
        filename: 'lecture1.pdf',
      });

      assert.ok(result.text.includes('Distributed Systems Lecture 1'));
      assert.equal(result.pageCount, 1);
      assert.equal(result.title, 'lecture1.pdf');
    });

    test('throws FileSizeLimitError if document exceeds 10MB limit', async () => {
      // 10MB + 1 byte
      const oversizedBuffer = Buffer.alloc(10 * 1024 * 1024 + 1);

      await assert.rejects(
        async () => {
          await extractTextFromDocument({
            buffer: oversizedBuffer,
            mimeType: 'text/plain',
            filename: 'huge.txt',
          });
        },
        (err) => err instanceof FileSizeLimitError
      );
    });

    test('throws UnsupportedFileTypeError for forbidden/unsupported MIME types', async () => {
      const buffer = Buffer.from('binary data');

      await assert.rejects(
        async () => {
          await extractTextFromDocument({
            buffer,
            mimeType: 'application/x-msdownload',
            filename: 'program.exe',
          });
        },
        (err) => err instanceof UnsupportedFileTypeError
      );
    });
  });
});
