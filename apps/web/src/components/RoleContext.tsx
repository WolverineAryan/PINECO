'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'creator' | 'brand_manager' | 'reviewer' | 'admin';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

const PROFILES: Record<UserRole, UserProfile> = {
  creator: {
    id: 'usr-creator-sarah',
    name: 'Sarah Chen',
    role: 'creator',
    title: 'Content Creator',
  },
  brand_manager: {
    id: 'usr-manager-marcus',
    name: 'Marcus Vance',
    role: 'brand_manager',
    title: 'Brand Manager',
  },
  reviewer: {
    id: 'usr-reviewer-elena',
    name: 'Elena Rostova',
    role: 'reviewer',
    title: 'Compliance Reviewer',
  },
  admin: {
    id: 'usr-admin-alex',
    name: 'Alex Thorne',
    role: 'admin',
    title: 'Workspace Administrator',
  },
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  workspaceId: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('reviewer');
  const [workspaceId] = useState('ws-demo-enterprise-001');

  useEffect(() => {
    const saved = localStorage.getItem('pineco_role') as UserRole;
    if (saved && PROFILES[saved]) {
      setRole(saved);
    }
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('pineco_role', newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole: handleSetRole,
        currentUser: PROFILES[role],
        workspaceId,
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
