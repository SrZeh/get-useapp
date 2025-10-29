// src/providers/AuthProvider.tsx
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth } from '../../lib/firebase';
import { logger } from '@/utils';

type AuthContextType = {
  user: User | null;
  loadingUser: boolean;
  error: Error | null;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refresh auth state manually if needed
  const refreshAuth = useCallback(async () => {
    try {
      setLoadingUser(true);
      setError(null);
      // Force a re-check by getting current user
      const currentUser = auth.currentUser;
      setUser(currentUser);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error('Failed to refresh auth');
      logger.error('Error refreshing auth state', authError);
      setError(authError);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        if (!isMounted) return;
        
        try {
          setUser(u ?? null);
          setError(null);
        } catch (err) {
          const authError = err instanceof Error ? err : new Error('Auth state change error');
          logger.error('Error in auth state change', authError);
          setError(authError);
        } finally {
          setLoadingUser(false);
        }
      },
      (err) => {
        if (!isMounted) return;
        
        const authError = err instanceof Error ? err : new Error('Auth listener error');
        logger.error('Auth state listener error', authError);
        setError(authError);
        setLoadingUser(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loadingUser,
      error,
      refreshAuth,
    }),
    [user, loadingUser, error, refreshAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
