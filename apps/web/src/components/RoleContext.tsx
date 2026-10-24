'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Product } from '@/lib/types';
import { api } from '@/lib/api';

const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  creator: {
    id: 'usr-creator-sarah',
    email: 'creator@pineco.internal',
    name: 'Sarah Chen',
    role: 'creator',
    title: 'Content Marketing Specialist',
    department: 'Growth & Communications',
    avatar: 'SC',
  },
  brand_manager: {
    id: 'usr-manager-marcus',
    email: 'manager@pineco.internal',
    name: 'Marcus Vance',
    role: 'brand_manager',
    title: 'Head of Brand Governance',
    department: 'Global Brand Office',
    avatar: 'MV',
  },
  reviewer: {
    id: 'usr-reviewer-elena',
    email: 'reviewer@pineco.internal',
    name: 'Elena Rostova',
    role: 'reviewer',
    title: 'Compliance & Legal Reviewer',
    department: 'Legal & Risk Governance',
    avatar: 'ER',
  },
  admin: {
    id: 'usr-admin-alex',
    email: 'admin@pineco.internal',
    name: 'Alex Thorne',
    role: 'admin',
    title: 'Enterprise Administrator',
    department: 'Platform Operations',
    avatar: 'AT',
  },
};

export interface RolePermissions {
  canEditRules: boolean;
  canEditFacts: boolean;
  canApproveSubmissions: boolean;
  canOverrideWithRationale: boolean;
  canCreateSubmissions: boolean;
  canInspectAuditTrail: boolean;
  canManageWorkspace: boolean;
  canExportPackets: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canEditRules: true,
    canEditFacts: true,
    canApproveSubmissions: true,
    canOverrideWithRationale: true,
    canCreateSubmissions: true,
    canInspectAuditTrail: true,
    canManageWorkspace: true,
    canExportPackets: true,
  },
  brand_manager: {
    canEditRules: true,
    canEditFacts: true,
    canApproveSubmissions: true,
    canOverrideWithRationale: true,
    canCreateSubmissions: true,
    canInspectAuditTrail: true,
    canManageWorkspace: false,
    canExportPackets: true,
  },
  reviewer: {
    canEditRules: false,
    canEditFacts: false,
    canApproveSubmissions: true,
    canOverrideWithRationale: true,
    canCreateSubmissions: false,
    canInspectAuditTrail: true,
    canManageWorkspace: false,
    canExportPackets: true,
  },
  creator: {
    canEditRules: false,
    canEditFacts: false,
    canApproveSubmissions: false,
    canOverrideWithRationale: false,
    canCreateSubmissions: true,
    canInspectAuditTrail: false,
    canManageWorkspace: false,
    canExportPackets: false,
  },
};

export interface RoleDetail {
  name: string;
  scope: string;
  description: string;
  unlockedList: string[];
  restrictedList: string[];
}

export const ROLE_DETAILS: Record<UserRole, RoleDetail> = {
  creator: {
    name: 'Content Marketing Specialist (Creator)',
    scope: 'Drafter & Pre-Publication Scans',
    description: 'Switched to Creator persona. Pre-flight copy drafting and real-time scanning are active. Human decision custody and audit log inspection are restricted under dual custody.',
    unlockedList: ['Draft Submissions', 'Real-Time Copy Scanner', 'Version Revision Editor', 'Brand Guideline Inspection'],
    restrictedList: ['Human Sign-Off Custody', 'Finding Overrides', 'Immutable Audit Ledger', 'Policy Rule Creation'],
  },
  reviewer: {
    name: 'Compliance & Legal Reviewer',
    scope: 'Review Custody & Overrides',
    description: 'Switched to Reviewer persona. Compliance inspection, rationale-backed finding overrides, and dual-custody publication sign-offs are active. Rule authoring is restricted to preserve evaluator objectivity.',
    unlockedList: ['Submission Sign-Off (Approve / Reject)', 'Finding Override with Rationale', 'Immutable Audit Ledger', 'Compliance Evidence Inspection'],
    restrictedList: ['Policy Rule Authoring', 'Approved Fact Deletion', 'Workspace Configuration'],
  },
  brand_manager: {
    name: 'Head of Brand Governance',
    scope: 'Policy Rules & Truth Library',
    description: 'Switched to Brand Manager persona. Deterministic brand rule authoring, approved fact library curation, and compliance audits are unlocked.',
    unlockedList: ['Deterministic Rule Authoring', 'Truth Library / Approved Facts', 'Submission Decision Custody', 'Audit Trail Analysis'],
    restrictedList: ['Workspace Infrastructure Config (Admin only)'],
  },
  admin: {
    name: 'Enterprise Administrator',
    scope: 'Sovereign Root Governance',
    description: 'Switched to Enterprise Administrator persona. Sovereign control unlocked across all workspace configurations, rule libraries, audit trails, and review custody.',
    unlockedList: ['Sovereign Root Governance', 'Workspace & User Management', 'Deterministic Rule Authoring', 'Full Audit Log Custody', 'All Decision Overrides'],
    restrictedList: [],
  },
};

