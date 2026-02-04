import { useAuth } from './useAuth';
import { hasRole, getDashboardPath, getMenuItems, hasPermission } from '../utils/roleUtils';

/**
 * Hook for role-based operations
 * Provides utilities for checking and managing user roles
 */
export function useRole() {
  const { role, isAdmin, isTeacher } = useAuth();

  return {
    role,
    isAdmin,
    isTeacher,
    hasRole: (requiredRole) => hasRole(role, requiredRole),
    getDashboardPath: () => getDashboardPath(role),
    getMenuItems: () => getMenuItems(role),
    hasPermission: (permission) => hasPermission(role, permission),
  };
}
