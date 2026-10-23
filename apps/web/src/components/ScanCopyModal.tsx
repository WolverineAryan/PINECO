'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  X,
  Sparkles,
  Send,
  UploadCloud,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { FileIngestionDropzone, ExtractedMeta } from './FileIngestionDropzone';

interface ScanCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: string;
}

export function ScanCopyModal({ isOpen, onClose, defaultChannel = 'social' }: ScanCopyModalProps) {
  const router = useRouter();
  const { workspaceId, currentUser, activeProduct } = useRole();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState(defaultChannel);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachedMeta, setAttachedMeta] = useState<ExtractedMeta | null>(null);

  if (!isOpen) return null;

  const handleExtracted = (text: string, meta: ExtractedMeta) => {
    setContent(text);
    setAttachedMeta(meta);
    if (!title.trim()) {
      const cleanName = meta.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    success('Text Extracted', `Successfully extracted ${meta.wordCount} words from ${meta.filename}.`);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      // 1. Create submission
      const sub = await api.createSubmission(
        {
          title: title.trim(),
          channel,
          content: content.trim(),
          workspace_id: workspaceId,
          product_id: activeProduct?.id || undefined,
        },
        currentUser.id
      );

      // 2. Trigger automated review (deterministic + AI fact matching)
      await api.triggerReview(sub.id, sub.current_version_id || undefined, currentUser.id);

      success('Scan Complete', `Analyzed "${sub.title}" against brand policies.`);
      setTitle('');
      setContent('');
      setAttachedMeta(null);
      onClose();
      router.push(`/submissions/${sub.id}`);
    } catch (err: any) {
      toastError('Scan Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadExample = (type: 'violation' | 'clean') => {
    setAttachedMeta(null);
    if (type === 'violation') {
      setTitle('Q4 Growth Promotional Blast');
      setChannel('social');
      setContent(
        'Get guaranteed results with our cheap solution! We guarantee 100% automated legal sign-off without human review and 9000% instant ROI. Sign up now!'
      );
    } else {
      setTitle('Enterprise Brand Launch Statement');
      setChannel('press_release');
      setContent(
        'Our platform provides a proven approach to enterprise brand governance. Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. Past performance is not indicative of future results.'
      );
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-neutral-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">Scan Content for Brand Compliance</h2>
              <p className="text-[11px] text-neutral-500">
                Product Scope: <strong className="text-purple-700">{activeProduct?.name || 'All Workspace Assets'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-neutral-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'upload'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document / Image (OCR)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'manual'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Direct Text Input</span>
          </button>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          {/* Metadata: Title & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-black">Content Asset Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Product Announcement, Instagram Copy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-black">Publishing Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black font-medium"
              >
                <option value="social">Social Media (LinkedIn, X)</option>
                <option value="press_release">Press Release</option>
                <option value="email">Email Campaign / Newsletter</option>
                <option value="website">Website / Landing Copy</option>
                <option value="blog">Editorial Blog Post</option>
                <option value="all">Universal / All Channels</option>
              </select>
            </div>
          </div>

          {/* Upload Zone (when in upload tab) */}
          {activeTab === 'upload' && (
            <FileIngestionDropzone
              onExtracted={handleExtracted}
              onError={(err) => toastError('Extraction Error', err)}
              currentFilename={attachedMeta?.filename}
              onClear={() => {
                setAttachedMeta(null);
                setContent('');
              }}
            />
          )}

          {/* Content Editor / Extracted Preview */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-black flex items-center space-x-1.5">
                <span>{attachedMeta ? 'Extracted Copy (Editable) *' : 'Draft Content to Audit *'}</span>
                {attachedMeta && (
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono font-medium">
                    Verified from {attachedMeta.fileType}
                  </span>
                )}
              </label>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-neutral-400 font-mono">
                  {wordCount} words • {charCount} chars
                </span>
                <span className="text-neutral-300">|</span>
                <button
                  type="button"
                  onClick={() => loadExample('violation')}
                  className="text-purple-700 hover:text-purple-900 hover:underline font-semibold"
                >
                  Violations
                </button>
                <span className="text-neutral-300">|</span>
                <button
                  type="button"
                  onClick={() => loadExample('clean')}
                  className="text-purple-700 hover:text-purple-900 hover:underline font-semibold"
                >
                  Clean
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              required
              placeholder={
                activeTab === 'upload'
                  ? 'Extracted text will appear here automatically, or you can paste directly...'
                  : 'Paste promotional copy, marketing slogans, claims, or disclaimers here...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black leading-relaxed resize-none font-mono"
            />
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start space-x-2.5 text-[11px] text-neutral-700">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-black">Multi-Stage Governance Pipeline:</span>
              <p className="mt-0.5 text-neutral-600">
                Instantly matches prohibited terminology, checks required disclaimers, and verifies extracted claims against verified company evidence before human sign-off.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold bg-black hover:bg-neutral-800 text-white rounded-xl shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>{submitting ? 'Running Compliance Scan...' : 'Run Compliance Scan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
