
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeleton, DashboardSkeleton } from "../../components/common/Skeleton";
import { Search, Download, Users, Filter, Plus, Mail, Phone, Building2, UserCheck, UserX, Package, Calendar, AlertCircle, CheckCircle, XCircle, Eye, Clock, ClipboardList } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import CreateGroupModal from "@/components/admin/CreateGroupModal";
import ViewGroupModal from "@/components/admin/ViewGroupModal";
import ManageGroupMembersModal from "@/components/admin/ManageGroupMembersModal";
import CreateDistributionModal from "@/components/admin/CreateDistributionModal";
import ReturnDistributionModal from "@/components/admin/ReturnDistributionModal";
import ViewDistributionRequestModal from "@/components/admin/ViewDistributionRequestModal";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

interface BulkDistribution {
  id: number;
  group_id: number;
  item_id: number;
  distributed_by: number;
  total_quantity: number;
  quantity_per_member: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  purpose: string | null;
  notes: string | null;
  distribution_date: string;
  expected_return_date: string | null;
  created_at: string;
  updated_at: string;
  group: {
    id: number;
    group_name: string;
    group_type: string;
    teachers_count: number;
  };
  item: {
    id: number;
    item_code: string;
    item_name: string;
    category: string;
  };
  distributedBy: {
    id: number;
    full_name: string;
  };
  itemDistributions: Array<{
    id: number;
    teacher_id: number;
    quantity_distributed: number;
    status: string;
    teacher: {
      id: number;
      full_name: string;
      email: string;
    };
  }>;
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
  const queryClient = useQueryClient();
  
  // Teachers state (non-cached filters)
  
