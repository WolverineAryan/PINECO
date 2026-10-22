'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, Layers, BookOpen, Clock, Activity } from 'lucide-react';
import { useRole, UserRole } from './RoleContext';
import { api } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const { role, setRole, currentUser, workspaceId } = useRole();
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [engineVersion, setEngineVersion] = useState<string>('');

  useEffect(() => {
    api.getHealth()
      .then((res) => {
        setApiHealthy(res.status === 'healthy');
        setEngineVersion(res.engine_version);
      })
      .catch(() => setApiHealthy(false));
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Layers },
    { label: 'Brand Knowledge', href: '/knowledge', icon: BookOpen },
    { label: 'Audit Trail', href: '/audit', icon: Clock },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top Banner: Hackathon Demo & Workspace Info */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
            CodeAxis Round 2 MVP
          </span>
          <span className="text-slate-400">Workspace:</span>
          <span className="font-mono text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">
            {workspaceId}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                apiHealthy === true
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : apiHealthy === false
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              API: {apiHealthy === true ? `Online (${engineVersion})` : apiHealthy === false ? 'Offline / Error' : 'Connecting...'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Active Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-slate-800 text-emerald-400 text-xs border border-slate-700 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="creator">Creator (Sarah Chen)</option>
              <option value="brand_manager">Brand Manager (Marcus Vance)</option>
              <option value="reviewer">Reviewer (Elena Rostova)</option>
              <option value="admin">Administrator (Alex Thorne)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Pineco</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-700 -mt-1">
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/submissions/new"
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Content Review</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
