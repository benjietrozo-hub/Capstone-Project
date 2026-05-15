import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from './Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | null;
}

export function ProtectedRoute({ children, requiredRole = null }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();

  // Check if user is in the process of logging out
  // @ts-ignore - global flag to prevent flash during logout
  if (window.__LOGGING_OUT__) {
    return <Loader />;
  }

  // Check if user is logging out to prevent "Access Denied" flash
  const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
  
  if (isLoggingOut) {
    // Clear the flag and show loader while redirecting
    sessionStorage.removeItem('isLoggingOut');
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
