'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Search,
  X,
  HelpCircle,
  Folder,
  Sparkles,
  Check,
  Bot,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BrandRule, ApprovedFact } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function KnowledgePage() {
  const { workspaceId, currentUser, activeProduct } = useRole();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'rules' | 'facts'>('rules');

  const [rules, setRules] = useState<BrandRule[]>([]);
  const [facts, setFacts] = useState<ApprovedFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showFactModal, setShowFactModal] = useState(false);

  // New Rule Form
  const [ruleName, setRuleName] = useState('');
  const [ruleCategory, setRuleCategory] = useState('terminology');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleReplacement, setRuleReplacement] = useState('');
  const [ruleSeverity, setRuleSeverity] = useState('medium');
  const [ruleChannel, setRuleChannel] = useState('all');
  const [ruleDescription, setRuleDescription] = useState('');

  // New Fact Form
  const [factStatement, setFactStatement] = useState('');
  const [factSourceTitle, setFactSourceTitle] = useState('');
  const [factSourceRef, setFactSourceRef] = useState('');
  const [factSourceUrl, setFactSourceUrl] = useState('');
  const [factOwner, setFactOwner] = useState('Product Marketing');

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const prodId = activeProduct?.id;
      const [r, f] = await Promise.all([
        api.getRules(workspaceId, prodId),
        api.getFacts(workspaceId, prodId),
      ]);
      setRules(r);
      setFacts(f);
    } catch (err: any) {
      toastError('Load Error', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId, activeProduct?.id]);

  const handleToggleRule = async (rule: BrandRule) => {
    try {
      const updated = await api.updateRule(
        rule.id,
        { enabled: !rule.enabled },
        currentUser.id
      );
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      success(
        updated.enabled ? 'Rule Enabled' : 'Rule Disabled',
        `Policy '${rule.name}' is now ${updated.enabled ? 'active' : 'inactive'}.`
      );
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createRule(
        {
          name: ruleName,
          category: ruleCategory,
          pattern: rulePattern || undefined,
          preferred_replacement: ruleReplacement || undefined,
          severity: ruleSeverity,
          channel_scope: ruleChannel,
          description: ruleDescription,
          enabled: true,
          workspace_id: workspaceId,
          product_id: activeProduct?.id || undefined,
        },
        currentUser.id
      );
      setRules([created, ...rules]);
      setShowRuleModal(false);
      setRuleName('');
      setRulePattern('');
      setRuleReplacement('');
      setRuleDescription('');
      success('Brand Rule Created', `'${created.name}' is now active.`);
    } catch (err: any) {
      toastError('Rule Creation Failed', err.message);
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createFact(
        {
          statement: factStatement,
          source_title: factSourceTitle,
          source_reference: factSourceRef,
          source_url: factSourceUrl || undefined,
          owner: factOwner,
          approval_status: 'approved',
          workspace_id: workspaceId,
          product_id: activeProduct?.id || undefined,
        },
        currentUser.id
      );
      setFacts([created, ...facts]);
      setShowFactModal(false);
      setFactStatement('');
      setFactSourceTitle('');
      setFactSourceRef('');
      setFactSourceUrl('');
      success('Approved Fact Saved', `'${created.source_title}' registered as ground truth.`);
    } catch (err: any) {
      toastError('Fact Creation Failed', err.message);
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.pattern && r.pattern.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredFacts = facts.filter(
    (f) =>
      f.statement.toLowerCase().includes(search.toLowerCase()) ||
      f.source_title.toLowerCase().includes(search.toLowerCase()) ||
      f.owner.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-neutral-200" />
        <div className="h-14 bg-white rounded-xl border border-neutral-200" />
        <div className="h-96 bg-white rounded-2xl border border-neutral-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
              Brand Guidelines & Ground Truth
            </h1>
            <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Folder className="w-3 h-3 text-neutral-600" />
              <span>{activeProduct?.name || 'All Workspace Assets'}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Authoritative deterministic policies, prohibited terms, mandatory disclaimers, and verified corporate facts for this product scope.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/automation"
            className="flex items-center space-x-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 border border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 px-3.5 py-2.5 rounded-xl transition shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Rule Architect &rarr;</span>
          </Link>

          {activeTab === 'rules' ? (
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.35)]"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>New Brand Rule</span>
            </button>
          ) : (
            <button
              onClick={() => setShowFactModal(true)}
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.35)]"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Approved Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center space-x-1.5 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'rules'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Brand Rules ({rules.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'facts'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Approved Facts ({facts.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50/50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-black"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Rules Table */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3.5 px-5">Rule Name & Guideline</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Prohibited Pattern</th>
                  <th className="py-3.5 px-5">Approved Replacement</th>
                  <th className="py-3.5 px-5">Severity</th>
                  <th className="py-3.5 px-5 text-center">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-neutral-400">
                      <Shield className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <span className="font-semibold block text-neutral-600">No brand rules found</span>
                      <span className="text-[11px] text-neutral-400">Add a rule manually or use the AI Agent to draft guidelines in plain English.</span>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-neutral-50/80 transition duration-150">
                      <td className="py-4 px-5 max-w-xs">
                        <span className="font-bold text-black block">{rule.name}</span>
                        <span className="text-[11px] text-neutral-500 block truncate mt-0.5">{rule.description}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded uppercase font-mono text-[10px] font-bold">
                          {rule.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px]">
                        {rule.pattern ? (
                          <span className="bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded font-bold">
                            &quot;{rule.pattern}&quot;
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px]">
                        {rule.preferred_replacement ? (
                          <span className="bg-purple-50 border border-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                            &quot;{rule.preferred_replacement}&quot;
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                          {rule.severity}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative inline-block ${
                            rule.enabled ? 'bg-purple-600' : 'bg-neutral-300'
                          }`}
                          title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-1 transition-transform ${
                              rule.enabled ? 'left-5.5' : 'left-1'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facts Table */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3.5 px-5">Approved Corporate Fact</th>
                  <th className="py-3.5 px-5">Source Reference</th>
                  <th className="py-3.5 px-5">Owner</th>
                  <th className="py-3.5 px-5">Validity</th>
                  <th className="py-3.5 px-5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {filteredFacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-neutral-400">
                      <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <span className="font-semibold block text-neutral-600">No approved facts registered</span>
                      <span className="text-[11px] text-neutral-400">Register audited metrics, research studies, and verified performance statistics.</span>
                    </td>
                  </tr>
                ) : (
                  filteredFacts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-neutral-50/80 transition duration-150">
                      <td className="py-4 px-5 font-semibold text-black max-w-md">
                        &quot;{fact.statement}&quot;
                        {fact.source_url && (
                          <a
                            href={fact.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-neutral-500 hover:text-black ml-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-bold text-black block">{fact.source_title}</span>
                        <span className="font-mono text-[10px] text-neutral-400">Ref: {fact.source_reference}</span>
                      </td>
                      <td className="py-4 px-5 text-neutral-600 font-medium font-mono text-[11px]">{fact.owner}</td>
                      <td className="py-4 px-5 text-neutral-500 text-[11px] font-mono">
                        {fact.valid_until ? `Until ${new Date(fact.valid_until).toLocaleDateString()}` : 'Perpetual'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1 bg-purple-50 text-purple-900 border border-purple-200">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          <span>{fact.approval_status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Brand Rule */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-black" />
                <h2 className="text-sm font-black text-black uppercase font-mono tracking-wider">
                  Create Brand Rule
                </h2>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 mb-4">
              Deterministic rules are evaluated instantly across all submitted marketing copy for {activeProduct?.name || 'this workspace'}.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Prohibit absolute guarantee: 'guaranteed 100%'"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black"
                  >
                    <option value="terminology">Terminology</option>
                    <option value="disclaimer">Disclaimer</option>
                    <option value="tone">Tone & Messaging</option>
                    <option value="factual">Factual Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black"
                  >
                    <option value="high">High (Mandatory Fix)</option>
                    <option value="medium">Medium (Standard Warning)</option>
                    <option value="low">Low (Advisory Recommendation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Prohibited Pattern / Term
                  </label>
                  <input
                    type="text"
                    value={rulePattern}
                    onChange={(e) => setRulePattern(e.target.value)}
                    placeholder="e.g. guaranteed 100%"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Preferred Replacement
                  </label>
                  <input
                    type="text"
                    value={ruleReplacement}
                    onChange={(e) => setRuleReplacement(e.target.value)}
                    placeholder="e.g. proven track record"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                  Description & Compliance Rationale *
                </label>
                <textarea
                  required
                  rows={3}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Explain why this rule exists and why creators must adhere..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs transition active:scale-95"
                >
                  Save Brand Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Approved Fact */}
      {showFactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-black" />
                <h2 className="text-sm font-black text-black uppercase font-mono tracking-wider">
                  Register Approved Fact
                </h2>
              </div>
              <button
                onClick={() => setShowFactModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 mb-4">
              Verified corporate facts serve as authoritative ground truth for zero-shot claim verification.
            </p>

            <form onSubmit={handleCreateFact} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                  Factual Claim Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={factStatement}
                  onChange={(e) => setFactStatement(e.target.value)}
                  placeholder="e.g. Pineco delivers 68% faster compliance turnarounds across marketing teams."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Source Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={factSourceTitle}
                    onChange={(e) => setFactSourceTitle(e.target.value)}
                    placeholder="e.g. Enterprise Benchmark Study 2026"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Reference Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={factSourceRef}
                    onChange={(e) => setFactSourceRef(e.target.value)}
                    placeholder="e.g. REP-2026-68"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Owner / Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={factOwner}
                    onChange={(e) => setFactOwner(e.target.value)}
                    placeholder="e.g. Product Marketing"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black uppercase font-mono text-[10px] tracking-wider mb-1">
                    Source URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={factSourceUrl}
                    onChange={(e) => setFactSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowFactModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs transition active:scale-95"
                >
                  Save Approved Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}