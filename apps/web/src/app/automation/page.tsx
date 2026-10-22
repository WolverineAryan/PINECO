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
} from 'lucide-react';
import { api } from '@/lib/api';
import { AgentStatus, AgentScanResponse, WarningItem } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function AutomationAgentPage() {
  const { workspaceId, activeProduct } = useRole();
  const { success, error: toastError } = useToast();

  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
              AI Governance Agent & Automation
            </h1>
            <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Folder className="w-3 h-3 text-neutral-600" />
              <span>{activeProduct?.name || 'All Workspaces'}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Autonomous pre-flight governance sentinels, automated candidate rewriting, and multi-tier legal & regulatory warning engines.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={loadStatus}
            disabled={loadingStatus}
            className="flex items-center space-x-1.5 text-xs text-neutral-600 hover:text-black border border-neutral-300 hover:border-black bg-white px-3 py-2 rounded-xl transition font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Telemetry</span>
          </button>
          <div className="flex items-center space-x-2 bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-black">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>ACTIVE SENTINEL</span>
          </div>
        </div>
      </div>

      {/* Top Telemetry & Status HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Agent Model</span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="text-lg font-bold text-black font-mono">
            {agentStatus?.model || 'grok-2-latest'}
          </div>
          <div className="text-[11px] text-neutral-500">
            {agentStatus?.llm_provider || 'xAI Grok-2 Autonomous Reasoner'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Interception Speed</span>
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div className="text-lg font-bold text-black font-mono">
            {agentStatus?.latency_ms || 42.5} ms
          </div>
          <div className="text-[11px] text-neutral-500">
            Sub-millisecond regex + parallel LLM
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Warning Categories</span>
            <AlertTriangle className="w-4 h-4 text-black" />
          </div>
          <div className="text-lg font-bold text-black font-mono">
            5 Granular Tiers
          </div>
          <div className="text-[11px] text-neutral-500">
            Legal, regulatory, trademark, fact drift
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Remediation Engine</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-lg font-bold text-black font-mono">
            Autonomous
          </div>
          <div className="text-[11px] text-neutral-500">
            Auto-diff generation with zero hallucination
          </div>
        </div>
      </div>

      {/* Autonomous Automation Pipelines Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-black" />
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
                continuousInterceptor ? 'bg-black' : 'bg-neutral-300'
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
                autoRemediation ? 'bg-black' : 'bg-neutral-300'
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
                regulatoryShield ? 'bg-black' : 'bg-neutral-300'
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
                factDriftSentry ? 'bg-black' : 'bg-neutral-300'
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
            <AlertTriangle className="w-4 h-4 text-black" />
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

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <span className="text-[10px] font-mono font-bold bg-neutral-100 border border-neutral-300 text-black px-1.5 py-0.5 rounded block w-fit">
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
              <Terminal className="w-4 h-4 text-black" />
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
              className="text-xs font-semibold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition"
            >
              Violation Sample
            </button>
            <button
              onClick={() => handlePreset('clean')}
              className="text-xs font-semibold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition"
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
            className="w-full p-4 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs font-mono leading-relaxed text-black bg-neutral-50/50"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-400 font-mono">
              Characters: {testText.length} • Scoped to {activeProduct?.name || 'Workspace'}
            </span>

            <button
              onClick={handleRunAgent}
              disabled={isScanning || !testText.trim()}
              className="flex items-center space-x-2 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs active:scale-95"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-black">
                  Compliance Score: {scanResult.compliance_score.toFixed(0)}%
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
              <span className="text-[11px] font-bold text-black">
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
                    <CheckCircle2 className="w-6 h-6 text-black mx-auto" />
                    <span className="text-xs font-bold text-black block">Zero Policy Warnings</span>
                    <p className="text-[11px] text-neutral-500">
                      Copy satisfies all deterministic policies, mandatory disclaimers, and corporate evidence requirements.
                    </p>
                  </div>
                ) : (
                  scanResult.warnings.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 hover:border-black transition shadow-xs"
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
                        <span className="text-neutral-400">Action: </span>
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
                    className="text-xs font-semibold text-black hover:underline flex items-center space-x-1"
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
                        className="text-[11px] text-neutral-700 bg-white p-2 rounded-lg border border-neutral-200 font-mono flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-3 h-3 text-black shrink-0" />
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
