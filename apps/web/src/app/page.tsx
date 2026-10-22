'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardSummary } from '@/lib/types';
import { useRole } from '@/components/RoleContext';

export default function DashboardPage() {
  const { workspaceId, currentUser } = useRole();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary(workspaceId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [workspaceId]);

  const handleResetDemo = async () => {
    if (!confirm('Reset the demo workspace back to the initial seeded baseline?')) return;
    try {
      setResetting(true);
      setResetMessage(null);
      const res = await api.resetDemoData();
      setResetMessage(res.message);
      await loadDashboard();
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      alert(`Error resetting demo data: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-sm">Loading governance telemetry from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800 my-8">
        <div className="flex items-center space-x-3 mb-2">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <h2 className="text-lg font-semibold">Backend Connection Unavailable</h2>
        </div>
        <p className="text-sm mb-4">
          Could not fetch metrics from the Pineco API backend: <span className="font-mono">{error}</span>
        </p>
        <button
          onClick={loadDashboard}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-4 py-2 rounded-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, recent_submissions, recent_audit_events } = data;

  return (
    <div className="space-y-8">
      {/* Hero / Judge Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Brand Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Evidence-Based Content Governance & Claim Verification
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pineco checks content before publication against approved brand guidelines and verified facts.
              Combining deterministic pattern matching and strict AI claim analysis, every finding is explained,
              traceable, and version-specific.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/submissions/new"
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition shadow-md"
            >
              <FileCheck className="w-4 h-4" />
              <span>New Review</span>
            </Link>
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-sm px-4 py-2.5 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs px-3.5 py-2 rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Quick Links for Judges */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Link
            href="/submissions/sub-demo-violation"
            className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 p-3 rounded-lg border border-slate-700/80 transition group"
          >
            <div>
              <span className="font-semibold text-rose-300 block">Sample with Violations</span>
              <span className="text-slate-400">Prohibited terms, unverified claim, missing disclaimer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
          </Link>
          <Link
            href="/submissions/sub-demo-clean"
            className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 p-3 rounded-lg border border-slate-700/80 transition group"
          >
            <div>
              <span className="font-semibold text-emerald-300 block">Clean Compliant Sample</span>
              <span className="text-slate-400">Verified benchmark facts and required disclaimer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
          </Link>
          <Link
            href="/knowledge"
            className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 p-3 rounded-lg border border-slate-700/80 transition group"
          >
            <div>
              <span className="font-semibold text-teal-300 block">Knowledge & Policy Base</span>
              <span className="text-slate-400">Inspect active rules, disclaimers & approved facts</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Submissions</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total_submissions}</span>
          <span className="text-[11px] text-slate-400">Persistent records</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 block">Approved</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{metrics.approved_submissions}</span>
          <span className="text-[11px] text-slate-400">Signed off by reviewer</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-rose-600 block">Changes Requested</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{metrics.changes_requested_submissions}</span>
          <span className="text-[11px] text-slate-400">Needs author revision</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-amber-600 block">Pending Review</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{metrics.pending_submissions}</span>
          <span className="text-[11px] text-slate-400">In review queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-indigo-600 block">Brand Rules</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">{metrics.total_rules}</span>
          <span className="text-[11px] text-slate-400">Deterministic policies</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-teal-600 block">Approved Facts</span>
          <span className="text-2xl font-bold text-teal-600 mt-1 block">{metrics.total_facts}</span>
          <span className="text-[11px] text-slate-400">Verified evidence</span>
        </div>
      </div>

      {/* Telemetry Breakdown: Severity & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Findings by Severity</h3>
            <span className="text-xs text-slate-500 font-mono">{metrics.total_findings} total findings</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-rose-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Severity (Blocks Approval)</span>
                </span>
                <span className="font-semibold text-slate-700">{metrics.findings_by_severity.high || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.high || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Medium Severity (Warnings)</span>
                </span>
                <span className="font-semibold text-slate-700">{metrics.findings_by_severity.medium || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.medium || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Low Severity / Verified Claims</span>
                </span>
                <span className="font-semibold text-slate-700">{metrics.findings_by_severity.low || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-slate-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.low || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Findings by Policy Category</h3>
            <span className="text-xs text-slate-500 font-mono">Live Rules Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Terminology</span>
              <span className="text-lg font-bold text-slate-900">{metrics.findings_by_category.terminology || 0}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Fact Checks</span>
              <span className="text-lg font-bold text-slate-900">{metrics.findings_by_category.fact_check || 0}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Disclaimers</span>
              <span className="text-lg font-bold text-slate-900">{metrics.findings_by_category.disclaimer || 0}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Tone & Messaging</span>
              <span className="text-lg font-bold text-slate-900">{metrics.findings_by_category.tone || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Content Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any submission to inspect findings, revise copy, or record review decisions.
            </p>
          </div>
          <Link
            href="/submissions/new"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>+ Submit Content</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
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
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No submissions recorded yet. Click &quot;New Review&quot; above to submit content.
                  </td>
                </tr>
              ) : (
                recent_submissions.map((sub) => {
                  let statusBadge = (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {sub.status}
                    </span>
                  );
                  if (sub.status === 'approved') {
                    statusBadge = (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Approved</span>
                      </span>
                    );
                  } else if (sub.status === 'changes_requested') {
                    statusBadge = (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium inline-flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Changes Requested</span>
                      </span>
                    );
                  } else if (sub.status === 'in_review') {
                    statusBadge = (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>In Review</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        <Link href={`/submissions/${sub.id}`} className="hover:text-emerald-700 underline decoration-slate-300">
                          {sub.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[11px]">
                          {sub.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">{sub.created_by}</td>
                      <td className="py-3.5 px-6">{statusBadge}</td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {new Date(sub.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(sub.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/submissions/${sub.id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded font-medium transition"
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

      {/* Live Audit Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Workspace Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable chronological record of submissions, reviews, and decisions</p>
          </div>
          <Link href="/audit" className="text-xs text-emerald-700 font-medium hover:underline">
            View Full Audit Log &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {recent_audit_events.map((evt) => (
            <div key={evt.id} className="flex items-start space-x-3 text-xs p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold mt-0.5">
                {evt.entity_type}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">{evt.event_type}</span> by{' '}
                <span className="font-mono text-emerald-700 font-medium">{evt.actor_id}</span>
                {evt.metadata_json && (
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5 truncate max-w-xl">
                    {evt.metadata_json}
                  </p>
                )}
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                {new Date(evt.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
