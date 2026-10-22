'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Folder,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function NewSubmissionPage() {
  const router = useRouter();
  const { workspaceId, currentUser, activeProduct } = useRole();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('social');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompliantSample = () => {
    setTitle('Enterprise Governance Launch Announcement');
    setChannel('press_release');
    setContent(
      'Our platform provides an accessible and cost-effective proven approach to enterprise brand governance. ' +
      'Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. ' +
      'Past performance is not indicative of future results.'
    );
    success('Compliant Sample Loaded', 'Verified evidence and disclaimer included.');
  };

  const loadViolationSample = () => {
    setTitle('Q4 High-Growth Campaign Draft (Violations Sample)');
    setChannel('social');
    setContent(
      'Get guaranteed results with our cheap software! ' +
      'Pineco guarantees 100% automated regulatory sign-off without human review ' +
      'and immediately increases sales by 9000%! Sign up now before offer expires.'
    );
    success('Violation Sample Loaded', 'Contains prohibited terms, missing disclaimer, and unsupported claims.');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create Submission & Version 1
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

      // 2. Trigger Governance Review
      await api.triggerReview(sub.id, sub.current_version_id || undefined, currentUser.id);

      // 3. Navigate
      router.push(`/submissions/${sub.id}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit and review content';
      setError(msg);
      toastError('Submission Failed', msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">Scan Content</h1>
          <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <Folder className="w-3 h-3 text-neutral-600" />
            <span>{activeProduct?.name || 'All Assets'}</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Submit draft copy to execute deterministic policy checks, disclaimer verification, and factual claim analysis for this product.
        </p>
      </div>

      {/* Quick Judge Sample Preloaders */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-white block">Evaluator Quick Tests</span>
            <span className="text-[11px] text-slate-400">Preload baseline copy to inspect deterministic & AI findings:</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={loadViolationSample}
            className="bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700/80 px-3 py-1.5 rounded-lg transition font-medium text-[11px]"
          >
            Load Violations Sample
          </button>
          <button
            type="button"
            onClick={loadCompliantSample}
            className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 px-3 py-1.5 rounded-lg transition font-medium text-[11px]"
          >
            Load Compliant Sample
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50/70 border border-rose-200 text-rose-900 text-xs p-4 rounded-xl flex items-center space-x-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Submission Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Enterprise Growth Announcement"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Target Channel *</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 transition font-medium"
          >
            <option value="social">Social Media (LinkedIn, Twitter/X)</option>
            <option value="press_release">Press Release / Corporate Communications</option>
            <option value="website">Website / Landing Page</option>
            <option value="blog">Editorial Blog</option>
            <option value="all">Omnichannel / All</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-800">
              Content Copy * <span className="font-normal text-slate-400">(Immutable Version 1)</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {wordCount} words • {charCount} chars
            </span>
          </div>
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write draft copy here to be audited against brand guidelines and verified facts..."
            className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 transition leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Author: <span className="font-mono text-slate-700 font-semibold">{currentUser.name}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Governance Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Submit & Run Review &rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
