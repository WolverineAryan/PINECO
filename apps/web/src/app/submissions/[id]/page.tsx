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
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SubmissionDetail, Finding, Review, ContentVersion, AuditEvent } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { SubmissionDetailSkeleton } from '@/components/Skeleton';

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
      const newVer = await api.createRevision(submission.id, revisionContent.trim(), currentUser.id);
      await api.triggerReview(submission.id, newVer.id, currentUser.id);
      success('Revision Committed', `Version ${newVer.version_number} created and evaluated.`);
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
      success('Finding Overridden', 'Override justification permanently logged to audit ledger.');
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
    return <SubmissionDetailSkeleton />;
  }

  if (error || !submission) {
    return (
      <div className="bg-neutral-100 border border-neutral-300 rounded-2xl p-6 text-black my-8 shadow-xs max-w-6xl mx-auto">
        <div className="flex items-center space-x-2.5 mb-2">
          <AlertTriangle className="w-5 h-5 text-black" />
          <h2 className="text-sm font-bold">Submission Not Found</h2>
        </div>
        <p className="text-xs text-neutral-600 font-mono mb-4">{error || 'Could not locate record.'}</p>
        <Link href="/dashboard" className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Nav & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-xs font-bold text-neutral-600 hover:text-black transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Compliance Hub</span>
        </Link>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRerunReview}
            disabled={rerunning}
            className="flex items-center space-x-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-black text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${rerunning ? 'animate-spin' : ''}`} />
            <span>Rerun Scan</span>
          </button>
          <button
            onClick={() => setShowDecisionModal(true)}
            className="flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Record Human Decision</span>
          </button>
        </div>
      </div>

      {/* Submission Info Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-neutral-100 text-black font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold border border-neutral-200">
                {submission.channel}
              </span>
              <span className="bg-neutral-100 text-black font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-neutral-200">
                Version {currentVersion?.version_number || 1}
              </span>
              {submission.status === 'approved' ? (
                <span className="bg-black text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Approved for Publication</span>
                </span>
              ) : submission.status === 'changes_requested' ? (
                <span className="bg-neutral-200 text-black border border-neutral-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-black" />
                  <span>Changes Requested</span>
                </span>
              ) : (
                <span className="bg-white text-black border border-neutral-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>Under Governance Review</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">{submission.title}</h1>
            <p className="text-[11px] text-neutral-500 font-mono">
              ID: {submission.id} • SHA-256: {currentVersion?.content_hash.slice(0, 16)}...
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-neutral-500 space-y-1 font-mono text-[11px]">
            <span>Author: <strong className="text-black font-bold">{submission.created_by}</strong></span>
            <span>Created: {new Date(submission.created_at).toLocaleDateString()}</span>
            <span>Recorded Versions: <strong className="text-black font-bold">{submission.versions.length}</strong></span>
          </div>
        </div>

        {/* Warning Summary if degraded AI or timeout */}
        {review?.warning_summary && (
          <div className="mt-4 bg-neutral-100 border border-neutral-300 text-black text-xs p-3.5 rounded-xl flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Operational Notice:</span>
              <p className="mt-0.5 text-neutral-600 text-[11px] leading-relaxed">{review.warning_summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'findings'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-current" />
          <span>Findings & Evidence ({findings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'editor'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-current" />
          <span>Revision Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <History className="w-3.5 h-3.5 text-current" />
          <span>Version History ({submission.versions.length})</span>
        </button>
      </div>

      {/* Tab: Findings Explorer */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-neutral-500 font-mono text-[11px] font-bold">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-black font-semibold text-xs"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-neutral-500 font-mono text-[11px] font-bold">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-black font-semibold text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="terminology">Terminology</option>
                  <option value="disclaimer">Disclaimer</option>
                  <option value="fact_check">Fact Check</option>
                  <option value="tone">Tone</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-neutral-500 font-mono text-[11px] font-bold">Evidence:</span>
                <select
                  value={evidenceFilter}
                  onChange={(e) => setEvidenceFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-black font-semibold text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="supported">Supported</option>
                  <option value="contradicted">Contradicted</option>
                  <option value="unverified">Unverified</option>
                  <option value="needs_human_review">Needs Human Review</option>
                </select>
              </div>
            </div>

            <span className="text-neutral-500 font-mono text-[11px] font-bold">
              Showing {filteredFindings.length} of {findings.length} findings
            </span>
          </div>

          {/* Findings Cards */}
          {filteredFindings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500">
              <CheckCircle2 className="w-10 h-10 text-black mx-auto mb-2" />
              <h3 className="text-sm font-bold text-black">No matching findings</h3>
              <p className="text-xs text-neutral-400 mt-1">
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
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 transition duration-150 hover:border-black"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black text-white">
                          {finding.severity}
                        </span>

                        <span className="bg-neutral-100 border border-neutral-300 text-black text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold">
                          {finding.category}
                        </span>

                        <span className="text-[10px] font-mono text-neutral-400">
                          via {finding.source_origin === 'rule_engine' ? 'Deterministic Engine' : 'AI Claim Verifier'}
                        </span>
                      </div>

                      {/* Evidence Status Pill */}
                      <div className="flex items-center space-x-2">
                        {finding.evidence_status === 'supported' && (
                          <span className="bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-purple-600" />
                            <span>Supported by Evidence</span>
                          </span>
                        )}
                        {finding.evidence_status === 'contradicted' && (
                          <span className="bg-neutral-100 border border-neutral-400 text-black text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-black" />
                            <span>Contradicts Brand Guideline</span>
                          </span>
                        )}
                        {finding.evidence_status === 'unverified' && (
                          <span className="bg-neutral-100 border border-neutral-300 text-neutral-700 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center space-x-1">
                            <HelpCircle className="w-3 h-3 text-neutral-600" />
                            <span>Unverified Claim</span>
                          </span>
                        )}
                        {finding.evidence_status === 'needs_human_review' && (
                          <span className="bg-neutral-100 border border-neutral-300 text-neutral-800 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-neutral-700" />
                            <span>Needs Human Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-mono text-black">
                      <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold block mb-1">
                        Affected Excerpt:
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap">{finding.excerpt}</p>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-neutral-700 leading-relaxed">
                      <strong className="text-black font-bold">Analysis: </strong> {finding.explanation}
                    </div>

                    {/* Rule / Fact Links */}
                    {finding.rule && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs flex items-start space-x-2 text-black">
                        <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Brand Policy Rule: </span>
                          <span>{finding.rule.name}</span>
                          <span className="text-neutral-500 block text-[11px] mt-0.5">{finding.rule.description}</span>
                        </div>
                      </div>
                    )}

                    {finding.fact && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs flex items-start space-x-2 text-black">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Authoritative Ground Truth: </span>
                          <span>{finding.fact.source_title} (Ref: {finding.fact.source_reference})</span>
                          <p className="text-neutral-500 text-[11px] mt-0.5 italic">
                            &quot;{finding.fact.statement}&quot; — Owner: {finding.fact.owner}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Suggested Correction */}
                    {finding.suggested_correction && (
                      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-purple-950 block">Suggested Compliant Correction:</span>
                          <span className="text-purple-800 font-mono text-[11px]">{finding.suggested_correction}</span>
                        </div>
                        <button
                          onClick={() => applySuggestedCorrection(finding.suggested_correction!)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition shrink-0 shadow-xs flex items-center space-x-1"
                        >
                          <span>Apply to Revision</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    )}

                    {/* Override Banner or CTA */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                      {isOverridden ? (
                        <div className="bg-neutral-100 text-black px-3 py-1.5 rounded-lg text-[11px] flex items-center space-x-1.5 font-medium border border-neutral-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
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
                          className="text-neutral-500 hover:text-black font-semibold underline text-[11px] transition"
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
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-black uppercase font-mono tracking-wider">Revise Content Copy</h2>
            <p className="text-neutral-500 text-[11px] mt-0.5">
              Editing generates an immutable new Version {submission.versions.length + 1}. Earlier versions remain preserved in history.
            </p>
          </div>

          <form onSubmit={handleCreateRevision} className="space-y-4">
            <textarea
              rows={10}
              value={revisionContent}
              onChange={(e) => setRevisionContent(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-neutral-50/50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black transition leading-relaxed text-black"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-neutral-500 font-mono text-[11px]">
                Target: {submission.channel} • New Version: v{submission.versions.length + 1}
              </span>

              <button
                type="submit"
                disabled={submittingRevision}
                className="flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95"
              >
                {submittingRevision ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Committing Version & Rerunning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
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
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-black uppercase font-mono tracking-wider">Immutable Content Versions</h2>
            <p className="text-neutral-500 text-[11px] mt-0.5">
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
                    isCurrent ? 'bg-neutral-50 border-black' : 'bg-neutral-50/50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-black">Version {ver.version_number}</span>
                      {isCurrent && (
                        <span className="bg-black text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                          Current Active
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-500 font-mono text-[11px]">
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-mono text-black bg-white p-3.5 rounded-lg border border-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {ver.content_text}
                  </p>

                  <div className="mt-2 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-300 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-2">
              <h2 className="text-sm font-black text-black uppercase font-mono tracking-wider">
                Record Review Decision
              </h2>
              <button onClick={() => setShowDecisionModal(false)} className="text-neutral-400 hover:text-black p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-neutral-500 text-[11px] mb-4">
              Commit decision permanently for Version {currentVersion?.version_number} by{' '}
              <strong className="text-black">{currentUser.name}</strong>.
            </p>

            <form onSubmit={handleRecordDecision} className="space-y-4">
              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1.5">
                  Decision Outcome *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType('approved')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition ${
                      decisionType === 'approved'
                        ? 'bg-black border-black text-white'
                        : 'border-neutral-300 hover:bg-neutral-100 text-black'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('changes_requested')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition ${
                      decisionType === 'changes_requested'
                        ? 'bg-black border-black text-white'
                        : 'border-neutral-300 hover:bg-neutral-100 text-black'
                    }`}
                  >
                    Request Fixes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('overridden')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition ${
                      decisionType === 'overridden'
                        ? 'bg-black border-black text-white'
                        : 'border-neutral-300 hover:bg-neutral-100 text-black'
                    }`}
                  >
                    Override
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                  Rationale / Feedback{' '}
                  {decisionType !== 'approved' && <span className="text-neutral-500 font-bold">* Required</span>}
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
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={decisionSubmitting}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs transition disabled:opacity-50 active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-300 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-2">
              <h2 className="text-sm font-black text-black uppercase font-mono tracking-wider">
                Override Finding
              </h2>
              <button onClick={() => setOverrideFindingId(null)} className="text-neutral-400 hover:text-black p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-neutral-500 text-[11px] mb-4">
              Overriding a brand finding requires an explicit business justification permanently recorded in the audit ledger.
            </p>

            <form onSubmit={handleOverrideFinding} className="space-y-4">
              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                  Override Rationale *
                </label>
                <textarea
                  rows={4}
                  required
                  value={overrideRationale}
                  onChange={(e) => setOverrideRationale(e.target.value)}
                  placeholder="e.g. Campaign exception approved by VP Marketing #881..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOverrideFindingId(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs transition disabled:opacity-50 active:scale-95"
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