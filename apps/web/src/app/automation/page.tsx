'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Shield,
  AlertTriangle,
  Scale,
  Clock,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Lock,
  Terminal,
  Activity,
  FileText,
  Sliders,
  Folder,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCheck,
  X,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  AgentStatus,
  AgentScanResponse,
  WarningItem,
  PolicyProposalResponse,
  ProposedRuleItem,
} from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function AutomationAgentPage() {
  const { workspaceId, activeProduct } = useRole();
  const { success, error: toastError } = useToast();

  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // AI Policy & Brand Rule Architect state (with Human Approval Step)
  const [policyPrompt, setPolicyPrompt] = useState(
    "Never say 'guaranteed 100% returns', suggest 'proven performance' instead"
  );
  const [isProposing, setIsProposing] = useState(false);
  const [proposal, setProposal] = useState<PolicyProposalResponse | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);

  // Automation Pipeline Toggles
  const [continuousInterceptor, setContinuousInterceptor] = useState(true);
  const [autoRemediation, setAutoRemediation] = useState(true);
  const [regulatoryShield, setRegulatoryShield] = useState(true);
  const [factDriftSentry, setFactDriftSentry] = useState(true);

  // Interactive Agent Sandbox
  const [testText, setTestText] = useState(
    'Get guaranteed results with our cheap cloud platform! Pineco guarantees 100% automated regulatory sign-off without human review and increases sales by 9000%.'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AgentScanResponse | null>(null);
  const [copiedRemediation, setCopiedRemediation] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getAgentStatus();
      setAgentStatus(res);
    } catch (err: any) {
      console.warn('Could not load agent status, using baseline fallback', err);
      setAgentStatus({
        status: 'ACTIVE_STANDBY',
        mode: 'continuous_sentinel',
        llm_provider: 'xAI Grok-2 (Autonomous)',
        model: 'grok-2-latest',
        latency_ms: 42.5,
        active_sentinel: true,
        autonomous_remediation: true,
        supported_warning_tiers: [
          'CRITICAL_LEGAL',
          'REGULATORY_SENSITIVITY',
          'FACTUAL_CONTRADICTION',
          'EXPIRED_EVIDENCE',
          'TRADEMARK_SENSITIVITY',
        ],
        capabilities: [
          'Pre-flight regulatory compliance audit',
          'Zero-shot corporate fact cross-examination',
          'Deterministic prohibited term interception',
          'Autonomous compliant candidate rewriting',
          'Safe-harbor forward-looking disclaimer enforcement',
        ],
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  // AI Policy Proposal Generator
  const handleGenerateProposal = async () => {
    if (!policyPrompt.trim()) return;
    setIsProposing(true);
    setApprovalSuccess(false);
    try {
      const res = await api.proposePolicy({
        prompt: policyPrompt.trim(),
        product_id: activeProduct?.id || null,
        workspace_id: workspaceId,
      });
      setProposal(res);
      success(
        'Policy Proposal Ready',
        'Review the drafted rules below and decide whether to approve or discard.'
      );
    } catch (err: any) {
      toastError('Proposal Generation Failed', err.message || 'Error drafting policy');
    } finally {
      setIsProposing(false);
    }
  };

  // Human Approval Step Execution
  const handleApproveProposal = async () => {
    if (!proposal) return;
    setIsApproving(true);
    try {
      let createdRulesCount = 0;
      let createdFactsCount = 0;

      // Commit rules
      for (const rule of proposal.rules) {
        await api.createRule({
          name: rule.name,
          category: rule.category || 'Brand Governance',
          description: rule.description || rule.explanation,
          pattern: rule.pattern,
          preferred_replacement: rule.preferred_replacement || undefined,
          severity: rule.severity || 'HIGH',
          channel_scope: 'all',
          enabled: true,
          workspace_id: workspaceId,
          product_id: activeProduct?.id || undefined,
        });
        createdRulesCount++;
      }

      // Commit facts if any
      for (const fact of proposal.facts) {
        await api.createFact({
          statement: fact.statement,
          source_title: fact.source_title,
          source_reference: fact.source_reference,
          owner: fact.owner || 'AI Agent',
          approval_status: 'approved',
          workspace_id: workspaceId,
          product_id: activeProduct?.id || undefined,
        });
        createdFactsCount++;
      }

      const totalCommitted = createdRulesCount + createdFactsCount;
      setApprovedCount(totalCommitted);
      setApprovalSuccess(true);
      setProposal(null);
      success(
        'Approved & Committed!',
        `Successfully added ${createdRulesCount} rule(s) to ${activeProduct?.name || 'Brand Guidelines'}.`
      );
    } catch (err: any) {
      toastError('Failed to Commit Rules', err.message || 'Error saving approved rules');
    } finally {
      setIsApproving(false);
    }
  };

  // Discard / Reject Proposal
  const handleDiscardProposal = () => {
    setProposal(null);
    setApprovalSuccess(false);
    success('Proposal Discarded', 'No changes were made to brand rules.');
  };

  const handleRunAgent = async () => {
    if (!testText.trim()) return;
    setIsScanning(true);
    try {
      const res = await api.scanWithAgent({
        text: testText,
        title: 'Autonomous Sentinel Scan',
        channel: 'marketing_draft',
        product_id: activeProduct?.id || null,
        workspace_id: workspaceId,
      });
      setScanResult(res);
      success('Agent Audit Complete', `Identified ${res.warnings.length} warning(s) in ${res.execution_ms}ms`);
    } catch (err: any) {
      toastError('Agent Scan Failed', err.message || 'Error executing agent scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyRemediation = () => {
    if (!scanResult?.remediated_text) return;
    navigator.clipboard.writeText(scanResult.remediated_text);
    setCopiedRemediation(true);
    success('Remediated Text Copied', 'Compliant copy placed on clipboard');
    setTimeout(() => setCopiedRemediation(false), 2000);
  };

  const handlePreset = (type: 'violation' | 'clean' | 'unverified') => {
    if (type === 'violation') {
      setTestText(
        'Get guaranteed results with our cheap cloud platform! Pineco guarantees 100% automated regulatory sign-off without human review.'
      );
    } else if (type === 'clean') {
      setTestText(
        'Pineco delivers enterprise brand governance combining deterministic rule enforcement with conservative fact verification.\n\nPast performance is not indicative of future results.'
      );
    } else {
      setTestText(
        'Our software platform automatically cuts operational overhead by 88% and guarantees a 5x revenue increase within 30 days.'
      );
    }
    setScanResult(null);
  };

  const setSamplePrompt = (text: string) => {
    setPolicyPrompt(text);
    setProposal(null);
    setApprovalSuccess(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header (60% White / 30% Black / 10% Purple) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs border border-purple-500/30">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">
              AI Governance Agent & Automation
            </h1>
            <span className="text-[10px] font-mono bg-purple-50 border border-purple-200 text-purple-700 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Folder className="w-3 h-3 text-purple-600" />
              <span>{activeProduct?.name || 'All Workspaces'}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Autonomous pre-flight governance sentinels, AI policy generation with human sign-off, and automated candidate rewriting.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={loadStatus}
            disabled={loadingStatus}
            className="flex items-center space-x-1.5 text-xs text-neutral-600 hover:text-black border border-neutral-300 hover:border-black bg-white px-3 py-2 rounded-xl transition font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Telemetry</span>
          </button>
          <div className="flex items-center space-x-2 bg-purple-50/80 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-purple-950">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>ACTIVE SENTINEL</span>
          </div>
        </div>
      </div>

      {/* FEATURE 1: AI POLICY ARCHITECT WITH FULL HUMAN APPROVAL STEP */}
      <div className="bg-white rounded-2xl border-2 border-black p-6 space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                Human-in-the-Loop Automation
              </span>
              <span className="text-xs text-neutral-300 font-mono">•</span>
              <span className="text-xs font-mono text-neutral-500 font-bold">
                Product Scope: {activeProduct?.name || 'General Workspace'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-black tracking-tight mt-1 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>AI Policy & Brand Rule Architect</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Describe any rule, forbidden term, or disclaimer in plain English. The AI agent drafts structured rules and presents a <strong className="text-black">full approval step</strong> before anything is added to your brand guidelines.
            </p>
          </div>

          <Link
            href="/knowledge"
            className="text-xs font-bold text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>View Current Rules &rarr;</span>
          </Link>
        </div>

        {/* Input prompt & preset chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-800 uppercase font-mono tracking-wider">
              Instruction Prompt for AI Agent:
            </label>
            <span className="text-[11px] text-purple-600 font-mono font-semibold">
              Natural Language &rarr; Strict Regex & Replacement
            </span>
          </div>

          <textarea
            value={policyPrompt}
            onChange={(e) => setPolicyPrompt(e.target.value)}
            rows={3}
            placeholder="e.g., Never use 'guaranteed 100% returns', suggest 'proven performance' instead..."
            className="w-full p-3.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none text-xs font-mono leading-relaxed text-black bg-neutral-50/50"
          />

          {/* Quick-select prompt suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-500 font-mono font-semibold">Try examples:</span>
            <button
              type="button"
              onClick={() =>
                setSamplePrompt("Never say 'guaranteed 100% returns', suggest 'proven performance' instead")
              }
              className="text-[11px] font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 border border-neutral-200 hover:border-purple-200 px-2.5 py-1 rounded-lg transition"
            >
              Prohibit &quot;guaranteed 100%&quot;
            </button>
            <button
              type="button"
              onClick={() =>
                setSamplePrompt("Forbid calling competitors 'inferior' or 'slow', suggest 'market alternative'")
              }
              className="text-[11px] font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 border border-neutral-200 hover:border-purple-200 px-2.5 py-1 rounded-lg transition"
            >
              Anti-disparagement rule
            </button>
            <button
              type="button"
              onClick={() =>
                setSamplePrompt("Require mandatory disclaimer: 'Terms and conditions apply to all promotional offers.'")
              }
              className="text-[11px] font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 border border-neutral-200 hover:border-purple-200 px-2.5 py-1 rounded-lg transition"
            >
              Mandatory promotion disclaimer
            </button>
            <button
              type="button"
              onClick={() =>
                setSamplePrompt("Never mention 'cheap software', always recommend 'cost-effective enterprise platform'")
              }
              className="text-[11px] font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 border border-neutral-200 hover:border-purple-200 px-2.5 py-1 rounded-lg transition"
            >
              Upgrade &quot;cheap&quot; terminology
            </button>
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleGenerateProposal}
              disabled={isProposing || !policyPrompt.trim()}
              className="flex items-center space-x-2 bg-black hover:bg-neutral-900 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs active:scale-95 hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)]"
            >
              {isProposing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Agent Drafting Rule Proposal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Draft Policy Proposal with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SUCCESS CONFIRMATION BANNER */}
        {approvalSuccess && (
          <div className="p-4 rounded-xl bg-purple-50/80 border-2 border-purple-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCheck className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider font-mono">
                  Rules Approved & Activated
                </span>
                <p className="text-xs text-purple-800">
                  Successfully committed {approvedCount} item(s) to <strong className="text-black">{activeProduct?.name || 'Brand Guidelines'}</strong>. Any draft scanned in this product will now automatically be audited against these rules.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Link
                href="/knowledge"
                className="text-xs font-bold bg-black text-white hover:bg-neutral-900 px-3.5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.3)]"
              >
                <span>View Guidelines</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
              </Link>
            </div>
          </div>
        )}

        {/* FULL APPROVAL STEP CARD */}
        {proposal && (
          <div className="mt-4 p-5 rounded-xl border-2 border-purple-600 bg-purple-50/20 space-y-5 animate-in fade-in duration-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    Approval Step Required
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Pending Human Sign-Off
                  </span>
                </div>
                <h3 className="text-sm font-black text-black">
                  Review AI Proposal Before Adding to Rules
                </h3>
                <p className="text-xs text-neutral-600">
                  {proposal.summary}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleDiscardProposal}
                  disabled={isApproving}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-300 bg-white hover:bg-neutral-100 px-3 py-2 rounded-xl transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  onClick={handleApproveProposal}
                  disabled={isApproving}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-black hover:bg-neutral-900 px-4 py-2 rounded-xl transition shadow-xs hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.4)]"
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>Saving to Guidelines...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <span>Approve & Add to Brand Rules</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Proposed Rules Grid */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-black block">
                Proposed Brand Rules ({proposal.rules.length}):
              </span>

              {proposal.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-black">{rule.name}</span>
                      <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded">
                        {rule.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black text-white">
                      Severity: {rule.severity}
                    </span>
                  </div>

                  {/* Pattern & Replacement breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block mb-1">
                        Forbidden Term / Pattern:
                      </span>
                      <span className="text-black font-bold">&quot;{rule.pattern}&quot;</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="text-purple-700 text-[10px] uppercase font-bold block mb-1">
                        Approved Replacement:
                      </span>
                      <span className="text-purple-950 font-bold">
                        {rule.preferred_replacement ? `"${rule.preferred_replacement}"` : '(Prohibit without direct replacement)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-600 pt-1 leading-relaxed">
                    <strong className="text-black">Compliance Rationale: </strong>
                    {rule.explanation || rule.description}
                  </p>
                </div>
              ))}

              {/* Proposed Facts if any */}
              {proposal.facts && proposal.facts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-black block">
                    Associated Verified Facts ({proposal.facts.length}):
                  </span>
                  {proposal.facts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1 text-xs"
                    >
                      <p className="font-semibold text-black">&quot;{fact.statement}&quot;</p>
                      <div className="text-[10px] text-neutral-500 font-mono flex items-center space-x-2">
                        <span>Source: {fact.source_title}</span>
                        <span>•</span>
                        <span>Ref: {fact.source_reference}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Approval Action Bar */}
            <div className="pt-3 border-t border-purple-200 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Clicking &quot;Approve&quot; saves this directly into Brand Guidelines for {activeProduct?.name || 'your workspace'}.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDiscardProposal}
                  disabled={isApproving}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-300 bg-white rounded-xl transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleApproveProposal}
                  disabled={isApproving}
                  className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-900 rounded-xl transition shadow-xs flex items-center space-x-1.5 hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.4)]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Approve & Add to Brand Rules</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Automation Pipelines Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Configurable Autonomous Pipelines</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Enable continuous background inspection sentinels for this product workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Pipeline 1 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-black block">Continuous Ingestion Interceptor</span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Pre-audits every incoming draft against deterministic regex rules prior to human reviewer assignment.
              </p>
            </div>
            <button
              onClick={() => setContinuousInterceptor(!continuousInterceptor)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                continuousInterceptor ? 'bg-purple-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  continuousInterceptor ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Pipeline 2 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-black block">Auto-Remediation Copilot</span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Automatically rewrites flagged sentences with brand-approved terminology and injected disclaimers.
              </p>
            </div>
            <button
              onClick={() => setAutoRemediation(!autoRemediation)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                autoRemediation ? 'bg-purple-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  autoRemediation ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Pipeline 3 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-black block">Regulatory Pre-Flight Warning Shield</span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Detects high-liability claims lacking mandatory safe harbor disclosures or quantitative proof.
              </p>
            </div>
            <button
              onClick={() => setRegulatoryShield(!regulatoryShield)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                regulatoryShield ? 'bg-purple-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  regulatoryShield ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Pipeline 4 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-black block">Stale Fact & Rule Drift Sentry</span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Flags statements referencing corporate evidence older than 90 days or past their approved validity window.
              </p>
            </div>
            <button
              onClick={() => setFactDriftSentry(!factDriftSentry)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                factDriftSentry ? 'bg-purple-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  factDriftSentry ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Tier Pre-Flight Warning Matrix */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-purple-600" />
            <span>Pre-Flight Warning Severity Matrix</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pineco classifies non-compliant copy into five deterministic warning tiers before human sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded block w-fit">
              CRITICAL_LEGAL
            </span>
            <span className="text-xs font-bold text-black block">Absolute Guarantees</span>
            <p className="text-[11px] text-neutral-500">
              Terms like &quot;100% guarantee&quot;, &quot;foolproof&quot;, or &quot;zero risk&quot;.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/20 space-y-1">
            <span className="text-[10px] font-mono font-bold bg-purple-100 border border-purple-300 text-purple-900 px-1.5 py-0.5 rounded block w-fit">
              REGULATORY_SENSITIVITY
            </span>
            <span className="text-xs font-bold text-black block">Missing Disclaimers</span>
            <p className="text-[11px] text-neutral-500">
              Forward-looking statements lacking required safe-harbor disclosures.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded block w-fit">
              FACTUAL_CONTRADICTION
            </span>
            <span className="text-xs font-bold text-black block">Direct Conflicts</span>
            <p className="text-[11px] text-neutral-500">
              Claims contradicting approved corporate database benchmarks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded block w-fit">
              EXPIRED_EVIDENCE
            </span>
            <span className="text-xs font-bold text-black block">Stale Fact Evidence</span>
            <p className="text-[11px] text-neutral-500">
              Evidence sources past their validity expiration timestamp.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded block w-fit">
              TRADEMARK_SENSITIVITY
            </span>
            <span className="text-xs font-bold text-black block">Improper Casing</span>
            <p className="text-[11px] text-neutral-500">
              Brand names written in lowercase or missing registered marks.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive AI Agent Sandbox & Remediation Studio */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider font-mono flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              <span>Interactive Autonomous Agent Sandbox</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Test the AI agent against draft copy to observe real-time warning generation and automated candidate rewriting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-neutral-400 font-mono">Presets:</span>
            <button
              onClick={() => handlePreset('violation')}
              className="text-xs font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition"
            >
              Violation Sample
            </button>
            <button
              onClick={() => handlePreset('clean')}
              className="text-xs font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition"
            >
              Clean Sample
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            placeholder="Paste draft marketing copy here to execute autonomous agent scan..."
            className="w-full p-4 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none text-xs font-mono leading-relaxed text-black bg-neutral-50/50"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-400 font-mono">
              Characters: {testText.length} • Scoped to {activeProduct?.name || 'Workspace'}
            </span>

            <button
              onClick={handleRunAgent}
              disabled={isScanning || !testText.trim()}
              className="flex items-center space-x-2 bg-black hover:bg-neutral-900 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs active:scale-95 hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)]"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Agent Auditing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute AI Agent Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agent Results Display */}
        {scanResult && (
          <div className="mt-6 pt-6 border-t border-neutral-200 space-y-6 animate-in fade-in duration-200">
            {/* Header Telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-purple-50/40 border border-purple-200 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-black">
                  Compliance Score: <strong className="text-purple-700">{scanResult.compliance_score.toFixed(0)}%</strong>
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-600">
                  Latency: {scanResult.execution_ms} ms
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-600">
                  Warnings: {scanResult.warnings.length}
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-900">
                {scanResult.summary}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Warnings List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <span className="text-xs font-bold text-black uppercase tracking-wider font-mono block">
                  Generated Warnings ({scanResult.warnings.length})
                </span>

                {scanResult.warnings.length === 0 ? (
                  <div className="p-6 rounded-xl border border-neutral-200 text-center space-y-2 bg-white">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 mx-auto" />
                    <span className="text-xs font-bold text-black block">Zero Policy Warnings</span>
                    <p className="text-[11px] text-neutral-500">
                      Copy satisfies all deterministic policies, mandatory disclaimers, and corporate evidence requirements.
                    </p>
                  </div>
                ) : (
                  scanResult.warnings.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 hover:border-purple-400 transition shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded">
                          {w.category}
                        </span>
                        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                          Severity: {w.severity}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-black block">
                        {w.title}
                      </span>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        {w.explanation}
                      </p>
                      <div className="pt-2 border-t border-neutral-100 text-[11px] font-mono text-black">
                        <span className="text-purple-600 font-bold">Action: </span>
                        {w.recommended_action}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Remediated Copy Studio (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black uppercase tracking-wider font-mono">
                    Autonomous Remediated Copy
                  </span>
                  <button
                    onClick={handleCopyRemediation}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center space-x-1"
                  >
                    {copiedRemediation ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Remediated Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 font-mono text-xs leading-relaxed text-black min-h-[140px] whitespace-pre-wrap">
                  {scanResult.remediated_text}
                </div>

                {/* Diff Summary Operations */}
                {scanResult.diff_summary.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono uppercase font-bold text-neutral-400 block">
                      Autonomous Diff Operations:
                    </span>
                    {scanResult.diff_summary.map((diff, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-neutral-800 bg-white p-2 rounded-lg border border-neutral-200 font-mono flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>{diff}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
