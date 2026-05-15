import React, { useState, useEffect } from 'react';
import { Plus, Users, Lock, Globe, Trash2, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { teacherAPI, authAPI } from '@/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import CreateDistributionGroupModal from '../../components/teacher/CreateDistributionGroupModal';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface DistributionGroup {
  id: number;
  group_name: string;
  group_type: string;
  list_type: string;
  visibility: string;
  department: string | null;
  description: string;
  is_active: boolean;
  created_by: number | null;
  teachers_count: number;
  teachers: any[];
  creator: any;
  created_at: string;
}

const DistributionGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'system' | 'user'>('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DistributionGroup | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
    fetchCurrentUser();
  }, [filter, pagination.currentPage]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {
        list_type: filter !== 'all' ? filter : undefined,
        page: pagination.currentPage,
        per_page: 9
      };
      const response = await teacherAPI.getDistributionGroups(params);
      const { data, current_page, last_page, total } = response.data.data;
      setGroups(data || []);
      setPagination({
        currentPage: current_page,
        lastPage: last_page,
        total: total
      });
    } catch (error: any) {
      console.error('Error fetching distribution groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch distribution groups',
        variant: 'destructive',
      });
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this distribution group?')) return;

    try {
      await teacherAPI.deleteDistributionGroup(groupId);
      toast({
        title: 'Success',
        description: 'Distribution group deleted successfully',
      });
      fetchGroups();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete distribution group',
        variant: 'destructive',
      });
    }
  };

  const getGroupTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      all_users: 'All Users',
      role: 'Role-Based',
      department: 'Department',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  const getGroupTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      all_users: 'bg-blue-100 text-blue-800',
      role: 'bg-purple-100 text-purple-800',
      department: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const systemGroups = groups.filter(g => g.list_type === 'system');
  const userGroups = groups.filter(g => g.list_type === 'user');

  return (
    <div>
      <NavHeader 
        title="Distribution Groups" 
        subtitle="Manage notification distribution lists for efficient communication"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          currentUser={currentUser}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Distribution Groups</h1>
        <p className="text-sm text-gray-600">Manage notification distribution lists for efficient communication</p>
      </div>
      
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h1 className="text-2xl font-bold text-gray-900">Distribution Groups</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage notification distribution lists for efficient communication
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Groups ({groups.length})
        </button>
        <button
          onClick={() => setFilter('system')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'system'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          System Groups ({systemGroups.length})
        </button>
        <button
          onClick={() => {
            setFilter('user');
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'user'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Groups ({userGroups.length})
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading distribution groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Distribution Groups</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'user'
              ? 'Create your first custom distribution group to organize notifications.'
              : 'No distribution groups available.'}
          </p>
          {filter === 'user' && (
            <Button onClick={() => setShowCreateModal(true)}>Create Group</Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.group_name}</h3>
                      <p className="text-sm text-gray-600">{group.teachers_count} members</p>
                    </div>
                  </div>
                  {group.visibility === 'private' ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getGroupTypeBadge(group.group_type)}>
                    {getGroupTypeLabel(group.group_type)}
                  </Badge>
                  <Badge variant={group.list_type === 'system' ? 'default' : 'secondary'}>
                    {group.list_type === 'system' ? 'System' : 'Custom'}
                  </Badge>
                  {group.department && (
                    <Badge variant="outline">{group.department}</Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                {group.list_type === 'user' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGroup(group)}
                      className="hover:bg-blue-50 text-blue-600 border-blue-100"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                      className="hover:bg-red-50 text-red-600 border-red-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.lastPage }))}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About Distribution Groups</h3>
        <p className="text-sm text-blue-800">
          Distribution groups allow teachers to efficiently receive inventory-related notifications
          based on their role, department, and responsibility. This minimizes irrelevant
          notifications and improves coordination in managing tools and equipment.
        </p>
      </Card>

      {/* Modals */}
      {(showCreateModal || editingGroup) && (
        <CreateDistributionGroupModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingGroup(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingGroup(null);
            fetchGroups();
          }}
          initialData={editingGroup}
        />
      )}
      </div>
    </div>
  );
};

export default DistributionGroupsPage;
