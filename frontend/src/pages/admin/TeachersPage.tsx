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
  teacher_id: string;
  full_name: string;
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  phone?: string;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  role?: string;
}

interface TeacherFormData {
  teacher_id: string;
  full_name: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  phone?: string;
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface FormErrors {
  [key: string]: string[];
}

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [formData, setFormData] = useState<TeacherFormData>({
    teacher_id: '',
    full_name: '',
    first_name: '',
    middle_initial: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    status: 'active',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTeachers({
        search,
        per_page: 50,
      });
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleOpenModal = (teacher: Teacher | null = null) => {
    // Clear errors when opening modal
    setFormErrors({});
    setGeneralError('');
    
    if (teacher) {
      setEditingId(teacher.id);
      setFormData({
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        first_name: teacher.first_name || '',
        middle_initial: teacher.middle_initial || '',
        last_name: teacher.last_name || '',
        gender: teacher.gender || '',
        birthdate: teacher.birthdate || '',
        address: teacher.address || '',
        phone: teacher.phone || '',
        username: teacher.username,
        email: teacher.email,
        password: '',
        confirm_password: '',
        status: teacher.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        teacher_id: '',
        full_name: '',
        first_name: '',
        middle_initial: '',
        last_name: '',
        gender: '',
        birthdate: '',
        address: '',
        phone: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
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
    
    // Basic validation - check individual name fields instead of full_name
    if (!formData.teacher_id || !formData.first_name || !formData.last_name || !formData.username || !formData.email) {
      setGeneralError('Please fill in all required fields (Teacher ID, First Name, Last Name, Username, Email)');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!editingId && !formData.password) {
      setGeneralError('Password is required for new teachers');
      toast.error('Password is required for new teachers');
      return;
    }
    
    // Auto-generate full_name from name fields
    const generatedFullName = [
      formData.first_name,
      formData.middle_initial,
      formData.last_name
    ].filter(Boolean).join(' ');
    
    const updatedFormData = {
      ...formData,
      full_name: generatedFullName
    };
    
    try {
      // Prepare data - remove empty password for updates
      const dataToSend = { ...updatedFormData };
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
    { key: 'teacher_id', label: 'Teacher ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'first_name', label: 'First Name' },
    { key: 'middle_initial', label: 'M.I.' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
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
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-red-800">
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
                  
                  {/* Form Fields - Clean Single Column Layout */}
                  <div className="space-y-5">
                    {/* Teacher ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teacher ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                        placeholder="Enter teacher ID"
                        required
                        disabled={!!editingId}
                      />
                      {editingId && (
                        <p className="text-xs text-gray-500 mt-1">Teacher ID cannot be changed</p>
                      )}
                      {formErrors.teacher_id && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.teacher_id[0]}</p>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="First name"
                          required
                        />
                        {formErrors.first_name && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.first_name[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.middle_initial || ''}
                          onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                          placeholder="Middle name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Last name"
                          required
                        />
                        {formErrors.last_name && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.last_name[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Gender and Birthdate */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Birthdate
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.birthdate || ''}
                          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={3}
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter complete address"
                      />
                    </div>

                    
                    {/* Contact Number and Email Address */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter contact number"
                        />
                        {formErrors.phone && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.phone[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                          required
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.email[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                    {/* Password and Confirm Password */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={editingId ? "Leave blank to keep current password" : "Enter password"}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.confirm_password || ''}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          placeholder="Confirm password"
                          required={!editingId}
                        />
                        {formErrors.confirm_password && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.confirm_password[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

