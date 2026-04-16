import { useState, useEffect } from "react";
import { Search, Users, Package, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Eye, Play, X, Filter } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import CreateDistributionModal from "@/components/admin/CreateDistributionModal";

interface BulkDistribution {
  id: number;
  group_id: number;
  item_id: number;
  distributed_by: number;
  total_quantity: number;
  quantity_per_member: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  purpose: string | null;
  notes: string | null;
  distribution_date: string;
  expected_return_date: string | null;
  created_at: string;
  updated_at: string;
  group: {
    id: number;
    group_name: string;
    group_type: string;
    teachers_count: number;
  };
  item: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
  };
  distributedBy: {
    id: number;
    full_name: string;
  };
  itemDistributions: Array<{
    id: number;
    teacher_id: number;
    quantity_distributed: number;
    status: string;
    teacher: {
      id: number;
      full_name: string;
      email: string;
    };
  }>;
}

interface BulkDistributionStats {
  total_distributions: number;
  pending_distributions: number;
  processing_distributions: number;
  completed_distributions: number;
  cancelled_distributions: number;
  total_items_distributed: number;
}

export default function BulkDistributionsPage() {
  const [distributions, setDistributions] = useState<BulkDistribution[]>([]);
  const [stats, setStats] = useState<BulkDistributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<BulkDistribution | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchDistributions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDistributions();
  }, [statusFilter, groupFilter]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (groupFilter !== "all") params.group_id = groupFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setDistributions(response.data.data.data || response.data.data);
    } catch (error: any) {
      console.error("Error fetching bulk distributions:", error);
      toast.error("Failed to load bulk distributions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleProcessDistribution = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/bulk-distributions/${id}/process`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bulk distribution processed successfully");
      fetchDistributions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process distribution");
    }
  };

  const handleCancelDistribution = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this bulk distribution?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/bulk-distributions/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bulk distribution cancelled successfully");
      fetchDistributions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel distribution");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, JSX.Element> = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      processing: <Badge className="bg-blue-100 text-blue-800">Processing</Badge>,
      completed: <Badge className="bg-green-100 text-green-800">Completed</Badge>,
      cancelled: <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      processing: <Play className="w-4 h-4 text-blue-600" />,
      completed: <CheckCircle className="w-4 h-4 text-green-600" />,
      cancelled: <XCircle className="w-4 h-4 text-gray-600" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesSearch = searchQuery === "" || 
      d.item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Distributions</h1>
          <p className="text-gray-600 mt-1">Manage group-based item distributions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
          <Users className="w-4 h-4" />
          Create Bulk Distribution
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_distributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_distributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
              <Play className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.processing_distributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_distributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
              <XCircle className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.cancelled_distributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Items Distributed</CardTitle>
              <Package className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.total_items_distributed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by item or group..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            Showing {filteredDistributions.length} of {distributions.length} bulk distributions
          </div>
        </CardContent>
      </Card>

      {/* Distributions List */}
      <div className="space-y-4">
        {filteredDistributions.map((distribution) => (
          <Card key={distribution.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(distribution.status)}
                    <CardTitle className="text-lg">{distribution.item.item_name}</CardTitle>
                    {getStatusBadge(distribution.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{distribution.group.group_name} ({distribution.group.teachers_count} members)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>{distribution.total_quantity} total ({distribution.quantity_per_member} each)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(distribution.distribution_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {distribution.purpose && (
                    <p className="text-sm text-gray-600 mt-2">{distribution.purpose}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDistribution(distribution);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {distribution.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleProcessDistribution(distribution.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Process
                    </Button>
                  )}
                  {['pending', 'processing'].includes(distribution.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelDistribution(distribution.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {filteredDistributions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bulk Distributions Found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new bulk distribution</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDistributionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDistributions();
            fetchStats();
          }}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bulk Distribution Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Distribution Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium">{selectedDistribution.item.item_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item Code:</span>
                      <span className="font-medium">{selectedDistribution.item.item_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group:</span>
                      <span className="font-medium">{selectedDistribution.group.group_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedDistribution.status)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Quantity & Dates</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-medium">{selectedDistribution.total_quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Member:</span>
                      <span className="font-medium">{selectedDistribution.quantity_per_member}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distribution Date:</span>
                      <span className="font-medium">{new Date(selectedDistribution.distribution_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Return:</span>
                      <span className="font-medium">
                        {selectedDistribution.expected_return_date 
                          ? new Date(selectedDistribution.expected_return_date).toLocaleDateString() 
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Distributions */}
              <div>
                <h3 className="font-semibold mb-3">Individual Distributions</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Teacher</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Email</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDistribution.itemDistributions.map((itemDist) => (
                        <tr key={itemDist.id}>
                          <td className="px-4 py-2 text-sm">{itemDist.teacher.full_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{itemDist.teacher.email}</td>
                          <td className="px-4 py-2 text-sm">{itemDist.quantity_distributed}</td>
                          <td className="px-4 py-2 text-sm">
                            <Badge variant={itemDist.status === 'active' ? 'default' : 'secondary'}>
                              {itemDist.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedDistribution.purpose && (
                <div>
                  <h3 className="font-semibold mb-3">Purpose</h3>
                  <p className="text-sm text-gray-600">{selectedDistribution.purpose}</p>
                </div>
              )}

              {selectedDistribution.notes && (
                <div>
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedDistribution.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
