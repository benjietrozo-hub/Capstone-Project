import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/common/Skeleton';
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
import { 
  User, 
  Mail, 
  Phone, 
  Edit2, 
  Archive, 
  Search, 
  Plus, 
  MoreHorizontal,
  UserCheck,
  UserX,
  ShieldCheck,
  Calendar,
  MapPin,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
  role: string;
}

interface FormErrors {
  [key: string]: string[];
}

export function TeachersPage() {
  const queryClient = useQueryClient();
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
    role: 'teacher',
  });
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const { 
    data: teachersResponse, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['teachers', { search }],
    queryFn: () => adminAPI.getTeachers({
      search,
      per_page: 50,
    }),
    placeholderData: (previousData: any) => previousData,
  });

  const teachers = teachersResponse?.data?.data || [];

  
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
        role: teacher.role || 'teacher',
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
        role: 'teacher',
      });
    }
    setShowPassword(false);
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
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
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
    if (!confirm('Are you sure you want to archive this teacher?')) return;
    try {
      await adminAPI.deleteTeacher(id);
      toast.success('Teacher archived successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    } catch (error) {
      toast.error('Failed to archive teacher');
    }
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Teacher Profile', 
      width: '250',
      render: (_: any, row: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
            {row.first_name ? row.first_name.charAt(0) : row.full_name.charAt(0)}
            {row.last_name ? row.last_name.charAt(0) : ''}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate">{row.full_name}</div>
            <div className="text-[10px] text-gray-500 font-mono">ID: {row.teacher_id}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'contact', 
      label: 'Contact Details', 
      width: '250',
      render: (_: any, row: Teacher) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate">{row.email}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-3.5 h-3.5 text-green-500" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      width: '120',
      render: (value: string) => {
        const role = value || 'teacher';
        const isAdmin = role === 'admin';
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isAdmin 
              ? 'bg-purple-50 text-purple-700 border-purple-100' 
              : 'bg-blue-50 text-blue-700 border-blue-100'
          }`}>
            {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {role}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '120',
      render: (value: string) => (
        <div className="flex items-center">
          <StatusBadge label={value} status={value} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120',
      render: (_: any, row: Teacher) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTeacher(row.id);
            }}
            className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full"
          >
            <Archive className="w-4 h-4" />
          </Button>
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
      
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded shadow-lg shadow-blue-200">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Faculty</h1>
              <p className="text-sm text-gray-500 font-medium">Manage and monitor all school personnel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-100 flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Teacher</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} cols={5} />
          ) : (
            <Table columns={columns} data={teachers} />
          )}
        </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center">
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
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-3">
                  {/* Error Alert Section */}
                  {(generalError || Object.keys(formErrors).length > 0) && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
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
                  <div className="space-y-3">
                    {/* Teacher ID */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Teacher ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Middle Initial
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.middle_initial || ''}
                          onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                          placeholder="Middle name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Birthdate
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.birthdate || ''}
                          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={2}
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter complete address"
                      />
                    </div>

                    
                    {/* Contact Number and Email Address */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter contact number"
                        />
                        {formErrors.phone && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.phone[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editingId ? "Leave blank to keep current password" : "Enter password"}
                            required={!editingId}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {editingId && (
                          <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                        )}
                        {formErrors.password && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Confirm Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                            value={formData.confirm_password || ''}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            placeholder="Confirm password"
                            required={!editingId}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formErrors.confirm_password && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.confirm_password[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        User Role
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-bold text-gray-900"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="teacher">TEACHER</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1 px-1 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        Determines the user's access level in the system
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
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

