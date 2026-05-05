import { useState, useEffect } from 'react';
import { X, Package, Users, Calendar, FileText, Plus, Minus } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CreateGroupDistributionModalProps {
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

interface DistributionGroup {
  id: number;
  group_name: string;
  group_type: string;
  description: string;
  teachers_count: number;
  is_active: boolean;
}

export default function CreateGroupDistributionModal({ onClose, onSuccess }: CreateGroupDistributionModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    group_id: '',
    quantity_per_teacher: '',
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
      const [itemsRes, groupsRes] = await Promise.all([
        axiosInstance.get('/admin/inventory'),
        axiosInstance.get('/admin/distribution/groups')
      ]);

      setItems(itemsRes.data.data.filter((item: Item) => item.quantity_available > 0));
      setGroups(groupsRes.data.data.filter((group: DistributionGroup) => group.is_active));
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.group_id || !formData.quantity_per_teacher) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
    const selectedGroup = groups.find(g => g.id === parseInt(formData.group_id));
    
    if (selectedItem && selectedGroup) {
      const totalQuantityNeeded = parseInt(formData.quantity_per_teacher) * selectedGroup.teachers_count;
      if (totalQuantityNeeded > selectedItem.quantity_available) {
        toast.error(`Insufficient inventory. Need ${totalQuantityNeeded} units but only ${selectedItem.quantity_available} available`);
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axiosInstance.post(
        '/admin/distributions/bulk',
        {
          ...formData,
          item_id: parseInt(formData.item_id),
          group_id: parseInt(formData.group_id),
          quantity_per_teacher: parseInt(formData.quantity_per_teacher),
        }
      );

      toast.success(`Items distributed to ${selectedGroup?.teachers_count} teachers successfully`);
      onSuccess();
    } catch (error: any) {
      console.error('Group distribution error:', error);
      toast.error(error.response?.data?.message || 'Failed to distribute items to group');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const selectedGroup = groups.find(g => g.id === parseInt(formData.group_id));
  const maxQuantity = selectedItem?.quantity_available || 0;
  const totalQuantityNeeded = selectedGroup && formData.quantity_per_teacher ? 
    parseInt(formData.quantity_per_teacher) * selectedGroup.teachers_count : 0;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_per_teacher: '' });
      return;
    }
    if (selectedGroup && numValue * selectedGroup.teachers_count > maxQuantity) {
      const maxPerTeacher = Math.floor(maxQuantity / selectedGroup.teachers_count);
      setFormData({ ...formData, quantity_per_teacher: maxPerTeacher.toString() });
      toast.warning(`Maximum ${maxPerTeacher} units per teacher based on available inventory`);
      return;
    }
    setFormData({ ...formData, quantity_per_teacher: value });
  };

  const incrementQuantity = () => {
    const current = parseInt(formData.quantity_per_teacher || '0');
    if (selectedGroup && current * selectedGroup.teachers_count < maxQuantity) {
      setFormData({ ...formData, quantity_per_teacher: (current + 1).toString() });
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(formData.quantity_per_teacher || '0');
    if (current > 1) {
      setFormData({ ...formData, quantity_per_teacher: (current - 1).toString() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Distribute Items to Group</h2>
            <p className="text-sm text-gray-600 mt-1">Assign inventory items to all teachers in a group</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Item and Group Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item_id">
                <Package className="w-4 h-4 inline mr-2" />
                Select Item *
              </Label>
              <Select value={formData.item_id} onValueChange={(value) => setFormData({ ...formData, item_id: value, quantity_per_teacher: '' })}>
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
                            ({item.item_code}) × {item.quantity_available}
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

            {/* Group Selection */}
            <div className="space-y-2">
              <Label htmlFor="group_id">
                <Users className="w-4 h-4 inline mr-2" />
                Select Group *
              </Label>
              <Select value={formData.group_id} onValueChange={(value) => setFormData({ ...formData, group_id: value, quantity_per_teacher: '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a distribution group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No groups available
                    </div>
                  ) : (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        <div className="flex flex-col items-start w-full">
                          <span className="font-medium">{group.group_name}</span>
                          <span className="text-xs text-gray-500">
                            {group.teachers_count} teachers
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedGroup && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-green-900">{selectedGroup.group_name}</p>
                  <div className="flex items-center justify-between text-xs text-green-700">
                    <span>Type: {selectedGroup.group_type}</span>
                    <span className="font-semibold">{selectedGroup.teachers_count} teachers</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Distribution */}
          {selectedItem && selectedGroup && (
            <div className="space-y-2">
              <Label htmlFor="quantity_per_teacher">
                Quantity Per Teacher *
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={!formData.quantity_per_teacher || parseInt(formData.quantity_per_teacher) <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="quantity_per_teacher"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={formData.quantity_per_teacher}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="text-center"
                  placeholder="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={!selectedGroup || (parseInt(formData.quantity_per_teacher || '0') * selectedGroup.teachers_count) >= maxQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quantity Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-900">
                    {selectedGroup.teachers_count} teachers × {formData.quantity_per_teacher || '0'} units each
                  </span>
                  <span className="font-semibold text-amber-900">
                    Total: {totalQuantityNeeded} units
                  </span>
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Available: {maxQuantity} units
                </div>
                {totalQuantityNeeded > maxQuantity && (
                  <div className="text-xs text-red-600 mt-1 font-medium">
                    Insufficient inventory!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
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
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition_on_distribution">Condition</Label>
              <Select value={formData.condition_on_distribution} onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
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

          {/* Purpose and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">
                <FileText className="w-4 h-4 inline mr-2" />
                Purpose
              </Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Classroom supplies, Lab equipment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this distribution"
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]"
              disabled={loading || !formData.item_id || !formData.group_id || !formData.quantity_per_teacher || totalQuantityNeeded > maxQuantity}
            >
              {loading ? 'Distributing...' : `Distribute to ${selectedGroup?.teachers_count || 0} Teachers`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
