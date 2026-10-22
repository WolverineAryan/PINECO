'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  History,
  Send,
  Sparkles,
  Info,
  X,
  UserCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SubmissionDetail, Finding, Review, ContentVersion, AuditEvent } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.id;
  const { currentUser } = useRole();
  const { success, error: toastError, info } = useToast();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'findings' | 'editor' | 'history'>('findings');

  // Filter state
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');

  // Revision Editor State
  const [revisionContent, setRevisionContent] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Reviewer Decision Modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'approved' | 'changes_requested' | 'overridden'>('approved');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  // Finding Override Modal
  const [overrideFindingId, setOverrideFindingId] = useState<string | null>(null);
  const [overrideRationale, setOverrideRationale] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  // Re-run review state
  const [rerunning, setRerunning] = useState(false);

  const loadSubmission = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await api.getSubmissionDetail(submissionId);
      setSubmission(data);
      if (data.current_version) {
        setRevisionContent(data.current_version.content_text);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const handleRerunReview = async () => {
    if (!submission?.current_version_id) return;
    try {
      setRerunning(true);
      await api.triggerReview(submission.id, submission.current_version_id, currentUser.id);
      success('Review Re-executed', 'Findings updated across all active policies.');
      await loadSubmission(true);
    } catch (err: any) {
      toastError('Review Failed', err.message);
    } finally {
      setRerunning(false);
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !revisionContent.trim()) return;

    try {
      setSubmittingRevision(true);
      // 1. Create new immutable version
      const newVer = await api.createRevision(submission.id, revisionContent.trim(), currentUser.id);
      // 2. Trigger review on new version
      await api.triggerReview(submission.id, newVer.id, currentUser.id);
      success('Revision Committed', `Version ${newVer.version_number} created and evaluated.`);
      // 3. Reload
      await loadSubmission(true);
      setActiveTab('findings');
    } catch (err: any) {
      toastError('Revision Failed', err.message);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission?.latest_review) return;

    if ((decisionType === 'overridden' || decisionType === 'changes_requested') && !decisionRationale.trim()) {
      alert('A non-empty rationale is mandatory when overriding or requesting changes.');
      return;
    }

    try {
      setDecisionSubmitting(true);
      await api.recordDecision(
        submission.latest_review.id,
        {
          decision: decisionType,
          rationale: decisionRationale.trim() || undefined,
        },
        currentUser.id
      );
      setShowDecisionModal(false);
      setDecisionRationale('');
      success('Decision Recorded', `Submission status updated to ${decisionType}.`);
      await loadSubmission(true);
    } catch (err: any) {
      toastError('Decision Failed', err.message);
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleOverrideFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideFindingId || !overrideRationale.trim()) {
      alert('An override rationale is required.');
      return;
    }

    try {
      setOverrideSubmitting(true);
      await api.overrideFinding(overrideFindingId, overrideRationale.trim(), currentUser.id);
      setOverrideFindingId(null);
      setOverrideRationale('');
      success('Finding Overridden', 'Override justification permanently logged to audit trail.');
      await loadSubmission(true);
    } catch (err: any) {
      toastError('Override Failed', err.message);
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const applySuggestedCorrection = (suggested: string) => {
    setRevisionContent((prev) => `${prev}\n\n[Correction Note]: ${suggested}`);
    info('Applied to Revision', 'Correction copied into the revision editor.');
    setActiveTab('editor');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div className="w-24 h-4 bg-slate-200/80 rounded skeleton-shimmer" />
          <div className="flex space-x-2">
            <div className="w-24 h-8 bg-slate-200/80 rounded-lg skeleton-shimmer" />
            <div className="w-32 h-8 bg-slate-200/80 rounded-lg skeleton-shimmer" />
          </div>
        </div>
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 skeleton-shimmer" />
        <div className="h-10 bg-slate-100 rounded-xl skeleton-shimmer" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200/80 skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-6 text-rose-900 my-8 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-semibold">Submission Not Found</h2>
        </div>
        <p className="text-xs text-rose-700 font-mono mb-4">{error || 'Could not locate record.'}</p>
        <Link href="/" className="bg-rose-950 hover:bg-rose-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const review = submission.latest_review;
  const currentVersion = submission.current_version;
  const findings = review?.findings || [];

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (evidenceFilter !== 'all' && f.evidence_status !== evidenceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Nav & Action Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#191919] transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Product Compliance Hub</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRerunReview}
            disabled={rerunning}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#FFFFF0] border border-[#E8E8DC] text-[#191919] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${rerunning ? 'animate-spin' : ''}`} />
            <span>Rerun Scan</span>
          </button>
          <button
            onClick={() => setShowDecisionModal(true)}
            className="flex items-center space-x-1.5 bg-[#F6C324] hover:bg-[#E5B520] text-[#191919] text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#191919]" />
            <span>Record Human Decision</span>
          </button>
        </div>
      </div>

      {/* Submission Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold">
                {submission.channel}
              </span>
              <span className="bg-slate-100 text-slate-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                Version {currentVersion?.version_number || 1}
              </span>
              {submission.status === 'approved' ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Approved for Publication</span>
                </span>
              ) : submission.status === 'changes_requested' ? (
                <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Changes Requested</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Under Governance Review</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{submission.title}</h1>
            <p className="text-[11px] text-slate-400 font-mono">
              ID: {submission.id} • SHA-256: {currentVersion?.content_hash.slice(0, 16)}...
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-slate-400 space-y-1 font-mono text-[11px]">
            <span>Author: <strong className="text-slate-800">{submission.created_by}</strong></span>
            <span>Created: {new Date(submission.created_at).toLocaleDateString()}</span>
            <span>Recorded Versions: <strong className="text-slate-800">{submission.versions.length}</strong></span>
          </div>
        </div>

        {/* Warning Summary if degraded AI or timeout */}
        {review?.warning_summary && (
          <div className="mt-4 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-xl flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Operational Notice:</span>
              <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">{review.warning_summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E8E8DC] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'findings'
              ? 'bg-[#F6C324] text-[#191919] shadow-sm'
              : 'text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0]'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-[#191919]" />
          <span>Findings & Evidence ({findings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'editor'
              ? 'bg-[#F6C324] text-[#191919] shadow-sm'
              : 'text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#191919]" />
          <span>Revision Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'bg-[#F6C324] text-[#191919] shadow-sm'
              : 'text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0]'
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#191919]" />
          <span>Version History ({submission.versions.length})</span>
        </button>
      </div>

      {/* Tab: Findings Explorer */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="terminology">Terminology</option>
                  <option value="disclaimer">Disclaimer</option>
                  <option value="fact_check">Fact Check</option>
                  <option value="tone">Tone</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Evidence Status:</span>
                <select
                  value={evidenceFilter}
                  onChange={(e) => setEvidenceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="supported">Supported</option>
                  <option value="contradicted">Contradicted</option>
                  <option value="unverified">Unverified</option>
                  <option value="needs_human_review">Needs Human Review</option>
                </select>
              </div>
            </div>

            <span className="text-slate-400 font-mono text-[11px]">
              Showing {filteredFindings.length} of {findings.length} findings
            </span>
          </div>

          {/* Findings Cards */}
          {filteredFindings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No matching findings</h3>
              <p className="text-xs text-slate-400 mt-1">
                Content adheres to all active governance filters or no violations were flagged.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFindings.map((finding) => {
                const isOverridden = finding.resolution_status === 'overridden';
                return (
                  <div
                    key={finding.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition duration-150 ${
                      finding.severity === 'high'
                        ? 'border-rose-200/80'
                        : finding.severity === 'medium'
                        ? 'border-amber-200/80'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            finding.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : finding.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {finding.severity}
                        </span>

                        <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold">
                          {finding.category}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          via {finding.source_origin === 'rule_engine' ? 'Deterministic Engine' : 'AI Claim Verifier'}
                        </span>
                      </div>

                      {/* Evidence Status Pill */}
                      <div className="flex items-center space-x-2">
                        {finding.evidence_status === 'supported' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Supported by Approved Evidence</span>
                          </span>
                        )}
                        {finding.evidence_status === 'contradicted' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Contradicts Brand Guideline / Policy</span>
                          </span>
                        )}
                        {finding.evidence_status === 'unverified' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                            <span>Unverified (No Approved Evidence)</span>
                          </span>
                        )}
                        {finding.evidence_status === 'needs_human_review' && (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>Needs Human Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block mb-1">
                        Affected Excerpt:
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap">{finding.excerpt}</p>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Analysis:</strong> {finding.explanation}
                    </div>

                    {/* Rule / Fact Links */}
                    {finding.rule && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-start space-x-2 text-slate-800">
                        <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Brand Policy Rule: </span>
                          <span>{finding.rule.name}</span>
                          <span className="text-slate-400 block text-[11px] mt-0.5">{finding.rule.description}</span>
                        </div>
                      </div>
                    )}

                    {finding.fact && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-start space-x-2 text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Authoritative Ground Truth: </span>
                          <span>{finding.fact.source_title} (Ref: {finding.fact.source_reference})</span>
                          <p className="text-slate-500 text-[11px] mt-0.5 italic">
                            &quot;{finding.fact.statement}&quot; — Owner: {finding.fact.owner}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Suggested Correction */}
                    {finding.suggested_correction && (
                      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-emerald-950 block">Suggested Correction:</span>
                          <span className="text-emerald-800">{finding.suggested_correction}</span>
                        </div>
                        <button
                          onClick={() => applySuggestedCorrection(finding.suggested_correction!)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-[11px] px-3 py-1 rounded-lg transition shrink-0 shadow-sm"
                        >
                          Apply to Revision &rarr;
                        </button>
                      </div>
                    )}

                    {/* Override Banner or CTA */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {isOverridden ? (
                        <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] flex items-center space-x-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>
                            <strong>Overridden by Reviewer:</strong> {finding.resolution_rationale} ({finding.resolved_by})
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOverrideFindingId(finding.id);
                            setOverrideRationale('');
                          }}
                          className="text-slate-500 hover:text-slate-900 font-medium underline text-[11px] transition"
                        >
                          Override Finding with Rationale...
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Revision Editor */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Revise Content Copy</h2>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Editing generates an immutable new Version {submission.versions.length + 1}. Earlier versions remain preserved in history.
            </p>
          </div>

          <form onSubmit={handleCreateRevision} className="space-y-4">
            <textarea
              rows={10}
              value={revisionContent}
              onChange={(e) => setRevisionContent(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 transition leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 font-mono text-[11px]">
                Target: {submission.channel} • New Version: v{submission.versions.length + 1}
              </span>

              <button
                type="submit"
                disabled={submittingRevision}
                className="flex items-center space-x-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {submittingRevision ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Committing Version & Rerunning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Submit Revision & Rerun Review &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Version History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Immutable Content Versions</h2>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Every revision is strictly hashed and versioned. Approvals bind only to the exact version reviewed.
            </p>
          </div>

          <div className="space-y-3">
            {submission.versions.map((ver) => {
              const isCurrent = ver.id === submission.current_version_id;
              return (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border transition ${
                    isCurrent ? 'bg-slate-50 border-slate-400' : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">Version {ver.version_number}</span>
                      {isCurrent && (
                        <span className="bg-slate-900 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          Current Active
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed whitespace-pre-wrap">
                    {ver.content_text}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>SHA-256: {ver.content_hash}</span>
                    <span>Author: {ver.created_by}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Record Decision */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Record Review Decision</h2>
              <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-[11px] mb-4">
              Commit decision permanently for Version {currentVersion?.version_number} by{' '}
              <strong className="text-slate-800">{currentUser.name}</strong>.
            </p>

            <form onSubmit={handleRecordDecision} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType('approved')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition ${
                      decisionType === 'approved'
                        ? 'bg-slate-950 border-slate-950 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('changes_requested')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition ${
                      decisionType === 'changes_requested'
                        ? 'bg-slate-950 border-slate-950 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('overridden')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition ${
                      decisionType === 'overridden'
                        ? 'bg-slate-950 border-slate-950 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Override & Approve
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rationale / Feedback{' '}
                  {decisionType !== 'approved' && <span className="text-rose-600 font-bold">* Required</span>}
                </label>
                <textarea
                  rows={4}
                  required={decisionType !== 'approved'}
                  value={decisionRationale}
                  onChange={(e) => setDecisionRationale(e.target.value)}
                  placeholder={
                    decisionType === 'approved'
                      ? 'Optional approval sign-off note...'
                      : 'Provide explicit business rationale or required copy revisions...'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={decisionSubmitting}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                >
                  {decisionSubmitting ? 'Recording...' : 'Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Finding Override */}
      {overrideFindingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Override Finding</h2>
              <button onClick={() => setOverrideFindingId(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-[11px] mb-4">
              Overriding a brand finding requires an explicit business justification permanently recorded in the audit trail.
            </p>

            <form onSubmit={handleOverrideFinding} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override Rationale *</label>
                <textarea
                  rows={4}
                  required
                  value={overrideRationale}
                  onChange={(e) => setOverrideRationale(e.target.value)}
                  placeholder="e.g. Campaign exception approved by VP Marketing #881..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOverrideFindingId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                >
                  {overrideSubmitting ? 'Submitting...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