export interface RoleSwitchBannerInfo {
  role: UserRole;
  title: string;
  scope: string;
  message: string;
  timestamp: number;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  permissions: RolePermissions;
  hasPermission: (perm: keyof RolePermissions) => boolean;
  isRoleSwitching: boolean;
  roleSwitchBanner: RoleSwitchBannerInfo | null;
  dismissRoleBanner: () => void;
  isAuthenticated: boolean;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  products: Product[];
  activeProduct: Product | null;
  setActiveProduct: (prod: Product | null) => void;
  reloadProducts: () => Promise<void>;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    title?: string;
    department?: string;
  }) => Promise<void>;
  loginWithRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; title?: string; department?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  openAuthModal: (mode?: any) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('reviewer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PROFILES['reviewer']);
  const [isRoleSwitching, setIsRoleSwitching] = useState<boolean>(false);
  const [roleSwitchBanner, setRoleSwitchBanner] = useState<RoleSwitchBannerInfo | null>(null);
  const [workspaceId, setWorkspaceId] = useState('ws-demo-enterprise-001');
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isDemoMode, setDemoMode] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const reloadProducts = async () => {
    try {
      const list = await api.getProducts(workspaceId);
      setProducts(list);
      if (list.length > 0) {
        setActiveProduct((prev) => {
          if (prev && list.some((p) => p.id === prev.id)) {
            return list.find((p) => p.id === prev.id) || null;
          }
          return null;
        });
      } else {
        setActiveProduct(null);
      }
    } catch {
      // If offline
    }
  };

  useEffect(() => {
    reloadProducts();
  }, [workspaceId]);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('pineco_jwt_token');
    const savedUser = localStorage.getItem('pineco_jwt_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setToken(savedToken);
        setCurrentUser(parsed);
        setRoleState(parsed.role);
        setIsAuthenticated(true);

        // Verify token with backend /me in background
        api
          .getCurrentUser()
          .then((verifiedProfile) => {
            setCurrentUser(verifiedProfile);
            setRoleState(verifiedProfile.role);
            localStorage.setItem('pineco_jwt_user', JSON.stringify(verifiedProfile));
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('pineco_jwt_token');
            localStorage.removeItem('pineco_jwt_user');
            setToken(null);
            setIsAuthenticated(false);
          });
        return;
      } catch {
        // ignore JSON parse error
      }
    }

    // Default: initialize with demo reviewer credentials
    loginWithCredentials('reviewer@pineco.internal', 'pineco2026!').catch(() => {});
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('pineco_jwt_token', res.access_token);
    localStorage.setItem('pineco_jwt_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setCurrentUser(res.user);
    setRoleState(res.user.role);
    setIsAuthenticated(true);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    title?: string;
    department?: string;
  }) => {
    const res = await api.register(data);
    localStorage.setItem('pineco_jwt_token', res.access_token);
    localStorage.setItem('pineco_jwt_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setCurrentUser(res.user);
    setRoleState(res.user.role);
    setIsAuthenticated(true);
  };

  const loginWithRole = async (targetRole: UserRole) => {
    try {
      const res = await api.login({ role: targetRole });
      localStorage.setItem('pineco_jwt_token', res.access_token);
      localStorage.setItem('pineco_jwt_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setCurrentUser(res.user);
      setRoleState(res.user.role);
      setIsAuthenticated(true);
    } catch {
      const fallback = DEFAULT_PROFILES[targetRole] || DEFAULT_PROFILES['reviewer'];
      setCurrentUser(fallback);
      setRoleState(fallback.role);
    }
  };

  const loginWithCredentials = async (email: string, password?: string) => {
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('pineco_jwt_token');
    localStorage.removeItem('pineco_jwt_user');
    setToken(null);
    setIsAuthenticated(false);
    const fallback = DEFAULT_PROFILES['creator'];
    setCurrentUser(fallback);
    setRoleState(fallback.role);
  };

  const updateProfile = async (data: { name?: string; title?: string; department?: string }) => {
    try {
      const updated = await api.updateCurrentUser(data);
      setCurrentUser(updated);
      localStorage.setItem('pineco_jwt_user', JSON.stringify(updated));
    } catch {
      // Local fallback for demo or offline accounts
      const updated: UserProfile = {
        ...currentUser,
        name: data.name || currentUser.name,
        title: data.title || currentUser.title,
        department: data.department || currentUser.department,
        avatar: data.name ? data.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() : currentUser.avatar,
      };
      setCurrentUser(updated);
      localStorage.setItem('pineco_jwt_user', JSON.stringify(updated));
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteCurrentUser();
    } catch {
      // Ignore network errors for local demo accounts
    }
    logout();
  };

  const setRole = (newRole: UserRole) => {
    if (newRole === role) return;
    setIsRoleSwitching(true);

    const detail = ROLE_DETAILS[newRole] || ROLE_DETAILS['reviewer'];
    setRoleSwitchBanner({
      role: newRole,
      title: detail.name,
      scope: detail.scope,
      message: detail.description,
      timestamp: Date.now(),
    });

    loginWithRole(newRole);

    // Provide a smooth skeleton shimmer feedback transition
    setTimeout(() => {
      setIsRoleSwitching(false);
    }, 600);
  };

  const dismissRoleBanner = () => {
    setRoleSwitchBanner(null);
  };

  const openAuthModal = (mode?: any) => {
    setAuthModalMode(mode === 'signup' ? 'signup' : 'signin');
    setIsAuthModalOpen(true);
  };

  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['reviewer'];
  const hasPermission = (perm: keyof RolePermissions): boolean => {
    return !!permissions[perm];
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        permissions,
        hasPermission,
        isRoleSwitching,
        roleSwitchBanner,
        dismissRoleBanner,
        isAuthenticated,
        workspaceId,
        setWorkspaceId,
        products,
        activeProduct,
        setActiveProduct,
        reloadProducts,
        isDemoMode,
        setDemoMode,
        token,
        login,
        register,
        loginWithRole,
        loginWithCredentials,
        logout,
        updateProfile,
        deleteAccount,
        openAuthModal,
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
