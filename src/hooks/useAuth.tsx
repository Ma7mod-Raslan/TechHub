// src/features/auth/hooks/useAuth.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { me as meApi } from '../api/authService';

type Role = 'student' | 'instructor' | 'admin';
export type User = { id: string; email: string; name?: string; role?: Role } | null;

type AuthContextValue = {
  user: User;
  setUser: (u: User) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** helper: يحاول يستخرج user من رد غير معروف الشكل بشكل آمن */
function extractUserFromResponse(res: unknown): User {
  if (!res || typeof res !== 'object') return null;
  const maybe = res as Record<string, unknown>;
  const data = maybe.data ?? maybe;
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  // if data has 'user' field use it, otherwise try use data itself if it looks like a user
  const userCandidate = d.user ?? d;
  if (!userCandidate || typeof userCandidate !== 'object') return null;
  const u = userCandidate as Record<string, unknown>;
  if (typeof u.email === 'string') {
    return {
      id: String(u.id ?? ''),
      email: String(u.email),
      name: typeof u.name === 'string' ? String(u.name) : undefined,
      role: typeof u.role === 'string' ? (u.role as Role) : undefined,
    };
  }
  return null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi()
      .then((res) => {
        const u = extractUserFromResponse(res);
        setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
