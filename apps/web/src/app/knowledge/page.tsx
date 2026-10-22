'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BrandRule, ApprovedFact } from '@/lib/types';
import { useRole } from '@/components/RoleContext';

export default function KnowledgePage() {
  const { workspaceId, currentUser, role } = useRole();
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

  const canManage = role === 'brand_manager' || role === 'admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, f] = await Promise.all([
        api.getRules(workspaceId),
        api.getFacts(workspaceId),
      ]);
      setRules(r);
      setFacts(f);
    } catch (err: any) {
      alert(`Error loading brand knowledge: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleToggleRule = async (rule: BrandRule) => {
    try {
      const updated = await api.updateRule(
        rule.id,
        { enabled: !rule.enabled },
        currentUser.id
      );
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err: any) {
      alert(`Error updating rule: ${err.message}`);
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
        },
        currentUser.id
      );
      setRules([created, ...rules]);
      setShowRuleModal(false);
      setRuleName('');
      setRulePattern('');
      setRuleReplacement('');
      setRuleDescription('');
    } catch (err: any) {
      alert(`Error creating rule: ${err.message}`);
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
        },
        currentUser.id
      );
      setFacts([created, ...facts]);
      setShowFactModal(false);
      setFactStatement('');
      setFactSourceTitle('');
      setFactSourceRef('');
      setFactSourceUrl('');
    } catch (err: any) {
      alert(`Error adding fact: ${err.message}`);
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFacts = facts.filter(
    (f) =>
      f.statement.toLowerCase().includes(search.toLowerCase()) ||
      f.source_title.toLowerCase().includes(search.toLowerCase()) ||
      f.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic brand policies, prohibited terminology, disclaimers, and authoritative corporate facts.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'rules' ? (
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Brand Rule</span>
            </button>
          ) : (
            <button
              onClick={() => setShowFactModal(true)}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Approved Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
              activeTab === 'rules'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Brand Rules ({rules.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
              activeTab === 'facts'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Approved Facts ({facts.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Rules Table */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-6">Rule Name & Details</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Pattern / Match</th>
                  <th className="py-3 px-6">Preferred Replacement</th>
                  <th className="py-3 px-6">Severity</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No brand rules found.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-6 max-w-xs">
                        <span className="font-semibold text-slate-900 block">{rule.name}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{rule.description}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-mono text-[10px] font-bold">
                          {rule.category}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px] text-rose-700 bg-rose-50/50 rounded px-2 py-1 max-w-[150px] truncate">
                        {rule.pattern || '—'}
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px] text-emerald-700 bg-emerald-50/50 rounded px-2 py-1 max-w-[150px] truncate">
                        {rule.preferred_replacement || '—'}
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rule.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : rule.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className="text-slate-600 hover:text-slate-900 focus:outline-none"
                          title="Toggle rule enabled/disabled"
                        >
                          {rule.enabled ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600 inline" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400 inline" />
                          )}
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-6">Approved Statement</th>
                  <th className="py-3 px-6">Source Reference</th>
                  <th className="py-3 px-6">Owner</th>
                  <th className="py-3 px-6">Validity</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No approved facts found.
                    </td>
                  </tr>
                ) : (
                  filteredFacts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 font-medium text-slate-900 max-w-md">
                        {fact.statement}
                        {fact.source_url && (
                          <a
                            href={fact.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-600 ml-2 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-slate-800 block">{fact.source_title}</span>
                        <span className="font-mono text-[11px] text-slate-400">Ref: {fact.source_reference}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{fact.owner}</td>
                      <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                        {fact.valid_until ? `Until ${new Date(fact.valid_until).toLocaleDateString()}` : 'Perpetual'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center space-x-1 ${
                            fact.approval_status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Brand Policy Rule</h2>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic rules are evaluated instantly across all submitted copy.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Prohibited Absolute Claim: 'guaranteed'"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="terminology">Terminology</option>
                    <option value="disclaimer">Disclaimer</option>
                    <option value="tone">Tone & Messaging</option>
                    <option value="factual">Factual Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="high">High (Blocks approval)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="low">Low (Advisory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pattern / Prohibited Term</label>
                  <input
                    type="text"
                    value={rulePattern}
                    onChange={(e) => setRulePattern(e.target.value)}
                    placeholder="e.g. guaranteed"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Replacement</label>
                  <input
                    type="text"
                    value={ruleReplacement}
                    onChange={(e) => setRuleReplacement(e.target.value)}
                    placeholder="e.g. proven"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Description & Rationale *</label>
                <textarea
                  required
                  rows={3}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Explain why this rule exists and how creators should adhere..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Approved Fact</h2>
            <p className="text-xs text-slate-500 mb-4">
              Verified corporate facts serve as authoritative ground truth for claim verification.
            </p>

            <form onSubmit={handleCreateFact} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Factual Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={factStatement}
                  onChange={(e) => setFactStatement(e.target.value)}
                  placeholder="e.g. Pineco delivers 68% faster compliance turnarounds across marketing teams."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Title *</label>
                  <input
                    type="text"
                    required
                    value={factSourceTitle}
                    onChange={(e) => setFactSourceTitle(e.target.value)}
                    placeholder="e.g. Benchmark Study 2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference Code *</label>
                  <input
                    type="text"
                    required
                    value={factSourceRef}
                    onChange={(e) => setFactSourceRef(e.target.value)}
                    placeholder="e.g. REP-2026-68"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner / Department *</label>
                  <input
                    type="text"
                    required
                    value={factOwner}
                    onChange={(e) => setFactOwner(e.target.value)}
                    placeholder="e.g. Product Marketing"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source URL (Optional)</label>
                  <input
                    type="url"
                    value={factSourceUrl}
                    onChange={(e) => setFactSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFactModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm"
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
