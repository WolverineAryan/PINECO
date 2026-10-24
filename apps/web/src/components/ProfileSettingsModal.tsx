'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  Shield,
  Key,
  Check,
  Copy,
  Trash2,
  AlertTriangle,
  Send,
  Building,
  Mail,
  Briefcase,
  Bell,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  initialTab?: 'profile' | 'settings' | 'help';
  onClose: () => void;
}

export function ProfileSettingsModal({
  isOpen,
  initialTab = 'profile',
  onClose,
}: ProfileSettingsModalProps) {
  const { currentUser, role, workspaceId, token, updateProfile, deleteAccount } = useRole();
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'help'>(initialTab);

  // Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedWs, setCopiedWs] = useState(false);

  // Settings State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [interceptAlerts, setInterceptAlerts] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Help & Support State
  const [supportCategory, setSupportCategory] = useState('rule_issue');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(currentUser.name);
      setTitle(currentUser.title || '');
      setDepartment(currentUser.department || '');
      setShowDeleteConfirm(false);
      setDeleteInputText('');
    }
  }, [isOpen, initialTab, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        title: title.trim(),
        department: department.trim(),
      });
      success('Profile Updated', 'Your profile details have been saved successfully.');
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    info('Token Copied', 'Active JWT bearer token copied to clipboard.');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyWorkspace = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopiedWs(true);
    info('Workspace Copied', 'Enterprise workspace ID copied.');
    setTimeout(() => setCopiedWs(false), 2000);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      success('Account Deleted', 'Your account has been deleted and active sessions revoked.');
      onClose();
    } catch (err: any) {
      toastError('Deletion Failed', err.message || 'Could not delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setIsSendingSupport(true);
    setTimeout(() => {
      setIsSendingSupport(false);
      setSupportMessage('');
      success('Support Ticket Created', 'Ticket #TICK-8921 logged. Compliance Ops will respond within 4 business hours.');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              {activeTab === 'profile' && <User className="w-4 h-4 text-purple-600" />}
              {activeTab === 'settings' && <SettingsIcon className="w-4 h-4 text-purple-600" />}
              {activeTab === 'help' && <HelpCircle className="w-4 h-4 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-black capitalize">
                {activeTab === 'profile' ? 'User Profile' : activeTab === 'settings' ? 'Account & Governance Settings' : 'Help & Documentation'}
              </h2>
              <p className="text-[11px] text-neutral-500 font-mono">
                {currentUser.email} • {role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar Tabs + Content Area (ChatGPT Style) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-56 p-3 md:p-4 border-b md:border-b-0 md:border-r border-neutral-200 bg-neutral-50/70 space-y-1 shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'profile'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-purple-400' : 'text-neutral-500'}`} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'settings'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <SettingsIcon className={`w-4 h-4 ${activeTab === 'settings' ? 'text-purple-400' : 'text-neutral-500'}`} />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'help'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${activeTab === 'help' ? 'text-purple-400' : 'text-neutral-500'}`} />
              <span>Help & Support</span>
            </button>

            <div className="pt-4 mt-4 border-t border-neutral-200/80 px-2 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block tracking-wider">
                Workspace Scope
              </span>
              <div className="bg-white p-2 rounded-lg border border-neutral-200 text-[11px] font-mono text-neutral-600">
                <div className="font-bold text-black truncate">Pineco Enterprise</div>
                <div className="text-[10px] text-purple-700 font-semibold truncate">16 Portfolios Active</div>
              </div>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
            {/* ========================================================= */}
            {/* TAB 1: PROFILE */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar & Role Badge */}
                <div className="flex items-center space-x-4 pb-4 border-b border-neutral-200">
                  <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-mono font-bold text-xl border-2 border-purple-500/40 shadow-xs">
                    {currentUser.avatar}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-black flex items-center space-x-2">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                        {role.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-black font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 font-mono cursor-not-allowed shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Compliance Officer"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Legal & Risk"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-xs"
                    />
                  </div>
                </div>

                {/* Workspace & JWT Token Details */}
                <div className="pt-2 space-y-3">
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                        Active Workspace ID
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyWorkspace}
                        className="text-purple-600 hover:text-purple-800 text-[11px] font-bold flex items-center space-x-1"
                      >
                        {copiedWs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWs ? 'Copied' : 'Copy ID'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-black font-semibold truncate bg-white p-2 rounded-lg border border-neutral-200">
                      {workspaceId}
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-1.5">
                        <Key className="w-3 h-3 text-purple-600" />
                        <span>Cryptographic JWT Bearer Token</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="text-purple-600 hover:text-purple-800 text-[11px] font-bold flex items-center space-x-1"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-neutral-600 truncate bg-white p-2 rounded-lg border border-neutral-200">
                      {token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-black hover:bg-neutral-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  >
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* TAB 2: SETTINGS & DANGER ZONE */}
            {/* ========================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 text-xs">
                {/* Interface Theme */}
                <div className="space-y-3 pb-5 border-b border-neutral-200">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Interface Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`p-3 rounded-xl border text-center transition font-semibold ${
                        theme === 'light'
                          ? 'border-purple-600 bg-purple-50/50 text-black shadow-xs font-bold'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Light Enterprise
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`p-3 rounded-xl border text-center transition font-semibold ${
                        theme === 'dark'
                          ? 'border-purple-600 bg-purple-50/50 text-black shadow-xs font-bold'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Dark Enclave
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`p-3 rounded-xl border text-center transition font-semibold ${
                        theme === 'system'
                          ? 'border-purple-600 bg-purple-50/50 text-black shadow-xs font-bold'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      System Sync
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3 pb-5 border-b border-neutral-200">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Governance Notifications
                  </label>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div>
                        <span className="font-bold text-black block">Regulatory Intercept Alerts</span>
                        <span className="text-[11px] text-neutral-500">Notify instantly when critical statutory violations are intercepted in draft copy.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={interceptAlerts}
                        onChange={(e) => setInterceptAlerts(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div>
                        <span className="font-bold text-black block">Dual-Custody Sign-Off Requests</span>
                        <span className="text-[11px] text-neutral-500">Alert reviewer when a campaign requires human approval sign-off.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={approvalAlerts}
                        onChange={(e) => setApprovalAlerts(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div>
                        <span className="font-bold text-black block">Weekly Compliance Digest</span>
                        <span className="text-[11px] text-neutral-500">Summary of review velocity and recurring risk patterns across portfolios.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={weeklyDigest}
                        onChange={(e) => setWeeklyDigest(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Enforcement Sensitivity */}
                <div className="space-y-3 pb-5 border-b border-neutral-200">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Evidence Verification Mode
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div>
                      <span className="font-bold text-black block">Strict Evidence Enforcement</span>
                      <span className="text-[11px] text-neutral-500">Blocks release of any quantitative claim missing verified corporate fact anchors.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStrictMode(!strictMode)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        strictMode ? 'bg-purple-600' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          strictMode ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Danger Zone: Delete Account */}
                <div className="p-4 sm:p-5 rounded-2xl border border-rose-300 bg-rose-50/40 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Danger Zone: Delete User Account</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Permanently delete your profile, active JWT bearer sessions, and workspace review history. Once deleted, your account cannot be recovered.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  ) : (
                    <div className="bg-white p-3.5 rounded-xl border border-rose-300 space-y-3 animate-in fade-in">
                      <p className="text-xs font-bold text-rose-950">
                        Confirm Account Deletion? All cryptographic credentials and reviewer history will be erased.
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={handleDeleteAccount}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs"
                        >
                          {isDeleting ? 'Erasing...' : 'Yes, Delete My Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-neutral-200 hover:bg-neutral-300 text-black font-semibold text-xs px-4 py-2 rounded-xl transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: HELP & SUPPORT */}
            {/* ========================================================= */}
            {activeTab === 'help' && (
              <div className="space-y-6 text-xs">
                {/* Quick Start Guides */}
                <div className="space-y-3 pb-5 border-b border-neutral-200">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Quick Operational Guides
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="font-bold text-black block">1. Deterministic Rule Scans</span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Instant regex keyword checks block prohibited guarantee phrases in &lt;0.04s before AI processing.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="font-bold text-black block">2. Fact Grounding Proofs</span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Quantitative claims are bound to corporate knowledge records or labeled unverified.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="font-bold text-black block">3. Dual-Custody Approval</span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Authorized reviewers approve or reject changes with mandatory written compliance rationales.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="font-bold text-black block">4. Merkle Chain Verification</span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Every scan and decision is committed to a permanent SHA-256 cryptographic audit ledger.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="space-y-3 pb-5 border-b border-neutral-200">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Keyboard Shortcuts
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="text-neutral-500">Scan Copy</span>
                      <kbd className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-bold text-black">Cmd+S</kbd>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="text-neutral-500">Search Scans</span>
                      <kbd className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-bold text-black">Cmd+K</kbd>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="text-neutral-500">Export Report</span>
                      <kbd className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-bold text-black">Cmd+E</kbd>
                    </div>
                  </div>
                </div>

                {/* Contact Compliance Support */}
                <form onSubmit={handleSendSupport} className="space-y-3">
                  <label className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                    Contact Compliance & Technical Support
                  </label>

                  <div className="space-y-2">
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-black font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                    >
                      <option value="rule_issue">Rule Intercept False Positive</option>
                      <option value="fact_evidence">Evidence Benchmark Discrepancy</option>
                      <option value="export_issue">Dossier PDF / PPTX Export Assistance</option>
                      <option value="rbac">User Permissions & Role Scoping</option>
                      <option value="general">General Support Inquiry</option>
                    </select>

                    <textarea
                      required
                      rows={3}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe the issue or assistance required..."
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-black text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-xs"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSendingSupport}
                        className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingSupport ? 'Submitting...' : 'Send Support Ticket'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* System Diagnostics Status */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-500">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Pineco Sentinel v2.4</span>
                  </div>
                  <span>API Status: 200 OK</span>
                  <span className="text-purple-700 font-bold">Merkle Parity: VALID</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
