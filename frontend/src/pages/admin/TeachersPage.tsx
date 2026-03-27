import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button, FormField, Alert } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface Teacher {
  id: number;
  employee_id: string;
  full_name: string;
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
  username: string;
  email: string;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  role?: string;
}

interface TeacherFormData {
  employee_id: string;
  full_name: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface FormErrors {
  [key: string]: string[];
}

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [formData, setFormData] = useState<TeacherFormData>({
    employee_id: '',
    full_name: '',
    first_name: '',
    middle_initial: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    status: 'active',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, [search, department]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTeachers({
        search,
        department,
        per_page: 50,
      });
      setTeachers(response.data.data);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await adminAPI.getTeacherDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const handleOpenModal = (teacher: Teacher | null = null) => {
    // Clear errors when opening modal
    setFormErrors({});
    setGeneralError('');
    
    if (teacher) {
      setEditingId(teacher.id);
      setFormData({
        employee_id: teacher.employee_id,
        full_name: teacher.full_name,
        first_name: teacher.first_name || '',
        middle_initial: teacher.middle_initial || '',
        last_name: teacher.last_name || '',
        username: teacher.username,
        email: teacher.email,
        password: '',
        department: teacher.department || '',
        phone: teacher.phone || '',
        status: teacher.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        employee_id: '',
        full_name: '',
        first_name: '',
        middle_initial: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        department: '',
        phone: '',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setGeneralError('');
    
    // Basic validation
    if (!formData.employee_id || !formData.username || !formData.email) {
      setGeneralError('Please fill in all required fields (Employee ID, Username, Email)');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!editingId && !formData.password) {
      setGeneralError('Password is required for new teachers');
      toast.error('Password is required for new teachers');
      return;
    }
    
    try {
      // Prepare data - remove empty password for updates
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete (dataToSend as any).password;
      }

      if (editingId) {
        await adminAPI.updateTeacher(editingId, dataToSend);
        toast.success('Teacher updated successfully');
      } else {
        await adminAPI.createTeacher(dataToSend);
        toast.success('Teacher created successfully');
      }
      setShowModal(false);
      setFormErrors({});
      setGeneralError('');
      fetchTeachers();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save teacher';
      const errors = error?.response?.data?.errors;
      
      if (errors) {
        // Store field errors for display
        setFormErrors(errors);
        setGeneralError(errorMessage);
        
        // Also show toast for each error
        Object.keys(errors).forEach(field => {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          toast.error(`${fieldName}: ${errors[field][0]}`);
        });
      } else {
        setGeneralError(errorMessage);
        toast.error(errorMessage);
      }
      
      console.error('Save teacher error:', error?.response?.data);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await adminAPI.deleteTeacher(id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'first_name', label: 'First Name' },
    { key: 'middle_initial', label: 'M.I.' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => {
        const role = value || 'teacher';
        const roleColors: Record<string, string> = {
          admin: 'bg-red-100 text-red-800 border-red-200',
          teacher: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleColors[role] || roleColors.teacher}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Teacher) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteTeacher(row.id)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <NavHeader 
        title="Teacher Management" 
        subtitle="Manage teacher accounts and permissions"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Teacher Management</h1>
        <p className="text-sm text-gray-600">Manage teacher accounts and permissions</p>
      </div>
      
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-start mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
              <FormField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
              />
              <FormField
                label="Department"
                type="select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d, label: d }))]}
              />
            </div>
            <div className="pt-6">
              <Button onClick={() => handleOpenModal()}>+ Add New Teacher</Button>
            </div>
          </div>

        <Table columns={columns} data={teachers} loading={loading} />
      </Card>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingId ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Teacher
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add New Teacher
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form wraps entire modal body and footer */}
            <form onSubmit={handleSaveTeacher}>
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* Error Alert Section */}
                  {(generalError || Object.keys(formErrors).length > 0) && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-semibold text-red-800">
                            {generalError || 'Please fix the following errors:'}
                          </h3>
                          {Object.keys(formErrors).length > 0 && (
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                              {Object.entries(formErrors).map(([field, messages]) => (
                                <li key={field}>
                                  <span className="font-medium">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {messages[0]}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Account Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Employee ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          placeholder="e.g., EMP-001"
                          required
                          disabled={!!editingId}
                        />
                        {editingId && (
                          <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                        )}
                        {formErrors.employee_id && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.employee_id[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Enter username"
                          required
                          disabled={!!editingId}
                        />
                        {editingId && (
                          <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        )}
                        {formErrors.username && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.username[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="teacher@example.com"
                          required
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.email[0]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Middle Initial
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.middle_initial}
                          onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                          placeholder="M"
                          maxLength={1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
                          required={!editingId}
                        />
                        {editingId && (
                          <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                        )}
                        {formErrors.password && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingId ? 'Update Teacher' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

