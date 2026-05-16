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

  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refresh_token: refreshToken }),

  sendOTP: (role) =>
    axiosInstance.post(`/${role}/send-otp`),

  verifyOTP: (role, otp) =>
    axiosInstance.post(`/${role}/verify-otp`, { otp }),

  resetForcedPassword: (role, data) =>
    axiosInstance.post(`/${role}/reset-forced-password`, data),

  verifyPassword: (role, password) =>
    axiosInstance.post(`/${role}/verify-password`, { password }),
};

export const adminAPI = {
  // Dashboard
  getDashboard: () =>
    axiosInstance.get('/admin/dashboard'),

  verifyPassword: (password) =>
    axiosInstance.post('/admin/verify-password', { password }),

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

  // --- New Serialized Inventory System ---
  getParentCategories: () =>
    axiosInstance.get('/admin/item-categories/parent-categories'),

  renameParentCategory: (data) =>
    axiosInstance.post('/admin/item-categories/rename-parent', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getItemCategories: (params) =>
    axiosInstance.get('/admin/item-categories', { params }),
    
  createItemCategory: (data) =>
    axiosInstance.post('/admin/item-categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  updateItemCategory: (id, data) =>
    axiosInstance.post(`/admin/item-categories/${id}`, data, { // using post for multipart form data with _method=PUT
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  deleteItemCategory: (id) =>
    axiosInstance.delete(`/admin/item-categories/${id}`),

  addCustomField: (categoryId, data) =>
    axiosInstance.post(`/admin/item-categories/${categoryId}/custom-fields`, data),
    
  deleteCustomField: (categoryId, fieldId) =>
    axiosInstance.delete(`/admin/item-categories/${categoryId}/custom-fields/${fieldId}`),

  getInventoryItems: (params) =>
    axiosInstance.get('/admin/inventory-items', { params }),
    
  createInventoryItem: (data) =>
    axiosInstance.post('/admin/inventory-items', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  bulkCreateInventoryItem: (data) =>
    axiosInstance.post('/admin/inventory-items/bulk', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  updateInventoryItem: (id, data) =>
    axiosInstance.post(`/admin/inventory-items/${id}`, data, { // using post for multipart form data with _method=PUT
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  deleteInventoryItem: (id) =>
    axiosInstance.delete(`/admin/inventory-items/${id}`),
  // ---------------------------------------

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

  // Borrow History
  getBorrowHistory: (params) =>
    axiosInstance.get('/admin/borrow-history', { params }),

  getBorrowHistoryYears: () =>
    axiosInstance.get('/admin/borrow-history/years'),

  // Teachers
  getTeachers: (params) =>
    axiosInstance.get('/admin/teachers', { params }),

  validateTeacherUnique: (field, value, exclude_id = null) => 
    axiosInstance.get('/admin/teachers/validate-unique', { params: { field, value, exclude_id } }),

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

  // Admins
  getAdmins: (params) =>
    axiosInstance.get('/admin/admins', { params }),

  createAdmin: (data) =>
    axiosInstance.post('/admin/admins', data),

  getAdmin: (id) =>
    axiosInstance.get(`/admin/admins/${id}`),

  updateAdmin: (id, data) =>
    axiosInstance.put(`/admin/admins/${id}`, data),

  deleteAdmin: (id) =>
    axiosInstance.delete(`/admin/admins/${id}`),
  
  demoteAdmin: (id) =>
    axiosInstance.post(`/admin/admins/${id}/demote`),

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

  // Archive Management
  getArchive: (params) =>
    axiosInstance.get('/admin/archive', { params }),

  getArchiveStats: () =>
    axiosInstance.get('/admin/archive/stats'),

  restoreFromArchive: (type, id) =>
    axiosInstance.post(`/admin/archive/${type}/${id}/restore`),

  deleteFromArchive: (type, id) =>
    axiosInstance.delete(`/admin/archive/${type}/${id}`),

  emptyArchive: (type) =>
    axiosInstance.delete('/admin/archive/empty', { params: { type } }),

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

  // Distributions Management
  getDistributionTeachers: (params) =>
    axiosInstance.get('/admin/distribution', { params }),
  getDistributionStatistics: () =>
    axiosInstance.get('/admin/distribution/statistics'),
  getDistributionDepartments: () =>
    axiosInstance.get('/admin/distribution/departments'),
  getDistributions: (params) =>
    axiosInstance.get('/admin/distributions', { params }),
  getBulkDistributions: (params) =>
    axiosInstance.get('/admin/bulk-distributions', { params }),
  cancelDistribution: (id) =>
    axiosInstance.post(`/admin/distributions/${id}/cancel`),
  reportDamagedDistribution: (id) =>
    axiosInstance.post(`/admin/distributions/${id}/damaged`),
  reportLostDistribution: (id) =>
    axiosInstance.post(`/admin/distributions/${id}/lost`),
  getDistributionCoreStats: () =>
    axiosInstance.get('/admin/distributions/statistics'),
  getSystemHealth: () =>
    axiosInstance.get('/admin/system/health'),
};

export const teacherAPI = {
  // Profile
  getMe: () =>
    axiosInstance.get('/teacher/me'),

  // Dashboard
  getDashboard: () =>
    axiosInstance.get('/teacher/dashboard'),

  // Inventory
  getInventoryParentCategories: () =>
    axiosInstance.get('/teacher/inventory/parent-categories'),

  getInventory: (params) =>
    axiosInstance.get('/teacher/inventory', { params }),

  getInventoryItem: (id) =>
    axiosInstance.get(`/teacher/inventory/${id}`),

  getCategoryDetails: (id) =>
    axiosInstance.get(`/teacher/inventory/${id}`),

  getInventoryCategories: () =>
    axiosInstance.get('/teacher/inventory-categories'),

  // Teacher's Personal Inventory — 3-level hierarchy
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

  getMyInventoryParentCategories: () =>
    axiosInstance.get('/teacher/my-inventory/parent-categories'),

  getMyInventoryCategories: (params) =>
    axiosInstance.get('/teacher/my-inventory/categories', { params }),

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

  // Item Distributions (Teacher Acceptance Flow)
  getDistributions: (params) =>
    axiosInstance.get('/teacher/distributions', { params }),

  acceptDistribution: (id) =>
    axiosInstance.post(`/teacher/distributions/${id}/accept`),

  rejectDistribution: (id, reason) =>
    axiosInstance.post(`/teacher/distributions/${id}/reject`, { reason }),

  // Activity Logs
  getActivityLogs: (params) =>
    axiosInstance.get('/teacher/logs', { params }),

  getActivityLogStats: () =>
    axiosInstance.get('/teacher/activity-logs/statistics'),

  // Entity Access
  getMyEntities: () =>
    axiosInstance.get('/teacher/my-entities'),

  getMyClassrooms: () =>
    axiosInstance.get('/teacher/my-classrooms'),

  getMyClubs: () =>
    axiosInstance.get('/teacher/my-clubs'),

  getMyDepartments: () =>
    axiosInstance.get('/teacher/my-departments'),

  getTeachers: (params) =>
    axiosInstance.get('/teacher/teachers', { params }),
};

export const settingsAPI = {
  getSetting: (key) => axiosInstance.get(`/settings/${key}`),
  updateSetting: (key, data) => axiosInstance.post(`/admin/settings/${key}`, data),
  getMaintenanceStatus: () => axiosInstance.get('/system/maintenance/status'),
};

export const profileAPI = {
  updateProfile: (data) =>
    axiosInstance.post('/profile/update', data),
  updateAccount: (data) => axiosInstance.post('/profile/account', data),
  changePassword: (data) => axiosInstance.post('/profile/password', data),
};
