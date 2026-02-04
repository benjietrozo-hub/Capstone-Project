/**
 * Role-Based Access Control Utilities
 * 
 * This module provides utilities for managing role-based access control in the application.
 * Supported roles: 'admin', 'teacher'
 */

/**
 * Checks if the user has the required role
 * @param {string} userRole - The user's role from localStorage
 * @param {string|string[]} requiredRole - The required role(s)
 * @returns {boolean} - True if user has the required role
 */
export const hasRole = (userRole, requiredRole) => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

/**
 * Gets the dashboard path for a given role
 * @param {string} role - The user's role
 * @returns {string} - The dashboard path
 */
export const getDashboardPath = (role) => {
  const dashboards = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
  };
  return dashboards[role] || '/login';
};

/**
 * Gets menu items for a given role
 * @param {string} role - The user's role
 * @returns {Array} - Array of menu items
 */
export const getMenuItems = (role) => {
  const menus = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
      { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
      { label: 'Borrow Requests', path: '/admin/requests', icon: '📋' },
      { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
      { label: 'Reports', path: '/admin/reports', icon: '📄' },
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
      { label: 'Browse Inventory', path: '/teacher/browse', icon: '🔍' },
      { label: 'My Requests', path: '/teacher/requests', icon: '📋' },
    ],
  };
  return menus[role] || [];
};

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'manage_inventory',
    'view_requests',
    'approve_requests',
    'manage_teachers',
    'view_reports',
    'manage_users',
  ],
  teacher: [
    'view_dashboard',
    'view_inventory',
    'create_requests',
    'view_own_requests',
    'cancel_own_requests',
  ],
};

/**
 * Checks if a user with the given role has permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Gets the role display name
 * @param {string} role - The role
 * @returns {string} - Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const names = {
    admin: 'Administrator',
    teacher: 'Teacher',
  };
  return names[role] || 'User';
};
