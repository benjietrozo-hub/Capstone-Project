import { useState, useEffect } from 'react';
import { X, Package, User, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ViewDistributionRequestModalProps {
  request: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ViewDistributionRequestModal({ request, onClose, onSuccess }: ViewDistributionRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [formData, setFormData] = useState({
    admin_notes: '',
    condition_on_distribution: 'good',
    inventory_item_ids: [] as number[]
  });

  // Fetch available items when action changes to approve
  useEffect(() => {
    if (action === 'approve' && request.category_id) {
      const fetchItems = async () => {
        setLoadingItems(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/admin/inventory-items?category_id=${request.category_id}&status=available&per_page=500`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableItems(res.data.data.data || []);
        } catch (err) {
          toast.error("Failed to load available items for this category");
        } finally {
          setLoadingItems(false);
        }
      };
      fetchItems();
    }
  }, [action, request.category_id]);

  const toggleItemSelection = (itemId: number) => {
    setFormData(prev => {
      const isSelected = prev.inventory_item_ids.includes(itemId);
      if (isSelected) {
        return { ...prev, inventory_item_ids: prev.inventory_item_ids.filter(id => id !== itemId) };
      } else {
        if (prev.inventory_item_ids.length >= request.quantity_requested) {
          toast.error(`You can only select up to ${request.quantity_requested} items.`);
          return prev;
        }
        return { ...prev, inventory_item_ids: [...prev.inventory_item_ids, itemId] };
      }
    });
  };

  const handleApprove = async () => {
    if (!formData.condition_on_distribution) {
      toast.error('Please select item condition');
      return;
    }
    
    if (formData.inventory_item_ids.length !== request.quantity_requested) {
      toast.error(`Please select exactly ${request.quantity_requested} serialized units to distribute.`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distribution-requests/${request.id}/approve`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Request approved and items distributed successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!formData.admin_notes) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distribution-requests/${request.id}/reject`,
        { admin_notes: formData.admin_notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Request rejected successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      approved: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
      rejected: <Badge className="bg-red-100 text-red-800">Rejected</Badge>,
      distributed: <Badge className="bg-blue-100 text-blue-800">Distributed</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Distribution Request Details</h2>
            <p className="text-sm text-gray-600 mt-1">Review and process request</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {getStatusBadge(request.status)}
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-2 gap-6">
            {/* Item Details */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Category Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-700">Category:</span>
                    <p className="font-medium text-blue-900">{request.category?.category_name || request.item?.category || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Quantity Requested:</span>
                    <p className="font-medium text-blue-900">{request.quantity_requested} units</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Details */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Teacher Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-green-700">Name:</span>
                    <p className="font-medium text-green-900">{request.teacher?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Email:</span>
                    <p className="font-medium text-green-900">{request.teacher?.email}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Requested:</span>
                    <p className="font-medium text-green-900">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reason for Request
            </Label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-900">{request.reason}</p>
            </div>
          </div>

          {/* Action Section (only for pending requests) */}
          {request.status === 'pending' && (
            <div className="space-y-4 pt-4 border-t">
              {!action && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setAction('approve')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Distribute
                  </Button>
                  <Button
                    onClick={() => setAction('reject')}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              )}

              {action === 'approve' && (
                <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900">Approve & Distribute</h3>
                  
                  <div className="space-y-2">
                    <Label className="flex justify-between items-center">
                      <span>Select Serial Numbers ({formData.inventory_item_ids.length} / {request.quantity_requested}) *</span>
                    </Label>
                    <div className="bg-white border border-green-200 rounded-md max-h-48 overflow-y-auto">
                      {loadingItems ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading units...</div>
                      ) : availableItems.length === 0 ? (
                        <div className="p-4 text-center text-sm text-red-500 font-medium">No available units in this category.</div>
                      ) : (
                        availableItems.map((item) => (
                          <label key={item.id} className={`flex items-center px-3 py-2 cursor-pointer border-b last:border-0 ${formData.inventory_item_ids.includes(item.id) ? 'bg-green-100' : 'hover:bg-gray-50'}`}>
                            <input 
                              type="checkbox" 
                              className="mr-3" 
                              checked={formData.inventory_item_ids.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                            />
                            <div>
                              <div className="font-medium text-sm text-gray-900">{item.serial_number}</div>
                              <div className="text-xs text-gray-500">{item.item_name} - {item.condition}</div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Initial Condition of Distribution *</Label>
                    <Select 
                      value={formData.condition_on_distribution} 
                      onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="admin_notes"
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      placeholder="Any notes about this distribution..."
                      rows={2}
                      className="bg-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1 bg-white">
                      Cancel
                    </Button>
                    <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-gradient-to-r from-green-500 to-green-600">
                      {loading ? 'Processing...' : 'Confirm Approval'}
                    </Button>
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div className="space-y-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900">Reject Request</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reject_reason">Reason for Rejection *</Label>
                    <Textarea
                      id="reject_reason"
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      placeholder="Explain why this request is being rejected..."
                      rows={4}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1 bg-white">
                      Cancel
                    </Button>
                    <Button onClick={handleReject} disabled={loading} className="flex-1 bg-gradient-to-r from-red-500 to-red-600">
                      {loading ? 'Processing...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
