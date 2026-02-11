import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Check, X, Package } from 'lucide-react';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import CreatePurchaseOrderModal from '../../components/admin/CreatePurchaseOrderModal';
import ViewPurchaseOrderModal from '../../components/admin/ViewPurchaseOrderModal';
import ReceiveItemsModal from '../../components/admin/ReceiveItemsModal';

interface PurchaseOrder {
  id: number;
  po_number: string;
  po_date: string;
  expected_delivery_date: string;
  status: string;
  supplier_name: string;
  total_amount: number;
  items_count?: number;
}

const PurchaseOrdersPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [statistics, setStatistics] = useState<any>({});

  useEffect(() => {
    fetchPurchaseOrders();
    fetchStatistics();
  }, [statusFilter, searchTerm]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/purchase-orders', {
        params: {
          status: statusFilter,
          search: searchTerm
        }
      });
      setPurchaseOrders(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/admin/purchase-orders/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.post(`/admin/purchase-orders/${id}/approve`);
      toast.success('Purchase order approved successfully');
      fetchPurchaseOrders();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve purchase order');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this purchase order?')) return;
    
    try {
      await axios.post(`/admin/purchase-orders/${id}/cancel`);
      toast.success('Purchase order cancelled successfully');
      fetchPurchaseOrders();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel purchase order');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    
    try {
      await axios.delete(`/admin/purchase-orders/${id}`);
      toast.success('Purchase order deleted successfully');
      fetchPurchaseOrders();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
    }
  };

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowViewModal(true);
  };

  const handleReceive = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowReceiveModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800' },
      partially_received: { label: 'Partially Received', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage purchase orders and suppliers</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create PO
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total POs</p>
          <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{statistics.pending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-blue-600">{statistics.approved || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{(statistics.total_amount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by PO number, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="partially_received">Partially Received</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-blue-600">{po.po_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(po.po_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.expected_delivery_date
                        ? new Date(po.expected_delivery_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₱{po.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(po)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {po.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(po.id)}
                            title="Approve"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {(po.status === 'approved' || po.status === 'partially_received') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReceive(po)}
                            title="Receive Items"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                        )}
                        {po.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(po.id)}
                            title="Cancel"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(po.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePurchaseOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchPurchaseOrders();
            fetchStatistics();
          }}
        />
      )}

      {showViewModal && selectedPO && (
        <ViewPurchaseOrderModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPO(null);
          }}
          poId={selectedPO.id}
        />
      )}

      {showReceiveModal && selectedPO && (
        <ReceiveItemsModal
          isOpen={showReceiveModal}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedPO(null);
          }}
          poId={selectedPO.id}
          onSuccess={() => {
            fetchPurchaseOrders();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
