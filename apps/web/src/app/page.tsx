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
  Cpu,
  BookOpen,
  Scale,
  Building2,
  HeartPulse,
  Briefcase,
  HelpCircle as QuestionIcon,
  ChevronDown,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';

export default function LandingPage() {
  const { openAuthModal } = useRole();
  const [activeTab, setActiveTab] = useState<'violations' | 'compliant'>('violations');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Pineco prevent AI hallucinations during fact verification?',
      a: 'Pineco implements an "Evidence before assertion" architecture. The LLM is restricted to analyzing candidate facts retrieved directly from your company’s approved database. Every fact ID returned by the model is validated against real database records; hallucinated IDs are automatically discarded and unbacked claims are conservatively labeled "Unverified".',
    },
    {
      q: 'What is the difference between deterministic rules and AI-assisted checks?',
      a: 'Deterministic rules execute exact pattern matching with Unicode normalization for non-negotiable policies like prohibited terminology and mandatory forward-looking disclaimers. AI-assisted analysis evaluates nuanced tone and semantic claim alignment against approved documentation.',
    },
    {
      q: 'Does Pineco overwrite previous content versions when a creator revises copy?',
      a: 'Never. Every edit generates an immutable new version (v1, v2, v3) bound to a SHA-256 cryptographic hash. Prior versions, review findings, and reviewer rationales remain preserved in the permanent compliance audit ledger.',
    },
    {
      q: 'Can reviewers override a flagged policy violation?',
      a: 'Yes, human reviewers can override specific findings or approve a version despite warnings, but the system strictly mandates a written business rationale that is permanently recorded in the audit trail.',
    },
    {
      q: 'Is our submitted marketing copy used to train external public AI models?',
      a: 'No. Pineco operates on an enterprise zero-retention model. Copy is only evaluated in-memory against your workspace guidelines through secure HTTPS server-to-server endpoints and is never utilized for public foundation model training.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Landing Navbar */}
      <nav className="h-20 border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo-mark.jpg"
              alt="Pineco"
              className="w-10 h-10 rounded-xl object-contain border border-neutral-200 shadow-xs"
            />
            <img
              src="/logo-text.png"
              alt="PINECO"
              className="h-5.5 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-neutral-600">
            <a href="#how-it-works" className="hover:text-black transition">How It Works</a>
            <a href="#inspector" className="hover:text-black transition">Live Inspector</a>
            <a href="#features" className="hover:text-black transition">Governance Engine</a>
            <a href="#security" className="hover:text-black transition">Security & Trust</a>
            <a href="#faq" className="hover:text-black transition">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openAuthModal}
              className="text-xs font-bold text-black hover:bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-xl transition"
            >
              Sign In
            </button>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-14 pb-20 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-6">
        {/* Full Brand Logo Banner */}
        <div className="flex justify-center mb-2">
          <img
            src="/logo-full.jpg"
            alt="Pineco"
            className="w-44 sm:w-52 h-auto object-contain rounded-2xl border border-neutral-200 shadow-xs"
          />
        </div>

        <div className="inline-flex items-center space-x-2 bg-neutral-50 border border-neutral-200 px-4 py-1.5 rounded-full text-xs font-mono text-black shadow-xs">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span className="font-bold">Enterprise Brand Governance Platform</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500">CodeAxis Round 2</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.08] max-w-4xl mx-auto">
          Before You Publish Marketing Copy,{' '}
          <span className="underline decoration-neutral-300 underline-offset-8">
            Prove Every Claim.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Pineco intercepts enterprise marketing, PR, and social copy before publication. It couples <strong>deterministic rule guardrails</strong> and mandatory disclaimers with <strong>conservative AI claim verification</strong> against approved corporate facts.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-sm hover:shadow-md transition active:scale-95"
          >
            <span>Explore Demo Workspace</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-black font-bold text-sm px-6 py-3.5 rounded-xl shadow-xs transition"
          >
            <UserCheck className="w-4 h-4 text-black" />
            <span>Persona Access (JWT)</span>
          </button>
        </div>

        {/* Live Metrics Highlights */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#000000] font-mono block">68%</span>
            <span className="text-xs text-slate-500 font-medium">Faster Review Velocity</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#000000] font-mono block">0</span>
            <span className="text-xs text-slate-500 font-medium">Unverified Claims Published</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#000000] font-mono block">100%</span>
            <span className="text-xs text-slate-500 font-medium">SHA-256 Version Traceability</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#000000] font-mono block">2.0s</span>
            <span className="text-xs text-slate-500 font-medium">Deterministic Engine Latency</span>
          </div>
        </div>
      </section>

      {/* Live Interactive Review Inspector Card */}
      <section id="inspector" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Interactive Sandbox</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000]">
            See Pineco Governance in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Toggle between an unvetted draft copy containing brand violations and a vetted compliant draft.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#000000] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-black">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
              <span className="font-mono text-slate-300 font-semibold text-[11px]">
                Pineco Live Audit Inspector v1.0
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-black/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('violations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  activeTab === 'violations' ? 'bg-black text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Violation Sample
              </button>
              <button
                onClick={() => setActiveTab('compliant')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  activeTab === 'compliant' ? 'bg-black text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compliant Sample
              </button>
            </div>
          </div>

          {/* Inspector Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {activeTab === 'violations' ? (
              <>
                <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] font-mono text-xs sm:text-sm leading-relaxed text-[#000000]">
                  Get{' '}
                  <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold border border-rose-300">
                    guaranteed results
                  </span>{' '}
                  with our{' '}
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                    cheap
                  </span>{' '}
                  software! Pineco{' '}
                  <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold border border-rose-300">
                    guarantees 100% automated regulatory sign-off without human review
                  </span>{' '}
                  and immediately increases sales by{' '}
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                    9000%
                  </span>
                  !
                </div>

                <div className="space-y-3">
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Deterministic Rule Violation: &apos;guaranteed results&apos;</span>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        Brand Policy #001 prohibits absolute marketing guarantees. Recommended replacement: <em>&apos;proven approach&apos;</em>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Contradicts Corporate Legal Ground Truth: &apos;automated regulatory sign-off&apos;</span>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        Direct conflict with Corporate Legal Charter (Ref: LEG-POL-2026): Pineco is strictly advisory and NEVER issues automated regulatory sign-off without certified human review.
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Unverified Claim: &apos;9000% sales increase&apos;</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        No approved statistical or benchmark evidence found in database. Under Pineco&apos;s <em>Evidence Before Assertion</em> principle, unverified quantitative claims are held for human review.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#000000]/80 font-mono text-xs sm:text-sm leading-relaxed text-[#000000]">
                  Our platform provides an accessible and cost-effective proven approach to enterprise brand governance. Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. Past performance is not indicative of future results.
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Quantitative Claim Verified by Ground Truth</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Verified against approved &apos;Enterprise Benchmark Report 2026&apos; (Ref: REP-2026-68, Owner: Product Marketing).
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Mandatory Regulatory Disclaimer Present</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Matches required forward-looking disclaimer rule #003. 100% Policy Compliant.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-[#FFFFFF] px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
            <span className="text-slate-600 font-mono text-[11px]">
              {activeTab === 'violations' ? '4 Actionable Issues Intercepted' : '0 Violations • Ready for Reviewer Sign-off'}
            </span>
            <Link
              href="/dashboard"
              className="font-bold text-[#000000] hover:underline flex items-center space-x-1"
            >
              <span>Test in Full Platform &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The 4-Step Chain of Custody */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">End-To-End Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#000000]">
            The 4-Step Governance Chain of Custody
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            How Pineco eliminates approval bottlenecks and protects brand reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center">
              01
            </div>
            <h3 className="text-sm font-bold text-[#000000]">Cryptographic Ingestion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creator submits marketing, PR, or social copy. Pineco computes a SHA-256 hash, creating an immutable Version 1 record.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center">
              02
            </div>
            <h3 className="text-sm font-bold text-[#000000]">Deterministic Guardrails</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rules engine checks prohibited terms, suggested phrasing, and required disclaimers with exact character offsets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center">
              03
            </div>
            <h3 className="text-sm font-bold text-[#000000]">Conservative Fact Proof</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Claims are classified as Supported, Contradicted, or Unverified. Hallucinated IDs are discarded at the database boundary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center">
              04
            </div>
            <h3 className="text-sm font-bold text-[#000000]">Human Decision & Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reviewer approves or requests revisions. Overrides strictly require written rationales logged in an append-only audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Why Conventional Compliance Fails vs Pineco */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 sm:p-12 shadow-sm space-y-10">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">The Problem We Solve</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000] mt-1">
              Why Traditional Brand Compliance Breaks Down at Scale
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] space-y-2">
              <span className="text-xs font-mono font-bold text-rose-600 uppercase">Conventional Approach</span>
              <h4 className="text-sm font-bold text-[#000000]">Static 80-Page PDF Style Guides</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Marketing teams cannot memorize 80-page brand PDF manuals. Rules are ignored, resulting in inconsistent terminology and legal exposure.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#000000] space-y-2 shadow-sm">
              <span className="text-xs font-mono font-bold text-[#000000] uppercase">The Pineco Way</span>
              <h4 className="text-sm font-bold text-[#000000]">Active Deterministic Rule Interception</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rules live as structured database policies evaluated in real time as copy is written, offering immediate suggested corrections.
              </p>
            </div>

            <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] space-y-2">
              <span className="text-xs font-mono font-bold text-rose-600 uppercase">Conventional Approach</span>
              <h4 className="text-sm font-bold text-[#000000]">Blind AI Generation & Hallucinations</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Public LLMs invent statistics, cite fictional sources, and write misleading marketing claims with high confident tones.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#000000] space-y-2 shadow-sm">
              <span className="text-xs font-mono font-bold text-[#000000] uppercase">The Pineco Way</span>
              <h4 className="text-sm font-bold text-[#000000]">Grounded Corporate Fact Vault</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Claims are checked exclusively against approved corporate sources with validity dates. Missing evidence is flagged as Unverified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Trust Architecture */}
      <section id="security" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Enterprise Security</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000]">
            Enterprise-Grade Privacy & Guardrail Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Lock className="w-4 h-4 text-[#000000]" />
            </div>
            <h4 className="text-xs font-bold text-[#000000]">JWT Bearer RBAC</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Backend verifies cryptographically signed JWT bearer tokens for every mutation, enforcing workspace scoping.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-[#000000]" />
            </div>
            <h4 className="text-xs font-bold text-[#000000]">Prompt Injection Defense</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Submitted drafts are strictly isolated as passive data. Models cannot execute commands or alter system policies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <GitBranch className="w-4 h-4 text-[#000000]" />
            </div>
            <h4 className="text-xs font-bold text-[#000000]">Immutable Versioning</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every revision generates an explicit new version without overwriting past iterations. Approvals strictly bind only to the reviewed version.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4 text-[#000000]" />
            </div>
            <h4 className="text-xs font-bold text-[#000000]">Permanent Audit Trail</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every review decision, override rationale, and policy edit is recorded in an immutable compliance ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000]">
            Everything You Need to Know About Pineco
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#000000] hover:bg-[#FFFFFF]/80 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-[#E5E5E5]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pre-Footer Banner */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-[#000000] text-white rounded-3xl p-8 sm:p-14 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#000000]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Experience Intelligent Brand Governance?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Test the live CRM command center, create policies, and evaluate drafts with instant feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#000000] hover:bg-[#262626] text-[#000000] font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition active:scale-95"
            >
              Open Command Center &rarr;
            </Link>
            <button
              onClick={openAuthModal}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition"
            >
              Switch Persona (JWT)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] bg-white py-10 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#000000] flex items-center justify-center text-[#000000] font-bold text-xs">
              P
            </div>
            <span className="font-extrabold text-[#000000]">Pineco Brand Governance OS</span>
            <span>•</span>
            <span>CodeAxis Hackathon Round 2</span>
          </div>
          <p className="font-mono text-[11px] text-slate-400">
            60% White (#FFFFFF) • 30% Yellow (#000000) • 10% Black (#000000)
          </p>
        </div>
      </footer>
    </div>
  );
}
