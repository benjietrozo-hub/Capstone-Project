import axiosInstance from './axios';

export const authAPI = {
  // Unified login endpoint
  login: (credentials) =>
    axiosInstance.post('/auth/login', credentials),

  // Legacy endpoints (kept for backward compatibility)
  adminLogin: (credentials) =>
    axiosInstance.post('/auth/admin/login', credentials),

  teacherLogin: (credentials) =>
    axiosInstance.post('/auth/teacher/login', credentials),

  teacherRegister: (data) =>
    axiosInstance.post('/auth/teacher/register', data),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  getMe: () =>
    axiosInstance.get('/auth/me'),
};

export const adminAPI = {
  // Dashboard
  getDashboard: () =>
    axiosInstance.get('/admin/dashboard'),

  getDashboardStats: () =>
    axiosInstance.get('/admin/dashboard/statistics'),

  // Inventory
  getInventory: (params) =>
    axiosInstance.get('/admin/inventory', { params }),

  createInventory: (data) =>
    axiosInstance.post('/admin/inventory', data),

  getInventoryItem: (id) =>
    axiosInstance.get(`/admin/inventory/${id}`),

  updateInventory: (id, data) =>
    axiosInstance.put(`/admin/inventory/${id}`, data),

  deleteInventory: (id) =>
    axiosInstance.delete(`/admin/inventory/${id}`),

  getInventoryCategories: () =>
    axiosInstance.get('/admin/inventory-categories'),

  // Borrow Requests
  getBorrowRequests: (params) =>
    axiosInstance.get('/admin/requests', { params }),

  approveBorrowRequest: (id, data) =>
    axiosInstance.post(`/admin/requests/${id}/approve`, data),

  rejectBorrowRequest: (id, data) =>
    axiosInstance.post(`/admin/requests/${id}/reject`, data),

  issueBorrowRequest: (id) =>
    axiosInstance.post(`/admin/requests/${id}/issue`),

  returnBorrowRequest: (id, data) =>
    axiosInstance.post(`/admin/requests/${id}/return`, data),

  getBorrowRequestsStats: () =>
    axiosInstance.get('/admin/requests/statistics'),

  // Teachers
  getTeachers: (params) =>
    axiosInstance.get('/admin/teachers', { params }),

  createTeacher: (data) =>
    axiosInstance.post('/admin/teachers', data),

  getTeacher: (id) =>
    axiosInstance.get(`/admin/teachers/${id}`),

  updateTeacher: (id, data) =>
    axiosInstance.put(`/admin/teachers/${id}`, data),

  deleteTeacher: (id) =>
    axiosInstance.delete(`/admin/teachers/${id}`),

  getTeacherDepartments: () =>
    axiosInstance.get('/admin/teacher-departments'),

  // Reports
  getReports: (params) =>
    axiosInstance.get('/admin/reports', { params }),

  getReport: (id) =>
    axiosInstance.get(`/admin/reports/${id}`),

  updateReport: (id, data) =>
    axiosInstance.put(`/admin/reports/${id}`, data),

  resolveReport: (id, data) =>
    axiosInstance.put(`/admin/reports/${id}`, { ...data, status: 'resolved' }),

  // System Logs
  getLogs: (params) =>
    axiosInstance.get('/admin/logs', { params }),

  getLog: (id) =>
    axiosInstance.get(`/admin/logs/${id}`),

  getLogsStatistics: () =>
    axiosInstance.get('/admin/logs/statistics'),
};

export const teacherAPI = {
  // Dashboard
  getDashboard: () =>
    axiosInstance.get('/teacher/dashboard'),

  // Inventory
  getInventory: (params) =>
    axiosInstance.get('/teacher/inventory', { params }),

  getInventoryItem: (id) =>
    axiosInstance.get(`/teacher/inventory/${id}`),

  getInventoryCategories: () =>
    axiosInstance.get('/teacher/inventory-categories'),

  // Teacher's Personal Inventory
  getMyInventory: (params) =>
    axiosInstance.get('/teacher/my-inventory', { params }),

  createMyInventoryItem: (data) =>
    axiosInstance.post('/teacher/my-inventory', data),

  getMyInventoryItem: (id) =>
    axiosInstance.get(`/teacher/my-inventory/${id}`),

  updateMyInventoryItem: (id, data) =>
    axiosInstance.put(`/teacher/my-inventory/${id}`, data),

  deleteMyInventoryItem: (id) =>
    axiosInstance.delete(`/teacher/my-inventory/${id}`),

  getMyInventoryCategories: () =>
    axiosInstance.get('/teacher/my-inventory/categories'),

  getMyInventoryStatistics: () =>
    axiosInstance.get('/teacher/my-inventory/statistics'),

  // Borrow Requests
  getBorrowRequests: (params) =>
    axiosInstance.get('/teacher/requests', { params }),

  createBorrowRequest: (data) =>
    axiosInstance.post('/teacher/requests', data),

  getBorrowRequest: (id) =>
    axiosInstance.get(`/teacher/requests/${id}`),

  cancelBorrowRequest: (id) =>
    axiosInstance.post(`/teacher/requests/${id}/cancel`),

  getBorrowRequestsStats: () =>
    axiosInstance.get('/teacher/requests/statistics'),
};
