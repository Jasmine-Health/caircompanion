import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { login as loginAPI, getCurrentUser, updateTimezone } from '../services/authService';
import { clearCachedVoiceModel, resolveUserVoiceModel } from '../services/voiceService';
import { clearStaleSessionData } from '../lib/sessionCleanup';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, organizationId?: string) => Promise<void>;
  logout: () => void;
  setTokenAndUser: (token: string, userData: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistVoicePreference = useCallback(() => {
    resolveUserVoiceModel().catch((error) => {
      console.error('[Voice] Failed to resolve voice preference:', error);
    });
  }, []);

  const syncTimezone = useCallback(async () => {
    try {
      await updateTimezone();
    } catch (error) {
      console.error('[Timezone] Failed to update timezone:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getCurrentUser()
        .then((userData) => {
          setUser(userData);
          syncTimezone();
          persistVoicePreference();
        })
        .catch(() => {
          // Silent session expiry (no explicit logout click): still a session end,
          // so the stale per-user data must not leak into whoever uses this device next.
          localStorage.removeItem('access_token');
          clearStaleSessionData();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [syncTimezone, persistVoicePreference]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        syncTimezone();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, syncTimezone]);

  const login = useCallback(async (email: string, password: string, organizationId?: string) => {
    const response = await loginAPI({
      email,
      password,
      role: 'patient',
      organization_id: organizationId,
    });
    setUser(response.user);
    localStorage.setItem('access_token', response.access_token);
    syncTimezone();
    persistVoicePreference();
  }, [syncTimezone, persistVoicePreference]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('access_token');
    clearStaleSessionData();
    clearCachedVoiceModel();
  }, []);

  const setTokenAndUser = useCallback((token: string, userData: User | null) => {
    // A fresh session is starting here (e.g. the OAuth callback). If the previous
    // session ended without logout() or the expiry handler running cleanly, its
    // chat history/organization could still be sitting in storage, so clear it
    // before the new session's token takes hold.
    clearStaleSessionData();
    localStorage.setItem('access_token', token);
    if (userData) {
      setUser(userData);
      syncTimezone();
      persistVoicePreference();
    }
  }, [syncTimezone, persistVoicePreference]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setTokenAndUser }}>
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
