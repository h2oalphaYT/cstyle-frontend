import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi, onUnauthorized, tokenStore, type User } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** False until the stored session has been checked with the server. */
  ready: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore the session from a stored token.
  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  // The API rejected our token (expired / logged out elsewhere).
  useEffect(() => onUnauthorized(() => {
    tokenStore.clear();
    setUser(null);
  }), []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, name, phone: phone || undefined });
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokenStore.get()) await authApi.logout();
    } catch {
      // Logging out locally is enough if the server is unreachable.
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    ready,
    loading,
    login,
    signup,
    logout,
    setUser,
  }), [user, ready, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
