import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../config/security';
import { authService } from '../services/authService';
import { secureLogger } from '../security/secureLogger';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  requestLogin: (email: string, password: string) => Promise<{
    challengeId: string;
    devCode?: string;
  }>;
  verify2FA: (challengeId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrador: [
    'leads:read',
    'leads:write',
    'vehicles:read',
    'analytics:read',
    'audit:read',
  ],
  analista: ['leads:read', 'vehicles:read', 'analytics:read'],
  usuario: ['vehicles:read', 'leads:write'],
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await authService.getUser();
        if (mounted) setUser(stored);
      } catch (error) {
        secureLogger.error('auth_bootstrap_failed', {
          message: error instanceof Error ? error.message : 'unknown',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const requestLogin = useCallback(async (email: string, password: string) => {
    const challenge = await authService.requestLogin(email, password);
    return {
      challengeId: challenge.challengeId,
      devCode: challenge.devCode,
    };
  }, []);

  const verify2FA = useCallback(async (challengeId: string, code: string) => {
    const logged = await authService.verify2FA(challengeId, code);
    setUser(logged);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, requestLogin, verify2FA, logout, hasPermission }),
    [user, loading, requestLogin, verify2FA, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
