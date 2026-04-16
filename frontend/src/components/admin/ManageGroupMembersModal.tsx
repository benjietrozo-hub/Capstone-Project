import { useState, useEffect } from "react";
import { X, Users, UserPlus, UserMinus, Search, Check } from "lucide-react";
import axios from "axios";
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
    if (allTeachers.length > 0 && currentMembers.length >= 0) {
      const currentMemberIds = currentMembers.map(m => m.id);
      const available = allTeachers.filter(teacher => !currentMemberIds.includes(teacher.id));
      setAvailableTeachers(available);
    }
  }, [allTeachers, currentMembers]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const token = localStorage.getItem("token");
      
      const [teachersRes, groupRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/groups/${group?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAllTeachers(teachersRes.data.data);
      setCurrentMembers(groupRes.data.data.teachers || []);
    } catch (error: any) {
      toast.error("Failed to load data");
      console.error("Error fetching data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedTeachers.length === 0) {
      toast.error("Please select at least one teacher to add");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distribution/groups/${group?.id}/add-teachers`,
        { teacher_ids: selectedTeachers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${selectedTeachers.length} teacher(s) added successfully`);
      setSelectedTeachers([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (teacherId: number) => {
    if (!confirm("Are you sure you want to remove this teacher from the group?")) return;

    try {
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distribution/groups/${group?.id}/remove-teachers`,
        { teacher_ids: [teacherId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Teacher removed successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove teacher");
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

  const filteredAvailableTeachers = availableTeachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCurrentMembers = currentMembers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Manage Group Members</h2>
            <p className="text-sm text-gray-600 mt-1">{group.group_name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {fetchingData ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Current Members ({currentMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCurrentMembers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No members found</p>
                    ) : (
                      filteredCurrentMembers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{teacher.full_name}</div>
                            <div className="text-sm text-gray-600">{teacher.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {teacher.department}
                              </Badge>
                              <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {teacher.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(teacher.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Available Teachers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Available Teachers ({filteredAvailableTeachers.length})
                    </CardTitle>
                    {selectedTeachers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedTeachers.length} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedTeachers.length === filteredAvailableTeachers.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAvailableTeachers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available teachers</p>
                    ) : (
                      filteredAvailableTeachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={selectedTeachers.includes(teacher.id)}
                              onCheckedChange={() => handleSelectTeacher(teacher.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{teacher.full_name}</div>
                              <div className="text-sm text-gray-600">{teacher.email}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {teacher.department}
                                </Badge>
                                <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {teacher.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedTeachers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={handleAddMembers}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]"
                      >
                        {loading ? "Adding..." : `Add ${selectedTeachers.length} Teacher(s)`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total Teachers: {allTeachers.length} | 
                  Current Members: {currentMembers.length} | 
                  Available: {availableTeachers.length}
                </div>
                <Button variant="outline" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
