'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Plus,
  Layers,
  BookOpen,
  Clock,
  Copy,
  Check,
  UserCheck,
  Search,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { api } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const { role, setRole, currentUser, workspaceId, openAuthModal } = useRole();
  const { success } = useToast();
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [engineVersion, setEngineVersion] = useState<string>('');
  const [copiedWs, setCopiedWs] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then((res) => {
        setApiHealthy(res.status === 'healthy');
        setEngineVersion(res.engine_version);
      })
      .catch(() => setApiHealthy(false));
  }, []);

  const copyWorkspace = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopiedWs(true);
    success('Workspace ID Copied', workspaceId);
    setTimeout(() => setCopiedWs(false), 2000);
  };

  const isLanding = pathname === '/landing';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      {/* Top Banner */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <span className="bg-slate-800 text-slate-300 border border-slate-700/80 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-medium">
            CodeAxis Round 2
          </span>
          <button
            onClick={copyWorkspace}
            title="Click to copy Workspace ID"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition text-[11px] group"
          >
            <span>Workspace:</span>
            <span className="font-mono text-slate-200 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded group-hover:border-slate-700">
              {workspaceId}
            </span>
            {copiedWs ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiHealthy === true
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : apiHealthy === false
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-400 font-mono">
              {apiHealthy === true ? `API Online (${engineVersion})` : apiHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>

          <span className="text-slate-800">|</span>

          {/* Active Persona / Sign In Button */}
          <button
            onClick={openAuthModal}
            className="flex items-center space-x-1.5 text-[11px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-0.5 rounded transition"
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 font-mono capitalize">({role.replace('_', ' ')})</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm border border-slate-800 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-950 flex items-center space-x-1.5">
                <span>Pineco</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-semibold text-slate-400 -mt-1 font-mono">
                Brand Governance
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                pathname === '/'
                  ? 'bg-slate-100 text-slate-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CRM Dashboard</span>
            </Link>
            <Link
              href="/knowledge"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                pathname === '/knowledge'
                  ? 'bg-slate-100 text-slate-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Brand Knowledge</span>
            </Link>
            <Link
              href="/audit"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                pathname === '/audit'
                  ? 'bg-slate-100 text-slate-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </Link>
            <Link
              href="/landing"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                pathname === '/landing'
                  ? 'bg-slate-100 text-slate-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Product Page</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openAuthModal}
            className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition font-medium"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Persona</span>
          </button>
          <Link
            href="/submissions/new"
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition duration-150"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Review</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
