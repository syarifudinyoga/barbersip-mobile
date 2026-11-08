import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, clearAuthToken, getAuthToken, saveAuthToken } from '../api/client';

export type UserRole = 'admin' | 'member' | 'superadmin' | 'capster' | 'barber';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return null;
      }

      const data = await apiFetch<User>('/auth/me');
      // Normalize 'barber' to 'capster' if needed
      const normalizedRole = (data.role === 'barber' ? 'capster' : data.role) as UserRole;
      const normalizedUser = { ...data, role: normalizedRole };
      setUser(normalizedUser);
      return normalizedUser;
    } catch {
      setUser(null);
      await clearAuthToken();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await apiFetch<{ token?: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      await saveAuthToken(response.token);
    }

    const normalizedRole = (response.user.role === 'barber' ? 'capster' : response.user.role) as UserRole;
    const normalizedUser = { ...response.user, role: normalizedRole };
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      await clearAuthToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

