import { useState, useEffect } from "react";
import { Search, Download, Users, Filter, Plus, Mail, Phone, Building2, UserCheck, UserX, Package, Calendar, AlertCircle, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import CreateGroupModal from "@/components/admin/CreateGroupModal";
import ViewGroupModal from "@/components/admin/ViewGroupModal";
import CreateDistributionModal from "@/components/admin/CreateDistributionModal";
import ReturnDistributionModal from "@/components/admin/ReturnDistributionModal";
import ViewDistributionRequestModal from "@/components/admin/ViewDistributionRequestModal";

interface Teacher {
  id: number;
  teacher_id: string;
  employee_id: string;
  full_name: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string;
  status: string;
  last_login: string | null;
  active_borrows_count: number;
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

interface Statistics {
  total_teachers: number;
  active_teachers: number;
  inactive_teachers: number;
  departments: Record<string, number>;
  groups: DistributionGroup[];
}

interface ItemDistribution {
  id: number;
  item_id: number;
  teacher_id: number;
  distributed_by: number;
  quantity_distributed: number;
  status: 'active' | 'returned' | 'cancelled';
  distribution_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  purpose: string | null;
  notes: string | null;
  admin_notes: string | null;
  condition_on_distribution: string;
  condition_on_return: string | null;
  is_overdue: boolean;
  item: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
  };
  teacher: {
    id: number;
    full_name: string;
    email: string;
    department: string;
  };
  distributed_by_admin: {
    id: number;
    full_name: string;
  };
}

interface DistributionStats {
  total_distributions: number;
  active_distributions: number;
  returned_distributions: number;
  overdue_distributions: number;
  total_quantity_distributed: number;
}

interface DistributionRequest {
  id: number;
  teacher_id: number;
  item_id: number;
  quantity_requested: number;
  reason: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'distributed';
  reviewed_by: number | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  teacher: {
    id: number;
    full_name: string;
    email: string;
    department: string;
  };
  item: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
    quantity_available: number;
  };
  reviewed_by_admin?: {
    id: number;
    full_name: string;
  };
}

interface DistributionRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  distributed_requests: number;
}

