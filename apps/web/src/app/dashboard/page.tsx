'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw,
  Sparkles,
  PlusCircle,
  FolderPlus,
  Folder,
  Send,
  Eye,
  Layers,
  BookOpen,
  Check,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardSummary, Submission, BrandRule, ApprovedFact } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { ScanCopyModal } from '@/components/ScanCopyModal';
import { CreateProductModal } from '@/components/CreateProductModal';

export default function ProductComplianceDashboard() {
  const { workspaceId, currentUser, activeProduct, products, reloadProducts } = useRole();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [facts, setFacts] = useState<ApprovedFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'action_needed' | 'approved'>('all');
  const [search, setSearch] = useState('');

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const prodId = activeProduct?.id;
      const [summaryRes, rulesRes, factsRes] = await Promise.all([
        api.getDashboardSummary(workspaceId, prodId),
        api.getRules(workspaceId, prodId),
        api.getFacts(workspaceId, prodId),
      ]);
      setData(summaryRes);
      setRules(rulesRes);
      setFacts(factsRes);
    } catch (err: any) {
      toastError('Dashboard Load Error', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId, activeProduct?.id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-neutral-200" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-neutral-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-neutral-200" />
      </div>
    );
  }

  const submissions = data?.recent_submissions || [];
  const metrics = data?.metrics;

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterTab === 'action_needed' && sub.status !== 'changes_requested') return false;
    if (filterTab === 'approved' && sub.status !== 'approved') return false;
    if (search && !sub.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <ScanCopyModal isOpen={scanModalOpen} onClose={() => { setScanModalOpen(false); loadData(true); }} />
      <CreateProductModal isOpen={createProductOpen} onClose={() => { setCreateProductOpen(false); reloadProducts(); }} />

      {/* Product Scope Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-neutral-500">
              Active Compliance Folder:
            </span>
            <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black font-bold px-2 py-0.5 rounded-full">
              {activeProduct?.category || 'General'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight flex items-center space-x-2">
            <Folder className="w-5 h-5 text-neutral-700" />
            <span>{activeProduct?.name || 'All Workspace Assets'}</span>
          </h1>
          <p className="text-xs text-neutral-500 max-w-xl">
            {activeProduct?.description || 'Brand compliance guidelines, approved facts, and content review history.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setCreateProductOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-black bg-white hover:bg-neutral-100 border border-neutral-300 px-3.5 py-2 rounded-xl transition font-bold"
          >
            <FolderPlus className="w-3.5 h-3.5 text-neutral-600" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setScanModalOpen(true)}
            className="flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Scan Copy</span>
          </button>
        </div>
      </div>

      {/* Metric Counters (Clean Black & White) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            Scanned Assets
          </span>
          <span className="text-2xl font-black text-black mt-0.5 block font-mono">
            {metrics?.total_submissions || 0}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Submissions in folder</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider block">
            Approved For Release
          </span>
          <span className="text-2xl font-black text-black mt-0.5 block font-mono">
            {metrics?.approved_submissions || 0}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Human signed off</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider block">
            Action Needed
          </span>
          <span className="text-2xl font-black text-black mt-0.5 block font-mono">
            {metrics?.changes_requested_submissions || 0}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Revisions requested</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            Active Guardrails
          </span>
          <span className="text-2xl font-black text-black mt-0.5 block font-mono">
            {(metrics?.total_rules || 0) + (metrics?.total_facts || 0)}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">{metrics?.total_rules || 0} rules, {metrics?.total_facts || 0} facts</span>
        </div>
      </div>

      {/* Main Content Compliance Stream */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
              Content Compliance Reviews
            </h2>
            <span className="text-xs bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full text-neutral-700 font-mono font-semibold">
              {filteredSubmissions.length} total
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'all' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('action_needed')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'action_needed' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Needs Action
              </button>
              <button
                onClick={() => setFilterTab('approved')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'approved' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Approved
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search scans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs px-3 py-1.5 pl-8 rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-black w-36 sm:w-44"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6 text-neutral-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black">No content submissions found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No draft copies have been scanned for this product folder yet. Click below to run your first compliance check.
              </p>
            </div>
            <button
              onClick={() => setScanModalOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Scan Content Now</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredSubmissions.map((sub) => {
              const isApproved = sub.status === 'approved';
              const isAction = sub.status === 'changes_requested';
              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/80 transition group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {sub.channel}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border ${
                          isApproved
                            ? 'bg-black text-white border-black'
                            : isAction
                            ? 'bg-neutral-200 text-black border-neutral-400'
                            : 'bg-white text-neutral-700 border-neutral-300'
                        }`}
                      >
                        {isApproved ? 'Approved for Release' : isAction ? 'Changes Requested' : 'In Review'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-black truncate group-hover:underline">
                      {sub.title}
                    </h3>

                    <div className="flex items-center space-x-3 text-[11px] text-neutral-500">
                      <span>Created by <strong className="text-neutral-800 font-mono">{sub.created_by}</strong></span>
                      <span>&bull;</span>
                      <span>{new Date(sub.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <Link
                    href={`/submissions/${sub.id}`}
                    className="flex items-center space-x-1.5 text-xs font-bold bg-black hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs shrink-0"
                  >
                    <span>Inspect Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Policy & Facts Glance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand Rules Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-black" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-black">
                Brand Guidelines ({rules.length})
              </h3>
            </div>
            <Link
              href="/knowledge"
              className="text-xs text-neutral-600 hover:text-black font-bold hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {rules.slice(0, 3).map((r) => (
              <div key={r.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black truncate">{r.name}</span>
                  <span className="text-[10px] font-mono uppercase bg-neutral-200 px-1.5 py-0.2 rounded font-semibold text-neutral-800">
                    {r.category}
                  </span>
                </div>
                {r.pattern && (
                  <p className="text-[11px] text-neutral-600 font-mono">
                    Pattern: &ldquo;<strong className="text-black">{r.pattern}</strong>&rdquo;
                    {r.preferred_replacement && (
                      <span> &rarr; use &ldquo;<strong className="text-black font-bold">{r.preferred_replacement}</strong>&rdquo;</span>
                    )}
                  </p>
                )}
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-xs text-neutral-400 py-3 text-center">No rules defined yet.</p>
            )}
          </div>
        </div>

        {/* Approved Facts Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-black">
                Approved Corporate Facts ({facts.length})
              </h3>
            </div>
            <Link
              href="/knowledge"
              className="text-xs text-neutral-600 hover:text-black font-bold hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {facts.slice(0, 3).map((f) => (
              <div key={f.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <p className="font-semibold text-black line-clamp-2">
                  &ldquo;{f.statement}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Source: {f.source_title}</span>
                  <span className="text-black font-bold">Verified</span>
                </div>
              </div>
            ))}
            {facts.length === 0 && (
              <p className="text-xs text-neutral-400 py-3 text-center">No facts registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
