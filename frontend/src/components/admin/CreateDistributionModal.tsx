import { useState, useEffect } from 'react';
import { X, Package, User, Calendar, FileText, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CreateDistributionModalProps {
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

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  department: string;
}

export default function CreateDistributionModal({ onClose, onSuccess }: CreateDistributionModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    teacher_id: '',
    quantity_distributed: '',
    distribution_date: new Date().toISOString().split('T')[0],
    purpose: '',
    notes: '',
    condition_on_distribution: 'good',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [itemsRes, teachersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setItems(itemsRes.data.data.filter((item: Item) => item.quantity_available > 0));
      setTeachers(teachersRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.teacher_id || !formData.quantity_distributed) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
    if (selectedItem && parseInt(formData.quantity_distributed) > selectedItem.quantity_available) {
      toast.error(`Only ${selectedItem.quantity_available} units available`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distributions`,
        {
          ...formData,
          item_id: parseInt(formData.item_id),
          teacher_id: parseInt(formData.teacher_id),
          quantity_distributed: parseInt(formData.quantity_distributed),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Item distributed successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to distribute item');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const maxQuantity = selectedItem?.quantity_available || 0;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_distributed: '' });
      return;
    }
    if (numValue > maxQuantity) {
      setFormData({ ...formData, quantity_distributed: maxQuantity.toString() });
      toast.warning(`Maximum available quantity is ${maxQuantity}`);
      return;
    }
    setFormData({ ...formData, quantity_distributed: value });
  };

  const incrementQuantity = () => {
    const current = parseInt(formData.quantity_distributed || '0');
    if (current < maxQuantity) {
      setFormData({ ...formData, quantity_distributed: (current + 1).toString() });
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(formData.quantity_distributed || '0');
    if (current > 1) {
      setFormData({ ...formData, quantity_distributed: (current - 1).toString() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Distribute Item to Teacher</h2>
            <p className="text-sm text-gray-600 mt-1">Assign inventory items for teacher use</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Item and Teacher Selection - Two Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item_id">
                <Package className="w-4 h-4 inline mr-2" />
                Select Item *
              </Label>
              <Select value={formData.item_id} onValueChange={(value) => setFormData({ ...formData, item_id: value, quantity_distributed: '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an item from inventory" />
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
                    <span className="font-semibold">Available: {selectedItem.quantity_available}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Selection */}
            <div className="space-y-2">
              <Label htmlFor="teacher_id">
                <User className="w-4 h-4 inline mr-2" />
                Select Teacher *
              </Label>
              <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No teachers available
                    </div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{teacher.full_name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {teacher.department}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formData.teacher_id && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-green-900">
                    {teachers.find(t => t.id === parseInt(formData.teacher_id))?.full_name}
                  </p>
                  <p className="text-xs text-green-700">
                    {teachers.find(t => t.id === parseInt(formData.teacher_id))?.department}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Quantity and Distribution Date - Two Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity with Custom Controls */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Distribute *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={!formData.quantity_distributed || parseInt(formData.quantity_distributed) <= 1}
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
                    value={formData.quantity_distributed}
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
                  disabled={!selectedItem || parseInt(formData.quantity_distributed || '0') >= maxQuantity}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedItem && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Available: <span className="font-semibold text-gray-900">{selectedItem.quantity_available}</span>
                  </span>
                  {formData.quantity_distributed && parseInt(formData.quantity_distributed) > 0 && (
                    <span className="text-gray-600">
                      Remaining: <span className="font-semibold text-blue-600">
                        {selectedItem.quantity_available - parseInt(formData.quantity_distributed)}
                      </span>
                    </span>
                  )}
                </div>
              )}
              
              {/* Quick quantity buttons */}
              {selectedItem && selectedItem.quantity_available > 1 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, quantity_distributed: '1' })}
                    className="text-xs"
                  >
                    1
                  </Button>
                  {selectedItem.quantity_available >= 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, quantity_distributed: '5' })}
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
                      onClick={() => setFormData({ ...formData, quantity_distributed: '10' })}
                      className="text-xs"
                    >
                      10
                    </Button>
                  )}
                  {selectedItem.quantity_available >= 20 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, quantity_distributed: '20' })}
                      className="text-xs"
                    >
                      20
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, quantity_distributed: selectedItem.quantity_available.toString() })}
                    className="text-xs"
                  >
                    All ({selectedItem.quantity_available})
                  </Button>
                </div>
              )}
            </div>

            {/* Distribution Date and Condition */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="distribution_date">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Distribution Date *
                </Label>
                <Input
                  id="distribution_date"
                  type="date"
                  value={formData.distribution_date}
                  onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Item Condition *</Label>
                <Select value={formData.condition_on_distribution} onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}>
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
            </div>
          </div>

          {/* Row 3: Purpose - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="purpose">
              <FileText className="w-4 h-4 inline mr-2" />
              Purpose / Reason for Distribution
            </Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Assigned for classroom use, Lab equipment, Personal teaching tools..."
              rows={3}
            />
          </div>

          {/* Row 4: Notes - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
              {loading ? 'Distributing...' : 'Distribute Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
