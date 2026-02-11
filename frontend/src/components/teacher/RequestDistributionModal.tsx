import { useState, useEffect } from 'react';
import { X, Package, FileText, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RequestDistributionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Item {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  quantity_available: number;
}

export default function RequestDistributionModal({ onClose, onSuccess }: RequestDistributionModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity_requested: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchAvailableItems();
  }, []);

  const fetchAvailableItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teacher/distribution-requests/available-items`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load available items');
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const maxQuantity = selectedItem?.quantity_available || 0;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_requested: '' });
      return;
    }
    if (numValue > maxQuantity) {
      setFormData({ ...formData, quantity_requested: maxQuantity.toString() });
      toast.warning(`Maximum available quantity is ${maxQuantity}`);
      return;
    }
    setFormData({ ...formData, quantity_requested: value });
  };

  const incrementQuantity = () => {
    const current = parseInt(formData.quantity_requested || '0');
    if (current < maxQuantity) {
      setFormData({ ...formData, quantity_requested: (current + 1).toString() });
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(formData.quantity_requested || '0');
    if (current > 1) {
      setFormData({ ...formData, quantity_requested: (current - 1).toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.quantity_requested || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/teacher/distribution-requests`,
        {
          ...formData,
          item_id: parseInt(formData.item_id),
          quantity_requested: parseInt(formData.quantity_requested),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Distribution request submitted successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Item Distribution</h2>
            <p className="text-sm text-gray-600 mt-1">Submit a request for items you need</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item_id">
              <Package className="w-4 h-4 inline mr-2" />
              Select Item *
            </Label>
            <Select value={formData.item_id} onValueChange={(value) => setFormData({ ...formData, item_id: value, quantity_requested: '' })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent>
                {items.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No items available
                  </div>
                ) : (
                  items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{item.item_name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.item_code}) • {item.quantity_available} available
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-blue-900">{selectedItem.item_name}</p>
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>Code: {selectedItem.item_code}</span>
                  <span>Category: {selectedItem.category}</span>
                  <span className="font-semibold">Available: {selectedItem.quantity_available}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Needed *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={!formData.quantity_requested || parseInt(formData.quantity_requested) <= 1}
                className="h-10 w-10 flex-shrink-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="relative flex-1">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={formData.quantity_requested}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="Enter quantity"
                  className="text-center text-lg font-semibold"
                  required
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={!selectedItem || parseInt(formData.quantity_requested || '0') >= maxQuantity}
                className="h-10 w-10 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedItem && formData.quantity_requested && parseInt(formData.quantity_requested) > 0 && (
              <p className="text-sm text-gray-600">
                Requesting <span className="font-semibold text-blue-600">{formData.quantity_requested}</span> of {selectedItem.quantity_available} available
              </p>
            )}
            
            {/* Quick quantity buttons */}
            {selectedItem && selectedItem.quantity_available > 1 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, quantity_requested: '1' })}
                  className="text-xs"
                >
                  1
                </Button>
                {selectedItem.quantity_available >= 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, quantity_requested: '5' })}
                    className="text-xs"
                  >
                    5
                  </Button>
                )}
                {selectedItem.quantity_available >= 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, quantity_requested: '10' })}
                    className="text-xs"
                  >
                    10
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              <FileText className="w-4 h-4 inline mr-2" />
              Reason for Request *
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why you need these items..."
              rows={4}
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
