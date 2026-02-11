import { useState } from 'react';
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
  const [formData, setFormData] = useState({
    admin_notes: '',
    condition_on_distribution: 'good',
  });

  const handleApprove = async () => {
    if (!formData.condition_on_distribution) {
      toast.error('Please select item condition');
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
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Distribution Request Details</h2>
            <p className="text-sm text-gray-600 mt-1">Review and process request</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
                  <h3 className="font-semibold text-blue-900">Item Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-700">Item:</span>
                    <p className="font-medium text-blue-900">{request.item.item_name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Code:</span>
                    <p className="font-medium text-blue-900">{request.item.item_code}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Category:</span>
                    <p className="font-medium text-blue-900">{request.item.category}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Quantity Requested:</span>
                    <p className="font-medium text-blue-900">{request.quantity_requested} units</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Available:</span>
                    <p className="font-medium text-blue-900">{request.item.quantity_available} units</p>
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
                    <p className="font-medium text-green-900">{request.teacher.full_name}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Email:</span>
                    <p className="font-medium text-green-900">{request.teacher.email}</p>
                  </div>
                  <div>
                    <span className="text-green-700">Department:</span>
                    <p className="font-medium text-green-900">{request.teacher.department}</p>
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

          {/* Additional Notes */}
          {request.notes && (
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">{request.notes}</p>
              </div>
            </div>
          )}

          {/* Review Information (if reviewed) */}
          {request.reviewed_by && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Review Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Reviewed By:</span>
                  <p className="font-medium text-gray-900">{request.reviewed_by?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Reviewed At:</span>
                  <p className="font-medium text-gray-900">
                    {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              {request.admin_notes && (
                <div>
                  <span className="text-gray-600">Admin Notes:</span>
                  <p className="font-medium text-gray-900 mt-1">{request.admin_notes}</p>
                </div>
              )}
            </div>
          )}

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
                    <Label htmlFor="condition">Item Condition *</Label>
                    <Select 
                      value={formData.condition_on_distribution} 
                      onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}
                    >
                      <SelectTrigger>
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
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAction(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                    >
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
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAction(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                    >
                      {loading ? 'Processing...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close button for non-pending requests */}
          {request.status !== 'pending' && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
