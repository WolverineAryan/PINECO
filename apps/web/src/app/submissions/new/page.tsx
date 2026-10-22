'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRole } from '@/components/RoleContext';

export default function NewSubmissionPage() {
  const router = useRouter();
  const { workspaceId, currentUser } = useRole();

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
  };

  const loadViolationSample = () => {
    setTitle('Q4 High-Growth Campaign Draft (Violations Sample)');
    setChannel('social');
    setContent(
      'Get guaranteed results with our cheap software! ' +
      'Pineco guarantees 100% automated regulatory sign-off without human review ' +
      'and immediately increases sales by 9000%! Sign up now before offer expires.'
    );
  };

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
        },
        currentUser.id
      );

      // 2. Trigger Governance Review
      await api.triggerReview(sub.id, sub.current_version_id || undefined, currentUser.id);

      // 3. Navigate to Review Explorer
      router.push(`/submissions/${sub.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit and review content');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Content Submission</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit draft copy to run deterministic brand rules, mandatory disclaimers, and factual claim verification.
        </p>
      </div>

      {/* Quick Judge Sample Preloaders */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Judge Quick Test:</strong> Preload sample copy to test governance checks:
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={loadViolationSample}
            className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg transition font-medium"
          >
            Load Violations Sample
          </button>
          <button
            type="button"
            onClick={loadCompliantSample}
            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg transition font-medium"
          >
            Load Compliant Sample
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Submission Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Growth Campaign Social Copy"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Publication Channel *</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="social">Social Media (LinkedIn, Twitter/X)</option>
            <option value="press_release">Press Release / Corporate Communications</option>
            <option value="website">Website / Landing Page</option>
            <option value="blog">Editorial Blog</option>
            <option value="all">Omnichannel / All</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            Content Copy * <span className="font-normal text-slate-400">(Immutable Version 1)</span>
          </label>
          <textarea
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write copy here to be audited against brand guidelines and verified facts..."
            className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Author: <span className="font-mono text-slate-700 font-semibold">{currentUser.name}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Governance Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit & Run Review &rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
