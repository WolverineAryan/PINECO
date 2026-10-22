'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  Shield,
  FileText,
  Clock,
  Sparkles,
  LogOut,
  UserCheck,
  Compass,
} from 'lucide-react';
import { useRole } from './RoleContext';

export function CrmSidebar() {
  const pathname = usePathname();
  const { currentUser, openAuthModal, role } = useRole();

  const navItems = [
    { label: 'Pipeline Overview', href: '/', icon: LayoutDashboard },
    { label: 'New Content Review', href: '/submissions/new', icon: PlusCircle },
    { label: 'Brand Knowledge Base', href: '/knowledge', icon: Shield },
    { label: 'Audit Timeline', href: '/audit', icon: Clock },
    { label: 'Public Product Page', href: '/landing', icon: Compass },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-900 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-900 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">Pineco</span>
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block -mt-0.5">
              Brand Governance
            </span>
          </div>
        </Link>
        <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
          CRM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 text-xs font-medium">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Workspace Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold border border-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Governance Health Widget */}
      <div className="p-3.5 mx-3 mb-3 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Compliance Health</span>
          <span className="text-emerald-400 font-bold font-mono">98.4%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-400 h-1.5 rounded-full w-[98.4%]" />
        </div>
        <span className="text-[10px] text-slate-400 block font-mono">Dual Rule & Claim Guardrails Active</span>
      </div>

      {/* User Persona Profile in Sidebar Footer */}
      <div className="p-3.5 border-t border-slate-900 bg-slate-950 flex items-center justify-between">
        <button
          onClick={openAuthModal}
          className="flex items-center space-x-2.5 text-left flex-1 min-w-0 group hover:opacity-90 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 shrink-0">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-white block truncate group-hover:text-emerald-300">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 block truncate capitalize font-mono">
              {role.replace('_', ' ')}
            </span>
          </div>
        </button>

        <button
          onClick={openAuthModal}
          title="Switch Account / JWT"
          className="text-slate-500 hover:text-white p-1.5 rounded-lg transition"
        >
          <UserCheck className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
