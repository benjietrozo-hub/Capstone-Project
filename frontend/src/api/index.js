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
    axiosInstance.put(`/admin/reports/${id}/resolve`, data),

  // System Logs
  getLogs: (params) =>
    axiosInstance.get('/admin/logs', { params }),

  getLog: (id) =>
    axiosInstance.get(`/admin/logs/${id}`),

  getLogsStatistics: () =>
    axiosInstance.get('/admin/logs/statistics'),

  // Suppliers
  getSuppliers: (params) =>
    axiosInstance.get('/admin/suppliers', { params }),

  createSupplier: (data) =>
    axiosInstance.post('/admin/suppliers', data),

  getSupplier: (id) =>
    axiosInstance.get(`/admin/suppliers/${id}`),

  updateSupplier: (id, data) =>
    axiosInstance.put(`/admin/suppliers/${id}`, data),

  deleteSupplier: (id) =>
    axiosInstance.delete(`/admin/suppliers/${id}`),

  getSuppliersList: () =>
    axiosInstance.get('/admin/suppliers/list'),

  // Purchase Orders
  getPurchaseOrders: (params) =>
    axiosInstance.get('/admin/purchase-orders', { params }),

  createPurchaseOrder: (data) =>
    axiosInstance.post('/admin/purchase-orders', data),

  getPurchaseOrder: (id) =>
    axiosInstance.get(`/admin/purchase-orders/${id}`),

  updatePurchaseOrder: (id, data) =>
    axiosInstance.put(`/admin/purchase-orders/${id}`, data),

  deletePurchaseOrder: (id) =>
    axiosInstance.delete(`/admin/purchase-orders/${id}`),

  approvePurchaseOrder: (id) =>
    axiosInstance.post(`/admin/purchase-orders/${id}/approve`),

  cancelPurchaseOrder: (id) =>
    axiosInstance.post(`/admin/purchase-orders/${id}/cancel`),

  receivePurchaseOrderItems: (id, data) =>
    axiosInstance.post(`/admin/purchase-orders/${id}/receive`, data),

  getPurchaseOrderStats: () =>
    axiosInstance.get('/admin/purchase-orders/statistics'),

  // Distribution Requests (Admin)
  getDistributionRequests: (params) =>
    axiosInstance.get('/admin/distribution-requests', { params }),

  getDistributionRequest: (id) =>
    axiosInstance.get(`/admin/distribution-requests/${id}`),

  approveDistributionRequest: (id, data) =>
    axiosInstance.post(`/admin/distribution-requests/${id}/approve`, data),

  rejectDistributionRequest: (id, data) =>
    axiosInstance.post(`/admin/distribution-requests/${id}/reject`, data),

  getDistributionRequestStats: () =>
    axiosInstance.get('/admin/distribution-requests/statistics'),

  // Trash Management
  getTrash: (params) =>
    axiosInstance.get('/admin/trash', { params }),

  getTrashStats: () =>
    axiosInstance.get('/admin/trash/stats'),

  restoreFromTrash: (type, id) =>
    axiosInstance.post(`/admin/trash/${type}/${id}/restore`),

  deleteFromTrash: (type, id) =>
    axiosInstance.delete(`/admin/trash/${type}/${id}`),

  emptyTrash: (type) =>
    axiosInstance.delete('/admin/trash/empty', { params: { type } }),

  // Distribution Groups
  getDistributionGroups: (params) =>
    axiosInstance.get('/admin/distribution/groups', { params }),
  createDistributionGroup: (data) =>
    axiosInstance.post('/admin/distribution/groups', data),
  getDistributionGroup: (id) =>
    axiosInstance.get(`/admin/distribution/groups/${id}`),
  updateDistributionGroup: (id, data) =>
    axiosInstance.put(`/admin/distribution/groups/${id}`, data),
  deleteDistributionGroup: (id) =>
    axiosInstance.delete(`/admin/distribution/groups/${id}`),
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

  // Distribution Groups
  getDistributionGroups: (params) =>
    axiosInstance.get('/teacher/distribution-groups', { params }),

  getDistributionGroup: (id) =>
    axiosInstance.get(`/teacher/distribution-groups/${id}`),

  updateDistributionGroup: (id, data) =>
    axiosInstance.put(`/teacher/distribution-groups/${id}`, data),

  deleteDistributionGroup: (id) =>
    axiosInstance.delete(`/teacher/distribution-groups/${id}`),

  addTeachersToGroup: (id, data) =>
    axiosInstance.post(`/teacher/distribution-groups/${id}/add-teachers`, data),

  removeTeachersFromGroup: (id, data) =>
    axiosInstance.post(`/teacher/distribution-groups/${id}/remove-teachers`, data),

  // Distribution Requests
  getTeacherDistributionRequests: (params) =>
    axiosInstance.get('/teacher/distribution-requests', { params }),

  createDistributionRequest: (data) =>
    axiosInstance.post('/teacher/distribution-requests', data),

  getDistributionRequestStats: () =>
    axiosInstance.get('/teacher/distribution-requests/statistics'),

  getAvailableItems: () =>
    axiosInstance.get('/teacher/distribution-requests/available-items'),

  cancelDistributionRequest: (id) =>
    axiosInstance.delete(`/teacher/distribution-requests/${id}`),

  // Activity Logs
  getActivityLogs: (params) =>
    axiosInstance.get('/teacher/activity-logs', { params }),

  getActivityLogStats: () =>
    axiosInstance.get('/teacher/activity-logs/statistics'),
};
