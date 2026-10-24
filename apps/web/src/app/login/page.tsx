'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { AuthBackgroundAnimation } from '@/components/AuthBackgroundAnimation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useRole();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(trimmedEmail, password);
      success('Authentication Successful', `Signed in as ${trimmedEmail}. Cryptographic session established.`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your email and password.';
      setErrorMessage(msg);
      toastError('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between text-neutral-900 selection:bg-purple-100 selection:text-purple-900 relative overflow-hidden">
      {/* Dynamic Animated Ambient Background */}
      <AuthBackgroundAnimation />

      {/* Top Header / Back Nav */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-medium">
          <span className="text-neutral-500 hidden sm:inline">Don't have an account?</span>
          <Link
            href="/signup"
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 border border-purple-600"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Account</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block group">
              <img
                src="/logo-text.png"
                alt="Pineco"
                className="h-10 w-auto object-contain mx-auto transition duration-200 group-hover:scale-[1.02]"
              />
            </Link>

            {/* Segmented Mode Selector */}
            <div className="flex p-1 bg-neutral-100 rounded-xl max-w-xs mx-auto text-xs font-semibold">
              <span className="flex-1 py-1.5 px-3 bg-white text-black font-bold rounded-lg shadow-2xs text-center">
                Sign In
              </span>
              <Link
                href="/signup"
                className="flex-1 py-1.5 px-3 text-neutral-500 hover:text-black rounded-lg text-center transition font-semibold"
              >
                Create Account
              </Link>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-black pt-1">
              Sign in to your account
            </h1>
            <p className="text-xs text-neutral-500">
              Autonomous AI brand governance and regulatory compliance console.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
              >
                Work Email
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
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/70 border border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono text-[11px]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-neutral-600 text-[11px]">Remember this browser</span>
              </label>

              <span className="text-[11px] text-neutral-400 font-medium cursor-help" title="Contact your IT Administrator or Pineco Workspace Admin to rotate credentials.">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 border border-purple-500/20 hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.35)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </>
              )}
            </button>

            {/* Prominent Create Account Link inside card */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Don't have an enterprise account?</span>
              <Link
                href="/signup"
                className="text-purple-700 font-bold hover:underline inline-flex items-center space-x-1"
              >
                <span>Create account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>

          {/* Security Footnote */}
          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Cryptographic dual-custody verification active</span>
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
