'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { UserRole } from '@/lib/types';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'reviewer', label: 'Compliance Reviewer', desc: 'Can approve/reject copy and authorize publication' },
  { role: 'creator', label: 'Content Drafter', desc: 'Can submit marketing & PR assets for scanning' },
  { role: 'brand_manager', label: 'Brand Manager', desc: 'Can author deterministic rules and approved facts' },
  { role: 'admin', label: 'System Admin', desc: 'Full sovereign custody, root configuration, and user audits' },
];

export default function SignupPage() {
  const router = useRouter();
  const { register } = useRole();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('reviewer');
  const [department, setDepartment] = useState('Global Brand Office');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full legal or corporate name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please accept the enterprise service terms to continue.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role: selectedRole,
        department: department.trim() || 'Global Brand Office',
      });
      success('Account Initialized', `Welcome ${trimmedName}! Authenticated session established.`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. An account with this email may already exist.';
      setErrorMessage(msg);
      toastError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between text-neutral-900 selection:bg-purple-100 selection:text-purple-900 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-monochrome opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_50%_35%,black_45%,transparent_85%)]" />

      {/* Top Header / Back Nav */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs font-medium text-neutral-500">
          <span>Already registered?</span>
          <Link
            href="/login"
            className="text-purple-700 font-bold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg bg-white border border-neutral-200/90 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block group">
              <img
                src="/logo-text.png"
                alt="Pineco"
                className="h-10 w-auto object-contain mx-auto transition duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-black pt-2">
              Create an enterprise account
            </h1>
            <p className="text-xs text-neutral-500">
              Join your organization's brand safety and regulatory compliance workspace.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="name"
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
              >
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
              >
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.rostova@enterprise.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
                >
                  Password
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Min. 6 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Role Selection */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="role"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
                >
                  Assigned Persona Role
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-semibold text-black focus:outline-none transition shadow-2xs"
                >
                  {ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="department"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
                >
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Brand Safety"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Role Description Note */}
            <div className="text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200/80 px-3 py-2 rounded-xl flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>{ROLES.find((r) => r.role === selectedRole)?.label}:</strong>{' '}
                {ROLES.find((r) => r.role === selectedRole)?.desc}
              </span>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start space-x-2 cursor-pointer select-none text-left">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-[11px] text-neutral-600 leading-snug">
                  I agree to the Enterprise Master Services Agreement, Dual-Custody Audit Policy, and Privacy Protocols.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 border border-purple-500/20 hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.35)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </>
              )}
            </button>
          </form>

          {/* Security Footnote */}
          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Immutable cryptographic chain of custody record</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-neutral-400 border-t border-neutral-200/60 bg-white/40">
        <p>&copy; 2026 Pineco Technologies Inc. Enterprise AI Governance Platform.</p>
      </footer>
    </div>
  );
}
