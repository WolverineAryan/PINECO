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

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
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
            return list.find((p) => p.id === prev.id) || list[0];
          }
          return list[0];
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

  const setRole = (newRole: UserRole) => {
    loginWithRole(newRole);
  };

  const openAuthModal = (mode?: any) => {
    setAuthModalMode(mode === 'signup' ? 'signup' : 'signin');
    setIsAuthModalOpen(true);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        currentUser,
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
