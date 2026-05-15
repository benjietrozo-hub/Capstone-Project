import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../api';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react';

interface ActivityLog {
  id: number;
  request_code: string;
  item?: {
    item_name: string;
    item_code: string;
  };
  quantity_requested: number;
  quantity_approved?: number;
  status: string;
  date_requested: string;
  date_approved?: string;
  date_borrowed?: string;
  date_returned?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
  purpose?: string;
}

interface ActivityStats {
  total_requests: number;
  pending: number;
  approved: number;
  borrowed: number;
  returned: number;
  rejected: number;
}

export function ActivityLogsPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState<ActivityStats>({
    total_requests: 0,
    pending: 0,
    approved: 0,
    borrowed: 0,
    returned: 0,
    rejected: 0,
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchActivities();
  }, [statusFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getBorrowRequests({
        status: statusFilter || undefined,
        per_page: 100,
      });
      
      const data = response.data.data;
      setActivities(data);

      // Calculate stats
      const statsData: ActivityStats = {
        total_requests: data.length,
        pending: data.filter((a: ActivityLog) => a.status === 'pending').length,
        approved: data.filter((a: ActivityLog) => a.status === 'approved').length,
        borrowed: data.filter((a: ActivityLog) => a.status === 'borrowed').length,
        returned: data.filter((a: ActivityLog) => a.status === 'returned').length,
        rejected: data.filter((a: ActivityLog) => a.status === 'rejected').length,
      };
      setStats(statsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'borrowed':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTimeline = (activity: ActivityLog) => {
    const timeline = [];
    
    if (activity.date_requested) {
      timeline.push({
        label: 'Requested',
        date: activity.date_requested,
        icon: <FileText className="w-4 h-4" />,
        color: 'text-blue-600',
      });
    }
    
    if (activity.date_approved) {
      timeline.push({
        label: 'Approved',
        date: activity.date_approved,
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
      });
    }
    
    if (activity.date_borrowed) {
      timeline.push({
        label: 'Borrowed',
        date: activity.date_borrowed,
        icon: <Package className="w-4 h-4" />,
        color: 'text-purple-600',
      });
    }
    
    if (activity.date_returned || activity.actual_return_date) {
      timeline.push({
        label: 'Returned',
        date: activity.date_returned || activity.actual_return_date,
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-teal-600',
      });
    }
    
    return timeline;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="Activity Logs" 
        subtitle="Track your equipment request history and activities"
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
        <h1 className="text-lg font-bold text-gray-900 mb-1">Activity Logs</h1>
        <p className="text-sm text-gray-600">Track your equipment request history and activities</p>
      </div>
      
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-2">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Borrowed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.borrowed}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Returned</p>
                <p className="text-2xl font-bold text-teal-600">{stats.returned}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-teal-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Activities</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
            
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No activities found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-l-4 border-blue-500 pl-6 pb-6 relative"
                  >
                    {/* Status Icon */}
                    <div className="absolute -left-3 top-0 bg-white rounded-full p-1">
                      {getActivityIcon(activity.status)}
                    </div>

                    {/* Activity Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {activity.item?.item_name || 'Unknown Item'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Request Code: <span className="font-mono font-semibold text-blue-600">{activity.request_code}</span>
                        </p>
                      </div>
                      <StatusBadge label={activity.status} status={activity.status} />
                    </div>

                    {/* Activity Details */}
                    <div className="bg-gray-50 rounded p-4 mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Item Code</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.item?.item_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Quantity</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.quantity_approved || activity.quantity_requested}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Purpose</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.purpose || 'N/A'}
                          </p>
                        </div>
                        {activity.expected_return_date && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Expected Return</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(activity.expected_return_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      {getActivityTimeline(activity).map((event, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={event.color}>{event.icon}</div>
                          <div>
                            <p className="text-xs text-gray-600">{event.label}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {event.date ? formatDate(event.date) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Notes */}
                    {activity.admin_notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-xs text-blue-800 font-semibold mb-1">Admin Notes:</p>
                        <p className="text-sm text-blue-900">{activity.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

