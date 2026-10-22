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
} from 'lucide-react';
import { useRole, UserRole } from './RoleContext';
import { useToast } from './Toast';
import { api } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const { role, setRole, currentUser, workspaceId } = useRole();
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

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Layers },
    { label: 'Brand Knowledge', href: '/knowledge', icon: BookOpen },
    { label: 'Audit Trail', href: '/audit', icon: Clock },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      {/* Top Telemetry & Switcher Bar */}
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
          {/* Live API Health indicator */}
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

          {/* Role Switcher */}
          <div className="flex items-center space-x-1.5 text-[11px]">
            <UserCheck className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Actor:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-slate-900 text-slate-200 text-[11px] border border-slate-800 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-600 cursor-pointer font-medium"
            >
              <option value="creator">Sarah Chen (Creator)</option>
              <option value="brand_manager">Marcus Vance (Brand Manager)</option>
              <option value="reviewer">Elena Rostova (Compliance Reviewer)</option>
              <option value="admin">Alex Thorne (Administrator)</option>
            </select>
          </div>
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
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
