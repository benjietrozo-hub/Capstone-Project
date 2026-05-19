import { useState, useEffect } from "react";
import { X, Users, UserPlus, UserMinus, Search, Check, Info, ShieldCheck, UserCheck, Layers, ArrowRight, Trash2 } from "lucide-react";
import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Teacher {
  id: number;
  teacher_id: string;
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string;
  status: string;
}

interface DistributionGroup {
  id: number;
  group_name: string;
  group_type: string;
  description: string;
  is_active: boolean;
  teachers_count: number;
  teachers?: Teacher[];
}

interface ManageGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: DistributionGroup | null;
}

const normalizeApiArray = (response: any) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  return [];
};

export default function ManageGroupMembersModal({
  isOpen,
  onClose,
  onSuccess,
  group
}: ManageGroupMembersModalProps) {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [currentMembers, setCurrentMembers] = useState<Teacher[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (isOpen && group) {
      fetchData();
    }
  }, [isOpen, group]);

  useEffect(() => {
    if (allTeachers.length > 0) {
      const currentMemberIds = currentMembers.map(m => m.id);
      const available = allTeachers.filter(teacher => !currentMemberIds.includes(teacher.id));
      setAvailableTeachers(available);
    }
  }, [allTeachers, currentMembers]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [teachersRes, groupRes] = await Promise.all([
        axiosInstance.get('/admin/distribution?all=1'),
        axiosInstance.get(`/admin/distribution/groups/${group?.id}`)
      ]);

      const allT = normalizeApiArray(teachersRes.data);
      const formattedAllT = allT.map((t: any) => ({ ...t, id: Number(t.id) }));
      setAllTeachers(formattedAllT);
      
      const groupData = groupRes.data.data || groupRes.data || {};
      const members = groupData.teachers || [];
      
      const formattedMembers = members.map((m: any) => ({
        ...m,
        id: Number(m.id),
        full_name: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim()
      }));
      setCurrentMembers(formattedMembers);
    } catch (error: any) {
      toast.error("Cloud synchronization failed");
    } finally {
      setFetchingData(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedTeachers.length === 0) {
      toast.error("Selection required to proceed");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `/admin/distribution/groups/${group?.id}/add-teachers`,
        { teacher_ids: selectedTeachers }
      );
      toast.success(`Successfully enrolled ${selectedTeachers.length} members`);
      setSelectedTeachers([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (teacherId: number) => {
    try {
      await axiosInstance.post(
        `/admin/distribution/groups/${group?.id}/remove-teachers`,
        { teacher_ids: [teacherId] }
      );
      toast.success("Member access revoked");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Revocation failed");
    }
  };

  const handleSelectTeacher = (teacherId: number) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredAvailableTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredAvailableTeachers.map(t => t.id));
    }
  };

  const filteredAvailableTeachers = availableTeachers.filter(teacher => {
    const search = searchQuery.toLowerCase();
    return (teacher.full_name || "").toLowerCase().includes(search) || 
           (teacher.email || "").toLowerCase().includes(search) || 
           (teacher.department || "").toLowerCase().includes(search);
  });

  const filteredCurrentMembers = currentMembers.filter(teacher => {
    const search = searchQuery.toLowerCase();
    return (teacher.full_name || "").toLowerCase().includes(search) || 
           (teacher.email || "").toLowerCase().includes(search);
  });

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-sm w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-6 py-4 flex items-center justify-between shrink-0 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -mr-40 -mt-40 blur-3xl" />
          <div className="flex items-center gap-4 z-10">
            <div className="p-2 bg-white/10 rounded-sm backdrop-blur-xl border border-white/10 shadow-inner">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-black text-white tracking-tight">Roster Management</h2>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold px-2 py-0 h-5 text-[10px]">
                  {group.group_name}
                </Badge>
              </div>
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMINISTRATIVE OVERRIDE: {group.group_type.toUpperCase()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
          {/* Sub-Header / Search */}
          <div className="px-6 py-3 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search global directory or current group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-sm border-slate-200 bg-white shadow-sm focus:ring-blue-500/20 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 bg-slate-100 rounded-sm">
              <Info className="w-3.5 h-3.5" />
              Synchronized Local Cache
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              
              {/* Current Members Pane */}
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                    <h3 className="text-base font-black text-slate-800">Active Recipients</h3>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-2.5 h-6 text-xs rounded-sm">
                    {currentMembers.length} Members
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                  {fetchingData ? (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">Syncing records...</div>
                  ) : filteredCurrentMembers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 bg-white rounded-sm border border-dashed border-slate-200">
                      <Users className="w-10 h-10 text-slate-200 mb-2" />
                      <p className="text-slate-400 font-bold text-sm">No recipients found</p>
                    </div>
                  ) : (
                    filteredCurrentMembers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-sm hover:shadow-md hover:shadow-slate-200/50 hover:border-emerald-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-sm flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <span className="font-black text-sm text-slate-400 group-hover:text-emerald-500">
                              {teacher.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-none mb-0.5">{teacher.full_name}</div>
                            <div className="text-[11px] font-medium text-slate-400">{teacher.email}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(teacher.id)}
                          className="h-8 w-8 rounded-sm text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selection Pane */}
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4.5 h-4.5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-800">Available Personnel</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTeachers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-[10px] font-black text-blue-600 hover:bg-blue-50 h-6 px-2.5 rounded-sm uppercase tracking-tighter"
                      >
                        {selectedTeachers.length === filteredAvailableTeachers.length ? "Clear All" : "Select Result Set"}
                      </Button>
                    )}
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black px-2.5 h-6 text-xs rounded-sm">
                      {filteredAvailableTeachers.length} Available
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 flex flex-col bg-white rounded-sm border border-slate-100 shadow-inner overflow-hidden">
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {filteredAvailableTeachers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 text-sm">
                        <UserPlus className="w-8 h-8 mb-1.5 opacity-20" />
                        <p className="font-bold">No available matches</p>
                      </div>
                    ) : (
                      filteredAvailableTeachers.map((teacher) => (
                        <label
                          key={teacher.id}
                          className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${selectedTeachers.includes(teacher.id) ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' : 'bg-white border-slate-50 hover:border-blue-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedTeachers.includes(teacher.id)}
                              onCheckedChange={() => handleSelectTeacher(teacher.id)}
                              className="w-4 h-4 rounded-sm border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div>
                              <div className="font-bold text-sm text-slate-900 leading-none mb-0.5">{teacher.full_name}</div>
                              <div className="text-[10px] font-medium text-slate-400">{teacher.department}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-black border-slate-100 text-slate-400 uppercase rounded-sm px-1.5 h-5">
                            {teacher.employee_id}
                          </Badge>
                        </label>
                      ))
                    )}
                  </div>

                  {selectedTeachers.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <Button
                        onClick={handleAddMembers}
                        disabled={loading}
                        className="w-full h-10 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                        Enroll {selectedTeachers.length} Personnel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Global Footer Stats */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Roster</span>
              <span className="text-xs font-black text-slate-800">{allTeachers.length} <span className="font-normal text-slate-400">Personnel</span></span>
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment Rate</span>
              <span className="text-xs font-black text-blue-600">{Math.round((currentMembers.length / allTeachers.length) * 100) || 0}% <span className="font-normal text-slate-400">Coverage</span></span>
            </div>
          </div>
          <Button 
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-9 px-6 text-sm rounded-sm transition-all"
          >
            Finished Processing
          </Button>
        </div>

      </div>
    </div>
  );
}

