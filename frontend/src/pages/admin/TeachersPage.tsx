import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button, FormField, Alert } from '../../components/common/FormElements';
import { Badge } from '../../components/common/Badge';
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
      render: (value: string) => <Badge label={value} status={value} />,
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
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Teacher' : 'Add New Teacher'}
        wide={true}
      >
        <form onSubmit={handleSaveTeacher} className="space-y-3">
          {/* Error Alert Section */}
          {(generalError || Object.keys(formErrors).length > 0) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
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
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Employee ID"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
              disabled={!!editingId}
              error={formErrors.employee_id?.[0]}
            />
            <FormField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={!!editingId}
              error={formErrors.username?.[0]}
            />
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              error={formErrors.email?.[0]}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <FormField
              label="M.I."
              value={formData.middle_initial}
              onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
              placeholder="M"
            />
            <FormField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingId}
              placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
              error={formErrors.password?.[0]}
            />
            <FormField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <FormField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          
          <div className="flex gap-4 pt-4 border-t mt-4">
            <Button type="submit">Save Teacher</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
}
