import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Card } from '@/components/ui/card';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { parseUserAgent, getDeviceDisplay } from '../../utils/deviceDetection';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Activity,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Users,
  Settings,
  FileText,
  Filter,
  Search,
  TrendingUp,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '../../components/common/FormElements';

interface SystemLog {
  id: number;
  log_type: string;
  user_type: string | null;
  user_id: number | null;
  user_name: string | null;
  action: string;
  description: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

interface LogStats {
  total_logs: number;
  today_logs: number;
  login_attempts: number;
  failed_logins: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LogStats>({
    total_logs: 0,
    today_logs: 0,
    login_attempts: 0,
    failed_logins: 0,
    by_type: {},
    by_severity: {},
  });
  
  const [filters, setFilters] = useState({
    log_type: '',
    action: '',
    user_type: '',
    search: '',
    severity: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalLogsCount, setTotalLogsCount] = useState(0);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const role = localStorage.getItem('role') || 'admin';

  // Initialize WebSocket for real-time log updates
  const { addListener, removeListener } = useWebSocket(currentUser?.id, role);

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [filters, currentPage, perPage]);

  // Listen for real-time log updates
  useEffect(() => {
    const handleLogUpdate = (newLog: SystemLog) => {
      // Add new log to the top of the list
      setLogs(prevLogs => [newLog, ...prevLogs]);
      
      // Update statistics
      setStats(prevStats => ({
        ...prevStats,
        total_logs: prevStats.total_logs + 1,
        today_logs: prevStats.today_logs + 1,
        login_attempts: newLog.action === 'login' ? prevStats.login_attempts + 1 : prevStats.login_attempts,
        failed_logins: newLog.action === 'login_failed' ? prevStats.failed_logins + 1 : prevStats.failed_logins,
      }));

      // Show toast for critical logs or failed logins
      if (newLog.severity === 'critical' || newLog.severity === 'error') {
        toast({
          title: `${newLog.severity.toUpperCase()}: ${newLog.action}`,
          description: newLog.description || 'New system log entry',
          variant: newLog.severity === 'critical' ? 'destructive' : 'default',
        });
      } else if (newLog.action === 'login_failed') {
        toast({
          title: 'Failed Login Attempt',
          description: newLog.description || `Failed login attempt from ${newLog.ip_address}`,
          variant: 'default',
        });
      }
    };

    addListener('log_update', handleLogUpdate);

    return () => {
      removeListener('log_update', handleLogUpdate);
    };
  }, [addListener, removeListener]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogs({
        ...filters,
        page: currentPage,
        per_page: perPage,
      });
      setLogs(response.data.data);
      setTotalLogsCount(response.data.total);
      setLastPage(response.data.last_page);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load system logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminAPI.getLogsStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="w-5 h-5 text-green-500" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-blue-500" />;
      case 'login_failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'inventory_create':
      case 'inventory_update':
      case 'inventory_delete':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'borrow_request_approved':
      case 'borrow_request_rejected':
      case 'item_returned':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'teacher_created':
      case 'teacher_updated':
      case 'teacher_deleted':
        return <Users className="w-5 h-5 text-teal-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[severity] || colors.info}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'critical':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && logs.length === 0) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="System Logs" 
        subtitle="Monitor all system activities and security events"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">System Logs</h1>
        <p className="text-sm text-gray-600">Monitor all system activities and security events</p>
      </div>
      
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_logs}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.today_logs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Login Attempts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.login_attempts}</p>
              </div>
              <LogIn className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed_logins}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Log Type
              </label>
              <select
                value={filters.log_type}
                onChange={(e) => { setFilters({ ...filters, log_type: e.target.value }); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="auth">Authentication</option>
                <option value="transaction">Transactions</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <optgroup label="Authentication">
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="login_failed">Failed Login</option>
                </optgroup>
                <optgroup label="Inventory">
                  <option value="inventory_create">Inventory Created</option>
                  <option value="inventory_update">Inventory Updated</option>
                  <option value="inventory_delete">Inventory Deleted</option>
                </optgroup>
                <optgroup label="Borrow Requests">
                  <option value="borrow_request_approved">Request Approved</option>
                  <option value="borrow_request_rejected">Request Rejected</option>
                  <option value="item_returned">Item Returned</option>
                </optgroup>
                <optgroup label="Teacher Management">
                  <option value="teacher_created">Teacher Created</option>
                  <option value="teacher_updated">Teacher Updated</option>
                  <option value="teacher_deleted">Teacher Deleted</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <select
                value={filters.user_type}
                onChange={(e) => { setFilters({ ...filters, user_type: e.target.value }); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Users</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => { setFilters({ ...filters, severity: e.target.value }); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
                placeholder="Search logs..."
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Logs Timeline */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline
            </h3>
            
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`border-l-4 pl-6 pb-4 relative ${
                      log.severity === 'critical' ? 'border-red-600' :
                      log.severity === 'error' ? 'border-red-400' :
                      log.severity === 'warning' ? 'border-yellow-400' :
                      'border-blue-400'
                    }`}
                  >
                    {/* Icon */}
                    <div className="absolute -left-3 top-0 bg-white rounded-full p-1">
                      {getLogIcon(log.action)}
                    </div>

                    {/* Log Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{log.action}</h4>
                          {getSeverityBadge(log.severity)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Log Details */}
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {log.user_name && (
                          <div>
                            <p className="text-xs text-gray-600">User</p>
                            <p className="font-semibold text-gray-900">{log.user_name}</p>
                          </div>
                        )}
                        {log.user_type && (
                          <div>
                            <p className="text-xs text-gray-600">User Type</p>
                            <p className="font-semibold text-gray-900 capitalize">{log.user_type}</p>
                          </div>
                        )}
                        {log.ip_address && (
                          <div>
                            <p className="text-xs text-gray-600">IP Address</p>
                            <p className="font-mono text-xs text-gray-900">{log.ip_address}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-600">Log Type</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {log.log_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {log.description && (
                      <div className="text-sm text-gray-700 mb-2">
                        {log.description}
                      </div>
                    )}

                    {/* User Agent / Device Info */}
                    {log.user_agent && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        <span>{getDeviceDisplay(log.user_agent)}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {!loading && totalLogsCount > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{logs.length}</span> of <span className="font-bold text-gray-900">{totalLogsCount}</span> logs
                      </div>
                      <div className="w-40">
                        <select
                          value={perPage}
                          onChange={(e) => {
                            setPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                          <option value={totalLogsCount}>All ({totalLogsCount})</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                          let pageNum;
                          if (lastPage <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= lastPage - 2) {
                            pageNum = lastPage - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 p-0 text-xs font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(lastPage)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
