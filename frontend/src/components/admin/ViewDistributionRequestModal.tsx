import { useState, useEffect } from 'react';
import { 
  X, Package, User, Calendar, FileText, CheckCircle, XCircle, 
  Info, Hash, Clock, ShieldCheck, TrendingUp, ChevronRight, 
  Settings, AlertTriangle, Boxes, Briefcase, Layout
} from 'lucide-react';
import { adminAPI } from '@/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ViewDistributionRequestModalProps {
  request: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ViewDistributionRequestModal({ request, onClose, onSuccess }: ViewDistributionRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [formData, setFormData] = useState({
    admin_notes: '',
    condition_on_distribution: 'excellent',
    inventory_item_ids: [] as number[]
  });

  useEffect(() => {
    if (action === 'approve' && (request.category_id || request.item?.category_id)) {
      const fetchItems = async () => {
        setLoadingItems(true);
        try {
          const catId = request.category_id || request.item?.category_id;
          const res = await adminAPI.getInventoryItems({
            category_id: catId,
            status: 'available',
            per_page: 500
          });
          
          const items = res.data?.data || [];
          setAvailableItems(Array.isArray(items) ? items : []);
        } catch (err) {
          toast.error("Failed to load available units for this category");
        } finally {
          setLoadingItems(false);
        }
      };
      fetchItems();
    }
  }, [action, request.category_id, request.item?.category_id]);

  const toggleItemSelection = (itemId: number) => {
    setFormData(prev => {
      const isSelected = prev.inventory_item_ids.includes(itemId);
      if (isSelected) {
        return { ...prev, inventory_item_ids: prev.inventory_item_ids.filter(id => id !== itemId) };
      } else {
        if (prev.inventory_item_ids.length >= request.quantity_requested) {
          toast.error(`Allocation capacity reached: ${request.quantity_requested} units maximum.`);
          return prev;
        }
        return { ...prev, inventory_item_ids: [...prev.inventory_item_ids, itemId] };
      }
    });
  };

  const handleApprove = async () => {
    if (formData.inventory_item_ids.length !== request.quantity_requested) {
      toast.error(`Incomplete selection: Identify exactly ${request.quantity_requested} serialized units.`);
      return;
    }

    try {
      setLoading(true);
      await adminAPI.approveDistributionRequest(request.id, formData);
      toast.success('Distribution cycle initialized successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!formData.admin_notes) {
      toast.error('Administrative rationale required for rejection');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.rejectDistributionRequest(request.id, { admin_notes: formData.admin_notes });
      toast.success('Request terminated and archived');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Termination failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black px-4 h-8 uppercase tracking-widest text-[10px]">Pending Review</Badge>,
      approved: <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-4 h-8 uppercase tracking-widest text-[10px]">Approved</Badge>,
      rejected: <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-black px-4 h-8 uppercase tracking-widest text-[10px]">Rejected</Badge>,
      distributed: <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black px-4 h-8 uppercase tracking-widest text-[10px]">Distributed</Badge>,
    };
    return variants[status] || <Badge className="font-black px-4 h-8 uppercase text-[10px] tracking-widest">{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: <Badge className="bg-slate-100 text-slate-600 border-slate-200">Low</Badge>,
      normal: <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200">Normal</Badge>,
      high: <Badge className="bg-amber-100 text-amber-600 border-amber-200">High</Badge>,
      urgent: <Badge className="bg-rose-100 text-rose-600 border-rose-200 animate-pulse">Urgent</Badge>,
    };
    return variants[priority] || null;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Premium Header */}
        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5 text-white">
            <div className="p-4 bg-white/10 rounded-[20px] backdrop-blur-xl border border-white/10">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Request Intelligence</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Analyze and authorize distribution protocols
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#F8FAFC] space-y-10">
          {/* Status and Meta Insights */}
          <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cycle Status</span>
                <div>{getStatusBadge(request.status)}</div>
              </div>
              <div className="h-12 w-px bg-slate-100 hidden sm:block" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Timestamp</span>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {new Date(request.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <div className="h-12 w-px bg-slate-100 hidden sm:block" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Level</span>
                <div>{getPriorityBadge(request.priority || 'normal')}</div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 rounded border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Reference Identifier</span>
              <span className="text-sm font-black text-slate-900">#REQ-{request.id.toString().padStart(6, '0')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Asset Intelligence */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded">
                  <Boxes className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Asset Parameters</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 shadow-inner">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Requested Category</p>
                  <p className="text-xl font-black text-slate-900 leading-tight">
                    {request.category?.category_name || request.item?.category || 'General Administrative Asset'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[9px] h-4 font-black border-blue-200 text-blue-500 uppercase">
                      CODE: {request.category?.category_code || 'N/A'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50 p-5 rounded border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Required Volume</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-900">{request.quantity_requested}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requester Intelligence */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Target Entity Context</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100 shadow-inner flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-100">
                    {request.requested_for_type === 'Teacher' || !request.requested_for_type ? <User className="w-8 h-8" /> : <Layout className="w-8 h-8" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
                      {request.requested_for_type || 'Teacher'} Deployment
                    </p>
                    <p className="text-xl font-black text-slate-900 truncate leading-tight">
                      {request.requested_for?.name || request.requested_for?.full_name || request.teacher?.full_name}
                    </p>
                    <p className="text-xs font-bold text-slate-500 truncate mt-1">
                      {request.teacher?.full_name} ({request.teacher?.department})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50 p-5 rounded border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Origin Department</span>
                  <Badge className="bg-emerald-600 font-black h-7 px-4 rounded shadow-lg shadow-emerald-100">
                    {request.teacher?.department || 'General'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Purpose */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded">
                <Info className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Operational Mission Statement</h3>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-8 shadow-inner italic text-slate-700 leading-relaxed font-medium">
              "{request.reason}"
            </div>
          </div>

          {/* Action Interface (Lifecycle Management) */}
          {request.status === 'pending' && (
            <div className="space-y-8 pt-6 animate-in slide-in-from-bottom-8 duration-700">
              {!action ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button
                    onClick={() => setAction('approve')}
                    className="h-20 rounded-[28px] bg-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-2xl shadow-slate-200 transition-all active:scale-95 group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                      Approve & Initialize
                    </div>
                  </Button>
                  <Button
                    onClick={() => setAction('reject')}
                    variant="outline"
                    className="h-20 rounded-[28px] border-slate-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-black text-xl transition-all active:scale-95 flex items-center gap-4"
                  >
                    <XCircle className="w-7 h-7" />
                    Archive Request
                  </Button>
                </div>
              ) : action === 'approve' ? (
                <div className="bg-slate-900 rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 rounded shadow-lg shadow-emerald-900/40">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Final Authorization</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setAction(null)} 
                      className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]"
                    >
                      Abort Action
                    </Button>
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Identify Serialized Assets ({formData.inventory_item_ids.length} / {request.quantity_requested})
                        </Label>
                        {formData.inventory_item_ids.length === request.quantity_requested && (
                          <Badge className="bg-emerald-600 text-white font-black text-[9px] tracking-[0.2em] h-5 rounded-full px-3">READY_FOR_DEPLOYMENT</Badge>
                        )}
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden backdrop-blur-md">
                        <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                          {loadingItems ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-3 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                              <span className="text-xs font-black uppercase tracking-widest">Synchronizing Inventory...</span>
                            </div>
                          ) : availableItems.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center gap-4">
                              <AlertTriangle className="w-12 h-12 text-rose-500" />
                              <div>
                                <p className="text-white font-black uppercase tracking-widest text-sm">Inventory Depleted</p>
                                <p className="text-slate-500 text-xs mt-1 font-medium">No available units found in the requested category.</p>
                              </div>
                            </div>
                          ) : (
                            availableItems.map((item) => (
                              <label 
                                key={item.id} 
                                className={`flex items-center gap-5 px-8 py-5 cursor-pointer transition-all ${formData.inventory_item_ids.includes(item.id) ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                              >
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.inventory_item_ids.includes(item.id) ? 'bg-blue-600 border-blue-600 shadow-lg' : 'border-white/20 bg-transparent'}`}>
                                  {formData.inventory_item_ids.includes(item.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-black text-sm flex items-center gap-3 ${formData.inventory_item_ids.includes(item.id) ? 'text-white' : 'text-slate-300'}`}>
                                    <Hash className="w-4 h-4 text-slate-500" />
                                    {item.serial_number}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cond: {item.condition}</span>
                                    <span className="text-[10px] text-slate-600 font-medium">• {item.location || 'Central Vault'}</span>
                                  </div>
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden"
                                  checked={formData.inventory_item_ids.includes(item.id)}
                                  onChange={() => toggleItemSelection(item.id)}
                                />
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Allocation Integrity</Label>
                        <Select 
                          value={formData.condition_on_distribution} 
                          onValueChange={(value) => setFormData({ ...formData, condition_on_distribution: value })}
                        >
                          <SelectTrigger className="bg-white/5 h-14 rounded border-white/10 text-white font-black focus:ring-blue-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white font-black">
                            <SelectItem value="excellent">Excellent Condition</SelectItem>
                            <SelectItem value="good">Standard (Good)</SelectItem>
                            <SelectItem value="fair">Acceptable (Fair)</SelectItem>
                            <SelectItem value="poor">Maintenance Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Processing Notes</Label>
                        <Input
                          placeholder="Provide context for audit..."
                          value={formData.admin_notes}
                          onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                          className="bg-white/5 h-14 rounded border-white/10 text-white font-black focus:ring-blue-600 placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleApprove} 
                      disabled={loading || formData.inventory_item_ids.length !== request.quantity_requested} 
                      className="w-full h-20 rounded-[28px] bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-900/40 font-black text-xl transition-all active:scale-95"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="uppercase tracking-widest">Processing Allocation...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 uppercase tracking-widest">
                          <ShieldCheck className="w-7 h-7" />
                          Confirm Deployment
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-10 space-y-8 shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-500">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-50 rounded border border-rose-100">
                        <XCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Archive Request</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setAction(null)} 
                      className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[10px]"
                    >
                      Abort Action
                    </Button>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="reject_reason" className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Rejection Rationale *</Label>
                      <Textarea
                        id="reject_reason"
                        value={formData.admin_notes}
                        onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                        placeholder="Define the administrative rationale for terminating this request. This justification will be relayed to the personnel..."
                        className="min-h-[160px] rounded-[24px] border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-600 p-8 font-medium italic shadow-inner"
                        required
                      />
                    </div>

                    <Button 
                      onClick={handleReject} 
                      disabled={loading || !formData.admin_notes} 
                      className="w-full h-20 rounded-[28px] bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-100 font-black text-xl transition-all active:scale-95 flex items-center gap-4"
                    >
                      {loading ? (
                         <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="uppercase tracking-widest">Terminating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 uppercase tracking-widest">
                          <XCircle className="w-7 h-7" />
                          Terminate & Archive
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

