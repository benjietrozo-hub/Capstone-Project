import { useState } from "react";
import { X, Mail, Users, Edit, Trash2, Download } from "lucide-react";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/distribution/groups/${group.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Distribution group deleted successfully");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.message || "Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const handleExportGroup = () => {
    if (!group.teachers || group.teachers.length === 0) {
      toast.error("No members to export");
      return;
    }

    const headers = ["Name", "Email", "Department"];
    const csv = [
      headers.join(","),
      ...group.teachers.map(t => `"${t.full_name}","${t.email}","${t.department}"`)
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${group.group_name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast.success("Group exported successfully");
  };

  const handleCopyEmails = () => {
    if (!group.teachers || group.teachers.length === 0) {
      toast.error("No members to copy");
      return;
    }

    const emails = group.teachers.map(t => t.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("Email addresses copied to clipboard");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{group.group_name}</h2>
                <Badge variant={group.is_active ? "default" : "secondary"}>
                  {group.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{group.group_type}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{group.description || "No description"}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 border-b">
            <Button variant="outline" size="sm" onClick={handleCopyEmails} className="gap-2">
              <Mail className="w-4 h-4" />
              Copy Emails
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportGroup} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <div className="flex-1"></div>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          {/* Members List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Members ({group.teachers_count})
              </h3>
            </div>

            {group.teachers && group.teachers.length > 0 ? (
              <div className="space-y-2">
                {group.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{teacher.full_name}</div>
                      <div className="text-sm text-gray-600">{teacher.email}</div>
                    </div>
                    <Badge variant="outline">{teacher.department}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No members in this group
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Distribution Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{group.group_name}"? This action cannot be undone.
              The teachers will not be deleted, only the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
