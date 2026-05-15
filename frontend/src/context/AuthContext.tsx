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
  recordActivity: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const ACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // Refresh token every 2 hours

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Initialize auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refresh_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
      setLastActivityTime(Date.now());
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      const { user, token, role, refresh_token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      
      setUser(user);
      setToken(token);
      setRefreshToken(refresh_token);
      setLastActivityTime(Date.now());
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
      const { user, token, refresh_token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'admin');
      
      setUser(user);
      setToken(token);
      setRefreshToken(refresh_token);
      setLastActivityTime(Date.now());
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
      const { user, token, refresh_token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'teacher');
      
      setUser(user);
      setToken(token);
      setRefreshToken(refresh_token);
      setLastActivityTime(Date.now());
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
      const { user, token, refresh_token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'teacher');
      
      setUser(user);
      setToken(token);
      setRefreshToken(refresh_token);
      setLastActivityTime(Date.now());
      return { success: true, user, token };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh token on user activity
  useEffect(() => {
    if (!token || !refreshToken) return;

    const refreshTokenIfActive = async () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      
      // If user has been active in the last 3 hours, refresh the token
      if (timeSinceLastActivity < ACTIVITY_TIMEOUT) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          const newToken = response.data.token;
          localStorage.setItem('token', newToken);
          setToken(newToken);
          console.log('Token refreshed due to user activity');
        } catch (err) {
          console.error('Token refresh failed:', err);
        }
      } else {
        // User has been inactive for 3 hours, logout
        console.log('User inactive for 3 hours, logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
    };

    const interval = setInterval(refreshTokenIfActive, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [token, refreshToken, lastActivityTime]);

  // Track user activity (mouse, keyboard, clicks)
  useEffect(() => {
    if (!token) return;

    const handleActivity = () => {
      setLastActivityTime(Date.now());
    };

    const events = ['mousedown', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [token]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setLoading(false);
    }
  }, []);

  // Record user activity
  const recordActivity = useCallback(() => {
    setLastActivityTime(Date.now());
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
    recordActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
