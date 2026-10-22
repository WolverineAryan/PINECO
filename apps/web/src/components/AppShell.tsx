'use client';

import React, { useState } from 'react';
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
  UserCheck,
  Compass,
  Menu,
  X,
  Copy,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { AuthModal } from './AuthModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, currentUser, workspaceId, openAuthModal } = useRole();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedWs, setCopiedWs] = useState(false);

  // If on public landing page at '/', render directly without app sidebar
  const isLanding = pathname === '/';

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#FFFFF0] text-[#191919]">
        <AuthModal />
        {children}
      </div>
    );
  }

  const copyWorkspace = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopiedWs(true);
    success('Workspace ID Copied', workspaceId);
    setTimeout(() => setCopiedWs(false), 2000);
  };

  const navItems = [
    { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Submit Copy', href: '/submissions/new', icon: PlusCircle },
    { label: 'Brand Policies & Rules', href: '/knowledge', icon: Shield },
    { label: 'Compliance Audit Log', href: '/audit', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#191919] flex">
      <AuthModal />

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E8E8DC] flex-col shrink-0 min-h-screen fixed inset-y-0 left-0 z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E8E8DC] flex items-center justify-between bg-white">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#F6C324] flex items-center justify-center text-[#191919] shadow-sm font-bold transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-[#191919]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-[#191919] block">
                Pineco
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block -mt-1 font-semibold">
                Brand Governance
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-mono bg-[#FFFFF0] border border-[#E8E8DC] text-[#191919] px-2 py-0.5 rounded font-bold">
            CRM
          </span>
        </div>

        {/* Workspace Quick Badge */}
        <div className="px-4 py-3 border-b border-[#E8E8DC] bg-[#FFFFF0]/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Workspace:</span>
            <button
              onClick={copyWorkspace}
              className="flex items-center space-x-1 font-mono text-[11px] text-[#191919] hover:text-black font-semibold bg-white border border-[#E8E8DC] px-2 py-0.5 rounded transition"
              title="Copy ID"
            >
              <span className="truncate max-w-[110px]">{workspaceId}</span>
              {copiedWs ? <Check className="w-3 h-3 text-[#191919]" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 text-xs font-medium">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Platform Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#F6C324] text-[#191919] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#191919]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            External
          </div>
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0] transition"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Public Landing Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </Link>
        </nav>

        {/* Governance Health Card in Sidebar */}
        <div className="p-3.5 mx-3 mb-3 bg-[#FFFFF0] border border-[#F6C324]/60 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Governance Health</span>
            <span className="text-[#191919] font-bold font-mono">98.4%</span>
          </div>
          <div className="w-full bg-[#E8E8DC] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#F6C324] h-1.5 rounded-full w-[98.4%]" />
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">Dual Rule & Claim Guardrails Active</span>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3.5 border-t border-[#E8E8DC] bg-white flex items-center justify-between">
          <button
            onClick={openAuthModal}
            className="flex items-center space-x-2.5 text-left flex-1 min-w-0 group hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F6C324] text-[#191919] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#191919] block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 block truncate capitalize font-mono font-medium">
                {role.replace('_', ' ')}
              </span>
            </div>
          </button>

          <button
            onClick={openAuthModal}
            title="Switch Persona / Inspect JWT"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#191919] hover:bg-[#FFFFF0] transition"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E8E8DC] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="hidden sm:inline-block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Pineco Brand Governance OS
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openAuthModal}
              className="hidden sm:flex items-center space-x-1.5 text-xs text-[#191919] bg-[#FFFFF0] border border-[#E8E8DC] hover:border-[#F6C324] px-3 py-1.5 rounded-xl transition font-medium"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#191919]" />
              <span>{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] bg-[#F6C324] text-[#191919] px-1.5 py-0.2 rounded font-bold font-mono">
                {role.replace('_', ' ')}
              </span>
            </button>

            <Link
              href="/submissions/new"
              className="flex items-center space-x-1.5 bg-[#F6C324] hover:bg-[#e5b41e] text-[#191919] text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#191919]" />
              <span>Submit Copy</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E8E8DC] p-4 space-y-2 text-xs font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl ${
                  pathname === item.href ? 'bg-[#F6C324] text-[#191919] font-bold' : 'text-slate-600 hover:bg-[#FFFFF0]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-[#FFFFF0]"
            >
              <Compass className="w-4 h-4" />
              <span>Public Landing Page</span>
            </Link>
          </div>
        )}

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
