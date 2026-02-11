import { useState, useEffect } from 'react';
import { Package, Plus, Search, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import RequestDistributionModal from '@/components/teacher/RequestDistributionModal';

interface DistributionRequest {
  id: number;
  teacher_id: number;
  item_id: number;
  quantity_requested: number;
  reason: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'distributed';
  reviewed_by: number | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  item: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
    quantity_available: number;
  };
  reviewed_by_admin?: {
    id: number;
    full_name: string;
  };
}

interface Statistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  distributed_requests: number;
}

export default function DistributionRequestsPage() {
  const [requests, setRequests] = useState<DistributionRequest[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [requestsRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/teacher/distribution-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/teacher/distribution-requests/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRequests(requestsRes.data.data);
      setStatistics(statsRes.data.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load distribution requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/teacher/distribution-requests/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Request cancelled successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1 inline" />Pending</Badge>,
      approved: <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1 inline" />Approved</Badge>,
      rejected: <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1 inline" />Rejected</Badge>,
      distributed: <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1 inline" />Distributed</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === '' ||
      req.item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900">Distribution Requests</h1>
          <p className="text-gray-600 mt-1">Request items you need for your teaching</p>
        </div>
        <Button 
          onClick={() => setShowRequestModal(true)} 
          className="gap-2 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending_requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.approved_requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
              <XCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.rejected_requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Distributed</CardTitle>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.distributed_requests}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by item name or code..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="distributed">Distributed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'You haven\'t made any distribution requests yet'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setShowRequestModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.item.item_name}</h3>
                        <p className="text-sm text-gray-600">Code: {request.item.item_code} • Category: {request.item.category}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Quantity Requested:</span>
                        <p className="font-semibold text-gray-900">{request.quantity_requested} units</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Requested On:</span>
                        <p className="font-semibold text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Reason:</span>
                      <p className="text-sm text-gray-900 mt-1">{request.reason}</p>
                    </div>

                    {request.notes && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">Additional Notes:</span>
                        <p className="text-sm text-gray-900 mt-1">{request.notes}</p>
                      </div>
                    )}

                    {request.reviewed_at && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">Review Information</span>
                          <span className="text-xs text-gray-600">
                            {new Date(request.reviewed_at).toLocaleString()}
                          </span>
                        </div>
                        {request.reviewed_by_admin && (
                          <p className="text-sm text-gray-600 mb-2">
                            Reviewed by: <span className="font-medium">{request.reviewed_by_admin.full_name}</span>
                          </p>
                        )}
                        {request.admin_notes && (
                          <div>
                            <span className="text-sm text-gray-600">Admin Notes:</span>
                            <p className="text-sm text-gray-900 mt-1">{request.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(request.id)}
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestDistributionModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
