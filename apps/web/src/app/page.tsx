'use client';

import React, { useState, useEffect } from 'react';
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
  BarChart3,
  ExternalLink,
  Cpu,
  BookOpen,
  Scale,
  Building2,
  HeartPulse,
  Briefcase,
  ChevronDown,
  Zap,
  Activity,
  Terminal,
  Eye,
  Fingerprint,
  Folder,
  Play,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Workflow,
  ShieldAlert,
  Clock,
  Send,
  Wand2,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function LandingPage() {
  const { openAuthModal } = useRole();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Interactive Hero Sandbox State
  const scenarios = [
    {
      id: 'saas-risk',
      label: 'High-Risk SaaS PR',
      badge: '3 Critical Violations',
      score: 42,
      text: 'Pineco is completely 100% guaranteed to eliminate all regulatory fines forever. Our revolutionary AI software guarantees 99.999% uptime with zero human review needed.',
      findings: [
        { type: 'rule', title: 'Prohibited Absolute: "100% guaranteed"', rule: 'Rule #001', desc: 'Absolute marketing guarantees violate corporate brand guidelines.' },
        { type: 'evidence', title: 'Unverified Uptime Claim: "99.999% uptime"', rule: 'Fact Grounding', desc: 'SLA ground truth in database certifies 99.9% uptime, not 99.999%.' },
        { type: 'legal', title: 'Missing Safe Harbor Disclaimer', rule: 'Policy #004', desc: 'Forward-looking statements require mandatory SEC Safe Harbor text.' },
      ],
      fixedText: 'Pineco delivers a proven, reliable enterprise platform designed to mitigate regulatory compliance risk. Our audited cloud infrastructure maintains a certified 99.9% uptime SLA. Statements regarding future performance are subject to operational conditions.',
      fixedScore: 98,
    },
    {
      id: 'fintech-claim',
      label: 'FinTech Launch Copy',
      badge: '2 Violations',
      score: 55,
      text: 'Earn completely risk-free 18% annual yields on corporate liquidity with our autonomous algorithmic treasury. Immediate liquidity is guaranteed by our partners.',
      findings: [
        { type: 'rule', title: 'Deceptive Term: "risk-free"', rule: 'SEC Rule 206', desc: 'SEC & FINRA strictly prohibit describing yield instruments as risk-free.' },
        { type: 'evidence', title: 'Unsubstantiated Rate: "18% annual yields"', rule: 'Fact #F-088', desc: 'Approved marketing facts specify variable baseline target rates, not fixed 18%.' },
      ],
      fixedText: 'Optimize corporate liquidity through our institutional treasury platform. Yields are variable based on market benchmark rates and involve capital risk. Past returns are not indicative of future performance. Terms and conditions apply.',
      fixedScore: 100,
    },
    {
      id: 'clean-enterprise',
      label: 'Verified Compliant',
      badge: 'Fully Compliant',
      score: 99,
      text: 'Pineco accelerates enterprise content review velocity by up to 68% across distributed marketing teams. Verified against Enterprise Benchmark Report 2026. Past performance is not indicative of future results.',
      findings: [],
      fixedText: 'Pineco accelerates enterprise content review velocity by up to 68% across distributed marketing teams. Verified against Enterprise Benchmark Report 2026. Past performance is not indicative of future results.',
      fixedScore: 100,
    },
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentCopy, setCurrentCopy] = useState(scenarios[0].text);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [governanceScore, setGovernanceScore] = useState(scenarios[0].score);
  const [latencyMs, setLatencyMs] = useState(42);

  // Live Ticker Simulation
  const tickerEvents = [
    { tag: 'AUDIT', text: 'Intercepted "100% guarantee" in Press Release draft #PR-401', time: '1s ago' },
    { tag: 'FACT', text: 'Verified SOC-2 Type II claim against Vault Doc #V-902', time: '4s ago' },
    { tag: 'HASH', text: 'Committed SHA-256 version hash 0x7f9a... to immutable ledger', time: '7s ago' },
    { tag: 'GATE', text: 'Reviewer Marcus V. approved revised Blog copy with rationale', time: '12s ago' },
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerEvents.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleScenarioSelect = (idx: number) => {
    setActiveScenarioIdx(idx);
    setIsFixed(false);
    setCurrentCopy(scenarios[idx].text);
    setGovernanceScore(scenarios[idx].score);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLatencyMs(Math.floor(38 + Math.random() * 25));
    }, 450);
  };

  const handleAutoFix = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCurrentCopy(scenarios[activeScenarioIdx].fixedText);
      setIsFixed(true);
      setGovernanceScore(scenarios[activeScenarioIdx].fixedScore);
      setIsScanning(false);
      setLatencyMs(64);
    }, 600);
  };

  const handleReset = () => {
    setIsFixed(false);
    setCurrentCopy(scenarios[activeScenarioIdx].text);
    setGovernanceScore(scenarios[activeScenarioIdx].score);
  };

  // Interactive ROI Calculator State
  const [submissionsPerMonth, setSubmissionsPerMonth] = useState(250);
  const [hoursPerReview, setHoursPerReview] = useState(3.5);

  const hoursSavedPerYear = Math.round(submissionsPerMonth * hoursPerReview * 0.68 * 12);
  const costSavings = Math.round(hoursSavedPerYear * 85); // $85/hr blended legal/marketing rate

  // FAQs
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
    <div className="min-h-screen bg-white text-black relative selection:bg-purple-600 selection:text-white">
      {/* Glowing Purple Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* ======================================================== */}
      {/* 1. Fluid Ambient Purple Mesh Background for entire Hero */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-monochrome opacity-50 [mask-image:radial-gradient(ellipse_at_50%_25%,black_45%,transparent_85%)]" />

        {/* Fluid morphing blobs */}
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-purple-600/25 via-violet-500/20 to-purple-400/15 blur-3xl animate-fluid-1" />
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/25 to-fuchsia-500/15 blur-3xl animate-fluid-2" />
        <div className="absolute top-96 left-1/3 w-[650px] h-[450px] rounded-full bg-gradient-to-r from-purple-700/15 via-violet-600/20 to-indigo-500/15 blur-3xl animate-fluid-3" />
        <div className="absolute top-48 inset-x-0 h-[600px] bg-radial-gradient from-purple-600/10 via-transparent to-transparent animate-purple-pulse" />
      </div>

      {/* ======================================================== */}
      {/* 2. Top Navigation Bar */}
      {/* ======================================================== */}
      <nav className="h-20 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/logo-navbar.png"
                alt="Pineco"
                className="h-10 sm:h-11 w-auto object-contain transition duration-200 group-hover:scale-[1.02]"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600" />
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-neutral-600">
            <a href="#live-sandbox" className="hover:text-purple-600 transition flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Live AI Sandbox</span>
            </a>
            <a href="#how-it-works" className="hover:text-purple-600 transition">Chain of Custody</a>
            <a href="#solutions" className="hover:text-purple-600 transition">Solutions</a>
            <a href="#architecture" className="hover:text-purple-600 transition">Architecture</a>
            <a href="#roi-calculator" className="hover:text-purple-600 transition">ROI Calculator</a>
            <a href="#faq" className="hover:text-purple-600 transition">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => openAuthModal('signin')}
              className="text-xs font-bold text-black hover:text-purple-700 hover:bg-purple-50 border border-neutral-300 hover:border-purple-300 px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Sign In</span>
            </button>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 hover:shadow-[0_0_25px_-3px_rgba(124,58,237,0.4)] border border-purple-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. Hero Section with 3D Console & Fluid Aura */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Floating Brand Badge with Neon Purple Border */}
        <div className="inline-flex items-center space-x-2.5 glass-pill px-4 py-1.5 rounded-full text-xs font-mono text-black shadow-sm border border-purple-300 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] transition duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
          </span>
          <span className="font-bold tracking-tight text-neutral-900">Enterprise Pre-Publication Governance</span>
          <span className="text-purple-300">•</span>
          <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            SENTINEL v2.4 ONLINE
          </span>
        </div>

        {/* Primary Hero Typography with Purple Gradient Text */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
            Before You Publish Marketing Copy,{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent underline decoration-purple-500/40 underline-offset-8">
                Prove Every Claim.
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Pineco intercepts marketing, PR, and social copy before publication. It couples{' '}
            <strong className="text-black font-bold">deterministic policy guardrails</strong> and mandatory legal disclaimers with{' '}
            <strong className="text-purple-700 font-bold">conservative AI fact verification</strong> grounded in corporate truth.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all duration-200 active:scale-95 group hover:shadow-[0_0_35px_-5px_rgba(124,58,237,0.55)] border border-purple-500/30"
          >
            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 glass-pill hover:bg-purple-50 hover:border-purple-400 text-black font-bold text-sm px-7 py-3.5 rounded-xl transition shadow-xs hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]"
          >
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Create Account (JWT)</span>
          </button>
        </div>

        {/* Live Sentinel Audit Activity Ticker */}
        <div className="max-w-2xl mx-auto pt-1">
          <div className="glass-panel px-4 py-2 rounded-xl border border-purple-200/80 shadow-xs flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shrink-0" />
              <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">
                {tickerEvents[tickerIndex].tag}
              </span>
              <span className="text-neutral-700 truncate text-[11px]">
                {tickerEvents[tickerIndex].text}
              </span>
            </div>
            <span className="text-neutral-400 text-[10px] shrink-0 ml-2">
              {tickerEvents[tickerIndex].time}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. 3D Glassmorphic Interactive Live Console Showcase */}
        {/* ======================================================== */}
        <div id="live-sandbox" className="pt-6 pb-4 relative max-w-5xl mx-auto perspective-stage">
          {/* Floating 3D Pill - Left: Intercepted Rule */}
          <div className="hidden md:flex absolute top-10 -left-6 lg:-left-8 z-30 glass-panel-purple px-4 py-3 rounded-2xl items-center space-x-3.5 animate-float-slow shadow-xl border border-purple-300/80">
            <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-purple-400/40">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                Deterministic Rule Intercept • {latencyMs}ms
              </div>
              <div className="text-xs font-bold text-black flex items-center space-x-1.5 mt-0.5">
                <span>Prohibited Phrasing</span>
                <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-purple-300">
                  &quot;100% Guaranteed&quot;
                </span>
              </div>
            </div>
          </div>

          {/* Floating 3D Pill - Right: AI Fact Grounding */}
          <div className="hidden md:flex absolute top-14 -right-6 lg:-right-8 z-30 glass-panel-dark text-white px-4 py-3.5 rounded-2xl items-center space-x-3.5 animate-float-reverse shadow-2xl border border-purple-500/40">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-purple-400/30">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Grounded Fact Proof</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                Ref: #F-001 (Approved 99.9% SLA)
              </div>
            </div>
          </div>

          {/* Floating 3D Pill - Bottom Left: SHA-256 Hash */}
          <div className="hidden lg:flex absolute -bottom-5 left-8 z-30 glass-panel px-4 py-2.5 rounded-2xl items-center space-x-3 animate-float-reverse shadow-lg border border-purple-200">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs border border-purple-500/30">
              <Fingerprint className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                Immutable Version Hash
              </div>
              <div className="text-xs font-mono font-semibold text-black">
                SHA-256: 7f8c9a...e34d
              </div>
            </div>
          </div>

          {/* Floating 3D Pill - Bottom Right: Safe Harbor Injected */}
          <div className="hidden lg:flex absolute -bottom-4 right-10 z-30 glass-panel px-4 py-2.5 rounded-2xl items-center space-x-3 animate-float-slow shadow-lg border border-purple-200">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs border border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                Mandatory Legal Disclaimer
              </div>
              <div className="text-xs font-bold text-black">
                Safe Harbor Safe-Guard Active
              </div>
            </div>
          </div>

          {/* Main 3D Tilted Interactive Console Card */}
          <div className="tilted-3d-card glass-panel rounded-3xl p-3 sm:p-5 border border-purple-300/80 shadow-2xl relative overflow-hidden text-left bg-white/90 glow-purple-card">
            {/* Top Chrome Window Bar with Purple Accents */}
            <div className="bg-black text-white px-5 py-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs border border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-neutral-300 font-semibold text-[11px] ml-2 flex items-center space-x-1.5">
                  <Folder className="w-3.5 h-3.5 text-purple-400" />
                  <span>PINECO // LIVE COMPLIANCE ENGINE [SENTINEL-v2.4]</span>
                </span>
              </div>

              {/* Scenario Switcher Tabs */}
              <div className="flex items-center space-x-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 font-mono text-[10px]">
                {scenarios.map((sc, i) => (
                  <button
                    key={sc.id}
                    onClick={() => handleScenarioSelect(i)}
                    className={`px-2.5 py-1 rounded-lg transition font-bold ${
                      activeScenarioIdx === i
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Body Grid */}
            <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Live Copy Scanner & Inspector (8 cols) */}
              <div className="lg:col-span-8 bg-neutral-50/95 rounded-2xl p-5 border border-neutral-200 relative overflow-hidden font-mono text-xs sm:text-[13px] leading-relaxed text-black flex flex-col justify-between space-y-4">
                {/* Micro-animated Scanning Laser Beam */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(124,58,237,1)] animate-scan-beam pointer-events-none" />
                )}

                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 text-[11px] text-neutral-500">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-black">
                        Active Draft: {scenarios[activeScenarioIdx].label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                        LATENCY: {latencyMs}ms
                      </span>
                      <span className="bg-neutral-200 text-black px-1.5 py-0.5 rounded font-mono text-[10px]">
                        Channel: Enterprise PR
                      </span>
                    </div>
                  </div>

                  {/* Rendered Text with Highlighted Annotations */}
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 text-xs sm:text-sm leading-relaxed min-h-[90px]">
                    {isFixed ? (
                      <p className="text-emerald-950">
                        {currentCopy}
                      </p>
                    ) : activeScenarioIdx === 0 ? (
                      <p>
                        Pineco is completely{' '}
                        <span className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded font-bold border border-rose-300">
                          100% guaranteed
                        </span>{' '}
                        to eliminate all regulatory fines forever. Our revolutionary AI software guarantees{' '}
                        <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold border border-amber-300">
                          99.999% uptime
                        </span>{' '}
                        with zero human review needed.
                      </p>
                    ) : activeScenarioIdx === 1 ? (
                      <p>
                        Earn completely{' '}
                        <span className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded font-bold border border-rose-300">
                          risk-free
                        </span>{' '}
                        <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold border border-amber-300">
                          18% annual yields
                        </span>{' '}
                        on corporate liquidity with our autonomous algorithmic treasury. Immediate liquidity is guaranteed by our partners.
                      </p>
                    ) : (
                      <p className="text-emerald-950">{currentCopy}</p>
                    )}
                  </div>

                  {/* Live Findings Drawer */}
                  <div className="mt-3.5 space-y-2">
                    {isFixed ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">
                          All policy violations resolved. 100% compliant with corporate governance standards.
                        </span>
                      </div>
                    ) : (
                      scenarios[activeScenarioIdx].findings.map((f, i) => (
                        <div
                          key={i}
                          className="bg-purple-50/80 border border-purple-200 p-2.5 rounded-xl flex items-start space-x-2.5 text-xs text-purple-950"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{f.title}</span>
                              <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded font-mono font-semibold">
                                {f.rule}
                              </span>
                            </div>
                            <p className="text-[11px] text-purple-800 mt-0.5">{f.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Interactive Auto-Fix Action Bar */}
                <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center space-x-2">
                    {!isFixed ? (
                      <button
                        onClick={handleAutoFix}
                        className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>1-Click Auto-Fix Copy</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleReset}
                        className="bg-neutral-200 hover:bg-neutral-300 text-black font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Draft</span>
                      </button>
                    )}
                    <span className="text-neutral-500 text-[11px]">
                      {isFixed ? 'Copy cleansed & verified' : 'Simulate automated policy rewrite'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-neutral-400">
                    ENGINE: DETERMINISTIC + GROK-2
                  </span>
                </div>
              </div>

              {/* Right Column: Real-time Telemetry & Governance HUD (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-purple-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100">
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                      Governance Score
                    </span>
                    <span className={`font-mono text-base font-extrabold ${governanceScore > 90 ? 'text-emerald-600' : 'text-purple-600'}`}>
                      {governanceScore}%
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="mt-2 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        governanceScore > 90 ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${governanceScore}%` }}
                    />
                  </div>

                  {/* Telemetry rows */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-600">Deterministic Engine</span>
                      <span className="font-mono font-bold text-black flex items-center space-x-1">
                        {isFixed || activeScenarioIdx === 2 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Passed (0 Flags)</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span className="text-rose-700">1 Intercepted</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-600">Fact Grounding Proof</span>
                      <span className="font-mono font-bold text-black">
                        {isFixed || activeScenarioIdx === 2 ? (
                          <span className="text-emerald-700">100% Grounded</span>
                        ) : (
                          <span className="text-amber-700">Unverified</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-600">Disclaimer Injection</span>
                      <span className="font-mono font-bold text-black">
                        {isFixed || activeScenarioIdx === 2 ? (
                          <span className="text-purple-700 font-bold">Injected</span>
                        ) : (
                          <span className="text-rose-700">Missing</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-600">Chain of Custody</span>
                      <span className="font-mono font-bold text-purple-700">SHA-256 Valid</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-neutral-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-purple-500/20"
                  >
                    <span>Open Live Product Audit</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Interactive 3D Metrics Cards */}
        <ScrollReveal delayMs={100}>
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="glass-panel p-5 rounded-2xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono block">68%</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Zap className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <span className="text-xs text-neutral-700 font-bold block">Faster Review Velocity</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Automated claim pre-filtering</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono block">0</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <span className="text-xs text-neutral-700 font-bold block">Unbacked Claims Published</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Strict corporate evidence matching</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono block">100%</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Lock className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <span className="text-xs text-neutral-700 font-bold block">SHA-256 Traceability</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Immutable audit compliance trail</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono block">0.04s</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Activity className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <span className="text-xs text-neutral-700 font-bold block">Regex Intercept Latency</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Instant deterministic pre-checks</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ======================================================== */}
      {/* 5. The 4-Step Chain of Custody with 3D Elevate Cards */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
        <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            End-To-End Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            The 4-Step Governance Chain of Custody
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            How Pineco eliminates approval bottlenecks and protects brand reputation through mathematical rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-xs border border-purple-500/30">
              01
            </div>
            <h3 className="text-sm font-bold text-black">Cryptographic Ingestion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Creator submits marketing, PR, or social copy. Pineco computes a SHA-256 hash, creating an immutable Version 1 record.
            </p>
            <div className="pt-2 text-[10px] font-mono text-purple-700 font-bold">
              + Immutable Version Seed
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-xs border border-purple-500/30">
              02
            </div>
            <h3 className="text-sm font-bold text-black">Deterministic Guardrails</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Rules engine checks prohibited terms, suggested phrasing, and required disclaimers with exact character offsets.
            </p>
            <div className="pt-2 text-[10px] font-mono text-purple-700 font-bold">
              + 0.04s Regex Intercept
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-xs border border-purple-500/30">
              03
            </div>
            <h3 className="text-sm font-bold text-black">Conservative Fact Proof</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Claims are classified as Supported, Contradicted, or Unverified. Hallucinated IDs are discarded at the database boundary.
            </p>
            <div className="pt-2 text-[10px] font-mono text-purple-700 font-bold">
              + Zero Public Hallucinations
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 shadow-sm card-3d-hover space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black text-white font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-xs border border-purple-500/30">
              04
            </div>
            <h3 className="text-sm font-bold text-black">Human Decision & Ledger</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Reviewer approves or requests revisions. Overrides strictly require written rationales logged in an append-only audit trail.
            </p>
            <div className="pt-2 text-[10px] font-mono text-purple-700 font-bold">
              + Audit Trail Bound
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 6. Live Interactive ROI & Risk Reduction Calculator */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="roi-calculator" className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Interactive Business Impact
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Calculate Your Organization&apos;s Compliance ROI
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto">
            See how automating deterministic rules and factual verification accelerates time-to-market.
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-purple-300 p-6 sm:p-8 shadow-xl glow-purple-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-black mb-2">
                  <span>Submissions Reviewed Per Month:</span>
                  <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-sm">
                    {submissionsPerMonth} assets
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="1000"
                  step="25"
                  value={submissionsPerMonth}
                  onChange={(e) => setSubmissionsPerMonth(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>25 assets</span>
                  <span>500 assets</span>
                  <span>1,000 assets</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-black mb-2">
                  <span>Average Legal / Policy Review Time per Copy:</span>
                  <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-sm">
                    {hoursPerReview} hours
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={hoursPerReview}
                  onChange={(e) => setHoursPerReview(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>1.0 hr</span>
                  <span>4.0 hrs</span>
                  <span>8.0 hrs</span>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Based on a verified 68% review acceleration benchmark across enterprise marketing workflows.
                </span>
              </div>
            </div>

            {/* Calculated Results HUD (5 cols) */}
            <div className="lg:col-span-5 bg-black text-white p-6 rounded-2xl border border-purple-500/30 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                Estimated Enterprise Impact
              </span>

              <div className="space-y-3">
                <div className="border-b border-neutral-800 pb-2">
                  <span className="text-[11px] text-neutral-400 block">Annual Hours Saved</span>
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                    {hoursSavedPerYear.toLocaleString()} hrs
                  </span>
                </div>

                <div className="border-b border-neutral-800 pb-2">
                  <span className="text-[11px] text-neutral-400 block">Estimated Annual Value</span>
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400">
                    ${costSavings.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-400 block">Compliance Exposure Risk</span>
                  <span className="text-base font-mono font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>99.4% Regulatory Risk Reduction</span>
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
              >
                <span>Deploy Pineco in Your Workspace &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 7. Industry Solutions Section with Purple Badges */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="solutions" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Industry Solutions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Tailored Governance for Highly Regulated Sectors
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Pre-configured compliance policies designed to protect organizations operating under strict legal mandates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Solution 1: FinTech */}
          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition-all duration-300 space-y-3 group shadow-xs card-3d-hover">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-purple-600 transition-colors">
              <Scale className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-black">Fintech & Banking</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Enforces SEC Rule 206(4)-1 and FINRA communications rules. Automatically intercepts unverified APY, yield, or performance guarantees and mandates safe-harbor disclosures.
            </p>
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5 text-[10px] font-mono text-purple-700 font-semibold">
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">SEC 206(4)-1</span>
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">FDIC Disclaimers</span>
            </div>
          </div>

          {/* Solution 2: Healthcare & Life Sciences */}
          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition-all duration-300 space-y-3 group shadow-xs card-3d-hover">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-purple-600 transition-colors">
              <HeartPulse className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-black">Healthcare & Pharma</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Adheres to FDA 21 CFR Part 11 and advertising standards. Requires clinical evidence binding for therapeutic efficacy claims and blocks off-label promotional assertions.
            </p>
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5 text-[10px] font-mono text-purple-700 font-semibold">
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">FDA 21 CFR</span>
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Clinical Substantiation</span>
            </div>
          </div>

          {/* Solution 3: Enterprise B2B SaaS */}
          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition-all duration-300 space-y-3 group shadow-xs card-3d-hover">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-purple-600 transition-colors">
              <Building2 className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-black">Enterprise B2B SaaS</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Verifies SOC 2, ISO 27001, and SLA uptime assertions against corporate data. Prevents uncertified security claims and governs competitive comparison copy.
            </p>
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5 text-[10px] font-mono text-purple-700 font-semibold">
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">SOC 2 Alignment</span>
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">SLA Verification</span>
            </div>
          </div>

          {/* Solution 4: Consumer & E-Commerce */}
          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition-all duration-300 space-y-3 group shadow-xs card-3d-hover">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-purple-600 transition-colors">
              <Briefcase className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-black">Consumer & Retail</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Complies with FTC Endorsement & Testimonial guides (16 CFR Part 255). Automatically audits influencer copy, environmental green claims, and discount veracity.
            </p>
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5 text-[10px] font-mono text-purple-700 font-semibold">
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">FTC 16 CFR</span>
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Greenwashing Shield</span>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 8. 3-Layered Defense Architecture */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="architecture" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Technical Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            The 3-Layered Defense Architecture
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            How Pineco achieves zero false assertions by decoupling deterministic regex guardrails from AI claim verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layer 1 */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded">
                LAYER 01
              </span>
              <span className="text-[11px] font-mono text-purple-600 font-bold">0.04s LATENCY</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold border border-purple-500/30">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-black">Deterministic Guardrail Engine</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Executes exact pattern matching with full Unicode normalization. Evaluates non-negotiable policies: prohibited terminology, required disclaimers, and suggested phrasing. <strong>Zero hallucination risk.</strong>
            </p>
            <ul className="text-[11px] font-mono text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-100">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Exact character offset boundary matching</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Non-negotiable legal disclaimer injection</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Preferred alternative word suggestions</span>
              </li>
            </ul>
          </div>

          {/* Layer 2 */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded">
                LAYER 02
              </span>
              <span className="text-[11px] font-mono text-purple-600 font-bold">GROK-2 LLM</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-black">Grounded Corporate Fact Vault</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Extracts discrete factual assertions using strict Pydantic JSON schemas. Claims are verified strictly against approved corporate evidence with active validity timestamps. Missing evidence defaults to <strong>Unverified</strong>.
            </p>
            <ul className="text-[11px] font-mono text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-100">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Evidence-before-assertion principle</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Database ID verification (rejects fake citations)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Supported / Contradicted / Unverified status</span>
              </li>
            </ul>
          </div>

          {/* Layer 3 */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded">
                LAYER 03
              </span>
              <span className="text-[11px] font-mono text-purple-600 font-bold">SHA-256 LEDGER</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold border border-purple-500/30">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-black">Human Gatekeeper & Audit Ledger</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Automated review never equals approval. Human reviewers execute binding decisions. Overriding any automated warning strictly mandates a written compliance rationale recorded in the append-only audit trail.
            </p>
            <ul className="text-[11px] font-mono text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-100">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Cryptographic SHA-256 content hashes</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Mandatory human rationale on overrides</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3 h-3 text-purple-600" />
                <span>Permanent immutable compliance record</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 9. Comparison Matrix: Traditional vs Pineco */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="comparison" className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Head-to-Head Comparison
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Why Generic AI & Spreadsheets Fail Enterprise Governance
          </h2>
        </div>

        <div className="glass-panel rounded-3xl border border-neutral-200 overflow-hidden shadow-lg">
          <div className="grid grid-cols-12 bg-black text-white p-4 text-xs font-mono font-bold border-b border-neutral-800">
            <div className="col-span-4 text-neutral-400">CAPABILITY / WORKFLOW</div>
            <div className="col-span-4 text-neutral-400">TRADITIONAL WORKFLOW</div>
            <div className="col-span-4 text-purple-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PINECO GOVERNANCE CORE</span>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            <div className="grid grid-cols-12 p-4 items-center">
              <div className="col-span-4 font-bold text-black">Prohibited Terminology</div>
              <div className="col-span-4 text-neutral-500">Manual review; prone to human oversight</div>
              <div className="col-span-4 font-semibold text-purple-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Deterministic intercept (&lt;0.04s)</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 items-center bg-neutral-50/50">
              <div className="col-span-4 font-bold text-black">Claim Substantiation</div>
              <div className="col-span-4 text-neutral-500">Ad-hoc Slack messages to legal teams</div>
              <div className="col-span-4 font-semibold text-purple-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Grounded DB vector lookup with timestamps</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 items-center">
              <div className="col-span-4 font-bold text-black">Audit Trail & Versioning</div>
              <div className="col-span-4 text-neutral-500">Scattered Google Docs comments</div>
              <div className="col-span-4 font-semibold text-purple-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>SHA-256 hash tree & append-only log</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 items-center bg-neutral-50/50">
              <div className="col-span-4 font-bold text-black">Override Accountability</div>
              <div className="col-span-4 text-neutral-500">Verbal sign-offs with zero paper trail</div>
              <div className="col-span-4 font-semibold text-purple-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Mandatory written compliance rationale</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 10. Enterprise Security & Compliance Credentials */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="security" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Trust & Security
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Built for Global Risk & Compliance Officers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-black">Zero Data Retention for Training</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your marketing copy and unpublished product announcements are never retained or utilized to train third-party foundation models.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Fingerprint className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-black">Cryptographic JWT & RBAC</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Granular role-based access control (Creator, Reviewer, Brand Manager, Administrator) secured with signed HS256 JWT sessions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-neutral-200 hover:border-purple-400 transition shadow-xs card-3d-hover space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-black">Audit-Ready Export</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Generate one-click verifiable compliance packets complete with character offset snapshots and reviewer timestamps for regulators.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 11. Frequently Asked Questions (FAQ) */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Answers for Compliance Teams
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left text-xs sm:text-sm font-bold text-black flex items-center justify-between space-x-4 hover:text-purple-700 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-purple-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-purple-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 12. Bottom CTA Banner */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-black text-white rounded-3xl p-8 sm:p-14 border border-purple-500/40 shadow-2xl relative overflow-hidden space-y-6 glow-purple-card">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs font-mono uppercase tracking-widest text-purple-300 font-bold block">
            Automate Pre-Publication Governance
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Protect Your Brand. Prove Every Claim.{' '}
            <span className="text-purple-400">Before Publication.</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Eliminate approval delays, intercept legal compliance risks in 0.04s, and establish an unbroken audit trail for all marketing communications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition active:scale-95 hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-purple-400/40"
            >
              Open Command Center &rarr;
            </Link>
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition border border-white/20"
            >
              Sign In (JWT)
            </button>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 13. Footer */}
      {/* ======================================================== */}
      <footer className="border-t border-neutral-200 bg-white py-12 px-4 sm:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo-mark.jpg"
              alt="Pineco"
              className="w-7 h-7 rounded-lg object-contain border border-neutral-200"
            />
            <span className="font-bold text-black">Pineco Brand Governance</span>
            <span className="text-neutral-300">|</span>
            <span className="font-mono text-[11px] text-purple-700 font-semibold">CodeAxis Enterprise Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a href="#live-sandbox" className="hover:text-purple-700 transition">Live Sandbox</a>
            <a href="#how-it-works" className="hover:text-purple-700 transition">Chain of Custody</a>
            <a href="#roi-calculator" className="hover:text-purple-700 transition">ROI Calculator</a>
            <a href="#security" className="hover:text-purple-700 transition">Security</a>
            <Link href="/dashboard" className="text-black font-bold hover:text-purple-700 transition">
              Launch App &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
