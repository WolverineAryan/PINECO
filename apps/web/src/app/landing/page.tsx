'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Lock,
  GitBranch,
  Layers,
  Search,
  Check,
  ChevronRight,
  UserCheck,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { AuthModal } from '@/components/AuthModal';

export default function LandingPage() {
  const { openAuthModal, loginWithRole } = useRole();
  const [activeTab, setActiveTab] = useState<'violations' | 'compliant'>('violations');

  return (
    <div className="space-y-24 py-6">
      <AuthModal />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-10">
        <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-800 shadow-sm animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">AI Governance Platform</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">Enterprise Brand Governance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
          Before You Publish Marketing Copy,{' '}
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 bg-clip-text text-transparent">
            Prove Every Claim.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Pineco intercepts enterprise content before publication. It couples <strong>deterministic brand policies</strong> and mandatory legal disclaimers with <strong>conservative AI claim verification</strong> against verified corporate facts.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition duration-150"
          >
            <span>Launch CRM Workspace</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs px-5 py-3 rounded-xl shadow-sm transition"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Sign In / Register (JWT)</span>
          </button>
        </div>

        {/* Live Interactive Scan Demo Card */}
        <div className="pt-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden text-left max-w-3xl mx-auto">
            {/* Window Header */}
            <div className="bg-slate-950 text-slate-300 px-5 py-3 flex items-center justify-between text-xs border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 text-[11px] ml-2">Pineco Governance Core v1.0 — Live Inspector</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setActiveTab('violations')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                    activeTab === 'violations' ? 'bg-slate-800 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Violation Sample
                </button>
                <button
                  onClick={() => setActiveTab('compliant')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                    activeTab === 'compliant' ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Compliant Sample
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 space-y-4 text-xs">
              {activeTab === 'violations' ? (
                <>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 font-mono leading-relaxed text-slate-800 text-xs">
                    Get{' '}
                    <span className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded font-bold border border-rose-200">
                      guaranteed results
                    </span>{' '}
                    with our{' '}
                    <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold border border-amber-200">
                      cheap
                    </span>{' '}
                    software! Pineco{' '}
                    <span className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded font-bold border border-rose-200">
                      guarantees 100% automated regulatory sign-off without human review
                    </span>{' '}
                    and increases sales by{' '}
                    <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold border border-amber-200">
                      9000%
                    </span>
                    !
                  </div>

                  {/* Findings Breakdown */}
                  <div className="space-y-2 pt-1">
                    <div className="bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Prohibited Term: &apos;guaranteed results&apos;</span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Deterministic Rule #001: Brand policy forbids absolute marketing guarantees. Recommended replacement: <em>&apos;proven approach&apos;</em>.
                        </p>
                      </div>
                    </div>

                    <div className="bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Contradicts Legal Policy: &apos;automated regulatory sign-off&apos;</span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Directly conflicts with Corporate Legal Charter (Ref: LEG-POL-2026): Pineco is strictly advisory and never provides automatic legal sign-off.
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Unverified Claim: &apos;9000% sales increase&apos;</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          No approved benchmark evidence found in database. <em>Evidence before assertion:</em> unbacked claims are flagged for human review.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/80 font-mono leading-relaxed text-slate-800 text-xs">
                    Our platform provides an accessible, cost-effective proven approach to enterprise brand governance. Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. Past performance is not indicative of future results.
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Claim Supported by Approved Evidence</span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Verified against &apos;Enterprise Benchmark Report 2026&apos; (Ref: REP-2026-68, Owner: Product Marketing).
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Mandatory Regulatory Disclaimer Present</span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Matches required forward-looking performance disclaimer. 100% Policy Compliant.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Bar */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {activeTab === 'violations' ? 'Status: 4 Actionable Issues Found' : 'Status: 100% Compliant & Sign-Off Ready'}
              </span>
              <Link
                href="/submissions/sub-demo-violation"
                className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center space-x-1"
              >
                <span>Inspect in Full Dashboard &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How Pineco Works: 3-Step Enterprise Workflow */}
      <section className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">The Governance Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            How Pineco Protects Your Brand in 3 Steps
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminate compliance bottlenecks and reputational risk with an automated, auditable chain of custody.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-950">Draft & SHA-256 Hashing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators submit marketing, PR, or social copy. Pineco immediately computes a SHA-256 cryptographic hash, creating an immutable Version 1 record.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-950">Dual Guardrail Scan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deterministic engines scan for prohibited terms and required disclaimers. In parallel, strict AI models check factual claims against verified corporate truth.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-950">Human Sign-off & Audit Log</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reviewers inspect explainable findings, request revisions, or approve the exact version. Overrides strictly require written rationales saved to the audit log.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Pillars Matrix */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 max-w-5xl mx-auto shadow-sm space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">Core Architecture</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Engineered for Enterprise Risk, Legal & Marketing Alignment
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Evidence Before Assertion</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Missing evidence means <em>Unverified</em>, not false. Hallucinated or invented fact IDs from LLMs are discarded at the database boundary.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <GitBranch className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Immutable Versioning</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every revision generates an explicit new version without overwriting past iterations. Approvals strictly bind only to the reviewed version.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <Lock className="w-4 h-4 text-slate-800" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Cryptographic JWT RBAC</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Backend verifies signed JWT bearer tokens for every mutation. Enforces workspace isolation and role permissions server-side.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <BarChart3 className="w-4 h-4 text-teal-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Telemetry & Audit Trail</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every review decision, override rationale, and policy edit is recorded in an immutable, append-only compliance timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 border border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Ready to Test Pineco Live?
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Switch between Creator, Reviewer, and Brand Manager personas instantly to test deterministic rules and AI fact verification.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-3">
          <Link
            href="/"
            className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow"
          >
            Enter Main Dashboard &rarr;
          </Link>
          <button
            onClick={openAuthModal}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs px-5 py-3 rounded-xl transition"
          >
            Select Persona (JWT)
          </button>
        </div>
      </section>
    </div>
  );
}
