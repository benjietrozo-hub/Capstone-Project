import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Search } from 'lucide-react';
import axios from '../../api/axios';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface ManageGroupMembersModalProps {
  group: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageGroupMembersModal: React.FC<ManageGroupMembersModalProps> = ({
  group,
  onClose,
  onSuccess,
}) => {
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>(group.teachers || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await axios.get('/admin/teachers');
      setAllTeachers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAddTeacher = async (teacherId: number) => {
    if (group.list_type === 'system') {
      toast({
        title: 'Not Allowed',
        description: 'System groups cannot be modified',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/teacher/distribution-groups/${group.id}/add-teachers`, {
        teacher_ids: [teacherId],
      });
      
      const teacher = allTeachers.find(t => t.id === teacherId);
      if (teacher) {
        setGroupMembers([...groupMembers, teacher]);
      }
      
      toast({
        title: 'Success',
        description: 'Teacher added to group',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add teacher',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: number) => {
    if (group.list_type === 'system') {
      toast({
        title: 'Not Allowed',
        description: 'System groups cannot be modified',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/teacher/distribution-groups/${group.id}/remove-teachers`, {
        teacher_ids: [teacherId],
      });
      
      setGroupMembers(groupMembers.filter(m => m.id !== teacherId));
      
      toast({
        title: 'Success',
        description: 'Teacher removed from group',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove teacher',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const memberIds = groupMembers.map(m => m.id);
  const availableTeachers = allTeachers.filter(t => !memberIds.includes(t.id));

  const filteredMembers = groupMembers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableTeachers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canModify = group.list_type !== 'system';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{group.group_name}</h2>
            <p className="text-sm text-gray-600">{group.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Current Members */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Current Members ({groupMembers.length})
              </h3>
              {loadingTeachers ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-sm text-gray-600">No members found</p>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{teacher.full_name}</p>
                        <p className="text-xs text-gray-600">
                          {teacher.department} • {teacher.email}
                        </p>
                      </div>
                      {canModify && (
                        <button
                          onClick={() => handleRemoveTeacher(teacher.id)}
                          disabled={loading}
                          className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Teachers */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Available Teachers ({availableTeachers.length})
              </h3>
              {!canModify ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm text-yellow-800">
                    System groups cannot be modified. Only administrators can manage system group memberships.
                  </p>
                </div>
              ) : loadingTeachers ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : filteredAvailable.length === 0 ? (
                <p className="text-sm text-gray-600">No available teachers</p>
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{teacher.full_name}</p>
                        <p className="text-xs text-gray-600">
                          {teacher.department} • {teacher.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddTeacher(teacher.id)}
                        disabled={loading}
                        className="ml-2 p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageGroupMembersModal;
