'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Shield,
  Clock,
  UserCheck,
  Menu,
  X,
  Copy,
  Check,
  ChevronDown,
  Folder,
  FolderPlus,
  Bot,
  Sparkles,
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
      <div className="min-h-screen bg-white text-black">
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
    { label: 'AI Agent & Automation', href: '/automation', icon: Bot },
    { label: 'Audit Timeline', href: '/audit', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex">
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
      <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-200 flex-col shrink-0 min-h-screen fixed inset-y-0 left-0 z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-neutral-200 flex items-center bg-white">
          <Link href="/dashboard" className="flex items-center w-full group">
            <img
              src="/logo-navbar.png"
              alt="Pineco"
              className="h-9 w-full object-contain object-left transition group-hover:opacity-90"
            />
          </Link>
        </div>

        {/* Product Folder Selection Card */}
        <div className="p-3 border-b border-neutral-200 bg-neutral-50/70 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Folder className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-neutral-500">
              Product Workspace
            </span>
          </div>

          <div className="relative">
            <select
              value={activeProduct?.id || ''}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setActiveProduct(found);
              }}
              className="w-full text-xs font-bold text-black bg-white border border-neutral-300 hover:border-black rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-xs pr-7 truncate"
            >
              {products.length === 0 ? (
                <option value="">(No product workspaces)</option>
              ) : (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {activeProduct && (
            <div className="text-[10px] text-neutral-500 font-mono truncate px-1 flex items-center justify-between">
              <span>{activeProduct.category}</span>
              <span className="text-black font-bold">Active Scope</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
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
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Scan Action in Sidebar */}
        <div className="p-3 mx-3 mb-2">
          <button
            onClick={() => setShowScanCopy(true)}
            className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Scan New Copy</span>
          </button>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-t border-neutral-200 bg-white flex items-center justify-between">
          <button
            onClick={openAuthModal}
            className="flex items-center space-x-2.5 text-left flex-1 min-w-0 group hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-black block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-neutral-500 block truncate capitalize font-mono font-medium">
                {role.replace('_', ' ')}
              </span>
            </div>
          </button>

          <button
            onClick={openAuthModal}
            title="Switch Persona / Inspect JWT"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/dashboard" className="lg:hidden flex items-center">
              <img
                src="/logo-navbar.png"
                alt="Pineco"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-600">
              <span className="text-neutral-400">Products</span>
              <span className="text-neutral-300">/</span>
              <span className="font-bold text-black flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-neutral-600" />
                <span>{activeProduct?.name || 'All Workspace Assets'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-black">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span>SENTINEL ONLINE</span>
            </div>

            <button
              onClick={copyWorkspace}
              title="Copy active Workspace ID"
              className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono text-neutral-600 hover:text-black border border-neutral-200 hover:border-black bg-white px-2.5 py-1.5 rounded-xl transition"
            >
              {copiedWs ? (
                <>
                  <Check className="w-3 h-3 text-black" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-neutral-400" />
                  <span>WS: {workspaceId.slice(0, 8)}...</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowScanCopy(true)}
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Scan Copy</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 p-4 space-y-2 text-xs font-medium">
            <div className="pb-2 border-b border-neutral-100">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">Active Product:</span>
              <select
                value={activeProduct?.id || ''}
                onChange={(e) => {
                  const found = products.find((p) => p.id === e.target.value);
                  if (found) setActiveProduct(found);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-bold p-2 border border-neutral-300 rounded-lg text-black bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                  pathname === item.href ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100'
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
              className="w-full flex items-center justify-center space-x-1.5 bg-black text-white p-2 rounded-xl font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan New Copy</span>
            </button>
          </div>
        )}

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-neutral-50/40 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
