'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
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

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  workspaceId: string;
  token: string | null;
  loginWithRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('reviewer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PROFILES['reviewer']);
  const [workspaceId] = useState('ws-demo-enterprise-001');
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        return;
      } catch {
        // ignore JSON parse error
      }
    }

    // Default: login automatically as demo reviewer
    loginWithRole('reviewer').catch(() => {});
  }, []);

  const loginWithRole = async (targetRole: UserRole) => {
    try {
      const res = await api.login({ role: targetRole });
      localStorage.setItem('pineco_jwt_token', res.access_token);
      localStorage.setItem('pineco_jwt_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setCurrentUser(res.user);
      setRoleState(res.user.role);
    } catch {
      // Fallback to local profile if API offline
      const fallback = DEFAULT_PROFILES[targetRole] || DEFAULT_PROFILES['reviewer'];
      setCurrentUser(fallback);
      setRoleState(fallback.role);
    }
  };

  const loginWithCredentials = async (email: string, password?: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('pineco_jwt_token', res.access_token);
    localStorage.setItem('pineco_jwt_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setCurrentUser(res.user);
    setRoleState(res.user.role);
  };

  const logout = () => {
    localStorage.removeItem('pineco_jwt_token');
    localStorage.removeItem('pineco_jwt_user');
    setToken(null);
    const fallback = DEFAULT_PROFILES['creator'];
    setCurrentUser(fallback);
    setRoleState(fallback.role);
  };

  const setRole = (newRole: UserRole) => {
    loginWithRole(newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        workspaceId,
        token,
        loginWithRole,
        loginWithCredentials,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
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