export default function DistributionListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showViewGroupModal, setShowViewGroupModal] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState<DistributionGroup | null>(null);

  // Item Distributions state
  const [distributions, setDistributions] = useState<ItemDistribution[]>([]);
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null);
  const [distributionSearch, setDistributionSearch] = useState("");
  const [distributionStatus, setDistributionStatus] = useState("all");
  const [showCreateDistributionModal, setShowCreateDistributionModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<ItemDistribution | null>(null);

  // Distribution Requests state
  const [distributionRequests, setDistributionRequests] = useState<DistributionRequest[]>([]);
  const [distributionRequestStats, setDistributionRequestStats] = useState<DistributionRequestStats | null>(null);
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("all");
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DistributionRequest | null>(null);

  useEffect(() => {
    fetchData();
    fetchDistributions();
    fetchDistributionRequests();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchQuery, selectedDepartment, selectedStatus, selectedGroup]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [teachersRes, statsRes, deptRes, groupsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTeachers(teachersRes.data.data);
      setStatistics(statsRes.data.data);
      setDepartments(deptRes.data.data);
      setGroups(groupsRes.data.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Failed to load distribution list");
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(t => t.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Group filter
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group && group.teachers) {
        const groupTeacherIds = group.teachers.map(t => t.id);
        filtered = filtered.filter(t => groupTeacherIds.includes(t.id));
      }
    }

    setFilteredTeachers(filtered);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      
      if (selectedDepartment !== "all") params.append("department", selectedDepartment);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedGroup) params.append("group_id", selectedGroup.toString());

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/distribution/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Convert to CSV
      const data = response.data.data;
      if (data.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row: any) => headers.map(h => `"${row[h]}"`).join(","))
      ].join("\n");

      // Download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `distribution-list-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      
      toast.success("Distribution list exported successfully");
    } catch (error: any) {
      console.error("Error exporting:", error);
      toast.error("Failed to export distribution list");
    }
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id));
    }
  };

  const handleSelectTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleViewGroup = (group: DistributionGroup) => {
    setSelectedGroupData(group);
    setShowViewGroupModal(true);
  };

  const handleGroupCreated = () => {
    fetchData();
    setShowCreateGroupModal(false);
  };

  // Item Distribution functions
  const fetchDistributions = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [distRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distributions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: distributionStatus !== 'all' ? distributionStatus : undefined }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distributions/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDistributions(distRes.data.data.data || distRes.data.data);
      setDistributionStats(statsRes.data.data);
    } catch (error: any) {
      console.error("Error fetching distributions:", error);
      toast.error("Failed to load distributions");
    }
  };

  const handleReturnDistribution = (distribution: ItemDistribution) => {
    setSelectedDistribution(distribution);
    setShowReturnModal(true);
  };

  const handleCancelDistribution = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this distribution? The quantity will be returned to inventory.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distributions/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Distribution cancelled successfully");
      fetchDistributions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel distribution");
    }
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status === 'active') {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    
    const variants: Record<string, any> = {
      active: <Badge className="bg-blue-100 text-blue-800">Active</Badge>,
      returned: <Badge className="bg-green-100 text-green-800">Returned</Badge>,
      cancelled: <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesSearch = distributionSearch === "" || 
      d.item.item_name.toLowerCase().includes(distributionSearch.toLowerCase()) ||
      d.teacher.full_name.toLowerCase().includes(distributionSearch.toLowerCase()) ||
      d.item.item_code.toLowerCase().includes(distributionSearch.toLowerCase());
    
    const matchesStatus = distributionStatus === "all" || d.status === distributionStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Distribution Request functions
  const fetchDistributionRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [reqRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution-requests`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: requestStatus !== 'all' ? requestStatus : undefined }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution-requests/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDistributionRequests(reqRes.data.data);
      setDistributionRequestStats(statsRes.data.data);
    } catch (error: any) {
      console.error("Error fetching distribution requests:", error);
      toast.error("Failed to load distribution requests");
    }
  };

  const handleViewRequest = (request: DistributionRequest) => {
    setSelectedRequest(request);
    setShowViewRequestModal(true);
  };

  const getRequestStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      approved: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
      rejected: <Badge className="bg-red-100 text-red-800">Rejected</Badge>,
      distributed: <Badge className="bg-blue-100 text-blue-800">Distributed</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const filteredRequests = distributionRequests.filter(r => {
    const matchesSearch = requestSearch === "" || 
      r.item.item_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.teacher.full_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.item.item_code.toLowerCase().includes(requestSearch.toLowerCase());
    
    const matchesStatus = requestStatus === "all" || r.status === requestStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distribution List</h1>
          <p className="text-gray-600 mt-1">Manage teacher contact lists and groups</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => setShowCreateGroupModal(true)} className="gap-2 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Teachers</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_teachers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics?.active_teachers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
            <UserX className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{statistics?.inactive_teachers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Groups</CardTitle>
            <Building2 className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{groups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Teachers</TabsTrigger>
          <TabsTrigger value="groups">Distribution Groups</TabsTrigger>
          <TabsTrigger value="distributions">Item Distributions</TabsTrigger>
          <TabsTrigger value="requests">Distribution Requests</TabsTrigger>
        </TabsList>

        {/* All Teachers Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGroup?.toString() || "all"} onValueChange={(v) => setSelectedGroup(v === "all" ? null : parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.group_name} ({group.teachers_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {filteredTeachers.length} of {teachers.length} teachers
                  {selectedTeachers.length > 0 && ` • ${selectedTeachers.length} selected`}
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedTeachers.length === filteredTeachers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={() => handleSelectTeacher(teacher.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{teacher.full_name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{teacher.employee_id}</p>
                      </div>
                    </div>
                    <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                      {teacher.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <Badge variant="outline" className="truncate">{teacher.department}</Badge>
                  </div>
                  {teacher.active_borrows_count > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 flex-shrink-0 text-blue-600" />
                      <span className="text-blue-600 font-medium">
                        {teacher.active_borrows_count} active borrow{teacher.active_borrows_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Distribution Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewGroup(group)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.group_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{group.description || "No description"}</p>
                    </div>
                    <Badge variant={group.is_active ? "default" : "secondary"}>
                      {group.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{group.teachers_count} members</span>
                    </div>
                    <Badge variant="outline">{group.group_type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Item Distributions Tab */}
        <TabsContent value="distributions" className="space-y-4">
          {/* Distribution Statistics */}
          {distributionStats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                  <Package className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{distributionStats.total_distributions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{distributionStats.active_distributions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Returned</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{distributionStats.returned_distributions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{distributionStats.overdue_distributions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Items Out</CardTitle>
                  <Package className="w-4 h-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{distributionStats.total_quantity_distributed}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by item or teacher..."
                      value={distributionSearch}
                      onChange={(e) => setDistributionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={distributionStatus} onValueChange={(v) => { setDistributionStatus(v); fetchDistributions(); }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => setShowCreateDistributionModal(true)} className="gap-2 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
                  <Plus className="w-4 h-4" />
                  Distribute Item
                </Button>
              </div>

              <div className="text-sm text-gray-600 mt-4">
                Showing {filteredDistributions.length} of {distributions.length} distributions
              </div>
            </CardContent>
          </Card>

          {/* Distributions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDistributions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No distributions found</p>
                          <Button 
                            onClick={() => setShowCreateDistributionModal(true)} 
                            variant="outline" 
                            className="mt-4"
                          >
                            Create First Distribution
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      filteredDistributions.map((dist) => (
                        <tr key={dist.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dist.item.item_name}</div>
                              <div className="text-sm text-gray-500">{dist.item.item_code}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dist.teacher.full_name}</div>
                              <div className="text-sm text-gray-500">{dist.teacher.department}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dist.quantity_distributed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(dist.distribution_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(dist.status, dist.is_overdue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {dist.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReturnDistribution(dist)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Return
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelDistribution(dist.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {dist.status === 'returned' && (
                                <span className="text-sm text-gray-500">
                                  Returned {dist.actual_return_date ? new Date(dist.actual_return_date).toLocaleDateString() : ''}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {/* Request Statistics */}
          {distributionRequestStats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                  <Package className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{distributionRequestStats.total_requests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                  <Clock className="w-4 h-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{distributionRequestStats.pending_requests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{distributionRequestStats.approved_requests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                  <XCircle className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{distributionRequestStats.rejected_requests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Distributed</CardTitle>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{distributionRequestStats.distributed_requests}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by item or teacher..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={requestStatus} onValueChange={(v) => { setRequestStatus(v); fetchDistributionRequests(); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="distributed">Distributed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600 mt-4">
                Showing {filteredRequests.length} of {distributionRequests.length} requests
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No distribution requests found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{req.item.item_name}</div>
                              <div className="text-sm text-gray-500">{req.item.item_code}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{req.teacher.full_name}</div>
                              <div className="text-sm text-gray-500">{req.teacher.department}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {req.quantity_requested}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRequestStatusBadge(req.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewRequest(req)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateGroupModal && (
        <CreateGroupModal
          teachers={teachers}
          onClose={() => setShowCreateGroupModal(false)}
          onSuccess={handleGroupCreated}
        />
      )}

      {showViewGroupModal && selectedGroupData && (
        <ViewGroupModal
          group={selectedGroupData}
          onClose={() => {
            setShowViewGroupModal(false);
            setSelectedGroupData(null);
          }}
          onUpdate={fetchData}
        />
      )}

      {showCreateDistributionModal && (
        <CreateDistributionModal
          onClose={() => setShowCreateDistributionModal(false)}
          onSuccess={() => {
            setShowCreateDistributionModal(false);
            fetchDistributions();
          }}
        />
      )}

      {showReturnModal && selectedDistribution && (
        <ReturnDistributionModal
          distribution={selectedDistribution}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedDistribution(null);
          }}
          onSuccess={() => {
            setShowReturnModal(false);
            setSelectedDistribution(null);
            fetchDistributions();
          }}
        />
      )}

      {showViewRequestModal && selectedRequest && (
        <ViewDistributionRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowViewRequestModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowViewRequestModal(false);
            setSelectedRequest(null);
            fetchDistributionRequests();
            fetchDistributions(); // Refresh distributions as well
          }}
        />
      )}
    </div>
  );
}
