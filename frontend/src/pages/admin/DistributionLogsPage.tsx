import { useState, useEffect } from "react";
import { Search, Download, Filter, Calendar, Package, Users, User, Clock, CheckCircle, XCircle, AlertCircle, Eye, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface DistributionLog {
  id: number;
  distributable_type: string;
  distributable_id: number;
  teacher_id: number | null;
  item_id: number;
  quantity: number;
  action: 'created' | 'processed' | 'cancelled' | 'returned' | 'modified';
  description: string | null;
  old_values: any;
  new_values: any;
  performed_by: number;
  performed_by_type: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: number;
    full_name: string;
    email: string;
  };
  item?: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
  };
  performedBy?: {
    id: number;
    full_name: string;
    email: string;
  };
  distributable?: {
    id: number;
    [key: string]: any;
  };
}

interface LogStatistics {
  total_logs: number;
  action_counts: Record<string, number>;
  top_items: Array<{
    item_id: number;
    count: number;
    total_quantity: number;
    item: {
      id: number;
      item_name: string;
      item_code: string;
    };
  }>;
  top_teachers: Array<{
    teacher_id: number;
    count: number;
    total_quantity: number;
    teacher: {
      id: number;
      full_name: string;
      email: string;
    };
  }>;
  recent_activity: DistributionLog[];
}

export default function DistributionLogsPage() {
  const [logs, setLogs] = useState<DistributionLog[]>([]);
  const [stats, setStats] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DistributionLog | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalLogsCount, setTotalLogsCount] = useState(0);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, dateFrom, dateTo, currentPage, perPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (actionFilter !== "all") params.action = actionFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const responseData = response.data.data;
      if (responseData && responseData.data) {
        setLogs(responseData.data);
        setTotalLogsCount(responseData.total);
        setLastPage(responseData.last_page);
      } else {
        setLogs(responseData);
      }
    } catch (error: any) {
      console.error("Error fetching distribution logs:", error);
      toast.error("Failed to load distribution logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution-logs/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setStats(response.data.data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const params: any = {};
      if (actionFilter !== "all") params.action = actionFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution-logs/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `distribution_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Distribution logs exported successfully");
    } catch (error: any) {
      toast.error("Failed to export logs");
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, JSX.Element> = {
      created: <Badge className="bg-blue-100 text-blue-800">Created</Badge>,
      processed: <Badge className="bg-green-100 text-green-800">Processed</Badge>,
      cancelled: <Badge className="bg-red-100 text-red-800">Cancelled</Badge>,
      returned: <Badge className="bg-purple-100 text-purple-800">Returned</Badge>,
      modified: <Badge className="bg-yellow-100 text-yellow-800">Modified</Badge>,
    };
    return variants[action] || <Badge>{action}</Badge>;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, JSX.Element> = {
      created: <CheckCircle className="w-4 h-4 text-blue-600" />,
      processed: <CheckCircle className="w-4 h-4 text-green-600" />,
      cancelled: <XCircle className="w-4 h-4 text-red-600" />,
      returned: <Package className="w-4 h-4 text-purple-600" />,
      modified: <AlertCircle className="w-4 h-4 text-yellow-600" />,
    };
    return icons[action] || <Clock className="w-4 h-4" />;
  };

  const getDistributableType = (type: string) => {
    return type.includes('BulkDistribution') ? 'Bulk Distribution' : 'Item Distribution';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distribution Logs</h1>
          <p className="text-gray-600 mt-1">Audit trail for all distribution activities</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_logs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Created</CardTitle>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.action_counts.created || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processed</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.action_counts.processed || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
              <XCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.action_counts.cancelled || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchLogs(); } }}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              placeholder="From Date"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              placeholder="To Date"
            />
          </div>

          <div className="text-sm text-gray-600 mt-4">
            Showing {logs.length} logs
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDistributableType(log.distributable_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.teacher ? log.teacher.full_name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.item ? log.item.item_name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.performedBy ? log.performedBy.full_name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loading && totalLogsCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{logs.length}</span> of <span className="font-bold text-gray-900">{totalLogsCount}</span> logs
                </div>
                <div className="w-40">
                  <Select
                    value={perPage.toString()}
                    onValueChange={(val) => {
                      setPerPage(parseInt(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                      <SelectItem value={totalLogsCount.toString()}>All ({totalLogsCount})</SelectItem>
                    </SelectContent>
                  </Select>
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
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-9 w-9 p-0 text-xs font-bold`}
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
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Log Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Action:</span>
                      <span>{getActionBadge(selectedLog.action)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{getDistributableType(selectedLog.distributable_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedLog.quantity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">People</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teacher:</span>
                      <span className="font-medium">{selectedLog.teacher ? selectedLog.teacher.full_name : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium">{selectedLog.item ? selectedLog.item.item_name : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performed By:</span>
                      <span className="font-medium">{selectedLog.performedBy ? selectedLog.performedBy.full_name : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-medium">{selectedLog.ip_address || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedLog.description && (
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-sm text-gray-600">{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <h3 className="font-semibold mb-3">Previous Values</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <h3 className="font-semibold mb-3">New Values</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
