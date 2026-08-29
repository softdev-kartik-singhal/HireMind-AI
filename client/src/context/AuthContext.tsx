'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole, ApiResponse, AuthResponseData } from '@/types/auth';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      if (response.data?.success && response.data.data?.user) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('hiremind_access_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      if (pathname && !['/login', '/register', '/forgot-password', '/reset-password', '/'].includes(pathname)) {
        router.push('/login');
      }
    };

    window.addEventListener('hiremind:auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('hiremind:auth:unauthorized', handleUnauthorized);
    };
  }, [fetchCurrentUser, pathname, router]);

  const login = async (data: { email: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    const { user: loggedInUser, accessToken } = response.data.data;
    
    if (accessToken) {
      localStorage.setItem('hiremind_access_token', accessToken);
    }
    
    setUser(loggedInUser);
    router.push('/dashboard');
  };

  const register = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    const { user: registeredUser, accessToken } = response.data.data;

    if (accessToken) {
      localStorage.setItem('hiremind_access_token', accessToken);
    }

    setUser(registeredUser);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('hiremind_access_token');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
