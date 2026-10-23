'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  CheckCircle2,
  RefreshCw,
  X,
  Scan,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { extractTextFromImage, OcrProgress } from '@/lib/ocr';
import { api } from '@/lib/api';

export interface ExtractedMeta {
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  wordCount: number;
  charCount: number;
  ocrConfidence?: number;
  thumbnailUrl?: string;
}

interface FileIngestionDropzoneProps {
  onExtracted: (text: string, meta: ExtractedMeta) => void;
  onError?: (errorMessage: string) => void;
  currentFilename?: string | null;
  onClear?: () => void;
  disabled?: boolean;
}

const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.txt',
  '.md',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.bmp',
];

export function FileIngestionDropzone({
  onExtracted,
  onError,
  currentFilename,
  onClear,
  disabled = false,
}: FileIngestionDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [activeMeta, setActiveMeta] = useState<ExtractedMeta | null>(null);

  const processFile = async (file: File) => {
    const filename = file.name;
    const lowerName = filename.toLowerCase();
    const isImage =
      file.type.startsWith('image/') ||
      ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some((ext) => lowerName.endsWith(ext));

    setIsProcessing(true);
    setOcrProgress(null);

    try {
      let extractedText = '';
      let ocrConfidence: number | undefined = undefined;
      let previewUrl: string | undefined = undefined;
      let detectedType = isImage ? 'image' : 'document';

      if (isImage) {
        previewUrl = URL.createObjectURL(file);
        // Execute client-side WebAssembly OCR via tesseract.js
        const ocrResult = await extractTextFromImage(file, (p) => {
          setOcrProgress(p);
        });

        extractedText = ocrResult.text;
        ocrConfidence = ocrResult.confidence;
        detectedType = 'image_ocr';

        // Also ping backend parse-file to record SHA-256 and confirm parity
        try {
          await api.parseFile(file, extractedText);
        } catch {
          // Non-blocking: local OCR succeeded
        }
      } else {
        // PDF, DOCX, TXT, MD processed by backend parser engine
        setOcrProgress({ status: 'Extracting text and structure...', progress: 50 });
        const res = await api.parseFile(file);
        extractedText = res.extracted_text;
        detectedType = res.file_type;
        setOcrProgress({ status: 'Extraction complete', progress: 100 });
      }

      if (!extractedText.trim()) {
        throw new Error(
          isImage
            ? 'No readable text was detected in this image. Please ensure text is clear and oriented correctly.'
            : 'No text content could be extracted from this document.'
        );
      }

      const words = extractedText.trim().split(/\s+/).length;
      const chars = extractedText.length;

      const meta: ExtractedMeta = {
        filename: file.name,
        fileType: detectedType,
        fileSizeBytes: file.size,
        wordCount: words,
        charCount: chars,
        ocrConfidence,
        thumbnailUrl: previewUrl,
      };

      setActiveMeta(meta);
      onExtracted(extractedText, meta);
    } catch (err: any) {
      const msg = err.message || 'Failed to process file';
      if (onError) onError(msg);
      setActiveMeta(null);
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isProcessing) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, isProcessing]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled && !isProcessing) {
        setIsDragging(true);
      }
    },
    [disabled, isProcessing]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // reset input so the same file can be re-selected if desired
    e.target.value = '';
  };

  const handleClear = () => {
    if (activeMeta?.thumbnailUrl) {
      URL.revokeObjectURL(activeMeta.thumbnailUrl);
    }
    setActiveMeta(null);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* When no file is loaded or we want to show dropzone */}
      {!activeMeta && !currentFilename && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isProcessing) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-600 bg-purple-50/50 scale-[1.01]'
              : 'border-neutral-200 hover:border-purple-400 bg-neutral-50/50 hover:bg-purple-50/20'
          } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
        >
          {isProcessing ? (
            <div className="py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-black">
                  {ocrProgress?.status || 'Analyzing input file...'}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Extracting text and structured clauses
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${ocrProgress?.progress || 35}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-purple-700 block">
                {ocrProgress?.progress ? `${ocrProgress.progress}%` : 'Processing'}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-black">
                  Drop any Document, PDF, or Image for Instant Extraction
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  or <span className="text-purple-600 font-semibold underline">browse from computer</span>
                </p>
              </div>

              {/* Badges of supported formats */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-medium text-neutral-700">
                  <FileText className="w-3 h-3 text-red-500" />
                  <span>PDF (.pdf)</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-medium text-neutral-700">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>Word (.docx, .doc)</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-medium text-neutral-700">
                  <ImageIcon className="w-3 h-3 text-purple-600" />
                  <span>Images / OCR (.png, .jpg, .webp)</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-medium text-neutral-700">
                  <File className="w-3 h-3 text-neutral-500" />
                  <span>Plain Text (.txt, .md)</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Loaded Badge & Details */}
      {(activeMeta || currentFilename) && (
        <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between text-xs transition">
          <div className="flex items-center space-x-3">
            {activeMeta?.thumbnailUrl ? (
              <img
                src={activeMeta.thumbnailUrl}
                alt="Uploaded source"
                className="w-10 h-10 rounded-lg object-cover border border-purple-200 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-black truncate max-w-[220px] sm:max-w-xs">
                  {activeMeta?.filename || currentFilename}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-200/80 text-purple-900 font-bold">
                  {activeMeta?.fileType || 'File'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-neutral-600 mt-0.5 font-sans">
                {activeMeta?.wordCount !== undefined && (
                  <span>{activeMeta.wordCount} words extracted</span>
                )}
                {activeMeta?.ocrConfidence !== undefined && (
                  <>
                    <span>•</span>
                    <span className="text-purple-700 font-medium">
                      OCR Confidence: {activeMeta.ocrConfidence}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
