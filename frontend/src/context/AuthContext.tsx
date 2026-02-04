import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authAPI } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  login: (credentials: any) => Promise<any>;
  adminLogin: (credentials: any) => Promise<any>;
  teacherLogin: (credentials: any) => Promise<any>;
  teacherRegister: (data: any) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      const { user, token, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      
      setUser(user);
      setToken(token);
      return { success: true, user, token, role };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.adminLogin(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'admin');
      
      setUser(user);
      setToken(token);
      return { success: true, user, token };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const teacherLogin = useCallback(async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.teacherLogin(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'teacher');
      
      setUser(user);
      setToken(token);
      return { success: true, user, token };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const teacherRegister = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.teacherRegister(data);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'teacher');
      
      setUser(user);
      setToken(token);
      return { success: true, user, token };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const role = localStorage.getItem('role');
  
  const value: AuthContextType = {
    user,
    token,
    role,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin: role === 'admin',
    isTeacher: role === 'teacher',
    login,
    adminLogin,
    teacherLogin,
    teacherRegister,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
