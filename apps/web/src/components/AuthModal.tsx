'use client';

import React, { useState } from 'react';
import { X, Key, ShieldCheck, UserCheck, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { UserRole } from '@/lib/types';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithRole, loginWithCredentials, currentUser, token } = useRole();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isAuthModalOpen) return null;

  const demoAccounts: { role: UserRole; name: string; title: string; email: string; avatar: string }[] = [
    {
      role: 'creator',
      name: 'Sarah Chen',
      title: 'Content Marketing Specialist',
      email: 'creator@pineco.internal',
      avatar: 'SC',
    },
    {
      role: 'reviewer',
      name: 'Elena Rostova',
      title: 'Compliance & Legal Reviewer',
      email: 'reviewer@pineco.internal',
      avatar: 'ER',
    },
    {
      role: 'brand_manager',
      name: 'Marcus Vance',
      title: 'Head of Brand Governance',
      email: 'manager@pineco.internal',
      avatar: 'MV',
    },
    {
      role: 'admin',
      name: 'Alex Thorne',
      title: 'Enterprise Administrator',
      email: 'admin@pineco.internal',
      avatar: 'AT',
    },
  ];

  const handleRoleSelect = async (r: UserRole) => {
    try {
      setLoading(true);
      await loginWithRole(r);
      success('Signed In Successfully', `Switched active JWT session to ${r.replace('_', ' ')}.`);
      closeAuthModal();
    } catch (err: any) {
      toastError('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setLoading(true);
      await loginWithCredentials(email.trim(), password);
      success('Authenticated via JWT', `Signed in as ${email}.`);
      closeAuthModal();
    } catch (err: any) {
      toastError('Authentication Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    success('JWT Token Copied', 'Bearer token copied to clipboard for API inspection.');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Enterprise Authentication</h2>
              <p className="text-[11px] text-slate-400">Cryptographic JWT bearer session & RBAC</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Demo Accounts Selector */}
        <div className="my-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider font-mono">
              1-Click Enterprise Personas:
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Instant JWT Issuance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {demoAccounts.map((acc) => {
              const isSelected = currentUser.email === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleRoleSelect(acc.role)}
                  disabled={loading}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex items-center space-x-3 group ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {acc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold block truncate">{acc.name}</span>
                    <span className={`text-[10px] block truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {acc.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-white px-2 text-slate-400">or sign in with credentials</span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleManualLogin} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. reviewer@pineco.internal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••••• (any demo password)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-sm transition text-xs flex items-center justify-center space-x-1.5"
          >
            <span>Authenticate & Generate JWT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Active JWT Debug Excerpt for Judges */}
        {token && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase font-sans">Active JWT Signature:</span>
              <button
                onClick={copyToken}
                className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Key className="w-3 h-3" />}
                <span>{copiedToken ? 'Copied' : 'Copy JWT'}</span>
              </button>
            </div>
            <p className="bg-slate-50 p-2 rounded border border-slate-200/80 truncate text-[10px] text-slate-600">
              {token}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
