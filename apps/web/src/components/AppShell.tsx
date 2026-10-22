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
  Folder,
  FolderPlus,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { AuthModal } from './AuthModal';
import { CreateProductModal } from './CreateProductModal';
import { ScanCopyModal } from './ScanCopyModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    role,
    currentUser,
    workspaceId,
    openAuthModal,
    products,
    activeProduct,
    setActiveProduct,
    isDemoMode,
  } = useRole();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedWs, setCopiedWs] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showScanCopy, setShowScanCopy] = useState(false);

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
    { label: 'Compliance Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Brand Guidelines', href: '/knowledge', icon: Shield },
    { label: 'Audit Timeline', href: '/audit', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#191919] flex">
      <AuthModal />
      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
      />
      <ScanCopyModal
        isOpen={showScanCopy}
        onClose={() => setShowScanCopy(false)}
      />

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E8E8DC] flex-col shrink-0 min-h-screen fixed inset-y-0 left-0 z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E8E8DC] flex items-center justify-between bg-white">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#F6C324] flex items-center justify-center text-[#191919] shadow-sm font-bold transition-transform group-hover:scale-105">
              <ShieldCheck className="w-4 h-4 text-[#191919]" />
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
            PROD
          </span>
        </div>

        {/* Product Folder Selection Card */}
        <div className="p-3 border-b border-[#E8E8DC] bg-[#FFFFF0]/60 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-slate-500">
              Product Space (Folder)
            </span>
            <button
              onClick={() => setShowCreateProduct(true)}
              className="text-[10px] font-bold text-[#191919] hover:underline flex items-center space-x-0.5"
            >
              <FolderPlus className="w-3 h-3 text-[#191919]" />
              <span>+ New</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={activeProduct?.id || ''}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setActiveProduct(found);
              }}
              className="w-full text-xs font-bold text-[#191919] bg-white border border-[#E8E8DC] hover:border-[#F6C324] rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-[#F6C324] cursor-pointer shadow-sm pr-7 truncate"
            >
              {products.length === 0 ? (
                <option value="">(No product folders yet)</option>
              ) : (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {activeProduct && (
            <div className="text-[10px] text-slate-500 font-mono truncate px-1 flex items-center justify-between">
              <span>{activeProduct.category}</span>
              <span className="text-emerald-700 font-bold">Active Scope</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Product Compliance
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
            Navigation
          </div>
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:text-[#191919] hover:bg-[#FFFFF0] transition"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Product Landing</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </Link>
        </nav>

        {/* Quick Scan Action in Sidebar */}
        <div className="p-3 mx-3 mb-2">
          <button
            onClick={() => setShowScanCopy(true)}
            className="w-full flex items-center justify-center space-x-2 bg-[#F6C324] hover:bg-[#e5b41e] text-[#191919] text-xs font-bold py-2.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-[#191919]" />
            <span>Scan New Copy</span>
          </button>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-t border-[#E8E8DC] bg-white flex items-center justify-between">
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
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
              <span className="text-slate-400">Products</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#191919] flex items-center space-x-1">
                <span>📁 {activeProduct?.name || 'All Workspace Assets'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowCreateProduct(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs text-[#191919] bg-white border border-[#E8E8DC] hover:border-[#F6C324] px-3 py-2 rounded-xl transition font-semibold shadow-sm"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => setShowScanCopy(true)}
              className="flex items-center space-x-1.5 bg-[#F6C324] hover:bg-[#e5b41e] text-[#191919] text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#191919]" />
              <span>Scan Content</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E8E8DC] p-4 space-y-2 text-xs font-medium">
            <div className="pb-2 border-b border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Active Product:</span>
              <select
                value={activeProduct?.id || ''}
                onChange={(e) => {
                  const found = products.find((p) => p.id === e.target.value);
                  if (found) setActiveProduct(found);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowScanCopy(true);
              }}
              className="w-full flex items-center justify-center space-x-1.5 bg-[#F6C324] text-[#191919] p-2 rounded-xl font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan New Copy</span>
            </button>
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
