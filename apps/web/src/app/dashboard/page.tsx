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
  Filter,
  UserCheck,
  Search,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  X,
  Compass,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardSummary, Submission } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { AuthModal } from '@/components/AuthModal';

export default function CrmDashboardPage() {
  const { workspaceId, currentUser, openAuthModal } = useRole();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // CRM Pipeline Filter state
  const [pipelineTab, setPipelineTab] = useState<'all' | 'action_needed' | 'in_review' | 'approved'>('all');
  const [crmSearch, setCrmSearch] = useState('');

  // CRM Quick Drawer Preview
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-slate-200/80 skeleton-shimmer" />
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

  const filteredPipeline = recent_submissions.filter((sub) => {
    if (pipelineTab === 'action_needed' && sub.status !== 'changes_requested') return false;
    if (pipelineTab === 'in_review' && !['draft', 'in_review'].includes(sub.status)) return false;
    if (pipelineTab === 'approved' && sub.status !== 'approved') return false;
    if (crmSearch && !sub.title.toLowerCase().includes(crmSearch.toLowerCase()) && !sub.channel.toLowerCase().includes(crmSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <AuthModal />

      {/* CRM Command Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
              Content Governance Command Center
            </h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              LIVE CRM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring, policy interception, and version-specific review approvals.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs text-brand-black hover:bg-brand-yellow/10 bg-white border border-brand-black/10 px-3 py-2 rounded-xl transition shadow-sm font-semibold"
          >
            <Compass className="w-3.5 h-3.5 text-brand-black" />
            <span>Product Landing</span>
          </Link>
          <button
            onClick={openAuthModal}
            className="flex items-center space-x-1.5 text-xs text-brand-black hover:bg-brand-yellow/10 bg-white border border-brand-black/10 px-3 py-2 rounded-xl transition shadow-sm font-semibold"
          >
            <UserCheck className="w-3.5 h-3.5 text-brand-black/60" />
            <span>Persona ({currentUser.name.split(' ')[0]})</span>
          </button>
          <Link
            href="/submissions/new"
            className="flex items-center space-x-1.5 bg-brand-yellow hover:bg-[#E5B520] text-brand-black text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
          >
            <FileCheck className="w-4 h-4 text-brand-black" />
            <span>New Review</span>
          </Link>
        </div>
      </div>

      {/* Workflow Explainer Banner for Normal Users */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800/90 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400">
              How It Works
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Automated Brand Compliance & Proof of Accuracy
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              1. <strong>Creator</strong> drafts marketing copy. 2. <strong>Pineco</strong> checks prohibited terms, required disclaimers & verified facts. 3. <strong>Reviewer</strong> signs off or requests changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/submissions/sub-demo-violation"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              Test Violations Sample &rarr;
            </Link>
            <Link
              href="/submissions/sub-demo-clean"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              Test Clean Sample &rarr;
            </Link>
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 inline mr-1 text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* CRM Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Total Assets
            </span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 block font-mono">
            {metrics.total_submissions}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">In content governance pipeline</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider font-mono">
              Signed Off
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block font-mono">
            {metrics.approved_submissions}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Human approved for release</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider font-mono">
              Action Required
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1 block font-mono">
            {metrics.changes_requested_submissions}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Policy violations flagged</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider font-mono">
              In Review Queue
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block font-mono">
            {metrics.pending_submissions}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting compliance sign-off</span>
        </div>
      </div>

      {/* Main CRM Content Pipeline Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Pipeline Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* CRM Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setPipelineTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition whitespace-nowrap ${
                pipelineTab === 'all'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Assets ({recent_submissions.length})
            </button>
            <button
              onClick={() => setPipelineTab('action_needed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition whitespace-nowrap flex items-center space-x-1.5 ${
                pipelineTab === 'action_needed'
                  ? 'bg-rose-950 text-rose-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Action Required ({metrics.changes_requested_submissions})</span>
            </button>
            <button
              onClick={() => setPipelineTab('in_review')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition whitespace-nowrap ${
                pipelineTab === 'in_review'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              In Review ({metrics.pending_submissions})
            </button>
            <button
              onClick={() => setPipelineTab('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition whitespace-nowrap flex items-center space-x-1.5 ${
                pipelineTab === 'approved'
                  ? 'bg-emerald-950 text-emerald-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved ({metrics.approved_submissions})</span>
            </button>
          </div>

          {/* CRM Search input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={crmSearch}
              onChange={(e) => setCrmSearch(e.target.value)}
              placeholder="Filter pipeline..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Pipeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-6">Content Asset</th>
                <th className="py-3 px-6">Channel Scope</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Governance Status</th>
                <th className="py-3 px-6">Last Action</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPipeline.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No submissions found matching this CRM pipeline filter.
                  </td>
                </tr>
              ) : (
                filteredPipeline.map((sub) => {
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
                        <span>Action Required</span>
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
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`hover:bg-slate-50/80 transition duration-150 cursor-pointer ${
                        selectedSub?.id === sub.id ? 'bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-950">
                        <Link
                          href={`/submissions/${sub.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {sub.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                          {sub.channel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{sub.created_by}</td>
                      <td className="py-4 px-6">{statusBadge}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {new Date(sub.updated_at).toLocaleDateString()},{' '}
                        {new Date(sub.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/submissions/${sub.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
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

      {/* Side Slide-Out Quick Drawer Preview when clicking a row */}
      {selectedSub && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Asset Quick Summary
              </span>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                {selectedSub.channel}
              </span>
              <h3 className="text-base font-bold text-slate-950 mt-1">{selectedSub.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedSub.id}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedSub.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Author:</span>
                <span className="font-mono text-slate-800">{selectedSub.created_by}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Modified:</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {new Date(selectedSub.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <Link
              href={`/submissions/${selectedSub.id}`}
              className="w-full flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition"
            >
              <span>Open Detailed Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setSelectedSub(null)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1.5"
            >
              Close Quick Drawer
            </button>
          </div>
        </div>
      )}

      {/* Telemetry Breakdown: Severity & Audit Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
              Risk Level Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">{metrics.total_findings} Findings Intercepted</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-rose-700 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Severity (Blocks Approval)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{metrics.findings_by_severity.high || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-rose-500 h-1.5 rounded-full"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.high || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-700 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Medium Severity (Warnings)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{metrics.findings_by_severity.medium || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{
                    width: `${metrics.total_findings ? ((metrics.findings_by_severity.medium || 0) / metrics.total_findings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
              Recent Audit Log Activity
            </h3>
            <Link href="/audit" className="text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline">
              View Log &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_audit_events.slice(0, 4).map((evt) => (
              <div key={evt.id} className="flex items-start space-x-3 text-xs p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold mt-0.5">
                  {evt.entity_type}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-900">{evt.event_type}</span> by{' '}
                  <span className="font-mono text-slate-700">{evt.actor_id}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">
                  {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