  // Pagination state for Teachers
  const [teacherPagination, setTeacherPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  // Pagination state for Groups
  const [groupPagination, setGroupPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showViewGroupModal, setShowViewGroupModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState<DistributionGroup | null>(null);

  // Item Distributions state
  const [distributionSearch, setDistributionSearch] = useState("");
  const [distributionStatus, setDistributionStatus] = useState("all");
  const [showCreateDistributionModal, setShowCreateDistributionModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<ItemDistribution | null>(null);

  // Distribution Requests state
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("all");
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DistributionRequest | null>(null);

  // React Query - Statistics and Departments
  const { data: statsData } = useQuery({
    queryKey: ['distribution-stats'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const [statsRes, deptRes, allGroupsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/groups`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { all: true }
        })
      ]);
      return {
        statistics: statsRes.data.data,
        departments: deptRes.data.data,
        allGroups: allGroupsRes.data.data
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const statistics = statsData?.statistics;
  const departments = statsData?.departments || [];
  const allGroups = statsData?.allGroups || [];

  // React Query - Teachers (Paginated)
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ['distribution-teachers', { 
      page: teacherPagination.currentPage, 
      search: debouncedSearch, 
      department: selectedDepartment, 
      status: selectedStatus, 
      group: selectedGroup 
    }],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: teacherPagination.currentPage,
          per_page: teacherPagination.perPage,
          search: debouncedSearch,
          department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          group_id: selectedGroup || undefined
        }
      });
      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const teachers = (teachersData as any)?.data || [];
  // Sync pagination if needed
  useEffect(() => {
    if (teachersData && ((teacherPagination.lastPage !== (teachersData as any).last_page) || (teacherPagination.total !== (teachersData as any).total))) {
      setTeacherPagination(prev => ({
        ...prev,
        lastPage: (teachersData as any).last_page,
        total: (teachersData as any).total
      }));
    }
  }, [teachersData, teacherPagination.lastPage, teacherPagination.total]);

  // React Query - Groups (Paginated)
  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['distribution-groups', { page: groupPagination.currentPage }],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution/groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: groupPagination.currentPage,
          per_page: groupPagination.perPage
        }
      });
      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const groups = (groupsData as any)?.data || [];
  useEffect(() => {
    if (groupsData && ((groupPagination.lastPage !== (groupsData as any).last_page) || (groupPagination.total !== (groupsData as any).total))) {
      setGroupPagination(prev => ({
        ...prev,
        lastPage: (groupsData as any).last_page,
        total: (groupsData as any).total
      }));
    }
  }, [groupsData, groupPagination.lastPage, groupPagination.total]);

  // React Query - Item Distributions
  const { data: distributionsData, isLoading: loadingDistributions } = useQuery({
    queryKey: ['item-distributions', { status: distributionStatus }],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const [distRes, bulkDistRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distributions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: distributionStatus !== 'all' ? distributionStatus : undefined }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: distributionStatus !== 'all' ? distributionStatus : undefined }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/distributions/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      return {
        distributions: normalizeApiArray(distRes.data),
        bulkDistributions: normalizeApiArray(bulkDistRes.data),
        stats: statsRes.data.data
      };
    },
  });

  const distributions = distributionsData?.distributions || [];
  const bulkDistributions = distributionsData?.bulkDistributions || [];
  const distributionStats = distributionsData?.stats;

  // Combine individual and bulk distributions for the table view
  const allDistributions = useMemo(() => {
    const individual = distributions.map(d => ({ ...d, type: 'individual' }));
    const bulk = bulkDistributions.map(d => ({ ...d, type: 'bulk' }));
    return [...individual, ...bulk].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [distributions, bulkDistributions]);

  // Filter distributions based on search query
  const filteredAllDistributions = useMemo(() => {
    return allDistributions.filter(dist => {
      const search = distributionSearch.toLowerCase();
      const itemName = dist.item?.item_name?.toLowerCase() || '';
      const teacherName = dist.teacher?.full_name?.toLowerCase() || '';
      const controlNo = dist.control_no?.toLowerCase() || '';
      const groupName = dist.group?.group_name?.toLowerCase() || '';
      
      return itemName.includes(search) || 
             teacherName.includes(search) || 
             controlNo.includes(search) ||
             groupName.includes(search);
    });
  }, [allDistributions, distributionSearch]);

  // React Query - Distribution Requests
  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ['distribution-requests', { status: requestStatus }],
    queryFn: async () => {
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
      return {
        requests: reqRes.data.data,
        stats: statsRes.data.data
      };
    },
  });

  const distributionRequests = requestsData?.requests || [];
  const distributionRequestStats = requestsData?.stats;

  // Filter requests based on search query
  const filteredRequests = useMemo(() => {
    return distributionRequests.filter((req: any) => {
      const search = requestSearch.toLowerCase();
      const itemName = req.item?.item_name?.toLowerCase() || '';
      const teacherName = req.teacher?.full_name?.toLowerCase() || '';
      const controlNo = req.control_no?.toLowerCase() || '';
      
      return itemName.includes(search) || 
             teacherName.includes(search) || 
             controlNo.includes(search);
    });
  }, [distributionRequests, requestSearch]);

  const loading = loadingTeachers || loadingGroups || loadingDistributions || loadingRequests;

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/distribution`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          all: true,
          search: debouncedSearch,
          department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          group_id: selectedGroup || undefined
        }
      });

      const dataToExport = response.data.data;
      if (!dataToExport || dataToExport.length === 0) {
        toast.error("No data to export");
        return;
      }

      const csvLines = ["DISTRIBUTION LIST EXPORT", `Generated: ${new Date().toLocaleString()}`, `Total Records: ${dataToExport.length}`, "", ""];
      const headers = ["No.", "Employee ID", "Full Name", "Email", "Phone", "Department", "Status"];
      csvLines.push(headers.join(","));
      
      dataToExport.forEach((teacher: any, index: number) => {
        csvLines.push([index + 1, teacher.employee_id, teacher.full_name, teacher.email, teacher.phone, teacher.department, teacher.status].join(","));
      });
      
      const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Distribution_List_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(t => t.id));
    }
  };

  const handleSelectTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleGroupCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['distribution-groups'] });
    setShowCreateGroupModal(false);
  };

  const handleReturnDistribution = (distribution: ItemDistribution) => {
    setSelectedDistribution(distribution);
    setShowReturnModal(true);
  };

  const handleCancelDistribution = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/distributions/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Cancelled");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Failed");
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

  const getStatusBadge = (status: string, isOverdue: boolean = false) => {
    if (isOverdue) return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    const variants: Record<string, any> = {
      active: <Badge className="bg-blue-100 text-blue-800">Active</Badge>,
      returned: <Badge className="bg-green-100 text-green-800">Returned</Badge>,
      cancelled: <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>,
      damaged: <Badge className="bg-orange-100 text-orange-800">Damaged</Badge>,
      lost: <Badge className="bg-red-100 text-red-800">Lost</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const handleViewGroup = (group: DistributionGroup) => {
    setSelectedGroupData(group);
    setShowViewGroupModal(true);
  };

  const handleManageMembers = (group: DistributionGroup) => {
    setSelectedGroupData(group);
    setShowManageMembersModal(true);
  };

  const handleReportDamaged = async (dist: ItemDistribution) => {
    if (!confirm("Report this item as damaged?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/distributions/${dist.id}/damaged`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Item reported as damaged");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleReportLost = async (dist: ItemDistribution) => {
    if (!confirm("Report this item as lost?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/distributions/${dist.id}/lost`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Item reported as lost");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleProcessBulkDistribution = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions/${id}/process`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Bulk distribution processed");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Failed to process");
    }
  };

  const fetchDistributionRequests = () => {
    queryClient.invalidateQueries({ queryKey: ['distribution-requests'] });
  };

  const fetchData = () => {
    queryClient.invalidateQueries({ queryKey: ['distribution-stats'] });
    queryClient.invalidateQueries({ queryKey: ['distribution-teachers'] });
    queryClient.invalidateQueries({ queryKey: ['distribution-groups'] });
  };

  const fetchDistributions = () => {
    queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
  };


  if (!statsData) {
    return <DashboardSkeleton />;
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
            Export
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
            <div className="text-2xl font-bold text-purple-600">{groupPagination.total}</div>
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
                    {allGroups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.group_name} ({group.teachers_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {teachers.length} of {teacherPagination.total} teachers
                  {selectedTeachers.length > 0 && ` • ${selectedTeachers.length} selected`}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedTeachers.length === teachers.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Grid */}
          {loadingTeachers ? (
            <TableSkeleton rows={6} cols={1} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
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
          )}

          {teachers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </CardContent>
            </Card>
          )}

          {/* Teacher Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              disabled={teacherPagination.currentPage === 1}
              onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: 1 }))}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={teacherPagination.currentPage === 1}
              onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              Page {teacherPagination.currentPage} of {teacherPagination.lastPage}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={teacherPagination.currentPage === teacherPagination.lastPage}
              onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={teacherPagination.currentPage === teacherPagination.lastPage}
              onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: teacherPagination.lastPage }))}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Distribution Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          {loadingGroups ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <TableSkeleton key={i} rows={4} cols={1} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
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
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{group.teachers_count} members</span>
                    </div>
                    <Badge variant="outline">{group.group_type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewGroup(group);
                      }}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManageMembers(group);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]"
                    >
                      Manage Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Group Pagination */}
          {groupPagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={groupPagination.currentPage === 1}
                onClick={() => setGroupPagination(prev => ({ ...prev, currentPage: 1 }))}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={groupPagination.currentPage === 1}
                onClick={() => setGroupPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                Page {groupPagination.currentPage} of {groupPagination.lastPage}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={groupPagination.currentPage === groupPagination.lastPage}
                onClick={() => setGroupPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={groupPagination.currentPage === groupPagination.lastPage}
                onClick={() => setGroupPagination(prev => ({ ...prev, currentPage: groupPagination.lastPage }))}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
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

                  <Select value={distributionStatus} onValueChange={(v) => setDistributionStatus(v)}>
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

                <div className="flex gap-2">
                                    <Button onClick={() => setShowCreateDistributionModal(true)} className="gap-2 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7]">
                    <Plus className="w-4 h-4" />
                    Distribute Item
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-4">
                Showing {filteredAllDistributions.length} of {allDistributions.length} distributions ({distributions.length} individual, {bulkDistributions.length} bulk)
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Control No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingDistributions ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8">
                          <TableSkeleton rows={8} cols={10} />
                        </td>
                      </tr>
                    ) : filteredAllDistributions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
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
                      filteredAllDistributions.map((dist) => (
                        <tr key={`${dist.type}-${dist.id}`} className="hover:bg-gray-50">
                          {/* Control No. Column */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {dist.type === 'bulk' ? `BD-${dist.id.toString().padStart(6, '0')}` : `ID-${dist.id.toString().padStart(6, '0')}`}
                            </div>
                            <Badge variant={dist.type === 'bulk' ? 'default' : 'secondary'} className="mt-1">
                              {dist.type === 'bulk' ? 'Bulk' : 'Individual'}
                            </Badge>
                          </td>
                          
                          {/* Date Column */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(dist.distribution_date).toLocaleDateString()}
                          </td>
                          
                          {/* Item Details Column */}
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dist.item?.item_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{dist.item?.item_code || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{dist.item?.category || 'N/A'}</div>
                            </div>
                          </td>
                          
                          {/* Recipient Column */}
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {dist.type === 'individual' ? dist.teacher?.full_name : dist.group?.group_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dist.type === 'individual' ? dist.teacher?.department : `${dist.group?.teachers_count} members`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {dist.type === 'individual' ? 'Teacher' : 'Group'}
                              </div>
                            </div>
                          </td>
                          
                          {/* Quantity Column */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">
                              {dist.type === 'individual' ? dist.quantity_distributed : `${dist.total_quantity} total`}
                            </div>
                            {dist.type === 'bulk' && (
                              <div className="text-xs text-gray-500">{dist.quantity_per_member}/member</div>
                            )}
                            <div className="text-xs text-gray-400">units</div>
                          </td>
                          
                          {/* Condition Column */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className={
                              dist.condition_on_distribution === 'excellent' ? 'bg-green-100 text-green-800' :
                              dist.condition_on_distribution === 'good' ? 'bg-blue-100 text-blue-800' :
                              dist.condition_on_distribution === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {dist.condition_on_distribution || 'Good'}
                            </Badge>
                          </td>
                          
                          {/* Purpose Column */}
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={dist.purpose || 'N/A'}>
                              {dist.purpose || 'N/A'}
                            </div>
                          </td>
                          
                          {/* Issued By Column */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {dist.distributed_by_admin?.name || 'Admin'}
                            </div>
                            <div className="text-xs text-gray-500">Property Custodian</div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(dist.status, (dist as any).is_overdue)}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {dist.type === 'individual' && dist.status === 'active' && (
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
                                    onClick={() => handleReportDamaged(dist)}
                                    className="text-orange-600 hover:text-orange-700"
                                  >
                                    Damaged
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReportLost(dist)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Lost
                                  </Button>
                                </>
                              )}
                              {dist.type === 'bulk' && dist.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.location.href = `/admin/bulk-distributions`}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleProcessBulkDistribution(dist.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Process
                                  </Button>
                                </>
                              )}
                              {dist.type === 'bulk' && dist.status === 'processing' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.location.href = `/admin/bulk-distributions`}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  View Details
                                </Button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingRequests ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8">
                          <TableSkeleton rows={5} cols={6} />
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No distribution requests found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{req.item?.item_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{req.item?.item_code || 'N/A'}</div>
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
            setShowViewRequestModal(false);
            setSelectedRequest(null);
            queryClient.invalidateQueries({ queryKey: ['distribution-requests'] });
            queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
          }}
        />
      )}

      
      {showManageMembersModal && selectedGroupData && (
        <ManageGroupMembersModal
          isOpen={showManageMembersModal}
          onClose={() => {
            setShowManageMembersModal(false);
            setSelectedGroupData(null);
          }}
          onSuccess={() => {
            setShowManageMembersModal(false);
            setSelectedGroupData(null);
            setShowManageMembersModal(false);
            setSelectedGroupData(null);
            queryClient.invalidateQueries({ queryKey: ['distribution-groups'] });
            queryClient.invalidateQueries({ queryKey: ['distribution-teachers'] });
          }}
          group={selectedGroupData}
        />
      )}
    </div>
  );
}

const normalizeApiArray = (response: any) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  return [];
};
