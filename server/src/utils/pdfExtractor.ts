import pdfParse from 'pdf-parse';

export class PdfExtractor {
  /**
   * Extract plain text content from a PDF Buffer with sanitization.
   */
  static async extractText(buffer: Buffer): Promise<string> {
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty PDF buffer provided for extraction.');
    }

    try {
      const parser = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || (pdfParse as any);
      const data = await (parser as any)(buffer);
      const rawText = data?.text || '';

      // Normalize line breaks and multiple spaces
      const sanitized = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!sanitized) {
        // Fallback: simple ascii string scan if pdf-parse returned empty
        return this.extractFallbackText(buffer);
      }

      return sanitized;
    } catch (err: any) {
      console.warn('[PdfExtractor] pdf-parse failed, attempting fallback extractor:', err.message);
      return this.extractFallbackText(buffer);
    }
  }

  /**
   * Fallback text extractor scanning readable printable characters.
   */
  private static extractFallbackText(buffer: Buffer): string {
    const rawString = buffer.toString('utf-8');
    // Extract sequences of printable ASCII text
    const matches = rawString.match(/[\x20-\x7E\t\n\r]{4,}/g);
    if (!matches || matches.length === 0) {
      return 'Candidate Resume Document';
    }
    return matches.join(' ').replace(/[ \t]+/g, ' ').trim();
  }
}
