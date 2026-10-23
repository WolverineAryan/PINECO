'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Key,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { UserRole } from '@/lib/types';

export function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    logout,
    currentUser,
    token,
    isAuthenticated,
    authModalMode,
    setAuthModalMode,
  } = useRole();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<'signin' | 'signup'>(authModalMode || 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('reviewer');
  const [department, setDepartment] = useState('Global Brand Office');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Sync tab with context if opened in specific mode
  React.useEffect(() => {
    if (authModalMode) {
      setTab(authModalMode);
    }
    setErrorMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleQuickDemoLogin = async (demoEmail: string, roleTitle: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await login(demoEmail, 'pineco2026!');
      success('Demo Session Initialized', `Signed in as ${roleTitle}. Redirecting to Command Center...`);
      closeAuthModal();
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Demo authentication failed.';
      setErrorMessage(msg);
      toastError('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      success('Authentication Successful', `Signed in as ${email.trim()}. Cryptographic JWT issued.`);
      closeAuthModal();
      setEmail('');
      setPassword('');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your email and password.';
      setErrorMessage(msg);
      toastError('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        department: department.trim() || 'Global Brand Office',
      });
      success('Account Registered', `Welcome ${name.trim()}! Signed in with cryptographically verified JWT.`);
      closeAuthModal();
      setName('');
      setEmail('');
      setPassword('');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. An account with this email may already exist.';
      setErrorMessage(msg);
      toastError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    success('Signed Out', 'Your active JWT session has been cleared.');
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    success('JWT Token Copied', 'Bearer token copied to clipboard for API inspection.');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center p-1.5 shadow-sm">
              <img
                src="/logo-mark.jpg"
                alt="Pineco"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black tracking-tight">Enterprise Authentication</h2>
              <p className="text-[11px] text-neutral-500 font-medium">Cryptographic JWT bearer session (HS256)</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-400 hover:text-black p-1.5 rounded-lg hover:bg-neutral-100 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Demo Account Quick Access Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>1-Click Demo Account Access</span>
            </span>
            <span className="text-[10px] font-mono text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200 font-semibold shadow-xs">
              PW: pineco2026!
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('reviewer@pineco.internal', 'Elena Rostova (Compliance Reviewer)')}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-xs active:scale-95 group"
            >
              <div className="text-xs font-bold text-black group-hover:text-purple-700 transition-colors flex items-center justify-between">
                <span>Reviewer</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Elena Rostova</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('manager@pineco.internal', 'Marcus Vance (Head of Brand)')}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-xs active:scale-95 group"
            >
              <div className="text-xs font-bold text-black group-hover:text-purple-700 transition-colors flex items-center justify-between">
                <span>Brand Manager</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Marcus Vance</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('creator@pineco.internal', 'Sarah Chen (Content Creator)')}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-xs active:scale-95 group"
            >
              <div className="text-xs font-bold text-black group-hover:text-purple-700 transition-colors flex items-center justify-between">
                <span>Content Creator</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Sarah Chen</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('admin@pineco.internal', 'Alex Thorne (Platform Admin)')}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-xs active:scale-95 group"
            >
              <div className="text-xs font-bold text-black group-hover:text-purple-700 transition-colors flex items-center justify-between">
                <span>Enterprise Admin</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Alex Thorne</div>
            </button>
          </div>
        </div>

        {/* Currently Logged In Banner if Authenticated */}
        {isAuthenticated && token && (
          <div className="mt-3.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                {currentUser.avatar || 'PI'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-black block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-neutral-500 block truncate">{currentUser.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  router.push('/dashboard');
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-black hover:bg-neutral-800 rounded-lg transition shadow-xs flex items-center space-x-1"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition flex items-center space-x-1 shrink-0"
              >
                <LogOut className="w-3 h-3" />
                <span>Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="flex p-1 bg-neutral-100 rounded-xl mt-3.5 mb-3.5">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'signin'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Manual Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'signup'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-all duration-200 active:scale-95 text-xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating & Redirecting...</span>
              ) : (
                <>
                  <span>Sign In & Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Create Account (Sign Up) Form */
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thor Aryan"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="36thoraryan@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Password <span className="font-normal text-neutral-400 text-[10px]">(min 6 chars)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Governance Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white transition"
              >
                <option value="reviewer">Compliance & Legal Reviewer</option>
                <option value="brand_manager">Head of Brand Governance</option>
                <option value="creator">Content Marketing Specialist</option>
                <option value="admin">Enterprise Platform Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-all duration-200 active:scale-95 text-xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            >
              {loading ? (
                <span className="animate-pulse">Creating Account & Redirecting...</span>
              ) : (
                <>
                  <span>Create Account & Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Cryptographic JWT Inspector Footer */}
        {token && (
          <div className="mt-4 pt-3.5 border-t border-neutral-100">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 text-neutral-600">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold text-black">Active JWT Bearer Session</span>
              </div>
              <button
                type="button"
                onClick={copyToken}
                className="text-neutral-500 hover:text-black flex items-center space-x-1 font-mono text-[10px] bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 hover:bg-neutral-100 transition"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3 h-3 text-neutral-400" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-[9px] text-neutral-400 truncate mt-1 bg-neutral-50 p-1.5 rounded border border-neutral-100">
              {token}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

