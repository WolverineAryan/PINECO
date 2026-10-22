'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardSummary } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function DashboardPage() {
  const { workspaceId } = useRole();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary(workspaceId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [workspaceId]);

  const handleResetDemo = async () => {
    if (!confirm('Reset the demo workspace back to the initial seeded baseline?')) return;
    try {
      setResetting(true);
      const res = await api.resetDemoData();
      success('Workspace Reset', res.message);
      await loadDashboard(true);
    } catch (err: any) {
      toastError('Reset Failed', err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="h-44 rounded-2xl bg-slate-900/90 skeleton-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
          <div className="h-44 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
        </div>
        <div className="h-56 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-6 text-rose-900 my-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-semibold">Backend Connection Unavailable</h2>
        </div>
        <p className="text-xs text-rose-700 mb-4 font-mono">
          {error || 'Unable to communicate with the FastAPI server.'}
        </p>
        <button
          onClick={() => loadDashboard()}
          className="bg-rose-950 hover:bg-rose-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, recent_submissions, recent_audit_events } = data;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800/80">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-full font-mono border border-slate-700/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intelligent Brand Governance Core</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Evidence-Based Brand Governance & Claim Verification
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Pineco intercepts marketing copy before publication to enforce deterministic policies, mandatory regulatory disclaimers, and verified corporate facts with human oversight.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link
              href="/submissions/new"
              className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>New Content Review</span>
            </Link>
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs px-3.5 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>

        {/* Quick Test Navigation Cards for Evaluators */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Link
            href="/submissions/sub-demo-violation"
            className="flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition group"
          >
            <div>
              <span className="font-semibold text-rose-300 block">Sample with Violations</span>
              <span className="text-[11px] text-slate-400">Prohibited terms, unverified 9000% claim, missing disclaimer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </Link>
          <Link
            href="/submissions/sub-demo-clean"
            className="flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition group"
          >
            <div>
              <span className="font-semibold text-emerald-300 block">Clean Compliant Sample</span>
              <span className="text-[11px] text-slate-400">Verified benchmark evidence and required disclaimer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </Link>
          <Link
            href="/knowledge"
            className="flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 transition group"
          >
            <div>
              <span className="font-semibold text-slate-200 block">Brand Knowledge Base</span>
              <span className="text-[11px] text-slate-400">Inspect active rules, disclaimers & approved facts</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Submissions</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total_submissions}</span>
          <span className="text-[11px] text-slate-400">Persistent versions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Approved</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{metrics.approved_submissions}</span>
          <span className="text-[11px] text-slate-400">Human signed-off</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Changes Needed</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{metrics.changes_requested_submissions}</span>
          <span className="text-[11px] text-slate-400">Requires author edit</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Pending</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{metrics.pending_submissions}</span>
          <span className="text-[11px] text-slate-400">In review queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Brand Rules</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total_rules}</span>
          <span className="text-[11px] text-slate-400">Active policies</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition hover:shadow">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">Approved Facts</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total_facts}</span>
          <span className="text-[11px] text-slate-400">Verified ground truth</span>
        </div>
      </div>

      {/* Telemetry Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">Findings by Severity</h3>
            <span className="text-xs text-slate-400 font-mono">{metrics.total_findings} total findings</span>
          </div>
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Severity (Blocks Approval)</span>
                </span>
                <span className="font-semibold text-slate-900 font-mono">{metrics.findings_by_severity.high || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.high || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Medium Severity (Policy Warnings)</span>
                </span>
                <span className="font-semibold text-slate-900 font-mono">{metrics.findings_by_severity.medium || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.medium || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Low Severity / Verified Claims</span>
                </span>
                <span className="font-semibold text-slate-900 font-mono">{metrics.findings_by_severity.low || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.low || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">Findings by Policy Category</h3>
            <span className="text-xs text-slate-400 font-mono">Live Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Terminology</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{metrics.findings_by_category.terminology || 0}</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Fact Checks</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{metrics.findings_by_category.fact_check || 0}</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Mandatory Disclaimers</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{metrics.findings_by_category.disclaimer || 0}</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Tone & Messaging</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{metrics.findings_by_category.tone || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Content Submissions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review live submissions, inspect explainable findings, or record version decisions.
            </p>
          </div>
          <Link
            href="/submissions/new"
            className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center space-x-1"
          >
            <span>+ Submit Draft</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Channel</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Last Updated</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No submissions recorded yet. Click &quot;New Content Review&quot; to begin.
                  </td>
                </tr>
              ) : (
                recent_submissions.map((sub) => {
                  let statusBadge = (
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                      {sub.status}
                    </span>
                  );
                  if (sub.status === 'approved') {
                    statusBadge = (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-medium text-[11px] inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Approved</span>
                      </span>
                    );
                  } else if (sub.status === 'changes_requested') {
                    statusBadge = (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-0.5 rounded-full font-medium text-[11px] inline-flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Changes Needed</span>
                      </span>
                    );
                  } else if (sub.status === 'in_review') {
                    statusBadge = (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-medium text-[11px] inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>In Review</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        <Link href={`/submissions/${sub.id}`} className="hover:text-slate-600 underline decoration-slate-200 underline-offset-4">
                          {sub.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold">
                          {sub.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">{sub.created_by}</td>
                      <td className="py-3.5 px-6">{statusBadge}</td>
                      <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">
                        {new Date(sub.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(sub.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/submissions/${sub.id}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                        >
                          View Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">Workspace Audit Activity</h3>
            <p className="text-xs text-slate-400">Append-only compliance timeline</p>
          </div>
          <Link href="/audit" className="text-xs text-slate-700 font-medium hover:underline flex items-center space-x-1">
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recent_audit_events.map((evt) => (
            <div key={evt.id} className="flex items-start space-x-3 text-xs p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold mt-0.5">
                {evt.entity_type}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-900">{evt.event_type}</span> by{' '}
                <span className="font-mono text-slate-700 font-medium">{evt.actor_id}</span>
                {evt.metadata_json && (
                  <p className="text-slate-400 font-mono text-[10px] mt-0.5 truncate max-w-xl">
                    {evt.metadata_json}
                  </p>
                )}
              </div>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">
                {new Date(evt.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
