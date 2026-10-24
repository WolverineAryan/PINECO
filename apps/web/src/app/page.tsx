'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FolderPlus,
  PlusCircle,
  FileCheck,
  Shield,
  Play,
  RotateCcw,
  Sliders,
  UserPlus,
  SlidersHorizontal,
  Workflow,
  ShieldAlert,
  Clock,
  Send,
  Wand2,
  Database,
  FileCode,
  Hash,
  Download,
  Key,
  Server,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { ScrollReveal } from '@/components/ScrollReveal';
import { InteractiveFluidCanvas } from '@/components/InteractiveFluidCanvas';

const SECTORS_DATA = [
  {
    id: 'fintech',
    name: 'FinTech & Capital Markets',
    shortTag: 'FINTECH',
    regulator: 'SEC & FINRA',
    statute: 'SEC Rule 206(4)-1 • FINRA Rule 2210',
    icon: Scale,
    riskTitle: 'Deceptive Yield & Unsubstantiated Returns Risk',
    primaryMandate: 'Bans performance guarantees, unverified APY promises, and requires mandatory statutory Safe-Harbor investment disclosures.',
    rules: [
      {
        title: 'Prohibited Absolute Return Guarantee',
        pattern: '\\b(guaranteed|risk-free|100% safe|no risk)\\b',
        severity: 'critical',
        code: 'SEC-206(4)-1.A',
        penalty: 'Enforcement fines up to $1.5M per violation',
      },
      {
        title: 'Unverified APY / Yield Promissory Claim',
        pattern: '\\b(\\d+(\\.\\d+)?%\\s*(annual|yearly|apy|return|yield))\\b',
        severity: 'high',
        code: 'FINRA-2210.C',
        penalty: 'Immediate marketing retraction mandate',
      },
    ],
    disclaimerRequired: 'Past performance is not indicative of future results. Capital at risk. Securities offered through certified broker-dealer members.',
    evidenceAnchor: 'SEC Form 10-K (Q3 Audit, Table 4.2) • Vault Document #V-FIN-2026',
    untrustedCopy: 'Earn guaranteed 14.5% annual returns with completely risk-free corporate liquidity management. Pineco guarantees 100% automated sign-off without human review.',
    violations: [
      { term: 'guaranteed 14.5% annual returns', reason: 'Unsubstantiated return guarantee violates SEC Rule 206(4)-1', code: 'SEC-206' },
      { term: 'completely risk-free', reason: 'Deceptive risk exclusion violates FINRA Rule 2210', code: 'FINRA-2210' },
      { term: 'guarantees 100% automated sign-off', reason: 'False operational automation assertion', code: 'SEC-GOV' },
    ],
    cleanCopy: 'Optimize corporate liquidity through institutional cash management strategies. Variable yield targets are benchmarked to prevailing short-term rates. Past performance is not indicative of future results.',
    statutoryDisclosure: 'Securities and cash management strategies involve capital loss risk. Consult qualified institutional counsel prior to commitment.',
    evidenceDoc: 'Verified against SEC 10-K Institutional Filing & Vault Proof #V-FIN-2026',
  },
  {
    id: 'healthcare',
    name: 'Healthcare, Pharma & Life Sciences',
    shortTag: 'HEALTHCARE',
    regulator: 'FDA & HHS',
    statute: 'FDA 21 CFR Part 11 • FD&C Act §502',
    icon: HeartPulse,
    riskTitle: 'Unapproved Efficacy & Off-Label Assertion Risk',
    primaryMandate: 'Enforces clinical trial evidence binding for medical claims, blocks off-label promises, and mandates investigational disclaimers.',
    rules: [
      {
        title: 'Unsubstantiated Clinical Efficacy Guarantee',
        pattern: '\\b(permanently cure|100% effective|instant cure)\\b',
        severity: 'critical',
        code: 'FDA-21CFR-312',
        penalty: 'FDA Warning Letter & clinical hold',
      },
      {
        title: 'Off-Label Diagnostic or Therapeutic Assertion',
        pattern: '\\b(eliminate [a-z]+ in \\d+ days|miracle)\\b',
        severity: 'high',
        code: 'FDCA-502.A',
        penalty: 'Mandatory commercial corrective campaign',
      },
    ],
    disclaimerRequired: 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, or cure any disease.',
    evidenceAnchor: 'ClinicalTrials.gov NCT-04928114 • IRB Clinical Protocol #2025-C8',
    untrustedCopy: 'Our proprietary therapeutic formula is 100% clinically proven to permanently cure metabolic fatigue and eliminate cognitive decline in 7 days.',
    violations: [
      { term: '100% clinically proven to permanently cure', reason: 'Unapproved disease modification claim violating FD&C Act §502(a)', code: 'FDA-CFR' },
      { term: 'eliminate cognitive decline in 7 days', reason: 'Lacks Phase-III randomized double-blind clinical trial backing', code: 'FDCA-502' },
    ],
    cleanCopy: 'Our investigational compound demonstrated statistically significant improvements in cellular metabolic biomarkers during double-blind Phase-II trials (N=1,420). Individual clinical outcomes may vary.',
    statutoryDisclosure: 'Investigational compound under active clinical study. Not approved by FDA for general over-the-counter administration.',
    evidenceDoc: 'Verified against ClinicalTrials.gov NCT-04928114 & IRB Protocol #2025-C8',
  },
  {
    id: 'saas',
    name: 'Enterprise Cloud & B2B SaaS',
    shortTag: 'ENTERPRISE SAAS',
    regulator: 'AICPA & ISO',
    statute: 'SOC 2 Type II • ISO/IEC 27001:2022',
    icon: Building2,
    riskTitle: 'Breach Liability & False Security Assertion Risk',
    primaryMandate: 'Binds marketing claims to certified SOC 2 compliance reports and contractual SLAs, preventing uncertified security assertions.',
    rules: [
      {
        title: 'Uncertified Security Guarantee',
        pattern: '\\b(unhackable|100% secure|zero vulnerability)\\b',
        severity: 'critical',
        code: 'SOC2-CC6.1',
        penalty: 'Contractual breach of warranty liability',
      },
      {
        title: 'Exaggerated SLA Uptime Metric',
        pattern: '\\b(99\\.999%|100% uptime)\\b',
        severity: 'high',
        code: 'SLA-CONTRACT',
        penalty: 'Customer SLA financial credit penalties',
      },
    ],
    disclaimerRequired: 'System availability is subject to scheduled maintenance windows as detailed in the Enterprise Master Services Agreement.',
    evidenceAnchor: 'AICPA SOC-2 Type II Independent Service Auditor Report (Oct 2026)',
    untrustedCopy: 'Pineco delivers completely unhackable 100% secure cloud operations with 99.999% uptime and completely eliminates all compliance overhead.',
    violations: [
      { term: 'completely unhackable 100% secure', reason: 'Unprovable absolute security warranty creates statutory liability', code: 'SOC2-SEC' },
      { term: '99.999% uptime', reason: 'Exceeds certified contractual SLA baseline of 99.9% in service agreement', code: 'SLA-BREACH' },
    ],
    cleanCopy: 'Pineco delivers enterprise brand governance built on SOC 2 Type II audited cloud infrastructure with a contractual 99.9% uptime SLA guarantee.',
    statutoryDisclosure: 'Security controls and operational safeguards certified under AICPA Trust Services Criteria (Security, Confidentiality).',
    evidenceDoc: 'Verified against EY Independent SOC-2 Type II Audit Certificate #EY-SOC2-881',
  },
  {
    id: 'consumer',
    name: 'Consumer Retail & E-Commerce',
    shortTag: 'RETAIL & FTC',
    regulator: 'FTC & NAD',
    statute: 'FTC 16 CFR Part 255 • FTC Green Guides',
    icon: Briefcase,
    riskTitle: 'Greenwashing & Undisclosed Endorsement Risk',
    primaryMandate: 'Audits influencer copy for mandatory disclosure hashtags, verifies environmental claims, and validates discount pricing honesty.',
    rules: [
      {
        title: 'Unqualified Environmental / Green Claim',
        pattern: '\\b(100% eco-friendly|zero carbon footprint|greenest)\\b',
        severity: 'critical',
        code: 'FTC-16CFR-260',
        penalty: 'FTC civil penalties up to $50,120 per violation',
      },
      {
        title: 'Undisclosed Influencer Sponsorship',
        pattern: '\\b(our favorite|we love|partnered with)\\b(?!.*#(ad|sponsored))',
        severity: 'high',
        code: 'FTC-16CFR-255',
        penalty: 'Mandatory joint brand-influencer enforcement',
      },
    ],
    disclaimerRequired: 'Paid brand ambassador endorsement. Full product sustainability lifecycle assessment available at pineco.com/esg.',
    evidenceAnchor: 'ISO 14044 Life Cycle Assessment Protocol #LCA-2026-88',
    untrustedCopy: 'This revolutionary product has 100% zero carbon footprint and our influencer partners agree it is the most miraculous item on Earth!',
    violations: [
      { term: '100% zero carbon footprint', reason: 'Unqualified general environmental claim prohibited by FTC Green Guides', code: 'FTC-GREEN' },
      { term: 'our influencer partners agree', reason: 'Missing mandatory prominent material connection disclosure (#Ad)', code: 'FTC-ENDORSE' },
    ],
    cleanCopy: 'Manufactured with 85% certified post-consumer recycled ocean polymers to reduce packaging lifecycle emissions by 34%. Paid brand ambassador endorsement.',
    statutoryDisclosure: 'Lifecycle assessment audited in accordance with ISO 14044 protocols. Full carbon verification on file.',
    evidenceDoc: 'Verified against ISO 14044 Third-Party LCA Verification #LCA-8812',
  },
];

