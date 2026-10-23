import Tesseract from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number; // 0 - 100
}

/**
 * Extracts text from an image (File, Blob, or URL) using client-side WebAssembly OCR.
 * Provides real-time recognition progress callbacks.
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string,
  onProgress?: (progress: OcrProgress) => void
): Promise<{ text: string; confidence: number }> {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (msg: { status?: string; progress?: number }) => {
        if (onProgress && msg) {
          const rawPct = msg.progress ?? 0;
          const statusText =
            msg.status === 'recognizing text'
              ? 'Recognizing characters...'
              : msg.status === 'loading tesseract core'
              ? 'Loading OCR engine...'
              : msg.status === 'initializing tesseract'
              ? 'Initializing model...'
              : msg.status === 'loading language traineddata'
              ? 'Loading language models...'
              : 'Processing image...';

          onProgress({
            status: statusText,
            progress: Math.min(100, Math.max(0, Math.round(rawPct * 100))),
          });
        }
      },
    });

    const text = (result?.data?.text || '').trim();
    const confidence = Math.round(result?.data?.confidence || 0);

    return { text, confidence };
  } catch (error) {
    console.error('OCR Recognition error:', error);
    throw new Error(
      error instanceof Error
        ? `OCR extraction error: ${error.message}`
        : 'Failed to parse image with OCR'
    );
  }
}
