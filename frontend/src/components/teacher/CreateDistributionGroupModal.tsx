import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { teacherAPI } from '@/api';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface CreateDistributionGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const CreateDistributionGroupModal: React.FC<CreateDistributionGroupModalProps> = ({
  onClose,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState({
    group_name: initialData?.group_name || '',
    group_type: initialData?.group_type || 'custom',
    description: initialData?.description || '',
    visibility: initialData?.visibility || 'shared',
    department: initialData?.department || '',
    teacher_ids: initialData?.teachers?.map((t: any) => t.id) || [] as number[],
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await teacherAPI.getTeachers({ all: true });
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        await teacherAPI.updateDistributionGroup(initialData.id, formData);
        toast({
          title: 'Success',
          description: 'Distribution group updated successfully',
        });
      } else {
        await teacherAPI.createDistributionGroup(formData);
        toast({
          title: 'Success',
          description: 'Distribution group created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} distribution group`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherToggle = (teacherId: number) => {
    setFormData((prev) => ({
      ...prev,
      teacher_ids: prev.teacher_ids.includes(teacherId)
        ? prev.teacher_ids.filter((id) => id !== teacherId)
        : [...prev.teacher_ids, teacherId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit' : 'Create'} Distribution Group
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Lab Equipment Coordinators"
              required
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.group_type}
              onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="custom">Custom</option>
              <option value="department">Department</option>
              <option value="role">Role-Based</option>
            </select>
          </div>

          {/* Department (conditional) */}
          {formData.group_type === 'department' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Science, ICT, TLE"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the purpose of this distribution group..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="shared"
                  checked={formData.visibility === 'shared'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Shared - Visible to all teachers
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Private - Only visible to you
                </span>
              </label>
            </div>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Teachers (Optional)
            </label>
            {loadingTeachers ? (
              <p className="text-sm text-gray-600">Loading teachers...</p>
            ) : (
              <div className="border border-gray-300 rounded max-h-48 overflow-y-auto">
                {teachers.map((teacher) => (
                  <label
                    key={teacher.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.teacher_ids.includes(teacher.id)}
                      onChange={() => handleTeacherToggle(teacher.id)}
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{teacher.full_name}</p>
                      <p className="text-xs text-gray-600">
                        {teacher.department} • {teacher.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Selected: {formData.teacher_ids.length} teacher(s)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Group' : 'Create Group')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDistributionGroupModal;
