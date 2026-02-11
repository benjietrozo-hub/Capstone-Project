import { useState } from 'react';
import { X, Calendar, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReturnDistributionModalProps {
  distribution: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnDistributionModal({ distribution, onClose, onSuccess }: ReturnDistributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    condition_on_return: 'good',
    admin_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distributions/${distribution.id}/return`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Distribution marked as returned successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as returned');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">Return Distribution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Distribution Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-blue-900">Distribution Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Item:</span>
                <p className="font-medium text-blue-900">{distribution.item.item_name}</p>
              </div>
              <div>
                <span className="text-blue-700">Teacher:</span>
                <p className="font-medium text-blue-900">{distribution.teacher.full_name}</p>
              </div>
              <div>
                <span className="text-blue-700">Quantity:</span>
                <p className="font-medium text-blue-900">{distribution.quantity_distributed} units</p>
              </div>
              <div>
                <span className="text-blue-700">Distributed:</span>
                <p className="font-medium text-blue-900">
                  {new Date(distribution.distribution_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Condition (Out):</span>
                <p className="font-medium text-blue-900 capitalize">{distribution.condition_on_distribution}</p>
              </div>
              {distribution.expected_return_date && (
                <div>
                  <span className="text-blue-700">Expected Return:</span>
                  <p className="font-medium text-blue-900">
                    {new Date(distribution.expected_return_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Return Date */}
            <div className="space-y-2">
              <Label htmlFor="actual_return_date">
                <Calendar className="w-4 h-4 inline mr-2" />
                Actual Return Date *
              </Label>
              <Input
                id="actual_return_date"
                type="date"
                value={formData.actual_return_date}
                onChange={(e) => setFormData({ ...formData, actual_return_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Condition on Return */}
            <div className="space-y-2">
              <Label htmlFor="condition_on_return">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Item Condition on Return *
              </Label>
              <Select 
                value={formData.condition_on_return} 
                onValueChange={(value) => setFormData({ ...formData, condition_on_return: value })}
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
              <p className="text-sm text-gray-600">
                Original condition: <span className="font-semibold capitalize">{distribution.condition_on_distribution}</span>
              </p>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="admin_notes">
                <FileText className="w-4 h-4 inline mr-2" />
                Admin Notes
              </Label>
              <Textarea
                id="admin_notes"
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                placeholder="Any notes about the return (damage, missing parts, etc.)..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {loading ? 'Processing...' : 'Mark as Returned'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
