import { useState } from "react";
import { X, Users, Search } from "lucide-react";
import axios from "axios";
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
  });
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
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
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/distribution/groups`,
        {
          ...formData,
          teacher_ids: selectedTeachers,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Distribution group created successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Distribution Group</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new group for targeted communication</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Group Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="group_name">Group Name *</Label>
                <Input
                  id="group_name"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  placeholder="e.g., Science Department Teachers"
                  required
                />
              </div>

              <div>
                <Label htmlFor="group_type">Group Type *</Label>
                <Select value={formData.group_type} onValueChange={(value) => setFormData({ ...formData, group_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="grade_level">Grade Level</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this group..."
                  rows={3}
                />
              </div>
            </div>

            {/* Teacher Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Teachers *</Label>
                <Badge variant="secondary">
                  {selectedTeachers.length} selected
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                    onClick={() => handleToggleTeacher(teacher.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={() => handleToggleTeacher(teacher.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{teacher.full_name}</div>
                      <div className="text-sm text-gray-600">{teacher.email}</div>
                    </div>
                    <Badge variant="outline">{teacher.department}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
