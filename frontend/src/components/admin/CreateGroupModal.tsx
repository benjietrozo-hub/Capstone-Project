import { useState } from "react";
import { 
  X, Users, Search, Info, Plus, ArrowRight, UserPlus, Layers,
  CheckCircle, ShieldCheck, TrendingUp, Filter, ChevronRight,
  Settings, Briefcase
} from "lucide-react";
import { adminAPI } from "../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  department: string;
  status: string;
}

interface CreateGroupModalProps {
  teachers: Teacher[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({ teachers, onClose, onSuccess }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    group_name: "",
    group_type: "custom",
    description: "",
    visibility: "private",
  });
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTeachers = teachers.filter(t => {
    const search = searchQuery.toLowerCase();
    const fullName = (t.full_name || "").toLowerCase();
    const email = (t.email || "").toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleToggleTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.group_name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedTeachers.length === 0) {
      toast.error("Please select at least one teacher");
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        group_name: formData.group_name,
        group_type: formData.group_type,
        visibility: formData.visibility,
        description: formData.description,
        teacher_ids: selectedTeachers,
      };
      
      await adminAPI.createDistributionGroup(requestData);
      toast.success("Distribution group created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Premium Header */}
        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5 text-white">
            <div className="p-4 bg-white/10 rounded-[20px] backdrop-blur-xl border border-white/10">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Generate Group</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Coordinated recipient logic for batch distribution cycles
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side: Group Configuration */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 bg-blue-50 rounded">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Operational Parameters</Label>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Distribution Hub Identity *</Label>
                    <Input
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      placeholder="e.g., Senior Research Faculty Cluster"
                      className="h-14 rounded border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 text-lg font-bold shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logic Category</Label>
                      <Select 
                        value={formData.group_type} 
                        onValueChange={(value) => setFormData({ ...formData, group_type: value })}
                      >
                        <SelectTrigger className="h-14 rounded border-slate-200 bg-white font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded border-slate-100 font-bold">
                          <SelectItem value="department">Department Hub</SelectItem>
                          <SelectItem value="role">Professional Role</SelectItem>
                          <SelectItem value="custom">Custom Logic Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Protocol</Label>
                      <Select 
                        value={formData.visibility} 
                        onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                      >
                        <SelectTrigger className="h-14 rounded border-slate-200 bg-white font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded border-slate-100 font-bold">
                          <SelectItem value="private">Restricted (Private)</SelectItem>
                          <SelectItem value="shared">Administrative (Shared)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mission Objective / Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Define the operational scope of this distribution group..."
                      className="rounded-[24px] border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 p-6 min-h-[160px] font-medium italic shadow-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Summary Insight */}
              <div className="bg-slate-900 rounded-[32px] p-8 space-y-6 shadow-xl shadow-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Deployment Insight</h4>
                  <Badge className="bg-white/10 text-white border-white/10 font-black px-3 h-6 text-[10px] tracking-widest">REAL-TIME</Badge>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-medium">Group Identity</span>
                    <span className="font-black text-white">{formData.group_name || "PENDING_IDENTIFIER"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-medium">Recipient Load</span>
                    <span className="font-black text-blue-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {selectedTeachers.length} Personnel
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-medium">Security Policy</span>
                    <span className="font-black text-emerald-400 uppercase tracking-widest text-[10px]">{formData.visibility}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Personnel Engine */}
            <div className="flex flex-col space-y-6 h-full">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                  <Label className="text-lg font-black text-slate-800">Personnel Engine</Label>
                </div>
                <button 
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest underline underline-offset-4"
                >
                  {selectedTeachers.length === filteredTeachers.length ? "Reset Roster" : "Batch Enroll All"}
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Query personnel registry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 rounded border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex-1 bg-white rounded-[32px] border border-slate-100 overflow-hidden flex flex-col shadow-inner">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                  {filteredTeachers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center text-slate-200 mb-4 border border-slate-100 shadow-sm">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Query Unmatched</p>
                      <p className="text-xs text-slate-300 mt-2 font-medium">Verify identifiers and try again</p>
                    </div>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className={`group flex items-center gap-4 p-4 transition-all cursor-pointer rounded ${selectedTeachers.includes(teacher.id) ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 ring-2 ring-slate-900' : 'hover:bg-slate-50'}`}
                        onClick={() => handleToggleTeacher(teacher.id)}
                      >
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedTeachers.includes(teacher.id) ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-200'}`}>
                          {selectedTeachers.includes(teacher.id) && <Plus className="w-4 h-4 text-white rotate-45" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black truncate ${selectedTeachers.includes(teacher.id) ? 'text-white' : 'text-slate-800'}`}>{teacher.full_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className={`text-[9px] h-4 font-black uppercase tracking-tighter ${selectedTeachers.includes(teacher.id) ? 'border-white/20 text-blue-400' : 'border-slate-100 text-slate-400'}`}>
                              {teacher.department}
                            </Badge>
                            <span className={`text-[10px] font-medium truncate ${selectedTeachers.includes(teacher.id) ? 'text-slate-400' : 'text-slate-400'}`}>{teacher.email}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Premium Action Footer */}
        <div className="p-10 border-t bg-white flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest h-14 px-8 rounded hover:bg-slate-50"
            disabled={loading}
          >
            Discard
          </Button>
          <div className="flex items-center gap-8">
             <div className="text-right hidden sm:block pr-8 border-r border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Enrolled Recipients</p>
                <p className="text-xl font-black text-slate-900">{selectedTeachers.length} Personnel</p>
              </div>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.group_name.trim() || selectedTeachers.length === 0} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-black h-14 px-14 rounded shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span className="uppercase tracking-widest">{loading ? "Synchronizing..." : "Initialize Group"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

