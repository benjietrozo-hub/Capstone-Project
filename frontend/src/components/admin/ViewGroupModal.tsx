import { useState } from "react";
import { X, Mail, Users, Edit, Archive, Download, Info, CheckCircle2, UserCheck, ShieldCheck } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  department: string;
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

interface ViewGroupModalProps {
  group: DistributionGroup;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ViewGroupModal({ group, onClose, onUpdate }: ViewGroupModalProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/distribution/groups/${group.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Distribution group moved to archive");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to archive group");
    } finally {
      setLoading(false);
    }
  };

  const handleExportGroup = () => {
    if (!group.teachers || group.teachers.length === 0) {
      toast.error("No member data available for export");
      return;
    }

    const headers = ["Name", "Email", "Department"];
    const csvContent = [
      headers.join(","),
      ...group.teachers.map(t => `"${t.full_name}","${t.email}","${t.department}"`)
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `group_${group.group_name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Group roster exported successfully");
  };

  const handleCopyEmails = () => {
    if (!group.teachers || group.teachers.length === 0) {
      toast.error("Recipients list is empty");
      return;
    }

    const emails = group.teachers.map(t => t.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("All member emails copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
        
        {/* Premium Header */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-10 py-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex items-center gap-6 z-10">
            <div className="p-4 bg-white/10 rounded-[24px] backdrop-blur-xl border border-white/10 shadow-inner">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-white tracking-tight">{group.group_name}</h2>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold px-3">
                  {group.is_active ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {group.group_type.toUpperCase()} DISTRIBUTION CHANNEL
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Action Bar */}
          <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleCopyEmails} 
                className="h-11 rounded-sm gap-2 border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all font-bold px-5"
              >
                <Mail className="w-4 h-4" />
                Copy Emails
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportGroup} 
                className="h-11 rounded-sm gap-2 border-slate-200 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all font-bold px-5"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="h-11 rounded-sm gap-2 border-slate-200 hover:bg-white hover:text-slate-900 transition-all font-bold px-5"
              >
                <Edit className="w-4 h-4" />
                Modify Group
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowArchiveDialog(true)}
                className="h-11 rounded-sm gap-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-bold px-5"
              >
                <Archive className="w-4 h-4" />
                Archive
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-10 py-8">
              {/* Group Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-slate-50 rounded-sm border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Count</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-800">{group.teachers_count}</span>
                    <span className="text-xs font-bold text-slate-400">Verified Personnel</span>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-sm border border-slate-100 flex flex-col md:col-span-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Group Description</span>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {group.description || "No official description has been provided for this distribution group."}
                  </p>
                </div>
              </div>

              {/* Members List Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Recipients</h3>
                  </div>
                  <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold px-3">
                    Live Status
                  </Badge>
                </div>

                {group.teachers && group.teachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <span className="font-black text-slate-400 group-hover:text-blue-500">
                              {teacher.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-none mb-1">{teacher.full_name}</div>
                            <div className="text-xs font-medium text-slate-400">{teacher.email}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                          {teacher.department}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">No Members Found</h3>
                    <p className="text-sm text-slate-300 mt-1">This group currently has no verified recipients.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
            <Button 
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-10 rounded shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              Close Record
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Archive Confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent className="rounded-[32px] p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-red-50 rounded-sm flex items-center justify-center text-red-600 mb-6">
              <Archive className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Archive Distribution Group?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-base leading-relaxed">
              You are about to archive <span className="font-bold text-slate-900">"{group.group_name}"</span>. 
              This will disable the group from active distribution workflows. 
              <span className="block mt-2">Personnel records associated with this group will remain intact in the system.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel disabled={loading} className="h-12 rounded font-bold border-slate-200 px-8">
              Keep Group
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={loading}
              className="h-12 rounded bg-red-600 hover:bg-red-700 font-bold px-10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Archive Group"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

