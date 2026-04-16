import { useState, useEffect } from 'react';
import { X, Package, User, Calendar, FileText, Plus, Minus, Users, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    item_id: '',
    quantity_distributed: '',
    distribution_date: new Date().toISOString().split('T')[0],
    purpose: '',
    notes: '',
    condition_on_distribution: 'good',
    distribution_type: 'teacher', // 'teacher' or 'group'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [itemsRes, teachersRes, groupsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/admin/distribution', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/admin/distribution/groups', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setItems(itemsRes.data.data.filter((item: Item) => item.quantity_available > 0));
      setTeachers(teachersRes.data);
      setGroups(groupsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTeacher = (teacherId: number) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAllTeachers = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || (formData.distribution_type === 'teacher' && selectedTeachers.length === 0) || (formData.distribution_type === 'group' && !selectedGroup) || !formData.quantity_distributed) {
      toast.error('Please select an item, recipient, and quantity');
      return;
    }

    const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
    
    if (formData.distribution_type === 'teacher') {
      // Teacher distribution logic
      const totalQuantityNeeded = parseInt(formData.quantity_distributed) * selectedTeachers.length;
      
      if (selectedItem && totalQuantityNeeded > selectedItem.quantity_available) {
        toast.error(`Insufficient inventory. Need ${totalQuantityNeeded} units but only ${selectedItem.quantity_available} available`);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Use bulk distribution endpoint for multiple teachers
        if (selectedTeachers.length > 1) {
          await axios.post(
            'http://127.0.0.1:8000/api/admin/distributions/bulk',
            {
              item_id: parseInt(formData.item_id),
              group_id: null, // Not using group, using individual teachers
              teacher_ids: selectedTeachers,
              quantity_per_teacher: parseInt(formData.quantity_distributed),
              distribution_date: formData.distribution_date,
              purpose: formData.purpose,
              notes: formData.notes,
              condition_on_distribution: formData.condition_on_distribution,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`Items distributed to ${selectedTeachers.length} teachers successfully`);
        } else {
          // Use single distribution endpoint for one teacher
          await axios.post(
            'http://127.0.0.1:8000/api/admin/distributions',
            {
              ...formData,
              item_id: parseInt(formData.item_id),
              teacher_id: selectedTeachers[0],
              quantity_distributed: parseInt(formData.quantity_distributed),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Item distributed successfully');
        }
        
        onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to distribute item');
      } finally {
        setLoading(false);
      }
    } else if (formData.distribution_type === 'group') {
      // Group distribution logic
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      
      if (!selectedGroupData) {
        toast.error('Please select a distribution group');
        return;
      }

      const teachersInGroup = selectedGroupData?.teachers || [];
      const quantityPerMember = parseInt(formData.quantity_distributed);
      const totalQuantityNeeded = quantityPerMember * teachersInGroup.length;
      
      if (selectedItem && totalQuantityNeeded > selectedItem.quantity_available) {
        toast.error(`Insufficient inventory. Need ${totalQuantityNeeded} units but only ${selectedItem.quantity_available} available`);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Use bulk distribution endpoint for group
        await axios.post(
          'http://127.0.0.1:8000/api/admin/bulk-distributions',
          {
            item_id: parseInt(formData.item_id),
            group_id: selectedGroup,
            total_quantity: totalQuantityNeeded,
            quantity_per_member: quantityPerMember,
            distribution_date: formData.distribution_date,
            purpose: formData.purpose,
            notes: formData.notes,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Items distributed to group "${selectedGroupData?.group_name}" successfully`);
        
        onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to distribute to group');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const maxQuantity = selectedItem?.quantity_available || 0;
  
  // FIX: Define selectedGroupData here so it's available in the render
  const selectedGroupData = groups.find(g => g.id === selectedGroup);

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
            <h2 className="text-xl font-bold text-gray-900">Distribute Items to Teachers</h2>
            <p className="text-sm text-gray-600 mt-1">Assign inventory items to one or multiple teachers</p>
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

            {/* Distribution Type Selection */}
            <div className="space-y-2">
              <Label>
                <Users className="w-4 h-4 inline mr-2" />
                Distribute to *
              </Label>
              <Select value={formData.distribution_type} onValueChange={(value) => setFormData({ ...formData, distribution_type: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose distribution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Individual Teachers</SelectItem>
                  <SelectItem value="group">Distribution Group</SelectItem>
                </SelectContent>
              </Select>

              {/* Teacher or Group Selection based on type */}
              {formData.distribution_type === 'teacher' ? (
                <>
                  {/* Teacher Selection */}
                  <div className="space-y-2">
                    <Label>
                      <Users className="w-4 h-4 inline mr-2" />
                      Select Teachers *
                    </Label>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Input
                        placeholder="Search teachers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    </div>

                    {/* Select All Button */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        {selectedTeachers.length} of {filteredTeachers.length} selected
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllTeachers}
                        className="text-xs"
                      >
                        {selectedTeachers.length === filteredTeachers.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>

                    {/* Teacher List */}
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {filteredTeachers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {searchQuery ? 'No teachers found' : 'No teachers available'}
                        </div>
                      ) : (
                        filteredTeachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleToggleTeacher(teacher.id)}
                          >
                            <Checkbox
                              checked={selectedTeachers.includes(teacher.id)}
                              onCheckedChange={() => handleToggleTeacher(teacher.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{teacher.full_name}</div>
                              <div className="text-xs text-gray-500">{teacher.department}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="text-xs text-green-700 space-y-1 max-h-20 overflow-y-auto">
                      {selectedTeachers.slice(0, 3).map(teacherId => {
                        const teacher = teachers.find(t => t.id === teacherId);
                        return teacher ? (
                          <div key={teacherId}>- {teacher.full_name}</div>
                        ) : null;
                      })}
                      {selectedTeachers.length > 3 && (
                        <div className="text-green-600">... and {selectedTeachers.length - 3} more</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Group Selection */}
                  <div className="space-y-2">
                    <Label>
                      <Users className="w-4 h-4 inline mr-2" />
                      Select Distribution Group *
                    </Label>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    </div>

                    {/* Group List */}
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {groups.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {searchQuery ? 'No groups found' : 'No groups available'}
                        </div>
                      ) : (
                        groups.filter(group => 
                          group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          group.group_type.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((group) => (
                          <div
                            key={group.id}
                            className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${selectedGroup === group.id ? 'bg-blue-50 border-blue-200' : ''}`}
                            onClick={() => setSelectedGroup(group.id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{group.group_name}</div>
                              <div className="text-xs text-gray-500">{group.teachers_count} members</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Selected Group Summary */}
                    {selectedGroup && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          Selected Group:
                        </p>
                        <div className="text-xs text-green-700">
                          {selectedGroupData?.group_name}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Quantity and Distribution Date - Two Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity with Custom Controls */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity Per Teacher *
              </Label>
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
              
              {/* Quantity Summary */}
              {((formData.distribution_type === 'teacher' && selectedTeachers.length > 0) || (formData.distribution_type === 'group' && selectedGroup)) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-900">
                      {formData.distribution_type === 'teacher' 
                        ? `${selectedTeachers.length} teachers × ${formData.quantity_distributed || '0'} units each`
                        : `${selectedGroupData?.teachers_count || 0} members × ${formData.quantity_distributed || '0'} units each`
                      }
                    </span>
                    <span className="font-semibold text-amber-900">
                      Total: {(parseInt(formData.quantity_distributed || '0') * (formData.distribution_type === 'teacher' ? selectedTeachers.length : (selectedGroupData?.teachers_count || 0)))} units
                    </span>
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    Available: <span className="font-semibold text-amber-900">{maxQuantity}</span> units
                  </div>
                </div>
              )}
              
              {/* FIX: Added missing closing brace for the condition */}
              {(parseInt(formData.quantity_distributed || '0') * (formData.distribution_type === 'teacher' ? selectedTeachers.length : (selectedGroupData?.teachers_count || 0))) > maxQuantity && (
                <div className="text-xs text-red-600 mt-1 font-medium">
                  Insufficient inventory!
                </div>
              )}
              
              {selectedItem && selectedTeachers.length === 0 && formData.distribution_type === 'teacher' && (
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
            <Button 
              type="submit" 
              disabled={loading || !formData.item_id || 
                (formData.distribution_type === 'teacher' && selectedTeachers.length === 0) || 
                (formData.distribution_type === 'group' && !selectedGroup) || 
                !formData.quantity_distributed || 
                ((formData.distribution_type === 'teacher' && (parseInt(formData.quantity_distributed || '0') * selectedTeachers.length) > maxQuantity) ||
                 (formData.distribution_type === 'group' && selectedGroupData && (parseInt(formData.quantity_distributed || '0') * (selectedGroupData?.teachers_count || 0)) > maxQuantity))} 
              className="flex-1 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]"
            >
              {loading ? 'Distributing...' : 
               formData.distribution_type === 'teacher' ? 
                 (selectedTeachers.length === 1 ? 'Distribute Item' : `Distribute to ${selectedTeachers.length} Teachers`) :
                 'Distribute to Group'
              }
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}