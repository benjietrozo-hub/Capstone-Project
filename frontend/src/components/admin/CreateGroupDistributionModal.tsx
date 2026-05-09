import { useState, useEffect } from 'react';
import { X, Package, Users, Calendar, FileText, Plus, Minus, Info, CheckCircle2, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
    quantity_per_teacher: '1',
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
      const [itemsRes, groupsRes] = await Promise.all([
        axiosInstance.get('/admin/inventory'),
        axiosInstance.get('/admin/distribution/groups')
      ]);

      setItems(itemsRes.data.data.filter((item: Item) => item.quantity_available > 0));
      setGroups(groupsRes.data.data.filter((group: DistributionGroup) => group.is_active));
    } catch (error) {
      toast.error('Failed to load system data');
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const selectedGroup = groups.find(g => g.id === parseInt(formData.group_id));
  const maxQuantity = selectedItem?.quantity_available || 0;
  const totalQuantityNeeded = selectedGroup && formData.quantity_per_teacher ? 
    parseInt(formData.quantity_per_teacher) * selectedGroup.teachers_count : 0;
  const isInventorySufficient = totalQuantityNeeded <= maxQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.group_id || !formData.quantity_per_teacher) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!isInventorySufficient) {
      toast.error('Inventory check failed: Insufficient units available');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(
        '/admin/distributions/bulk',
        {
          ...formData,
          item_id: parseInt(formData.item_id),
          group_id: parseInt(formData.group_id),
          quantity_per_teacher: parseInt(formData.quantity_per_teacher),
        }
      );

      toast.success(`Successfully distributed items to ${selectedGroup?.group_name}`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bulk distribution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_per_teacher: '' });
      return;
    }
    setFormData({ ...formData, quantity_per_teacher: value });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl backdrop-blur-md">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bulk Group Distribution</h2>
              <p className="text-slate-400 text-sm opacity-90">Distribute assets to multiple recipients in a single batch</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Primary Configuration (Left) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Package className="w-3 h-3" /> Step 1: Select Asset
                  </Label>
                  <Select 
                    value={formData.item_id} 
                    onValueChange={(value) => setFormData({ ...formData, item_id: value, quantity_per_teacher: '1' })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                      <SelectValue placeholder="Choose inventory item" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()} className="py-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{item.item_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">CODE: {item.item_code} • {item.quantity_available} units left</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedItem && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">Active Selection</span>
                        <Badge className="bg-blue-600 text-white border-none">{selectedItem.quantity_available} In Stock</Badge>
                      </div>
                      <p className="text-sm font-bold text-blue-900 line-clamp-1">{selectedItem.item_name}</p>
                    </div>
                  )}
                </div>

                {/* Group Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Step 2: Recipient Group
                  </Label>
                  <Select 
                    value={formData.group_id} 
                    onValueChange={(value) => setFormData({ ...formData, group_id: value, quantity_per_teacher: '1' })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                      <SelectValue placeholder="Choose target group" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()} className="py-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{group.group_name}</span>
                            <span className="text-[10px] text-slate-400">{group.teachers_count} Teachers • {group.group_type}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedGroup && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Recipients</span>
                        <Badge className="bg-emerald-600 text-white border-none">{selectedGroup.teachers_count} Members</Badge>
                      </div>
                      <p className="text-sm font-bold text-emerald-900 line-clamp-1">{selectedGroup.group_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Logic */}
              <div className="space-y-4">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                  Distribution Settings
                </Label>
                
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Units per recipient</h4>
                      <p className="text-xs text-slate-400">Specify how many units each teacher receives</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                      <button 
                        type="button"
                        onClick={() => handleQuantityChange((parseInt(formData.quantity_per_teacher || '1') - 1).toString())}
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-30"
                        disabled={parseInt(formData.quantity_per_teacher || '1') <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <Input
                        type="number"
                        value={formData.quantity_per_teacher}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="w-20 text-center border-none font-black text-lg focus:ring-0 shadow-none bg-transparent"
                      />
                      <button 
                        type="button"
                        onClick={() => handleQuantityChange((parseInt(formData.quantity_per_teacher || '1') + 1).toString())}
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Inventory Status */}
                  {selectedItem && selectedGroup && (
                    <div className={`p-5 rounded-2xl border ${isInventorySufficient ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50 border-red-100'} transition-colors`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {isInventorySufficient ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                          )}
                          <span className={`text-sm font-bold ${isInventorySufficient ? 'text-blue-900' : 'text-red-900'}`}>
                            {isInventorySufficient ? 'Inventory Validation Passed' : 'Critical Stock Shortage'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Required</span>
                          <p className="text-xl font-black text-slate-800">{totalQuantityNeeded} <span className="text-xs font-normal text-slate-400">units</span></p>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Post-Batch</span>
                          <p className={`text-xl font-black ${isInventorySufficient ? 'text-emerald-600' : 'text-red-600'}`}>
                            {maxQuantity - totalQuantityNeeded} <span className="text-xs font-normal opacity-60">units</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Condition */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Effective Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.distribution_date}
                      onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                      className="pl-12 h-14 rounded-2xl border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Initial Condition</Label>
                  <Select value={formData.condition_on_distribution} onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl">
                      <SelectItem value="excellent">Excellent / Pristine</SelectItem>
                      <SelectItem value="good">Good / Functional</SelectItem>
                      <SelectItem value="fair">Fair / Used</SelectItem>
                      <SelectItem value="poor">Poor / Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Context & Metadata (Right) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <div className="space-y-4">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Administrative Context</Label>
                <div className="space-y-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Official Purpose</Label>
                    <Input
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="e.g., SY 2024-2025 Faculty Distribution"
                      className="h-12 rounded-xl border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Internal Remarks</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any internal tracking notes or special instructions..."
                      rows={5}
                      className="rounded-2xl border-slate-200 bg-white p-4"
                    />
                  </div>
                </div>
              </div>

              {/* Batch Preview Card */}
              <div className="mt-auto p-8 rounded-[32px] bg-slate-900 text-white space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Batch Execution Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm">
                    <span className="text-slate-400">Total Transactions</span>
                    <span className="font-bold">{selectedGroup?.teachers_count || 0} Records</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-sm">
                    <span className="text-slate-400">Asset Targeted</span>
                    <span className="font-bold truncate max-w-[150px]">{selectedItem?.item_name || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm font-bold">
                    <span className="text-slate-400">Gross Units Distributed</span>
                    <span className="text-xl text-blue-400">{totalQuantityNeeded} units</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.item_id || !formData.group_id || !isInventorySufficient} 
                  className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {loading ? 'Processing Batch...' : 'Authorize Batch Distribution'}
                </Button>
              </div>

            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

