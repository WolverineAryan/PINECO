'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Shield,
  Clock,
  UserCheck,
  Menu,
  X,
  Check,
  ChevronDown,
  Folder,
  FolderPlus,
  Bot,
  Sparkles,
  Key,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from './Toast';
import { AuthModal } from './AuthModal';
import { CreateProductModal } from './CreateProductModal';
import { ScanCopyModal } from './ScanCopyModal';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import {
  DashboardSkeleton,
  KnowledgeSkeleton,
  AuditSkeleton,
  SubmissionDetailSkeleton,
} from './Skeleton';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    role,
    setRole,
    currentUser,
    workspaceId,
    openAuthModal,
    logout,
    products,
    activeProduct,
    setActiveProduct,
    isRoleSwitching,
    roleSwitchBanner,
    dismissRoleBanner,
    hasPermission,
  } = useRole();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showScanCopy, setShowScanCopy] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'settings' | 'help'>('profile');

  // If on public landing page or dedicated auth pages, render directly without app sidebar
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLanding = pathname === '/' || pathname === '/landing';

  if (isLanding || isAuthPage) {
    return (
      <div className="min-h-screen bg-white text-black">
        {children}
      </div>
    );
  }

  const navItems = [
    { label: 'Compliance Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Brand Guidelines', href: '/knowledge', icon: Shield },
    { label: 'AI Agent & Automation', href: '/automation', icon: Bot },
    { label: 'Audit Timeline', href: '/audit', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex">
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        initialTab={profileModalTab}
        onClose={() => setProfileModalOpen(false)}
      />
      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
      />
      <ScanCopyModal
        isOpen={showScanCopy}
        onClose={() => setShowScanCopy(false)}
      />

      {/* Desktop Persistent Left Sidebar (30% Black / Neutral structure) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-200 flex-col shrink-0 min-h-screen fixed inset-y-0 left-0 z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-neutral-200 flex items-center bg-white">
          <Link href="/dashboard" className="flex items-center w-full group">
            <img
              src="/logo-text.png"
              alt="Pineco"
              className="h-10 w-auto max-w-full object-contain object-left transition group-hover:opacity-90"
            />
          </Link>
        </div>

        {/* Product Folder Selection Card */}
        <div className="p-3 border-b border-neutral-200 bg-neutral-50/70 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Folder className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-neutral-500">
                Product Workspace
              </span>
            </div>
            {products.length > 0 && (
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100/80 px-2 py-0.2 rounded-full font-bold">
                {products.length} Products
              </span>
            )}
          </div>

          <div className="relative">
            <select
              value={activeProduct?.id || 'all'}
              onChange={(e) => {
                if (e.target.value === 'all' || !e.target.value) {
                  setActiveProduct(null);
                } else {
                  const found = products.find((p) => p.id === e.target.value);
                  if (found) setActiveProduct(found);
                }
              }}
              className="w-full text-xs font-bold text-black bg-white border border-neutral-300 hover:border-black rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 cursor-pointer shadow-xs pr-7 truncate transition"
            >
              <option value="all">All Products (16 Portfolios)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <div className="text-[10px] text-neutral-500 font-mono truncate px-1 flex items-center justify-between">
            <span>{activeProduct ? activeProduct.category : 'All 16 Enterprise Portfolios'}</span>
            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.2 rounded-full font-bold">
              {activeProduct ? 'Active Scope' : '20 Entries'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Product Compliance
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
            const isRestricted = item.href === '/audit' && !hasPermission('canInspectAuditTrail');
            const isReadOnly = item.href === '/knowledge' && !hasPermission('canEditRules');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-950 via-black to-black text-white shadow-xs font-bold border-l-3 border-purple-500 ring-1 ring-purple-500/30'
                    : 'text-neutral-600 hover:text-black hover:bg-purple-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-neutral-500'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {isRestricted && (
                  <span className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                    Restricted
                  </span>
                )}
                {isReadOnly && (
                  <span className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                    Read-Only
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Scan Action in Sidebar */}
        <div className="p-3 mx-3 mb-2">
          <button
            onClick={() => setShowScanCopy(true)}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition active:scale-95 hover:shadow-[0_0_22px_rgba(124,58,237,0.45)] border border-purple-400/30"
          >
            <PlusCircle className="w-4 h-4 text-purple-200" />
            <span>Scan New Copy</span>
          </button>
        </div>

        {/* User Card in Sidebar Footer (ChatGPT-Style Popover Menu) */}
        <div className="p-3 border-t border-neutral-200 bg-white relative">
          {/* ChatGPT-Style Small Floating Pop-up Menu */}
          {profileMenuOpen && (
            <>
              {/* Invisible Click-Outside Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileMenuOpen(false)}
              />

              {/* Floating Menu Popover */}
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs">
                {/* User Header Summary */}
                <div className="p-2.5 pb-2 border-b border-neutral-100 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-purple-500/30">
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-black block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                {/* Navigation Options */}
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setProfileModalTab('profile');
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 font-semibold transition text-left"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setProfileModalTab('settings');
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 font-semibold transition text-left"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setProfileModalTab('help');
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 font-semibold transition text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Help &amp; Support</span>
                  </button>
                </div>

                <div className="border-t border-neutral-100 pt-1 space-y-0.5">
                  <Link
                    href="/login"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 text-[11px] transition text-left font-medium"
                  >
                    <Key className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Switch Account / Sign In</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition text-left text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Bottom Profile Pill Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2.5 text-left flex-1 min-w-0 group hover:opacity-90 p-1.5 rounded-xl hover:bg-neutral-100/70 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-purple-500/30">
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-black block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-purple-600 block truncate capitalize font-mono font-bold">
                  {role.replace('_', ' ')}
                </span>
              </div>
              <ChevronUp className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (60% White dominant canvas with subtle purple radial backdrop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-purple-700 hover:bg-purple-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/dashboard" className="lg:hidden flex items-center">
              <img
                src="/logo-text.png"
                alt="Pineco"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-600">
              <span className="text-neutral-400">Products</span>
              <span className="text-neutral-300">/</span>
              <span className="font-bold text-black flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-purple-600" />
                <span>{activeProduct?.name || 'All Workspace Assets'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick RBAC Role Simulator Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:border-purple-300 bg-neutral-50/90 hover:bg-purple-50/50 transition-all text-xs font-semibold shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span className="font-mono text-[9px] uppercase font-bold text-neutral-400">Role:</span>
                <span className="text-black capitalize font-bold text-xs">{role.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 mb-1">
                    Simulate Access Role (RBAC)
                  </div>
                  {(['reviewer', 'brand_manager', 'creator', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        if (role !== r) {
                          setRole(r);
                        }
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        role === r
                          ? 'bg-purple-50 text-purple-900 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div>
                        <div className="capitalize">{r.replace('_', ' ')}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {r === 'reviewer' && 'Reviews & override justifications'}
                          {r === 'brand_manager' && 'Policy & ground truth rules'}
                          {r === 'creator' && 'Drafter & pre-publication checks'}
                          {r === 'admin' && 'Sovereign root governance'}
                        </div>
                      </div>
                      {role === r && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowScanCopy(true)}
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 hover:shadow-[0_0_15px_-2px_rgba(124,58,237,0.35)] border border-purple-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
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
                value={activeProduct?.id || 'all'}
                onChange={(e) => {
                  if (e.target.value === 'all' || !e.target.value) {
                    setActiveProduct(null);
                  } else {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setActiveProduct(found);
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-bold p-2 border border-neutral-300 rounded-lg text-black bg-white"
              >
                <option value="all">All Products (16 Portfolios)</option>
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
                  pathname === item.href ? 'bg-black text-white font-bold border-l-2 border-purple-500' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <item.icon className="w-4 h-4 text-purple-400" />
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
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Scan New Copy</span>
            </button>
          </div>
        )}

        {/* Inner Page View (60% White dominant canvas with subtle purple radial top glow) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-neutral-50/40 bg-purple-radial min-h-[calc(100vh-4rem)]">
          {/* Dynamic Enterprise Role Switch Notification Banner */}
          {roleSwitchBanner && (
            <div className="mb-6 bg-white border border-purple-200 rounded-2xl p-4 shadow-xs flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs uppercase tracking-wider">
                  {roleSwitchBanner.role.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-black">Active Persona: {roleSwitchBanner.title}</span>
                    <span className="text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                      Scope: {roleSwitchBanner.scope}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      RBAC Enforced
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {roleSwitchBanner.message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissRoleBanner}
                className="text-neutral-400 hover:text-black p-1.5 rounded-lg hover:bg-neutral-100 transition shrink-0 text-xs font-semibold"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {isRoleSwitching ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-black text-white px-4 py-3 rounded-2xl text-xs font-mono shadow-xl border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-neutral-300 font-bold uppercase text-[10px] tracking-wider">Re-authenticating Access Scope:</span>
                  <span className="text-white font-bold capitalize">{role.replace('_', ' ')}</span>
                </div>
                <span className="text-purple-300 text-[10px] uppercase font-mono tracking-wider">Calibrating RBAC Privileges...</span>
              </div>
              {(() => {
                if (pathname === '/knowledge') return <KnowledgeSkeleton />;
                if (pathname === '/audit') return <AuditSkeleton />;
                if (pathname.startsWith('/submissions/')) return <SubmissionDetailSkeleton />;
                return <DashboardSkeleton />;
              })()}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
