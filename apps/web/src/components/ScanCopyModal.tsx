'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, X, Sparkles, Send, ShieldAlert, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { useRole } from './RoleContext';
import { useToast } from './Toast';

interface ScanCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: string;
}

export function ScanCopyModal({ isOpen, onClose, defaultChannel = 'social' }: ScanCopyModalProps) {
  const router = useRouter();
  const { workspaceId, currentUser, activeProduct } = useRole();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState(defaultChannel);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

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
      onClose();
      router.push(`/submissions/${sub.id}`);
    } catch (err: any) {
      toastError('Scan Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadExample = (type: 'violation' | 'clean') => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-neutral-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">Scan Content for Brand Compliance</h2>
              <p className="text-[11px] text-neutral-500">
                Product Scope: <strong className="text-black">{activeProduct?.name || 'All Workspace Assets'}</strong>
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

        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-black">Content Asset Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Product Announcement, Instagram Copy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-black">Publishing Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-black">Draft Content to Audit *</label>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <span className="text-neutral-400">Load Template:</span>
                <button
                  type="button"
                  onClick={() => loadExample('violation')}
                  className="text-neutral-700 hover:text-black hover:underline font-bold"
                >
                  Violations Sample
                </button>
                <span className="text-neutral-300">|</span>
                <button
                  type="button"
                  onClick={() => loadExample('clean')}
                  className="text-neutral-700 hover:text-black hover:underline font-bold"
                >
                  Clean Sample
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Paste promotional copy, marketing slogans, claims, or disclaimers here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black leading-relaxed resize-none font-sans"
            />
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start space-x-2.5 text-[11px] text-neutral-700">
            <Sparkles className="w-4 h-4 text-black shrink-0 mt-0.5" />
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
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{submitting ? 'Running Compliance Scan...' : 'Run Compliance Scan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
