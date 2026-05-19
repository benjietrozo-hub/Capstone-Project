import { useState, useEffect } from 'react';
import { X, Zap, Users, User, ChevronRight, ChevronLeft, Check, Minus, Plus, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { adminAPI } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface DirectAssignModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type RecipientType = 'teacher' | 'group';

export default function DirectAssignModal({ onClose, onSuccess }: DirectAssignModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Items
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Step 2 — Recipient
  const [recipientType, setRecipientType] = useState<RecipientType>('teacher');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [quantityPerMember, setQuantityPerMember] = useState(1);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Step 3 — Metadata
  const [form, setForm] = useState({
    distribution_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    condition_on_distribution: 'good',
    purpose: '',
    notes: '',
  });

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchAvailableItems();
    else { setAvailableItems([]); setSelectedItemIds([]); }
  }, [selectedCategoryId]);

  const fetchInitialData = async () => {
    try {
      const [catRes, teacherRes, groupRes] = await Promise.all([
        axiosInstance.get('/admin/item-categories'),
        axiosInstance.get('/admin/distribution?all=1'),
        axiosInstance.get('/admin/distribution/groups'),
      ]);

      // DEBUG — remove after fix confirmed
      console.log('[DirectAssign] catRes.data:', catRes.data);
      console.log('[DirectAssign] teacherRes.data:', teacherRes.data);
      console.log('[DirectAssign] groupRes.data:', groupRes.data);

      // /admin/item-categories returns a plain array
      const rawCats = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data ?? []);
      setCategories(Array.isArray(rawCats) ? rawCats : []);

      // /admin/distribution?all=1 returns { success, data: [...] }
      const rawTeachers = Array.isArray(teacherRes.data?.data) ? teacherRes.data.data : [];
      setTeachers(rawTeachers);

      // /admin/distribution/groups returns { success, data: { data: [...] } } paginated
      const rawGroups = groupRes.data?.data?.data ?? groupRes.data?.data ?? [];
      setGroups(Array.isArray(rawGroups) ? rawGroups.filter((g: any) => g.is_active !== false) : []);
    } catch {
      toast.error('Failed to load data');
    }
  };

  const fetchAvailableItems = async () => {
    setLoadingItems(true);
    try {
      const res = await axiosInstance.get('/admin/inventory-items', {
        params: { category_id: selectedCategoryId, status: 'available', per_page: 500 }
      });
      // returns paginated { success, data: { data: [...] } }
      const items = res.data?.data?.data ?? res.data?.data ?? [];
      setAvailableItems(Array.isArray(items) ? items : []);
      setSelectedItemIds([]);
    } catch { toast.error('Failed to load items'); }
    finally { setLoadingItems(false); }
  };

  const toggleItem = (id: number) =>
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectedCategory = categories.find(c => c.id === parseInt(selectedCategoryId));
  const selectedTeacher = teachers.find(t => t.id === parseInt(selectedTeacherId));
  const selectedGroup = groups.find(g => g.id === parseInt(selectedGroupId));
  const filteredTeachers = teachers.filter(t =>
    `${t.full_name} ${t.email} ${t.department}`.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const neededForGroup = selectedGroup ? selectedGroup.teachers_count * quantityPerMember : 0;
  const groupReady = recipientType === 'group' && selectedGroup && selectedItemIds.length === neededForGroup;
  const teacherReady = recipientType === 'teacher' && selectedTeacherId && selectedItemIds.length > 0;
  const step2Valid = groupReady || teacherReady;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (recipientType === 'teacher') {
        await adminAPI.directAssignToTeacher({
          category_id: parseInt(selectedCategoryId),
          teacher_id: parseInt(selectedTeacherId),
          inventory_item_ids: selectedItemIds,
          ...form,
        });
        toast.success(`${selectedItemIds.length} item(s) directly assigned to ${selectedTeacher?.full_name}`);
      } else {
        await adminAPI.directAssignToGroup({
          category_id: parseInt(selectedCategoryId),
          group_id: parseInt(selectedGroupId),
          inventory_item_ids: selectedItemIds,
          quantity_per_member: quantityPerMember,
          ...form,
        });
        toast.success(`Items assigned to all ${selectedGroup?.teachers_count} members of "${selectedGroup?.group_name}"`);
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Assignment failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/20 rounded-sm">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Direct Assignment</h2>
              <p className="text-slate-400 text-xs font-medium">Assign items immediately — no request required</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Step indicators */}
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs font-bold hidden md:block ${step === s ? 'text-white' : 'text-slate-500'}`}>
                  {s === 1 ? 'Items' : s === 2 ? 'Recipient' : 'Details'}
                </span>
                {s < 3 && <ChevronRight className="w-3 h-3 text-slate-600" />}
              </div>
            ))}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-sm text-slate-400 hover:text-white transition-all ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Select Category + Items ── */}
          {step === 1 && (
            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">1. Select Item Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="h-12 rounded-sm border-slate-200">
                    <SelectValue placeholder="Choose a category…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()} className="rounded-sm">
                        <span className="font-bold">{c.category_name}</span>
                        <span className="text-slate-400 text-xs ml-2">({c.available_count ?? '?'} available)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategoryId && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">2. Select Inventory Items</Label>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black rounded-sm">
                      {selectedItemIds.length} selected
                    </Badge>
                  </div>
                  <div className="border border-slate-100 rounded-sm overflow-hidden max-h-72 overflow-y-auto">
                    {loadingItems ? (
                      <div className="p-8 text-center text-slate-400 text-sm italic">Loading items…</div>
                    ) : availableItems.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm italic">No available items in this category</div>
                    ) : availableItems.map((item: any) => (
                      <label key={item.id} className={`flex items-center gap-4 p-4 border-b border-slate-50 cursor-pointer transition-colors ${selectedItemIds.includes(item.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                        <Checkbox
                          checked={selectedItemIds.includes(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">{item.serial_number || item.item_name}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.item_code || `ID #${item.id}`}</p>
                        </div>
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black rounded-sm text-xs">available</Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Select Recipient ── */}
          {step === 2 && (
            <div className="p-8 space-y-8">
              {/* Recipient type toggle */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Recipient Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['teacher', 'group'] as RecipientType[]).map(t => (
                    <button key={t} onClick={() => setRecipientType(t)}
                      className={`p-5 rounded-sm border-2 flex items-center gap-4 transition-all font-bold text-sm ${recipientType === t ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}>
                      {t === 'teacher' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      {t === 'teacher' ? 'Individual Teacher' : 'Distribution Group'}
                    </button>
                  ))}
                </div>
              </div>

              {recipientType === 'teacher' && (
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Teacher</Label>
                  <Input placeholder="Search teacher…" value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} className="h-11 rounded-sm border-slate-200" />
                  <div className="border border-slate-100 rounded-sm overflow-hidden max-h-64 overflow-y-auto">
                    {filteredTeachers.map((t: any) => (
                      <label key={t.id} className={`flex items-center gap-4 p-4 border-b border-slate-50 cursor-pointer transition-colors ${selectedTeacherId === t.id.toString() ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-slate-50'}`}>
                        <input type="radio" name="teacher" value={t.id} checked={selectedTeacherId === t.id.toString()} onChange={() => setSelectedTeacherId(t.id.toString())} className="accent-emerald-600" />
                        <div className="w-9 h-9 bg-slate-100 rounded-sm flex items-center justify-center font-black text-slate-500 text-sm shrink-0">
                          {(t.full_name || t.first_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{t.full_name}</p>
                          <p className="text-xs text-slate-400">{t.department}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {recipientType === 'group' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Group</Label>
                    <div className="grid grid-cols-1 gap-3 max-h-52 overflow-y-auto pr-1">
                      {groups.map((g: any) => (
                        <label key={g.id} className={`flex items-center justify-between p-4 border-2 rounded-sm cursor-pointer transition-all ${selectedGroupId === g.id.toString() ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="group" value={g.id} checked={selectedGroupId === g.id.toString()} onChange={() => setSelectedGroupId(g.id.toString())} className="accent-emerald-600" />
                            <div>
                              <p className="font-black text-slate-900 text-sm">{g.group_name}</p>
                              <p className="text-xs text-slate-400 uppercase tracking-wide">{g.group_type}</p>
                            </div>
                          </div>
                          <Badge className="bg-slate-100 text-slate-600 rounded-sm font-black">{g.teachers_count} members</Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedGroup && (
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Units per Member</Label>
                      <div className="flex items-center gap-4 w-fit bg-slate-50 border border-slate-200 rounded-sm p-2">
                        <button type="button" onClick={() => setQuantityPerMember(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-sm bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-black text-lg text-slate-900">{quantityPerMember}</span>
                        <button type="button" onClick={() => setQuantityPerMember(q => q + 1)} className="w-9 h-9 rounded-sm bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={`p-4 rounded-sm border flex items-center gap-3 ${selectedItemIds.length === neededForGroup ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                        {selectedItemIds.length === neededForGroup
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />}
                        <p className="text-sm font-bold text-slate-700">
                          Need <span className="font-black">{neededForGroup}</span> items ({selectedGroup.teachers_count} members × {quantityPerMember}) — selected <span className="font-black">{selectedItemIds.length}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Metadata ── */}
          {step === 3 && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Distribution Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="date" value={form.distribution_date} onChange={e => setForm(f => ({ ...f, distribution_date: e.target.value }))} className="pl-12 h-12 rounded-sm border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Expected Return Date <span className="text-slate-300 normal-case font-medium">(optional)</span></Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="date" value={form.expected_return_date} onChange={e => setForm(f => ({ ...f, expected_return_date: e.target.value }))} className="pl-12 h-12 rounded-sm border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Item Condition *</Label>
                  <Select value={form.condition_on_distribution} onValueChange={v => setForm(f => ({ ...f, condition_on_distribution: v }))}>
                    <SelectTrigger className="h-12 rounded-sm border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-sm">
                      {['excellent', 'good', 'fair', 'poor'].map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Purpose</Label>
                  <Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. SY 2024-2025 faculty distribution" className="h-12 rounded-sm border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Internal Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Optional remarks…" className="rounded-sm border-slate-200" />
                </div>
              </div>

              {/* Summary panel */}
              <div className="bg-slate-900 rounded-sm p-8 text-white space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-lg">Assignment Summary</h3>
                </div>
                {[
                  { label: 'Category', value: selectedCategory?.category_name || '—' },
                  { label: 'Items Selected', value: `${selectedItemIds.length} unit(s)` },
                  { label: 'Recipient Type', value: recipientType === 'teacher' ? 'Individual Teacher' : 'Distribution Group' },
                  { label: 'Recipient', value: recipientType === 'teacher' ? (selectedTeacher?.full_name || '—') : (selectedGroup?.group_name || '—') },
                  ...(recipientType === 'group' ? [{ label: 'Members', value: `${selectedGroup?.teachers_count || 0} teachers` }] : []),
                  { label: 'Effective Date', value: form.distribution_date || '—' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/10 text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-bold truncate max-w-[160px] text-right">{row.value}</span>
                  </div>
                ))}
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black rounded-sm mt-2">
                  Status: ACTIVE immediately
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(s => s - 1)} className="h-11 px-6 rounded-sm font-bold text-slate-500 hover:text-slate-700">
            {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
          </Button>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-emerald-600 w-6' : 'bg-slate-200'}`} />)}
          </div>
          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? (!selectedCategoryId || selectedItemIds.length === 0) : !step2Valid}
              className="h-11 px-8 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-black gap-2 disabled:opacity-40"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.distribution_date || !form.condition_on_distribution}
              className="h-11 px-8 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all disabled:opacity-40"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? 'Assigning…' : 'Authorize Assignment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
