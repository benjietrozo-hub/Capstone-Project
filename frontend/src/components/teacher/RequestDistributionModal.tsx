import { useState, useEffect } from 'react';
import { 
  X, Package, FileText, Plus, Minus, Users, 
  CheckSquare, Info, ShieldCheck, TrendingUp, Boxes, Briefcase,
  AlertTriangle, Flag, Layers, Layout
} from 'lucide-react';
import { teacherAPI } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RequestDistributionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialCategoryId?: number;
  initialItemCode?: any;
}

interface Category {
  id: number;
  category_name: string;
  category_code: string;
  description: string;
  available_items: number;
}

interface Entity {
  type: 'Teacher' | 'Classroom' | 'Club' | 'Department';
  id: number;
  name: string;
}

export default function RequestDistributionModal({ 
  onClose, 
  onSuccess,
  initialCategoryId,
  initialItemCode 
}: RequestDistributionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  const [formData, setFormData] = useState({
    category_id: initialCategoryId?.toString() || '',
    quantity_requested: '',
    reason: '',
    notes: initialItemCode ? `Requesting specific item: ${initialItemCode}` : '',
    priority: 'normal',
    requested_for: 'Teacher-0' // Changed 'Teacher-self' to 'Teacher-0' to match logic in fetchInitialData
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setFetchingData(true);
      const [itemsRes, entitiesRes] = await Promise.all([
        teacherAPI.getAvailableItems(),
        teacherAPI.getMyEntities()
      ]);
      
      setCategories(itemsRes.data.data || []);
      
      // Flatten entities for the select dropdown
      const flattenedEntities: Entity[] = [
        { type: 'Teacher', id: 0, name: 'Personal (My Self)' } // id 0 will be handled as current teacher on backend
      ];
      
      if (entitiesRes.data.data) {
        const data = entitiesRes.data.data;
        if (data.classrooms) data.classrooms.forEach((e: any) => flattenedEntities.push({ type: 'Classroom', id: e.id, name: `Classroom: ${e.name}` }));
        if (data.clubs) data.clubs.forEach((e: any) => flattenedEntities.push({ type: 'Club', id: e.id, name: `Club: ${e.name}` }));
        if (data.departments) data.departments.forEach((e: any) => flattenedEntities.push({ type: 'Department', id: e.id, name: `Dept: ${e.name}` }));
      }
      
      setEntities(flattenedEntities);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('System synchronization failed');
    } finally {
      setFetchingData(false);
    }
  };

  const selectedCategory = (categories || []).find(c => c.id === parseInt(formData.category_id));
  const maxQuantity = selectedCategory?.available_items || 0;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setFormData({ ...formData, quantity_requested: '' });
      return;
    }
    if (numValue > maxQuantity) {
      setFormData({ ...formData, quantity_requested: maxQuantity.toString() });
      toast.warning(`Maximum available quantity reached (${maxQuantity})`);
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
    
    if (!formData.category_id || !formData.quantity_requested || !formData.reason) {
      toast.error('Required parameters missing: Asset, Volume, and Rationale required');
      return;
    }

    const [reqType, reqId] = formData.requested_for.split('-');

    try {
      setLoading(true);
      await teacherAPI.createDistributionRequest({
        category_id: parseInt(formData.category_id),
        quantity_requested: parseInt(formData.quantity_requested),
        reason: formData.reason,
        notes: formData.notes,
        priority: formData.priority,
        requested_for_type: reqType,
        requested_for_id: reqId === 'self' ? null : parseInt(reqId)
      });

      toast.success('Distribution protocol initiated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request transmission failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white p-12 rounded-[40px] flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Premium Header */}
        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5 text-white">
            <div className="p-4 bg-white/10 rounded-[20px] backdrop-blur-xl border border-white/10">
              <Boxes className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Distribution Protocol</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Securely request administrative assets for your units
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 p-3 hover:bg-white/10 rounded transition-all text-white active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Asset Intelligence */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Asset Selection</Label>
                </div>
                
                <div className="space-y-4">
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value, quantity_requested: '' })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-600 rounded font-bold">
                      <SelectValue placeholder="Identify asset category..." />
                    </SelectTrigger>
                    <SelectContent className="rounded shadow-2xl border-slate-100">
                      {categories.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Registry Empty</p>
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="py-4 focus:bg-blue-50 rounded-sm">
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-slate-900">{cat.category_name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {cat.available_items} units currently available
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {selectedCategory && (
                    <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Asset Information</p>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{selectedCategory.description}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Volume Optimization */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded">
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
                      disabled={!formData.quantity_requested || parseInt(formData.quantity_requested) <= 1}
                      className="h-16 w-16 rounded border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={formData.quantity_requested}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-16 text-center text-3xl font-black rounded border-slate-200 bg-slate-50 shadow-inner focus:bg-white transition-all"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Units</span>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={!selectedCategory || parseInt(formData.quantity_requested || '0') >= maxQuantity}
                      className="h-16 w-16 rounded border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[1, 5, 10, 'Max'].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (val === 'Max') handleQuantityChange(maxQuantity.toString());
                          else handleQuantityChange(val.toString());
                        }}
                        className="rounded-sm h-11 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 text-xs font-black text-slate-500 hover:text-blue-600 transition-all"
                        disabled={!selectedCategory || (typeof val === 'number' && val > maxQuantity)}
                      >
                        {val === 'Max' ? 'MAX CAP' : `+${val}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Deployment Context */}
            <div className="space-y-8">
              {/* Target Entity Selection */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded">
                    <Layout className="w-5 h-5 text-purple-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Deployment Target</Label>
                </div>
                
                <div className="space-y-4">
                  <Select 
                    value={formData.requested_for} 
                    onValueChange={(value) => setFormData({ ...formData, requested_for: value })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-purple-600 rounded font-bold">
                      <SelectValue placeholder="Select target entity..." />
                    </SelectTrigger>
                    <SelectContent className="rounded shadow-2xl border-slate-100 font-bold">
                      {entities.map((entity) => (
                        <SelectItem key={`${entity.type}-${entity.id}`} value={`${entity.type}-${entity.id}`} className="py-4 focus:bg-purple-50">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-sm ${entity.type === 'Teacher' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              {entity.type === 'Teacher' ? <Briefcase className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                            </div>
                            <span className="text-slate-900">{entity.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Define the operational unit that will utilize these assets</p>
                </div>
              </div>

              {/* Priority & Urgency */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-50 rounded">
                    <Flag className="w-5 h-5 text-rose-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Mission Priority</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['low', 'normal', 'high', 'urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`h-14 rounded-sm border-2 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] ${
                        formData.priority === p 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        p === 'low' ? 'bg-slate-400' : 
                        p === 'normal' ? 'bg-emerald-400' : 
                        p === 'high' ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                      }`} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Logic */}
          <div className="mt-10 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <Label className="text-lg font-black text-slate-800">Mission Rationale</Label>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Justification *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide a detailed administrative rationale for this allocation..."
                  className="min-h-[120px] rounded-[24px] border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 p-8 font-medium italic shadow-inner"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Supplemental Intelligence (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional operational context..."
                  className="h-14 rounded-sm border-slate-200 bg-slate-50 focus:bg-white font-bold"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Action Infrastructure */}
        <div className="p-10 border-t bg-white flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest h-14 px-8 rounded hover:bg-slate-50"
          >
            Abort Protocol
          </Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.category_id || !formData.quantity_requested || !formData.reason}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black h-14 px-14 rounded shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="uppercase tracking-widest">Transmitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 uppercase tracking-widest">
                <ShieldCheck className="w-5 h-5" />
                <span>Initialize Request</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
