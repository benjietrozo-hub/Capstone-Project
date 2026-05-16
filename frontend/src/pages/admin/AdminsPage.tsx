import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/common/Skeleton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/FormElements';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { 
  Mail, 
  Phone, 
  Edit2, 
  Archive, 
  Search, 
  Plus,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowDownCircle
} from 'lucide-react';

interface Admin {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  full_name?: string;
  admin_type?: string;
}

interface AdminFormData {
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface FormErrors {
  [key: string]: string[];
}

export function AdminsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    middle_initial: '',
    last_name: '',
    phone: '',
    status: 'active',
  });
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const { 
    data: adminsResponse, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['admins', { search }],
    queryFn: () => adminAPI.getAdmins({
      search,
      per_page: 50,
    }),
    placeholderData: (previousData: any) => previousData,
  });

  const admins = adminsResponse?.data?.data || [];

  const handleOpenModal = (admin: Admin | null = null) => {
    setFormErrors({});
    setGeneralError('');
    
    if (admin) {
      setEditingId(admin.id);
      setFormData({
        username: admin.username,
        email: admin.email,
        password: '',
        confirm_password: '',
        first_name: admin.first_name || '',
        middle_initial: admin.middle_initial || '',
        last_name: admin.last_name || '',
        phone: admin.phone || '',
        status: admin.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        middle_initial: '',
        last_name: '',
        phone: '',
        status: 'active',
      });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormErrors({});
    setGeneralError('');
    
    if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
      setGeneralError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!editingId && !formData.password) {
      setGeneralError('Password is required for new admins');
      toast.error('Password is required for new admins');
      return;
    }
    
    try {
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete (dataToSend as any).password;
      }

      if (editingId) {
        await adminAPI.updateAdmin(editingId, dataToSend);
        toast.success('Admin updated successfully');
      } else {
        await adminAPI.createAdmin(dataToSend);
        toast.success('Admin created successfully');
      }
      setShowModal(false);
      setFormErrors({});
      setGeneralError('');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save admin';
      const errors = error?.response?.data?.errors;
      
      if (errors) {
        setFormErrors(errors);
        setGeneralError(errorMessage);
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

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Are you sure you want to archive this admin?')) return;
    try {
      await adminAPI.deleteAdmin(id);
      toast.success('Admin archived successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (error) {
      toast.error('Failed to archive admin');
    }
  };

  const handleDemoteAdmin = async (id: number) => {
    if (!confirm('Are you sure you want to demote this administrator back to a teacher? This will remove all administrative access.')) return;
    try {
      await adminAPI.demoteAdmin(id);
      
      // Invalidate queries immediately to update the local list
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      
      toast.success('Administrator demoted to Teacher. Redirecting to Teacher Management...', { duration: 4000 });
      
      setTimeout(() => {
        navigate('/admin/teachers');
      }, 800); // Reduced delay for better UX
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to demote administrator';
      toast.error(message);
    }
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Admin Profile', 
      width: '250',
      render: (_: any, row: Admin) => {
        const fullName = row.full_name || `${row.first_name || ''} ${row.middle_initial || ''} ${row.last_name || ''}`.trim();
        const initials = row.first_name && row.last_name 
          ? `${row.first_name.charAt(0)}${row.last_name.charAt(0)}`
          : fullName.charAt(0);
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 truncate">{fullName || row.username}</div>
              <div className="text-[10px] text-gray-500 font-mono">@{row.username}</div>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'contact', 
      label: 'Contact Details', 
      width: '250',
      render: (_: any, row: Admin) => (
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
      render: () => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-purple-50 text-purple-700 border-purple-100">
          <ShieldCheck className="w-3 h-3" />
          ADMIN
        </div>
      ),
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
      render: (_: any, row: Admin) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full inline-flex items-center justify-center transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAdmin(row.id);
            }}
            className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full inline-flex items-center justify-center transition-colors"
            title="Archive Admin"
          >
            <Archive className="w-4 h-4" />
          </button>
          {row.id !== currentUser?.id && row.admin_type !== 'root_admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDemoteAdmin(row.id);
              }}
              className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full inline-flex items-center justify-center transition-colors"
              title="Demote to Teacher"
            >
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <NavHeader 
        title="Admin Management" 
        subtitle="Manage administrator accounts and permissions"
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
      
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Admin Management</h1>
        <p className="text-sm text-gray-600">Manage administrator accounts and permissions</p>
      </div>
      
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600 rounded shadow-lg shadow-purple-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Administrators</h1>
              <p className="text-sm text-gray-500 font-medium">Manage admin accounts with full system access</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-md shadow-purple-100 flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Admin</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} cols={5} />
          ) : (
            <Table columns={columns} data={admins} />
          )}
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Admin' : 'Add New Admin'}
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

            <form onSubmit={handleSaveAdmin}>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-3">
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
                  
                  <div className="space-y-3">
                    {/* Name Fields */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Middle
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={formData.middle_initial || ''}
                          onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                          placeholder="M.I."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                        required
                        disabled={!!editingId}
                      />
                      {editingId && (
                        <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                      )}
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Contact number"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
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
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Confirm Password {!editingId && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors pr-10"
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
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
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
                  className="px-5 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingId ? 'Update Admin' : 'Save Admin'}
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
