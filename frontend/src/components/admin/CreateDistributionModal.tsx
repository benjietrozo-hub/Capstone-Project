import { useState, useEffect } from 'react';
import { 
  X, Package, User, Calendar, FileText, Plus, Minus, Users, 
  CheckSquare, Square, Search, Info, AlertTriangle, Layers,
  ChevronRight, ArrowRight, ShieldCheck, TrendingUp, Boxes, Briefcase
} from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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

const normalizeApiArray = (response: any) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  return [];
};

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
    condition_on_distribution: 'excellent',
    distribution_type: 'teacher', // 'teacher' or 'group'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, teachersRes, groupsRes] = await Promise.all([
        axiosInstance.get('/admin/inventory'),
        axiosInstance.get('/admin/distribution?all=1'),
        axiosInstance.get('/admin/distribution/groups')
      ]);

      const inventory = normalizeApiArray(itemsRes.data);
      setItems(inventory.filter((item: any) => item && (item.quantity_available || 0) > 0));

      const teacherList = normalizeApiArray(teachersRes.data)
        .filter((t: any) => t !== null)
        .map((t: any) => ({
          ...t,
          full_name: t.full_name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unnamed Personnel',
          email: t.email || 'no-email@system.local',
          department: t.department || 'General'
        }));
      setTeachers(teacherList);

      setGroups(normalizeApiArray(groupsRes.data).filter((g: any) => g !== null));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('System synchronization failed');
    }
  };

  const filteredTeachers = teachers.filter(t => {
    if (!t) return false;
    const search = (searchQuery || "").toLowerCase();
    const fullName = (t.full_name || "").toLowerCase();
    const email = (t.email || "").toLowerCase();
    const department = (t.department || "").toLowerCase();

    return fullName.includes(search) || 
           email.includes(search) || 
           department.includes(search);
  });

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
      toast.error('Required parameters missing: Asset, Recipient, and Volume required');
      return;
    }

    const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
    
    if (formData.distribution_type === 'teacher') {
      const totalQuantityNeeded = parseInt(formData.quantity_distributed) * selectedTeachers.length;
      
      if (selectedItem && totalQuantityNeeded > selectedItem.quantity_available) {
        toast.error(`Inventory deficit. Requirement: ${totalQuantityNeeded}, Available: ${selectedItem.quantity_available}`);
        return;
      }

      try {
        setLoading(true);
        if (selectedTeachers.length > 1) {
          await axiosInstance.post(
            '/admin/distributions/bulk',
            {
              item_id: parseInt(formData.item_id),
              group_id: null,
              teacher_ids: selectedTeachers,
              quantity_per_teacher: parseInt(formData.quantity_distributed),
              distribution_date: formData.distribution_date,
              purpose: formData.purpose,
              notes: formData.notes,
              condition_on_distribution: formData.condition_on_distribution,
            }
          );
          toast.success(`Allocated to ${selectedTeachers.length} personnel successfully`);
        } else {
          await axiosInstance.post(
            '/admin/distributions',
            {
              ...formData,
              item_id: parseInt(formData.item_id),
              teacher_id: selectedTeachers[0],
              quantity_distributed: parseInt(formData.quantity_distributed),
            }
          );
          toast.success('Individual allocation completed');
        }
        onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Allocation pipeline failed');
      } finally {
        setLoading(false);
      }
    } else if (formData.distribution_type === 'group') {
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      if (!selectedGroupData) {
        toast.error('Target distribution group not identified');
        return;
      }

      const teachersInGroup = selectedGroupData?.teachers || [];
      const quantityPerMember = parseInt(formData.quantity_distributed);
      const totalQuantityNeeded = quantityPerMember * (selectedGroupData?.teachers_count || teachersInGroup.length);
      
      if (selectedItem && totalQuantityNeeded > selectedItem.quantity_available) {
        toast.error(`Inventory deficit. Group requirement: ${totalQuantityNeeded}, Available: ${selectedItem.quantity_available}`);
        return;
      }

      try {
        setLoading(true);
        await axiosInstance.post(
          '/admin/bulk-distributions',
          {
            item_id: parseInt(formData.item_id),
            group_id: selectedGroup,
            total_quantity: totalQuantityNeeded,
            quantity_per_member: quantityPerMember,
            distribution_date: formData.distribution_date,
            purpose: formData.purpose,
            notes: formData.notes,
          }
        );
        toast.success(`Group allocation for "${selectedGroupData?.group_name}" initialized`);
        onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Group allocation failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.item_id));
  const maxQuantity = selectedItem?.quantity_available || 0;
  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_distributed: '' });
      return;
    }
    if (numValue > maxQuantity) {
      setFormData({ ...formData, quantity_distributed: maxQuantity.toString() });
      toast.warning(`Maximum unit capacity reached (${maxQuantity})`);
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

  const totalNeeded = (parseInt(formData.quantity_distributed || '0') * (formData.distribution_type === 'teacher' ? selectedTeachers.length : (selectedGroupData?.teachers_count || 0)));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-sm shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Premium Header */}
        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5 text-white">
            <div className="p-4 bg-white/10 rounded-sm backdrop-blur-xl border border-white/10">
              <Boxes className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Initiate Distribution</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Securely allocate administrative assets to personnel
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 p-3 hover:bg-white/10 rounded-sm transition-all text-white active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Asset & Volume */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-sm">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Asset Selection</Label>
                </div>
                
                <div className="space-y-4">
                  <Select 
                    value={formData.item_id} 
                    onValueChange={(value) => setFormData({ ...formData, item_id: value, quantity_distributed: '' })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-600 rounded-sm font-bold">
                      <SelectValue placeholder="Identify asset from registry..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm shadow-2xl border-slate-100">
                      {items.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Registry Empty</p>
                        </div>
                      ) : (
                        items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()} className="py-4 focus:bg-blue-50 rounded-sm">
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-slate-900 leading-none">{item.item_name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {item.item_code} • {item.quantity_available} units in stock
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
 
                  {selectedItem && (
                    <div className="bg-blue-50/50 p-5 rounded-sm border border-blue-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Synchronized Identity</p>
                          <p className="text-lg font-black text-slate-900">{selectedItem.item_name}</p>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedItem.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-blue-600 leading-none">{selectedItem.quantity_available}</span>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Available</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
 
              {/* Volume Optimization */}
              <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-sm">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Volume Optimization</Label>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={!formData.quantity_distributed || parseInt(formData.quantity_distributed) <= 1}
                      className="h-16 w-16 rounded-sm border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={formData.quantity_distributed}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-16 text-center text-3xl font-black rounded-sm border-slate-200 bg-slate-50 shadow-inner focus:bg-white transition-all"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Units</span>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={!selectedItem || parseInt(formData.quantity_distributed || '0') >= maxQuantity}
                      className="h-16 w-16 rounded-sm border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
 
                  {/* Allocation Impact Card */}
                  {(totalNeeded > 0) && (
                    <div className={`p-6 rounded-sm border transition-all duration-500 ${totalNeeded > maxQuantity ? 'bg-rose-50 border-rose-100' : 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-sm ${totalNeeded > maxQuantity ? 'bg-rose-100 text-rose-600' : 'bg-blue-600 text-white'}`}>
                          {totalNeeded > maxQuantity ? (
                            <AlertTriangle className="w-6 h-6" />
                          ) : (
                            <TrendingUp className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-widest ${totalNeeded > maxQuantity ? 'text-rose-600' : 'text-slate-400'}`}>
                            {totalNeeded > maxQuantity ? 'Inventory Deficit' : 'Allocation Pipeline'}
                          </p>
                          <p className={`text-sm font-bold ${totalNeeded > maxQuantity ? 'text-rose-900' : 'text-white'} mt-1`}>
                            {totalNeeded} units total for {formData.distribution_type === 'teacher' ? `${selectedTeachers.length} recipients` : `${selectedGroupData?.teachers_count || 0} members`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black ${totalNeeded > maxQuantity ? 'text-rose-600' : 'text-blue-400'}`}>
                            {totalNeeded}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3">
                    {[1, 5, 10, 'All'].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (val === 'All') handleQuantityChange(maxQuantity.toString());
                          else handleQuantityChange(val.toString());
                        }}
                        className="rounded-sm h-11 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 text-xs font-black text-slate-500 hover:text-blue-600 transition-all"
                        disabled={!selectedItem || (typeof val === 'number' && val > maxQuantity)}
                      >
                        {val === 'All' ? `MAX (${maxQuantity})` : `+${val}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recipient Intelligence */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-sm">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <Label className="text-lg font-black text-slate-800">Target Recipients</Label>
                  </div>
                  <div className="flex p-1 bg-slate-100 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, distribution_type: 'teacher' })}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${formData.distribution_type === 'teacher' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, distribution_type: 'group' })}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${formData.distribution_type === 'group' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Collective
                    </button>
                  </div>
                </div>

                <div className="space-y-5 flex-1 flex flex-col min-h-0">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder={`Filter ${formData.distribution_type === 'teacher' ? 'personnel' : 'distribution channels'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 rounded-sm border-slate-200 bg-slate-50/50 shadow-inner focus:bg-white"
                    />
                  </div>
 
                  {formData.distribution_type === 'teacher' ? (
                    <div className="space-y-4 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Selections: {selectedTeachers.length}</span>
                        <button 
                           type="button" 
                          onClick={handleSelectAllTeachers}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                        >
                          {selectedTeachers.length === filteredTeachers.length ? 'Clear Selection' : 'Batch Select All'}
                        </button>
                      </div>
                      <div className="flex-1 border border-slate-100 rounded-sm overflow-y-auto bg-slate-50/30 p-2 space-y-2 shadow-inner custom-scrollbar">
                        {filteredTeachers.length === 0 ? (
                          <div className="py-20 text-center">
                            <User className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No Personnel Found</p>
                          </div>
                        ) : (
                          filteredTeachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              className={`group flex items-center gap-4 p-4 transition-all cursor-pointer rounded-sm ${selectedTeachers.includes(teacher.id) ? 'bg-white shadow-lg shadow-slate-200/50 ring-2 ring-blue-600/10' : 'hover:bg-white hover:shadow-sm'}`}
                              onClick={() => handleToggleTeacher(teacher.id)}
                            >
                              <div className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all ${selectedTeachers.includes(teacher.id) ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-slate-200 bg-white'}`}>
                                {selectedTeachers.includes(teacher.id) && <CheckSquare className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-black transition-colors ${selectedTeachers.includes(teacher.id) ? 'text-blue-600' : 'text-slate-900'}`}>{teacher.full_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-[9px] h-4 font-black border-slate-100 text-slate-400 uppercase tracking-tighter rounded-sm">{teacher.department}</Badge>
                                  <span className="text-[10px] font-medium text-slate-400 truncate">{teacher.email}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border border-slate-100 rounded-sm overflow-y-auto bg-slate-50/30 p-2 space-y-2 shadow-inner custom-scrollbar">
                      {groups.length === 0 ? (
                        <div className="py-20 text-center">
                          <Layers className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No Channels Available</p>
                        </div>
                      ) : (
                        groups.filter(group => {
                          const search = (searchQuery || "").toLowerCase();
                          const groupName = (group.group_name || "").toLowerCase();
                          const groupType = (group.group_type || "").toLowerCase();
                          return groupName.includes(search) || groupType.includes(search);
                        }).map((group) => (
                          <div
                            key={group.id}
                            className={`group flex items-center gap-4 p-5 transition-all cursor-pointer rounded-sm ${selectedGroup === group.id ? 'bg-white shadow-xl shadow-slate-200 ring-2 ring-blue-600' : 'hover:bg-white hover:shadow-sm'}`}
                            onClick={() => setSelectedGroup(group.id)}
                          >
                            <div className={`w-12 h-12 rounded-sm flex items-center justify-center transition-all ${selectedGroup === group.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                              <Users className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-black transition-colors ${selectedGroup === group.id ? 'text-blue-600' : 'text-slate-900'}`}>{group.group_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-[9px] h-4 font-black uppercase border-slate-100">{group.group_type}</Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.teachers_count} Active Members</span>
                              </div>
                            </div>
                            {selectedGroup === group.id && <CheckSquare className="w-5 h-5 text-blue-600" />}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Parameters */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-sm">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <Label className="text-lg font-black text-slate-800">Timeline & Condition</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Effective Date</Label>
                  <Input
                    type="date"
                    value={formData.distribution_date}
                    onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                    className="h-12 rounded-sm border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Condition</Label>
                  <Select 
                    value={formData.condition_on_distribution} 
                    onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}
                  >
                    <SelectTrigger className="h-12 rounded-sm border-slate-200 bg-slate-50 focus:bg-white font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm border-slate-100 font-bold">
                      <SelectItem value="excellent">Excellent Condition</SelectItem>
                      <SelectItem value="good">Standard (Good)</SelectItem>
                      <SelectItem value="fair">Acceptable (Fair)</SelectItem>
                      <SelectItem value="poor">Maintenance Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
 
            <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-sm">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <Label className="text-lg font-black text-slate-800">Operational Logic</Label>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Purpose</Label>
                  <Input
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g., Departmental deployment, Research project..."
                    className="h-12 rounded-sm border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
 
          <div className="mt-10 bg-white p-8 rounded-sm border border-slate-100 shadow-sm">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3 block">Administrative Notes (Internal Audit Log)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Provide context for the audit trail. These notes are visible only to property administrators..."
              className="min-h-[120px] rounded-sm border-slate-200 bg-slate-50 focus:bg-white p-6 font-medium italic"
            />
          </div>
        </form>

        {/* Action Infrastructure */}
        <div className="p-10 border-t bg-white flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest h-14 px-8 rounded-sm hover:bg-slate-50"
          >
            Abort Operation
          </Button>
          
          <div className="flex items-center gap-6">
            {totalNeeded > 0 && totalNeeded <= maxQuantity && (
              <div className="text-right hidden sm:block pr-6 border-r border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Impact Summary</p>
                <p className="text-xl font-black text-blue-600">{totalNeeded} Units Deployed</p>
              </div>
            )}
            
            <Button 
              onClick={handleSubmit}
              disabled={loading || !formData.item_id || 
                (formData.distribution_type === 'teacher' && selectedTeachers.length === 0) || 
                (formData.distribution_type === 'group' && !selectedGroup) || 
                !formData.quantity_distributed || 
                (totalNeeded > maxQuantity)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black h-14 px-14 rounded-sm shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="uppercase tracking-widest">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 uppercase tracking-widest">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Finalize Allocation</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}