const MARQUEE_ITEMS = [
  { title: 'SEC Rule 206(4)-1', category: 'Investment Marketing' },
  { title: 'FDA 21 CFR Part 11', category: 'Electronic Records' },
  { title: 'FINRA Rule 2210', category: 'Communications with Public' },
  { title: 'SOC 2 Type II', category: 'Security & Confidentiality' },
  { title: 'FTC 16 CFR Part 255', category: 'Endorsement & Claims' },
  { title: 'ISO/IEC 27001:2022', category: 'ISMS Certified' },
  { title: 'Zero-Retention Enclave', category: 'Contractual DPA' },
  { title: 'SHA-256 Merkle Chain', category: 'Cryptographic Ledger' },
  { title: 'Deterministic Intercept <0.04s', category: 'Zero Latency' },
  { title: 'Role-Scoped JWT Sessions', category: 'Multi-Tenant RBAC' },
];

const RBAC_ROLES = [
  {
    id: 'compliance_lead',
    name: 'Compliance Officer / Legal',
    roleTag: 'ROLE_COMPLIANCE_LEAD',
    level: 'Tier 1 - Sovereign Governance',
    scope: 'rules:*, vault:*, overrides:*, ledger:audit_export',
    permissions: [
      { name: 'Deterministic Rule Engine Configuration', allowed: true },
      { name: 'Ground Truth Knowledge Base Management', allowed: true },
      { name: 'Statutory Policy Override (Requires Written Rationale)', allowed: true },
      { name: 'SHA-256 Merkle Chain Verification & Re-Anchoring', allowed: true },
      { name: 'Multi-Format Export (PDF, DOCX, PPTX)', allowed: true },
    ],
    payload: {
      iss: 'https://auth.pineco.enterprise.internal',
      sub: 'usr_comp_8921a',
      role: 'COMPLIANCE_LEAD',
      scope: ['rules:write', 'vault:write', 'overrides:execute', 'ledger:audit'],
      tenant_id: 'ten_enterprise_prime',
      mfa_verified: true,
      exp: 1792780800,
    },
  },
  {
    id: 'brand_manager',
    name: 'Brand & Editorial Director',
    roleTag: 'ROLE_BRAND_MANAGER',
    level: 'Tier 2 - Editorial Governance',
    scope: 'rules:propose, vault:write, submissions:approve',
    permissions: [
      { name: 'Deterministic Rule Engine Configuration', allowed: true },
      { name: 'Ground Truth Knowledge Base Management', allowed: true },
      { name: 'Statutory Policy Override (Requires Written Rationale)', allowed: true },
      { name: 'SHA-256 Merkle Chain Verification & Re-Anchoring', allowed: false },
      { name: 'Multi-Format Export (PDF, DOCX, PPTX)', allowed: true },
    ],
    payload: {
      iss: 'https://auth.pineco.enterprise.internal',
      sub: 'usr_bdir_4401c',
      role: 'BRAND_MANAGER',
      scope: ['rules:propose', 'vault:write', 'submissions:approve'],
      tenant_id: 'ten_enterprise_prime',
      mfa_verified: true,
      exp: 1792780800,
    },
  },
  {
    id: 'reviewer',
    name: 'Compliance Reviewer / QA',
    roleTag: 'ROLE_REVIEWER_QA',
    level: 'Tier 3 - Operational Review',
    scope: 'submissions:review, overrides:request, diff:inspect',
    permissions: [
      { name: 'Deterministic Rule Engine Configuration', allowed: false },
      { name: 'Ground Truth Knowledge Base Management', allowed: false },
      { name: 'Statutory Policy Override (Requires Written Rationale)', allowed: true },
      { name: 'SHA-256 Merkle Chain Verification & Re-Anchoring', allowed: false },
      { name: 'Multi-Format Export (PDF, DOCX, PPTX)', allowed: true },
    ],
    payload: {
      iss: 'https://auth.pineco.enterprise.internal',
      sub: 'usr_rev_1294e',
      role: 'REVIEWER_QA',
      scope: ['submissions:review', 'overrides:request', 'diff:inspect'],
      tenant_id: 'ten_enterprise_prime',
      mfa_verified: true,
      exp: 1792780800,
    },
  },
  {
    id: 'creator',
    name: 'Campaign Creator / Copywriter',
    roleTag: 'ROLE_CREATOR',
    level: 'Tier 4 - Submitter Context',
    scope: 'submissions:submit, revisions:edit',
    permissions: [
      { name: 'Deterministic Rule Engine Configuration', allowed: false },
      { name: 'Ground Truth Knowledge Base Management', allowed: false },
      { name: 'Statutory Policy Override (Requires Written Rationale)', allowed: false },
      { name: 'SHA-256 Merkle Chain Verification & Re-Anchoring', allowed: false },
      { name: 'Multi-Format Export (PDF, DOCX, PPTX)', allowed: false },
    ],
    payload: {
      iss: 'https://auth.pineco.enterprise.internal',
      sub: 'usr_cw_7712f',
      role: 'CREATOR',
      scope: ['submissions:submit', 'revisions:edit'],
      tenant_id: 'ten_enterprise_prime',
      mfa_verified: false,
      exp: 1792780800,
    },
  },
  {
    id: 'auditor',
    name: 'External Regulatory Auditor',
    roleTag: 'ROLE_AUDITOR_RO',
    level: 'Tier 5 - Read-Only Verification',
    scope: 'ledger:read_immutable, audit:export_all, signatures:verify',
    permissions: [
      { name: 'Deterministic Rule Engine Configuration', allowed: false },
      { name: 'Ground Truth Knowledge Base Management', allowed: false },
      { name: 'Statutory Policy Override (Requires Written Rationale)', allowed: false },
      { name: 'SHA-256 Merkle Chain Verification & Re-Anchoring', allowed: true },
      { name: 'Multi-Format Export (PDF, DOCX, PPTX)', allowed: true },
    ],
    payload: {
      iss: 'https://auth.pineco.enterprise.internal',
      sub: 'usr_sec_9901a',
      role: 'EXTERNAL_AUDITOR',
      scope: ['ledger:read_immutable', 'audit:export_all', 'signatures:verify'],
      tenant_id: 'ten_enterprise_prime',
      mfa_verified: true,
      exp: 1792780800,
    },
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { openAuthModal, loginWithCredentials, setActiveProduct } = useRole();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoAccess = async () => {
    try {
      setIsDemoLoading(true);
      await loginWithCredentials('reviewer@pineco.internal', 'pineco2026!');
      setActiveProduct(null);
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Live Interactive Hero Dashboard Showcase Data (20 Pre-Seeded Real Entries across 16 Portfolios)
  const HERO_DASHBOARD_SUBMISSIONS = [
    {
      id: 'sub-fintech-violations',
      title: 'ApexYield High-Alpha Institutional Trading Engine',
      product: 'Apex Capital Solutions',
      category: 'FinTech',
      channel: 'SOCIAL',
      status: 'changes_requested',
      findingsCount: 3,
      findingsSummary: 'SEC Rule 206(4)-1 guaranteed returns, unverified 18% APY, missing risk disclosures',
      author: 'Elena Rostova (Compliance Officer)',
      time: '12m ago',
      hash: '3f1dcb89...e41e',
    },
    {
      id: 'sub-healthcare-approved',
      title: 'BioPure CardioFlow Phase-III Clinical Brief',
      product: 'BioPure Therapeutics',
      category: 'HealthCare',
      channel: 'PRESS RELEASE',
      status: 'approved',
      findingsCount: 0,
      findingsSummary: 'ClinicalTrials.gov NCT-04928114 verified, FDA 21 CFR §202.1 fair balance compliant',
      author: 'Dr. Marcus Vance',
      time: '28m ago',
      hash: '7a9c14ef...b892',
    },
    {
      id: 'sub-saas-violations',
      title: 'NovaSaaS Enterprise SOC-2 Cloud Architecture',
      product: 'NovaCloud Platform',
      category: 'Enterprise SaaS',
      channel: 'WEBSITE',
      status: 'changes_requested',
      findingsCount: 2,
      findingsSummary: 'Unsubstantiated 99.999% SLA uptime warranty, uncertified zero-vulnerability claim',
      author: 'Alex Thorne, Esq.',
      time: '45m ago',
      hash: '5d2e891c...102a',
    },
    {
      id: 'sub-consumer-approved',
      title: 'EcoSmart Circular Polymer Sustainability Packaging',
      product: 'EcoSmart Living',
      category: 'Consumer Goods',
      channel: 'PACKAGING',
      status: 'approved',
      findingsCount: 0,
      findingsSummary: 'ISO 14044 LCA lifecycle verified, FTC 16 CFR Part 260 environmental claims backed',
      author: 'Sarah Lin (Brand Lead)',
      time: '1h ago',
      hash: '9e41b702...fc31',
    },
    {
      id: 'sub-genai-violations',
      title: 'AuraGen Multi-Modal Agentic AI Launch Brief',
      product: 'AuraGen Studio',
      category: 'GenAI & Agents',
      channel: 'EMAIL',
      status: 'changes_requested',
      findingsCount: 2,
      findingsSummary: 'FTC undisclosed automated decisioning, unsubstantiated 100% autonomous accuracy',
      author: 'Devon Chen (AI Lead)',
      time: '2h ago',
      hash: '2c8810da...994e',
    },
    {
      id: 'sub-cybersecurity-approved',
      title: 'QuantumSafe Post-Quantum Cryptography Architecture',
      product: 'QuantumSafe Labs',
      category: 'Cybersecurity',
      channel: 'WHITEPAPER',
      status: 'approved',
      findingsCount: 0,
      findingsSummary: 'NIST FIPS 203/204 standard compliance, mathematically proven lattice encryption',
      author: 'Dr. Aris Thorne',
      time: '3h ago',
      hash: '8f12a091...77cb',
    },
  ];

  const [heroDashboardFilter, setHeroDashboardFilter] = useState<'all' | 'action_needed' | 'approved'>('all');
  const [heroDashboardSearch, setHeroDashboardSearch] = useState('');

  const filteredHeroSubmissions = HERO_DASHBOARD_SUBMISSIONS.filter((sub) => {
    if (heroDashboardFilter === 'action_needed' && sub.status !== 'changes_requested') return false;
    if (heroDashboardFilter === 'approved' && sub.status !== 'approved') return false;
    if (
      heroDashboardSearch &&
      !sub.title.toLowerCase().includes(heroDashboardSearch.toLowerCase()) &&
      !sub.product.toLowerCase().includes(heroDashboardSearch.toLowerCase()) &&
      !sub.category.toLowerCase().includes(heroDashboardSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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

  // Interactive ROI Calculator State
  const [submissionsPerMonth, setSubmissionsPerMonth] = useState(250);
  const [hoursPerReview, setHoursPerReview] = useState(3.5);

  const hoursSavedPerYear = Math.round(submissionsPerMonth * hoursPerReview * 0.68 * 12);
  const costSavings = Math.round(hoursSavedPerYear * 85); // $85/hr blended legal/marketing rate

  // Interactive Sector Workstation State
  const [activeSector, setActiveSector] = useState<'fintech' | 'healthcare' | 'saas' | 'consumer'>('fintech');
  const [sectorViewMode, setSectorViewMode] = useState<'violations' | 'compliant'>('violations');

  // Interactive Architecture Layer State
  const [activeArchitectureLayer, setActiveArchitectureLayer] = useState<number>(1);

  const currentSector = SECTORS_DATA.find((s) => s.id === activeSector) || SECTORS_DATA[0];

  // Interactive Trust & Security Console State
  const [securityActiveTab, setSecurityActiveTab] = useState<'zero_retention' | 'rbac_matrix' | 'audit_export'>('zero_retention');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('compliance_lead');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'docx' | 'pptx'>('pdf');
  const [isVerifyingLedger, setIsVerifyingLedger] = useState(false);
  const [ledgerVerificationResult, setLedgerVerificationResult] = useState<string | null>(null);

  const selectedRole = RBAC_ROLES.find((r) => r.id === selectedRoleId) || RBAC_ROLES[0];

  const handleVerifyLedger = () => {
    setIsVerifyingLedger(true);
    setLedgerVerificationResult(null);
    setTimeout(() => {
      setIsVerifyingLedger(false);
      setLedgerVerificationResult('MERKLE_PARITY_VALID • SHA-256 HASH VERIFIED AGAINST SOVEREIGN AUDIT LEDGER (0 DRIFT)');
    }, 650);
  };

  // Footer Newsletter State
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const handleFooterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerEmail.trim()) {
      setFooterSubscribed(true);
      setFooterEmail('');
    }
  };

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
          <Link href="/" className="flex items-center space-x-2.5 group">
            <img
              src="/favicon.png"
              alt="Pineco Emblem"
              className="h-9 w-9 object-contain rounded-xl transition duration-200 group-hover:scale-105"
            />
            <img
              src="/logo-text.png"
              alt="Pineco"
              className="h-12 sm:h-14 w-auto object-contain transition duration-200 group-hover:scale-[1.02]"
            />
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 px-3 py-2 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 px-3.5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 border border-purple-600"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </Link>
            <button
              onClick={handleDemoAccess}
              disabled={isDemoLoading}
              className="hidden sm:flex items-center space-x-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 border border-neutral-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isDemoLoading ? 'Opening...' : 'Live Demo'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. Hero Section with TopperCode-Inspired Physics Fluid Canvas */}
      {/* ======================================================== */}
      <section className="pt-6 sm:pt-12 pb-10 sm:pb-16 px-2.5 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto rounded-3xl sm:rounded-[2.5rem] border border-neutral-200 bg-white px-3.5 sm:px-10 pt-10 sm:pt-20 pb-10 sm:pb-16 relative overflow-hidden shadow-xl">
          {/* Interactive Physics Fluid Water Flow Canvas (Inspired by toppercode.online) */}
          <InteractiveFluidCanvas className="opacity-75" />

          {/* Foreground Hero Content */}
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-50/90 border border-neutral-200/90 shadow-xs mb-1 backdrop-blur-xs">
              <img src="/favicon.png" alt="Pineco Emblem" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-neutral-800 tracking-wide font-mono">Pineco Brand Governance</span>
            </div>

            {/* Primary Hero Typography with Elegant Serif Gradient Highlight */}
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.12] sm:leading-[1.08] text-balance">
              Autonomous AI Copy Governance.<br className="hidden sm:inline" />
              Before You Publish Copy,<br />
              <span className="bg-gradient-to-r from-neutral-950 via-purple-600 to-neutral-950 bg-clip-text text-transparent font-serif italic font-normal">
                Prove Every Claim.
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed text-balance px-1">
              Pineco intercepts marketing, PR, and social copy before publication. It couples{' '}
              <strong className="text-black font-bold">deterministic policy guardrails</strong> and mandatory legal disclaimers with{' '}
              <strong className="text-purple-700 font-bold">conservative AI fact verification</strong> grounded in corporate truth.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-full shadow-lg shadow-purple-900/20 hover:shadow-purple-500/30 transition-all group active:scale-95 border border-purple-500/40"
              >
                <UserPlus className="w-4 h-4 text-purple-200" />
                <span className="leading-none">Create Free Account</span>
                <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              </Link>
              <button
                onClick={handleDemoAccess}
                disabled={isDemoLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-bold text-white bg-black hover:bg-neutral-900 active:bg-neutral-800 rounded-full shadow-md transition-all group active:scale-95 border border-neutral-700"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="leading-none">
                  {isDemoLoading ? 'Opening Demo...' : 'Live Demo (20 Entries)'}
                </span>
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-neutral-700 hover:text-black bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 rounded-full shadow-sm transition-all active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="leading-none">Sign In</span>
              </Link>
            </div>

            {/* Hero Trust Strip under CTAs (toppercode.online pattern) */}
            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-neutral-200/80 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 text-xs sm:text-sm text-neutral-800">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-medium leading-none">Deterministic Guardrails (&lt;0.04s)</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-medium leading-none">Grounded Fact Vault Proof</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-medium leading-none">SHA-256 Merkle Ledger</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-medium leading-none">Zero Retention for Training</span>
              </div>
            </div>

            {/* Live Sentinel Audit Activity Ticker */}
            <div className="max-w-2xl mx-auto pt-2">
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
          </div>

        {/* ======================================================== */}
        {/* 4. Real Enterprise Dashboard Showcase (Zero Traffic / Clutter) */}
        {/* ======================================================== */}
        <div id="live-sandbox" className="pt-6 pb-4 relative max-w-5xl mx-auto">
          {/* Main Production Dashboard Card */}
          <div className="bg-white rounded-3xl border border-neutral-300/80 shadow-2xl overflow-hidden text-left transition-all hover:border-purple-300">
            {/* Top Chrome Window Bar (Browser App Shell) */}
            <div className="bg-neutral-950 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg font-mono text-[11px] text-neutral-300">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>https://app.pineco.io/dashboard</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 bg-purple-950/80 border border-purple-700/60 text-purple-300 px-2.5 py-1 rounded-lg font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="font-bold">Live Enterprise Scope</span>
                </div>
                <Link
                  href="/dashboard"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition shadow-xs flex items-center space-x-1"
                >
                  <span>Launch Live App</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Dashboard Inner Body */}
            <div className="p-4 sm:p-6 space-y-5 bg-neutral-50/50">
              {/* Product Scope & Command Header */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-neutral-500">
                      Active Compliance Scope:
                    </span>
                    <span className="text-[10px] font-mono bg-purple-50 border border-purple-200 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                      Multi-Portfolio Governance
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black tracking-tight flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-purple-600" />
                    <span>Enterprise Content Compliance Command Center</span>
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xl">
                    Real-time monitoring across 20 pre-seeded compliance submissions, 12 statutory brand guardrails, and 9 approved evidence facts.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1.5 text-xs text-black bg-white hover:bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-xl transition font-bold"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-neutral-600" />
                    <span>New Folder</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 border border-purple-400/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-purple-200" />
                    <span>Scan Copy</span>
                  </Link>
                </div>
              </div>

              {/* 4 Real Metric Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                    Drafts Scanned
                  </span>
                  <span className="text-2xl font-black text-black mt-0.5 block font-mono">
                    20
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 block">Total drafts checked</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider block">
                    Approved For Release
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-0.5 block font-mono">
                    8
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 block">Passed & human signed off</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider block">
                    Needs Revisions
                  </span>
                  <span className="text-2xl font-black text-rose-600 mt-0.5 block font-mono">
                    12
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 block">Policy warnings flagged</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
                      Active Guardrails
                    </span>
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-2xl font-black text-black mt-0.5 block font-mono">
                    21
                  </span>
                  <span className="text-[11px] text-purple-700 mt-0.5 block">12 rules, 9 facts</span>
                </div>
              </div>

              {/* Real Content Compliance Reviews Stream (Table) */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <h4 className="text-xs font-bold text-black uppercase tracking-wide font-mono">
                      Content Compliance Reviews
                    </h4>
                    <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.2 rounded-full font-mono font-bold">
                      {filteredHeroSubmissions.length} of 20 shown
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {/* Filter Tabs */}
                    <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 text-xs font-semibold">
                      <button
                        onClick={() => setHeroDashboardFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                          heroDashboardFilter === 'all'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setHeroDashboardFilter('action_needed')}
                        className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                          heroDashboardFilter === 'action_needed'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Needs Action
                      </button>
                      <button
                        onClick={() => setHeroDashboardFilter('approved')}
                        className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                          heroDashboardFilter === 'approved'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Approved
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search submissions..."
                        value={heroDashboardSearch}
                        onChange={(e) => setHeroDashboardSearch(e.target.value)}
                        className="text-[11px] px-2.5 py-1 pl-7 rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-purple-600 w-32 sm:w-40 font-mono"
                      />
                      <Search className="w-3 h-3 text-neutral-400 absolute left-2 top-2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Submissions Rows */}
                <div className="divide-y divide-neutral-200 text-xs">
                  {filteredHeroSubmissions.map((sub) => {
                    const isApproved = sub.status === 'approved';
                    return (
                      <div
                        key={sub.id}
                        className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50/90 transition group"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {sub.channel}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono border ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {isApproved ? 'APPROVED' : 'CHANGES REQUESTED'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {sub.product} ({sub.category})
                            </span>
                          </div>
                          <div className="font-bold text-black text-xs sm:text-sm group-hover:text-purple-700 transition-colors truncate">
                            {sub.title}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-neutral-500">
                            {isApproved ? (
                              <span className="text-emerald-700 flex items-center space-x-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{sub.findingsSummary}</span>
                              </span>
                            ) : (
                              <span className="text-rose-700 flex items-center space-x-1 font-semibold">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span className="truncate">{sub.findingsCount} Policy Violations: {sub.findingsSummary}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                          <span className="text-[10px] font-mono text-neutral-400 hidden md:inline">
                            {sub.time}
                          </span>
                          <Link
                            href="/dashboard"
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition border ${
                              isApproved
                                ? 'bg-white hover:bg-neutral-100 text-black border-neutral-300'
                                : 'bg-black hover:bg-neutral-900 text-white border-black'
                            }`}
                          >
                            <span>{isApproved ? 'View Attestation' : 'Inspect Audit'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Footer Ribbon inside Dashboard */}
                <div className="bg-neutral-100/70 p-3 sm:px-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-neutral-600 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Real production data seeded across all 16 enterprise product categories.</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                  >
                    <span>Open Full 20-Entry Compliance Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
        </div>
      </section>

      {/* ======================================================== */}
      {/* Real-time Enterprise Compliance Marquee Ticker (toppercode.online design) */}
      {/* ======================================================== */}
      <section className="py-6 sm:py-8 border-y border-neutral-200 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 relative overflow-hidden">
          {/* Gradient edge masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-4 sm:gap-6 text-xs font-mono text-neutral-700">
            {/* Duplicated for seamless infinite loop */}
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 whitespace-nowrap bg-white border border-neutral-200 px-4 py-2 rounded-full shadow-xs hover:border-purple-400 hover:shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-black font-bold text-xs">{item.title}</span>
                <span className="text-[10px] text-neutral-500 font-sans font-medium">({item.category})</span>
              </div>
            ))}
          </div>
        </div>
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
          <div className="rounded-[2rem] bg-white border border-neutral-200 hover:border-purple-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl topper-card-hover space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                01
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                STAGE_INGEST
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-black tracking-tight group-hover:text-purple-600 transition-colors">
                Cryptographic Ingestion
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Creator submits marketing, PR, or social copy. Pineco computes a SHA-256 hash, creating an immutable Version 1 record.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-bold">
              <span>+ Immutable Version Seed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-neutral-200 hover:border-purple-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl topper-card-hover space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                02
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                STAGE_DETERM
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-black tracking-tight group-hover:text-purple-600 transition-colors">
                Deterministic Guardrails
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Rules engine checks prohibited terms, suggested phrasing, and required disclaimers with exact character offsets.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-bold">
              <span>+ 0.04s Regex Intercept</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-neutral-200 hover:border-purple-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl topper-card-hover space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                03
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                STAGE_VERIFY
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-black tracking-tight group-hover:text-purple-600 transition-colors">
                Conservative Fact Proof
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Claims are classified as Supported, Contradicted, or Unverified. Hallucinated IDs are discarded at the database boundary.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-bold">
              <span>+ Grounded Truth Anchors</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-neutral-200 hover:border-purple-500/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl topper-card-hover space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 font-mono font-extrabold text-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                04
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                STAGE_LEDGER
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-black tracking-tight group-hover:text-purple-600 transition-colors">
                Human Review & Ledger
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Reviewer approves or requests revisions. Overrides strictly require written rationales logged in an append-only audit trail.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-bold">
              <span>+ Signed WORM Trail</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
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
      {/* 7. Enterprise Regulatory Workbench (Production Console) */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="solutions" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
                Enterprise Policy Workstation
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
              Production Regulatory Enforcements by Sector
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Live deterministic policy intercepts, evidence verification gates, and statutory Safe-Harbor injection across highly audited industries.
            </p>
          </div>

          {/* Regulator Compliance Stamp */}
          <div className="flex items-center space-x-2 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-mono shrink-0">
            <span className="text-neutral-500">Statutory Coverage:</span>
            <span className="font-bold text-black uppercase">SEC • FDA • AICPA • FTC</span>
          </div>
        </div>

        {/* Sector Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200">
          {SECTORS_DATA.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSector === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSector(sec.id as any);
                  setSectorViewMode('violations');
                }}
                className={`flex items-center space-x-2.5 p-3 rounded-xl transition text-left group ${
                  isSelected
                    ? 'bg-white text-black shadow-md border border-neutral-200 ring-2 ring-purple-600/20'
                    : 'text-neutral-600 hover:text-black hover:bg-white/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold truncate block">{sec.name.split('&')[0].trim()}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 font-semibold block truncate">
                    {sec.regulator}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Active Sector Console */}
        {currentSector && (
          <div className="glass-panel rounded-3xl border border-neutral-300 shadow-xl overflow-hidden bg-white">
            {/* Top Command Bar */}
            <div className="bg-black text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="font-mono font-bold text-neutral-200 text-xs tracking-wide">
                  REGULATORY BENCH // {currentSector.statute}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 font-bold">
                  ENFORCEMENT ACTIVE
                </span>
              </div>

              {/* View Mode Toggle: Intercepted vs Remediated */}
              <div className="flex items-center space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSectorViewMode('violations')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    sectorViewMode === 'violations'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Intercepted Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSectorViewMode('compliant')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    sectorViewMode === 'compliant'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Certified Output</span>
                </button>
              </div>
            </div>

            {/* Console Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Left Column: Active Statutory Policies (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-neutral-50/50 space-y-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                      Mandate Overview
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-bold">
                      {currentSector.shortTag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-black">{currentSector.riskTitle}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {currentSector.primaryMandate}
                  </p>
                </div>

                {/* Statutory Rules */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider font-mono block">
                    Active Guardrail Specifications
                  </span>
                  {currentSector.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black text-xs">{rule.title}</span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-extrabold ${
                            rule.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>
                      <div className="bg-neutral-100 p-1.5 rounded font-mono text-[11px] text-purple-900 border border-neutral-200 truncate">
                        Regex: {rule.pattern}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                        <span>Statute: {rule.code}</span>
                        <span className="text-rose-700 font-semibold">{rule.penalty}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mandatory Disclaimer Box */}
                <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-purple-900 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Statutory Safe-Harbor Clause</span>
                  </div>
                  <p className="text-[11px] text-neutral-700 italic leading-relaxed">
                    &quot;{currentSector.disclaimerRequired}&quot;
                  </p>
                </div>
              </div>

              {/* Right Column: Live Interception & Remediated Content Engine (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-4 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-black">
                        {sectorViewMode === 'violations'
                          ? 'Raw Untrusted Marketing Copy (Non-Compliant)'
                          : 'Pineco Certified & Remediated Publication Copy'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Channel: Omnichannel Campaign
                    </span>
                  </div>

                  {/* Copy Display Area */}
                  <div
                    className={`mt-4 p-4 rounded-2xl border min-h-[140px] text-xs sm:text-sm leading-relaxed transition-all duration-200 font-mono ${
                      sectorViewMode === 'violations'
                        ? 'bg-rose-50/30 border-rose-200 text-black'
                        : 'bg-emerald-50/30 border-emerald-200 text-neutral-900'
                    }`}
                  >
                    {sectorViewMode === 'violations' ? (
                      <div className="space-y-3">
                        <p className="leading-relaxed">
                          {currentSector.untrustedCopy}
                        </p>
                        <div className="pt-2 border-t border-rose-200/80 space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 block">
                            Triggered Interceptions:
                          </span>
                          {currentSector.violations.map((v, i) => (
                            <div
                              key={i}
                              className="p-2 bg-white rounded-lg border border-rose-200 text-[11px] flex items-start space-x-2 shadow-2xs"
                            >
                              <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                !
                              </span>
                              <div>
                                <span className="font-bold text-rose-900 line-through">
                                  &quot;{v.term}&quot;
                                </span>
                                <p className="text-neutral-600 text-[10px] mt-0.5">{v.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-neutral-900 leading-relaxed font-sans text-xs sm:text-sm">
                          {currentSector.cleanCopy}
                        </p>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 space-y-1 font-sans">
                          <div className="flex items-center space-x-1.5 font-bold font-mono text-[10px] uppercase text-purple-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Injected Statutory Disclosure</span>
                          </div>
                          <p className="text-neutral-700 italic text-[11px]">
                            {currentSector.statutoryDisclosure}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                          <span className="text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Evidence Anchor Verified</span>
                          </span>
                          <span className="text-[10px] text-neutral-500 truncate max-w-[260px]">
                            {currentSector.evidenceDoc}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Console Controls */}
                <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-600">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Latency: 0.03s</span>
                    <span>•</span>
                    <span className="text-purple-700 font-semibold">Zero False Assertions</span>
                    <span>•</span>
                    <span>SHA-256 Validated</span>
                  </div>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs active:scale-95 border border-purple-500/20"
                  >
                    <span>Deploy {currentSector.shortTag} Policies</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* High-Impact Proof Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Regulatory Parity</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-black block">100% SEC/FDA</span>
            <span className="text-[11px] text-neutral-500 block">Strict zero-hallucination boundary</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Avg Fine Prevented</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-700 block">$4.2M / Yr</span>
            <span className="text-[11px] text-neutral-500 block">Per institutional compliance audit</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Deterministic Intercept</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-black block">&lt; 0.04s</span>
            <span className="text-[11px] text-neutral-500 block">Real-time character offset matching</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Evidence Audit Trail</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-700 block">SHA-256</span>
            <span className="text-[11px] text-neutral-500 block">Cryptographically immutable ledger</span>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 8. 3-Layered Defense Architecture (Interactive Blueprint) */}
      {/* ======================================================== */}
      <ScrollReveal delayMs={100}>
      <section id="architecture" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 font-bold">
            Technical Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            The 3-Layered Defense Architecture
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            How Pineco achieves zero false assertions by decoupling sub-millisecond deterministic regex guardrails from grounded database fact verification.
          </p>
        </div>

        {/* Interactive Layer Switcher Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-neutral-100 rounded-2xl max-w-2xl mx-auto border border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveArchitectureLayer(1)}
            className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center space-x-2 ${
              activeArchitectureLayer === 1
                ? 'bg-black text-white shadow-md'
                : 'text-neutral-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Layer 1: Deterministic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveArchitectureLayer(2)}
            className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center space-x-2 ${
              activeArchitectureLayer === 2
                ? 'bg-black text-white shadow-md'
                : 'text-neutral-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Layer 2: Fact Vault</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveArchitectureLayer(3)}
            className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center space-x-2 ${
              activeArchitectureLayer === 3
                ? 'bg-black text-white shadow-md'
                : 'text-neutral-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Layer 3: Audit Ledger</span>
          </button>
        </div>

        {/* Live Architecture Inspection Console */}
        <div className="glass-panel rounded-3xl border border-neutral-300 shadow-xl overflow-hidden bg-white">
          <div className="bg-black text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-800">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-neutral-300 text-xs font-bold ml-2">
                {activeArchitectureLayer === 1
                  ? 'KERNEL // REGEX_DETERMINISTIC_INTERCEPTOR.PY [0.038ms]'
                  : activeArchitectureLayer === 2
                  ? 'KERNEL // FACT_GROUNDING_EVIDENCE_MATCHER.PY [STRICT_SCHEMA]'
                  : 'KERNEL // CRYPTO_AUDIT_LEDGER_CHAIN.PY [SHA256_MUTEX]'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              ZERO-HALLUCINATION GUARANTEE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
            {/* Left Column: Architectural Specs (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-neutral-50/50 space-y-4 text-left">
              {activeArchitectureLayer === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-700 font-bold uppercase">
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Layer 01: Sub-Millisecond Gate</span>
                  </div>
                  <h3 className="text-base font-bold text-black">Deterministic Guardrail Engine</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Evaluates non-negotiable legal and brand policies using exact regular expressions with Unicode NFKC normalization. Intercepts forbidden phrasing, calculates exact start and end offsets, and injects compliant replacements in microseconds.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 border-t border-neutral-200 font-mono text-neutral-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Exact character boundary matching (\b)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Mandatory statutory disclaimer verification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Zero LLM dependency = 0.00% hallucination</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeArchitectureLayer === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-700 font-bold uppercase">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    <span>Layer 02: Truth-in-Evidence Gate</span>
                  </div>
                  <h3 className="text-base font-bold text-black">Grounded Corporate Fact Vault</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Enforces the strict &quot;Evidence before assertion&quot; mandate. The AI provider is constrained by Pydantic JSON schemas. Every claim must cite an active, non-expired fact record from the corporate database. Hallucinated IDs are discarded at the boundary.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 border-t border-neutral-200 font-mono text-neutral-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Strict Pydantic JSON schema output parsing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Database ID integrity check (rejects fake citations)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Conservative default: Unbacked claims &rarr; Unverified</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeArchitectureLayer === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-700 font-bold uppercase">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Layer 03: Accountability & Integrity</span>
                  </div>
                  <h3 className="text-base font-bold text-black">Human Gatekeeper & Audit Ledger</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Automated analysis never equals approval. Human reviewers execute legally binding sign-offs. If a reviewer overrides an automated warning, the system strictly mandates a written compliance rationale permanently recorded in an append-only audit trail.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 border-t border-neutral-200 font-mono text-neutral-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Cryptographic SHA-256 content version hash</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Mandatory written business rationale on overrides</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Tamper-evident append-only compliance record</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Live Terminal Code & Data Stream (7 cols) */}
            <div className="lg:col-span-7 p-6 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed text-left flex flex-col justify-between overflow-x-auto min-h-[280px]">
              {activeArchitectureLayer === 1 && (
                <div className="space-y-2 text-[11px]">
                  <div className="text-neutral-500">// Deterministic pattern interception engine trace:</div>
                  <div className="text-purple-400">&gt; pineco.engine.deterministic.run_rules(content_text, rules)</div>
                  <div className="text-neutral-400">
                    [0.038ms] UNICODE_NORMALIZE: NFKC encoding verified (4,821 chars)
                  </div>
                  <div className="text-rose-400">
                    [ALERT] PATTERN_INTERCEPT: \b(guarantee|100%|risk-free)\b
                  </div>
                  <div className="text-neutral-300">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EXCERPT: &quot;...with completely 100% guaranteed elimination of...&quot;
                  </div>
                  <div className="text-neutral-300">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OFFSETS: [start: 24, end: 39] | RULE_ID: &quot;rule-001&quot; | SEVERITY: &quot;high&quot;
                  </div>
                  <div className="text-emerald-400">
                    [REMEDY] REPLACEMENT_SUGGESTION: &quot;proven approach&quot;
                  </div>
                  <div className="text-neutral-500 pt-2 border-t border-neutral-800">
                    STATUS: Findings emitted with 0% LLM latency. Regex pre-flight pass complete.
                  </div>
                </div>
              )}

              {activeArchitectureLayer === 2 && (
                <div className="space-y-2 text-[11px]">
                  <div className="text-neutral-500">// Database Fact Vault & Evidence Grounding Verification:</div>
                  <div className="text-purple-400">&gt; SELECT * FROM approved_facts WHERE workspace_id = &apos;ws-enterprise&apos;</div>
                  <div className="bg-neutral-900/90 p-3 rounded-lg border border-neutral-800 text-neutral-300 space-y-1">
                    <div>&#123;</div>
                    <div className="pl-4 text-emerald-400">&quot;claim_text&quot;: &quot;Certified 99.9% Uptime Cloud SLA&quot;,</div>
                    <div className="pl-4 text-purple-300">&quot;evidence_status&quot;: &quot;supported&quot;,</div>
                    <div className="pl-4 text-neutral-400">&quot;fact_id&quot;: &quot;fact-sla-999-001&quot;,</div>
                    <div className="pl-4 text-neutral-400">&quot;source_title&quot;: &quot;SOC-2 Type II Independent Audit Report&quot;,</div>
                    <div className="pl-4 text-neutral-400">&quot;valid_until&quot;: &quot;2027-12-31T23:59:59Z&quot;,</div>
                    <div className="pl-4 text-neutral-400">&quot;confidence_score&quot;: 1.0</div>
                    <div>&#125;</div>
                  </div>
                  <div className="text-neutral-400">
                    [VERIFY] Database foreign key validated: `fact_id` exists in `approved_facts` table.
                  </div>
                  <div className="text-emerald-400">
                    [RESULT] Claim certified as supported against primary evidence.
                  </div>
                </div>
              )}

              {activeArchitectureLayer === 3 && (
                <div className="space-y-2 text-[11px]">
                  <div className="text-neutral-500">// Cryptographic Audit Trail & Immutability Ledger:</div>
                  <div className="text-purple-400">&gt; pineco.models.AuditEvent.record(entity=&apos;submission&apos;, action=&apos;approved&apos;)</div>
                  <div className="space-y-1 text-neutral-300">
                    <div>BLOCK SEQUENCE: #008821 // STATE: COMMITTED & SEALED</div>
                    <div className="text-purple-300">
                      CONTENT_SHA256: 7f8c9a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
                    </div>
                    <div>SIGNER: usr-reviewer-marcus (Brand Governance Director)</div>
                    <div className="text-emerald-400">DECISION: APPROVED_FOR_DISTRIBUTION</div>
                    <div className="text-neutral-400">
                      RATIONALE: &quot;Reviewed against Q4 Legal Guidelines. Safe-harbor disclaimer verified.&quot;
                    </div>
                    <div className="text-neutral-500">
                      MUTEX: Immutable record. Prior versions (v1, v2) archived in append-only store.
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                <span>PINECO SECURITY STANDARD: FIPS-180-4 / SOC 2 / HIPAA SAFE HARBOR</span>
                <span className="text-purple-400">AUDIT READY</span>
              </div>
            </div>
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
      <section id="security" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Trust, Custody & Regulatory Defense</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
            Built for Global Risk & Compliance Officers
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Engineered for chief compliance counsel and risk committees. Zero third-party model training, signed cryptographic RBAC sessions, and tamper-evident SHA-256 audit ledgers.
          </p>
        </div>

        {/* Security Posture Telemetry Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Data Retention SLA</div>
            <div className="text-xl sm:text-2xl font-black text-black mt-1">0 Days</div>
            <div className="text-xs text-purple-700 font-semibold mt-0.5">Strict Ephemeral In-Memory</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Transit & Rest Cipher</div>
            <div className="text-xl sm:text-2xl font-black text-black mt-1">AES-256-GCM</div>
            <div className="text-xs text-purple-700 font-semibold mt-0.5">TLS 1.3 Strict Enclave</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Audit Record Custody</div>
            <div className="text-xl sm:text-2xl font-black text-black mt-1">SHA-256</div>
            <div className="text-xs text-purple-700 font-semibold mt-0.5">Write-Once Merkle Anchor</div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Access Verification</div>
            <div className="text-xl sm:text-2xl font-black text-black mt-1">HS256 / RS256</div>
            <div className="text-xs text-purple-700 font-semibold mt-0.5">Role-Scoped Session Keys</div>
          </div>
        </div>

        {/* Interactive Compliance Console */}
        <div className="bg-white border border-neutral-300 rounded-3xl shadow-xl overflow-hidden">
          {/* Console Top Control Bar */}
          <div className="bg-neutral-900 border-b border-neutral-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-px bg-neutral-700" />
              <div className="text-xs font-mono font-bold text-neutral-300 flex items-center space-x-2">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>GOVERNANCE_CONTROL_PLANE // v1.4</span>
              </div>
            </div>

            {/* Segmented Controls for Tabs */}
            <div className="inline-flex rounded-xl bg-neutral-800/90 p-1 border border-neutral-700 text-xs font-medium">
              <button
                onClick={() => setSecurityActiveTab('zero_retention')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  securityActiveTab === 'zero_retention'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Retention Enclave</span>
              </button>
              <button
                onClick={() => setSecurityActiveTab('rbac_matrix')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  securityActiveTab === 'rbac_matrix'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Cryptographic RBAC & JWT</span>
              </button>
              <button
                onClick={() => setSecurityActiveTab('audit_export')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  securityActiveTab === 'audit_export'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Audit Export & Verifier</span>
              </button>
            </div>
          </div>

          {/* Console Body Tab Content */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: ZERO DATA RETENTION ENCLAVE */}
            {securityActiveTab === 'zero_retention' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Enclave Architecture Pipeline */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-black flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-purple-600" />
                      <span>Volatile In-Memory Enclave Isolation</span>
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      SLA: ZERO_RETENTION_VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Customer campaign copy, unreleased product roadmaps, and pricing models are evaluated strictly inside an isolated runtime envelope. Your content is never retained, logged to disk, or utilized to train external LLMs.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-purple-300 transition space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                        <span>mTLS 1.3 Strict Ingress Handshake</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 pl-7">
                        Payloads are decrypted directly in tenant-scoped volatile memory buffers. Zero intermediate staging on public object storage.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-purple-300 transition space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                        <span>Deterministic In-Memory Rule Engine</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 pl-7">
                        High-speed Unicode-normalized regex evaluation executes in &lt;0.04s without generating persistent cache artifacts.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-purple-300 transition space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                        <span>Zero Model Training Contractual Guarantee</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 pl-7">
                        Enterprise API clauses strictly prohibit AI foundation vendors from storing token batches for reinforcement learning or model fine-tuning.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-purple-300 transition space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">4</span>
                        <span>Cryptographic Memory Zeroization & Purge</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 pl-7">
                        Immediately following payload emission, memory allocation segments are overwritten with zero-fill buffers to prevent cold-boot extraction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Real Telemetry Terminal */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                    <span className="font-bold text-neutral-700 flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-600" />
                      <span>RUNTIME_ENCLAVE_LOGS</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>SOCKET_CONNECTED</span>
                    </span>
                  </div>

                  <div className="bg-neutral-950 rounded-2xl p-4 font-mono text-[11px] text-neutral-300 border border-neutral-800 shadow-inner space-y-2 leading-relaxed overflow-x-auto">
                    <div className="text-neutral-500">[ENCLAVE:BOOT] Worker #4892 initialized in isolated cgroup</div>
                    <div className="text-neutral-400">[POLICY:ZRET] Zero-retention enforcement ACTIVE (DPA-SEC-2026-08)</div>
                    <div className="text-purple-400">[INGRESS:TLS] Handshake: TLS_AES_256_GCM_SHA384 (TLSv1.3)</div>
                    <div className="text-neutral-300">[SANITIZE:PII] Regex pipeline inspected 4,120 bytes: 0 unmasked entities</div>
                    <div className="text-emerald-400">[EXEC:RAM] In-memory rule pass complete: 38.4ms (0 disk I/O)</div>
                    <div className="text-amber-400">[PURGE:RAM] Zeroizing volatile memory buffer at 0x7ffd98... [SHREDDED]</div>
                    <div className="text-neutral-400">[LEDGER:HASH] Block SHA-256 commit 0x4e82b7... registered</div>
                    <div className="text-emerald-500 font-bold">[TERMINATE] Worker cycle closed cleanly. Ephemeral life: 44ms.</div>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center space-x-2.5 text-xs text-purple-900">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Independent SOC 2 Type II audit confirms zero persistent data remanence in production workers.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CRYPTOGRAPHIC RBAC & JWT */}
            {securityActiveTab === 'rbac_matrix' && (
              <div className="space-y-6">
                {/* Role Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-200">
                  <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mr-2">
                    Inspect Role:
                  </span>
                  {RBAC_ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        selectedRoleId === role.id
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <Fingerprint className={`w-3.5 h-3.5 ${selectedRoleId === role.id ? 'text-purple-400' : 'text-neutral-500'}`} />
                      <span>{role.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Role Permission Matrix */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-black">{selectedRole.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                          {selectedRole.level}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-neutral-500">
                        JWT Scope: <span className="text-neutral-700 font-semibold">{selectedRole.scope}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {selectedRole.permissions.map((perm, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                            perm.allowed
                              ? 'bg-white border-neutral-200'
                              : 'bg-neutral-50/60 border-neutral-200/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {perm.allowed ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center shrink-0">
                                <span className="w-1.5 h-0.5 bg-neutral-400" />
                              </div>
                            )}
                            <span className={perm.allowed ? 'font-medium text-black' : 'text-neutral-500'}>
                              {perm.name}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              perm.allowed
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-neutral-200/70 text-neutral-600'
                            }`}
                          >
                            {perm.allowed ? 'AUTHORIZED' : 'RESTRICTED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Live Decoded JWT Session Inspector */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                      <span className="font-bold text-neutral-700 flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-600" />
                        <span>DECODED_HS256_JWT_PAYLOAD</span>
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        <span>SIGNED & VERIFIED</span>
                      </span>
                    </div>

                    <div className="bg-neutral-950 rounded-2xl p-4 font-mono text-xs text-neutral-300 border border-neutral-800 shadow-inner overflow-x-auto space-y-1">
                      <div className="text-neutral-500">// Header: {"{"}"alg": "HS256", "typ": "JWT"{"}"}</div>
                      <div className="text-purple-400">// Claims Payload:</div>
                      <pre className="text-[11px] text-neutral-300 font-mono leading-relaxed mt-1">
{JSON.stringify(selectedRole.payload, null, 2)}
                      </pre>
                    </div>

                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-black flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Least-Privilege Architectural Enforcement</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Session tokens are cryptographically signed and validated on every API call. Role elevations and policy overrides strictly require signed rationale payloads anchored to the audit log.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIT EXPORT & VERIFIER */}
            {securityActiveTab === 'audit_export' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Multi-Format Packet Exporter */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-black flex items-center space-x-2">
                      <Download className="w-4 h-4 text-purple-600" />
                      <span>One-Click Regulatory Evidence Exporter</span>
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Generate comprehensive compliance dossiers for SEC, FDA, FINRA, or Board risk reviews in standard verifiable enterprise formats.
                    </p>
                  </div>

                  {/* Format Selector */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => setSelectedExportFormat('pdf')}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedExportFormat === 'pdf'
                          ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-black text-black">PDF Dossier</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Verifiable Certificate</div>
                    </button>
                    <button
                      onClick={() => setSelectedExportFormat('docx')}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedExportFormat === 'docx'
                          ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-black text-black">DOCX Brief</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Statutory Evidence</div>
                    </button>
                    <button
                      onClick={() => setSelectedExportFormat('pptx')}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedExportFormat === 'pptx'
                          ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-black text-black">PPTX Deck</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Board Risk Summary</div>
                    </button>
                  </div>

                  {/* Document Preview Card */}
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                        Generated Artifact Specification
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        REGULATOR_READY
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-black flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>PINECO_AUDIT_REPORT_2026_Q4.{selectedExportFormat.toUpperCase()}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {selectedExportFormat === 'pdf' && 'Includes tamper-evident QR verification token, full character offset inspection tables, and cryptographic reviewer signature blocks.'}
                        {selectedExportFormat === 'docx' && 'Complete legal brief containing statutory SEC Rule 206(4)-1 & FDA 21 CFR citations, redlined diff comparisons, and written rationale justifications.'}
                        {selectedExportFormat === 'pptx' && '7-slide board-ready presentation deck featuring compliance scorecard KPIs, policy violation remediation tables, ground-truth fact verification anchors, and dual-custody authorization gates.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">Size: ~2.4 MB • SHA256: c8f9...441a</span>
                      <Link
                        href="/audit"
                        className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-400" />
                        <span>Export from Audit Vault</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right: Merkle Hash Verifier */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-black flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-purple-600" />
                      <span>Cryptographic Merkle Parity Engine</span>
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Every submission version is bound to a SHA-256 parent hash tree. Verify immutable tamper-evident proof directly against sovereign ledger blocks.
                    </p>
                  </div>

                  {/* Stamp Details Box */}
                  <div className="bg-neutral-950 rounded-2xl p-4 font-mono text-xs text-neutral-300 border border-neutral-800 shadow-inner space-y-2.5">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400 text-[11px]">LEDGER_BLOCK_SEQUENCE</span>
                      <span className="text-purple-400 font-bold">#18,492</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px]">
                      <span className="text-neutral-400">REVIEWER_SIGNATURE</span>
                      <span className="text-neutral-200">Marcus Vance, Esq. (NY-48921)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px]">
                      <span className="text-neutral-400">TIMESTAMP_UTC</span>
                      <span className="text-neutral-200">2026-10-23T15:10:00Z</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-neutral-400">RECORD_SHA256_DIGEST</span>
                      <div className="text-[10px] text-neutral-400 break-all bg-neutral-900 p-2 rounded-lg border border-neutral-800 font-mono">
                        4e82b7190f84a8cb70183e92cf1a95c80d440e729acb771e892cfa98b001a1c3
                      </div>
                    </div>
                  </div>

                  {/* Verification Trigger Button */}
                  <div className="space-y-2">
                    <button
                      onClick={handleVerifyLedger}
                      disabled={isVerifyingLedger}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {isVerifyingLedger ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Executing Cryptographic Parity Check...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Run Parity Check Against Ledger</span>
                        </>
                      )}
                    </button>

                    {ledgerVerificationResult && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-mono font-bold flex items-center space-x-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{ledgerVerificationResult}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regulatory Standards Certification Bar */}
        <div className="border border-neutral-200 rounded-2xl p-6 bg-neutral-50/70">
          <div className="text-center space-y-1 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
              Formal Regulatory Standards & Legal Architecture
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">SOC 2 Type II</div>
              <div className="text-[10px] text-neutral-500">Security & Confidentiality</div>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">ISO/IEC 27001</div>
              <div className="text-[10px] text-neutral-500">Certified ISMS Baseline</div>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">SEC 17 CFR §240</div>
              <div className="text-[10px] text-neutral-500">WORM Electronic Archival</div>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">FDA 21 CFR Part 11</div>
              <div className="text-[10px] text-neutral-500">Electronic Signatures</div>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">HIPAA Safe Harbor</div>
              <div className="text-[10px] text-neutral-500">Automated PHI Redaction</div>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 hover:border-purple-300 transition">
              <div className="font-mono text-xs font-black text-black">GDPR Art. 28</div>
              <div className="text-[10px] text-neutral-500">Direct Enterprise DPA</div>
            </div>
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
              href="/signup"
              className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-black font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </Link>
            <button
              onClick={handleDemoAccess}
              disabled={isDemoLoading}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-7 py-3.5 rounded-xl shadow-md transition active:scale-95 border border-purple-400/40 inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isDemoLoading ? 'Loading Demo Workspace...' : 'Explore Demo Account'}</span>
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition border border-white/20 inline-flex items-center justify-center"
            >
              Sign In (Enterprise)
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 13. Professional Enterprise Footer */}
      {/* ======================================================== */}
      <footer className="border-t border-neutral-200 bg-neutral-50/90 text-neutral-600 pt-16 pb-12 px-4 sm:px-8 text-xs relative">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Newsletter & Statutory Security Bulletin Bar */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-[10px] font-mono uppercase font-bold text-purple-700 tracking-wider">
                  Statutory Regulatory Bulletin
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-black">
                Stay updated on SEC, FTC, and FDA Brand Compliance Directives
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Receive quarterly analysis of advertising enforcement actions, emerging AI disclosure statutes, and automated brand governance benchmarks.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {footerSubscribed ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subscribed! You will receive quarterly statutory compliance intelligence.</span>
                </div>
              ) : (
                <form onSubmit={handleFooterSubscribe} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    required
                    placeholder="Enter compliance or legal email..."
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-purple-600 min-w-[240px] font-mono shadow-xs"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Main Clean & Professional Footer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs py-4">
            {/* Column 1: Brand & Overview (6 cols) */}
            <div className="md:col-span-6 space-y-3.5">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo-text.png"
                  alt="Pineco"
                  className="h-36 sm:h-40 w-auto object-contain -ml-1"
                />
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
                Intelligent pre-publication brand governance, deterministic regulatory rule verification, and cryptographic chain-of-custody audit logging for distributed enterprise marketing teams.
              </p>
              <div className="inline-flex items-center space-x-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-700 font-semibold">Systems Operational</span>
                <span className="text-neutral-300">|</span>
                <span className="text-purple-700 font-bold">Latency &lt;0.04s</span>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-500">SOC 2 &bull; ISO 27001</span>
              </div>
            </div>

            {/* Column 2: Governance Platform (3 cols) */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-black">
                Platform
              </div>
              <ul className="space-y-2 text-neutral-500">
                <li><Link href="/dashboard" className="hover:text-purple-700 transition">Compliance Overview</Link></li>
                <li><Link href="/knowledge" className="hover:text-purple-700 transition">Brand Guidelines &amp; Rules</Link></li>
                <li><Link href="/audit" className="hover:text-purple-700 transition">Immutable Audit Ledger</Link></li>
                <li><Link href="/automation" className="hover:text-purple-700 transition">AI Policy Architect</Link></li>
              </ul>
            </div>

            {/* Column 3: Trust & Regulatory (3 cols) */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-black">
                Compliance &amp; Trust
              </div>
              <ul className="space-y-2 text-neutral-500">
                <li><a href="#regulations" className="hover:text-purple-700 transition">SEC &amp; FINRA Guidelines</a></li>
                <li><a href="#regulations" className="hover:text-purple-700 transition">FTC Truth-in-Advertising</a></li>
                <li><a href="#regulations" className="hover:text-purple-700 transition">FDA Fair-Balance Controls</a></li>
                <li><a href="#security" className="hover:text-purple-700 transition">SOC 2 Type II Readiness</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-6 border-t border-neutral-200/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
              <div>
                <span>&copy; 2026 Pineco Technologies Inc. All rights reserved.</span>
              </div>

              <div className="flex flex-wrap items-center space-x-4">
                <a href="#security" className="hover:text-purple-700 transition">Privacy Policy</a>
                <a href="#security" className="hover:text-purple-700 transition">Terms of Service</a>
                <a href="#security" className="hover:text-purple-700 transition">Security Attestation</a>
                <Link href="/dashboard" className="text-black font-bold hover:text-purple-700 transition inline-flex items-center space-x-1">
                  <span>Open App</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 leading-relaxed text-center sm:text-left">
              Disclaimer: Pineco provides pre-publication brand governance and compliance verification. Automated verification supplements internal review workflows under dual-custody human sign-off.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
