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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Synchronizing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Request Distribution</h2>
              <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Request long-term assets for your entities
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Asset Intelligence */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <Label className="text-base font-bold text-slate-800">Asset Selection</Label>
                </div>
                
                <div className="space-y-3">
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value, quantity_requested: '' })}
                  >
                    <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-blue-600 rounded-md font-medium">
                      <SelectValue placeholder="Select an asset..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-slate-200 max-h-60">
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          No items available
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="py-2.5 cursor-pointer">
                            <div className="flex justify-between items-center w-full min-w-[200px]">
                              <span className="font-medium text-slate-900">{cat.category_name}</span>
                              <span className="text-xs text-slate-500 ml-4">
                                {cat.available_items} avail
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {selectedCategory && selectedCategory.description && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-100 animate-in fade-in">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
                      <p className="text-sm text-slate-700">{selectedCategory.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Volume Optimization */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <Label className="text-base font-bold text-slate-800">Quantity</Label>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={!formData.quantity_requested || parseInt(formData.quantity_requested) <= 1}
                      className="h-10 w-10 shrink-0 text-slate-500"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={formData.quantity_requested}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-10 text-center font-bold"
                        placeholder="0"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={!selectedCategory || parseInt(formData.quantity_requested || '0') >= maxQuantity}
                      className="h-10 w-10 shrink-0 text-slate-500"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 'Max'].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (val === 'Max') handleQuantityChange(maxQuantity.toString());
                          else handleQuantityChange(val.toString());
                        }}
                        className="h-8 text-xs"
                        disabled={!selectedCategory || (typeof val === 'number' && val > maxQuantity)}
                      >
                        {val === 'Max' ? 'MAX' : `+${val}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Deployment Context */}
            <div className="space-y-6">
              {/* Target Entity Selection */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layout className="w-4 h-4 text-purple-600" />
                  <Label className="text-base font-bold text-slate-800">Deployment Target</Label>
                </div>
                
                <div className="space-y-3">
                  <Select 
                    value={formData.requested_for} 
                    onValueChange={(value) => setFormData({ ...formData, requested_for: value })}
                  >
                    <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-purple-600 rounded-md font-medium">
                      <SelectValue placeholder="Select target entity..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-slate-200">
                      {entities.map((entity) => (
                        <SelectItem key={`${entity.type}-${entity.id}`} value={`${entity.type}-${entity.id}`} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium">{entity.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 px-1">Define who will utilize these assets</p>
                </div>
              </div>

              {/* Priority & Urgency */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="w-4 h-4 text-rose-600" />
                  <Label className="text-base font-bold text-slate-800">Priority</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {['low', 'normal', 'high', 'urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`h-10 rounded-md border transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${
                        formData.priority === p 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        p === 'low' ? 'bg-slate-400' : 
                        p === 'normal' ? 'bg-emerald-400' : 
                        p === 'high' ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Logic */}
          <div className="mt-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-slate-600" />
              <Label className="text-base font-bold text-slate-800">Rationale & Notes</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Justification <span className="text-red-500">*</span></Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide a reason for this allocation..."
                  className="min-h-[100px] rounded-md border-slate-200 focus:ring-2 focus:ring-blue-600 resize-y"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Notes (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other details..."
                  className="h-10 rounded-md border-slate-200"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Action Infrastructure */}
        <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.category_id || !formData.quantity_requested || !formData.reason}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold min-w-[140px] flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Request</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
