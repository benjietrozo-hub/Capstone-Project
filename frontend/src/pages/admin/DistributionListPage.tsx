
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeleton, DashboardSkeleton } from "../../components/common/Skeleton";
import { Search, Download, Users, Users2, Filter, Plus, Mail, Phone, Building2, UserCheck, UserX, Package, Calendar, AlertCircle, CheckCircle, XCircle, Eye, Clock, ClipboardList, Printer, Archive, ShieldCheck, TrendingUp, ArrowUpRight, Layers, Settings } from "lucide-react";


import { adminAPI } from "../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import CreateGroupModal from "@/components/admin/CreateGroupModal";
import ViewGroupModal from "@/components/admin/ViewGroupModal";
import ManageGroupMembersModal from "@/components/admin/ManageGroupMembersModal";
import CreateDistributionModal from "@/components/admin/CreateDistributionModal";
import ReturnDistributionModal from "@/components/admin/ReturnDistributionModal";
import ViewDistributionRequestModal from "@/components/admin/ViewDistributionRequestModal";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";

// Normalize any API response shape into a plain array
const normalizeApiArray = (response: any): any[] => {
  if (!response) return [];
  // Plain array
  if (Array.isArray(response)) return response;
  // { success, data: { data: [...] } }  — paginated wrapped
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
  // { success, data: [...] }  — plain wrapped
  if (response?.data && Array.isArray(response.data)) return response.data;
  // { data: [...] }  — paginator root
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

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

  // Verification Modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'group' | 'distribution', data: any } | null>(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();

  // React Query - Statistics and Departments
  const { data: statsData } = useQuery({
    queryKey: ['distribution-stats'],
    queryFn: async () => {
      const [statsRes, deptRes, allGroupsRes] = await Promise.all([
        adminAPI.getDistributionStatistics(),
        adminAPI.getDistributionDepartments(),
        adminAPI.getDistributionGroups({ all: true })
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
      const response = await adminAPI.getDistributionTeachers({
        page: teacherPagination.currentPage,
        per_page: teacherPagination.perPage,
        search: debouncedSearch,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        group_id: selectedGroup || undefined
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
      const response = await adminAPI.getDistributionGroups({
        page: groupPagination.currentPage,
        per_page: groupPagination.perPage
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
      const [distRes, bulkDistRes, statsRes] = await Promise.all([
        adminAPI.getDistributions({ status: distributionStatus !== 'all' ? distributionStatus : undefined }),
        adminAPI.getBulkDistributions({ status: distributionStatus !== 'all' ? distributionStatus : undefined }),
        adminAPI.getDistributionCoreStats()
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
      const itemName = dist.category?.category_name?.toLowerCase() || dist.item?.item_name?.toLowerCase() || '';
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
      const [reqRes, statsRes] = await Promise.all([
        adminAPI.getDistributionRequests({ status: requestStatus !== 'all' ? requestStatus : undefined }),
        adminAPI.getDistributionRequestStats()
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
      const itemName = req.category?.category_name?.toLowerCase() || req.item?.item_name?.toLowerCase() || '';
      const teacherName = req.teacher?.full_name?.toLowerCase() || '';
      const controlNo = req.control_no?.toLowerCase() || '';
      
      return itemName.includes(search) || 
             teacherName.includes(search) || 
             controlNo.includes(search);
    });
  }, [distributionRequests, requestSearch]);

  const loading = loadingTeachers || loadingGroups || loadingDistributions || loadingRequests;

  const handlePrintDistributions = () => {
    if (filteredAllDistributions.length === 0) {
      toast.error("No data to print");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = filteredAllDistributions.map((dist, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${dist.type === 'bulk' ? `BD-${dist.id}` : `ID-${dist.id}`}</td>
        <td>${new Date(dist.distribution_date).toLocaleDateString()}</td>
        <td>
          <strong>${dist.category?.category_name || dist.item?.item_name || 'N/A'}</strong><br/>
          <small>${dist.category?.category_code || dist.item?.item_code || ''}</small>
        </td>
        <td>
          ${dist.type === 'individual' ? dist.teacher?.full_name : dist.group?.group_name}<br/>
          <small>${dist.type === 'individual' ? dist.teacher?.department : 'Group'}</small>
        </td>
        <td>${dist.type === 'individual' ? dist.quantity_distributed : dist.total_quantity}</td>
        <td>${dist.condition_on_distribution || 'Good'}</td>
        <td>${dist.status}</td>
        <td style="border-bottom: 1px solid #ccc; width: 100px;"></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Equipment Distribution Report - OIMS</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0063F7; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #0063F7; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { bg-color: #f8f9fa; font-weight: bold; text-transform: uppercase; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sig-block { text-align: center; width: 200px; }
            .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OFFICE INVENTORY MANAGEMENT SYSTEM</h1>
            <p><strong>EQUIPMENT DISTRIBUTION REPORT</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Control No</th>
                <th>Date</th>
                <th>Item Details</th>
                <th>Recipient</th>
                <th>Qty</th>
                <th>Cond.</th>
                <th>Status</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <div class="sig-block">
              <div class="sig-line">Prepared By</div>
              <p>Property Custodian</p>
            </div>
            <div class="sig-block">
              <div class="sig-line">Verified By</div>
              <p>School Administrator</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExport = async () => {

    try {
      const response = await adminAPI.getDistributionTeachers({
        all: true,
        search: debouncedSearch,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        group_id: selectedGroup || undefined
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
    if (!confirm("Are you sure you want to cancel this distribution?")) return;
    try {
      await adminAPI.cancelDistribution(id);
      toast.success("Distribution cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel distribution");
    }
  };

  const handleViewRequest = (request: DistributionRequest) => {
    setSelectedRequest(request);
    setShowViewRequestModal(true);
  };

  const getRequestStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>,
      approved: <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>,
      rejected: <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>,
      distributed: <Badge className="bg-blue-100 text-blue-800 border-blue-200">Distributed</Badge>,
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const getStatusBadge = (status: string, isOverdue: boolean = false) => {
    if (isOverdue) return <Badge className="bg-red-100 text-red-800 border-red-200 font-bold px-3 py-1 animate-pulse">Overdue</Badge>;
    const variants: Record<string, any> = {
      active: <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1">Active</Badge>,
      returned: <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1">Returned</Badge>,
      cancelled: <Badge className="bg-slate-50 text-slate-500 border-slate-100 font-bold px-3 py-1">Cancelled</Badge>,
      damaged: <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold px-3 py-1">Damaged</Badge>,
      lost: <Badge className="bg-red-50 text-red-700 border-red-100 font-bold px-3 py-1">Lost</Badge>,
    };
    return variants[status] || <Badge className="font-bold px-3 py-1">{status}</Badge>;
  };

  const handleViewGroup = (group: DistributionGroup) => {
    setSelectedGroupData(group);
    setShowViewGroupModal(true);
  };

  const handleManageMembers = (group: DistributionGroup) => {
    setSelectedGroupData(group);
    setShowManageMembersModal(true);
  };
  
  const handleVerifyAndExecute = async () => {
    if (!verifyPassword) {
      toast.error("Administrative authorization required");
      return;
    }

    try {
      setVerifying(true);
      await adminAPI.verifyPassword(verifyPassword);
      
      if (!pendingAction) return;

      if (pendingAction.type === 'group') {
        const group = pendingAction.data;
        await adminAPI.deleteDistributionGroup(group.id);
        toast.success("Distribution group archived");
        queryClient.invalidateQueries({ queryKey: ['distribution-groups'] });
      } else if (pendingAction.type === 'distribution') {
        const dist = pendingAction.data;
        // Assuming archive means delete here based on original code
        await adminAPI.cancelDistribution(dist.id); 
        toast.success("Distribution record moved to archive");
        queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
      }

      setShowVerifyModal(false);
      setVerifyPassword('');
      setPendingAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authorization failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleArchiveGroup = (group: DistributionGroup) => {
    setPendingAction({ type: 'group', data: group });
    setShowVerifyModal(true);
  };

  const handleArchiveDistribution = (dist: ItemDistribution) => {
    setPendingAction({ type: 'distribution', data: dist });
    setShowVerifyModal(true);
  };

  const handleReportDamaged = async (dist: ItemDistribution) => {
    toast.info("Updating asset condition...");
    try {
      await adminAPI.reportDamagedDistribution(dist.id);
      toast.success("Asset reported as damaged");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Condition update failed");
    }
  };

  const handleReportLost = async (dist: ItemDistribution) => {
    toast.info("Updating asset status...");
    try {
      await adminAPI.reportLostDistribution(dist.id);
      toast.success("Asset reported as lost");
      queryClient.invalidateQueries({ queryKey: ['item-distributions'] });
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  if (!statsData && loadingTeachers) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-10">
      <NavHeader 
        title="Distribution Hub" 
        subtitle="Centralized management for personnel allocations"
        showBackButton={false}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-4 md:p-10 space-y-6 md:space-y-10 max-w-[1600px] mx-auto">
        {/* Premium Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded shadow-lg shadow-blue-200">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Distribution Hub</h1>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Centralized management for personnel allocations and group distributions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="w-full sm:w-auto h-12 px-6 rounded border-slate-200 bg-white hover:bg-slate-50 font-bold transition-all gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Data
          </Button>
          <Button 
            onClick={() => setShowCreateGroupModal(true)} 
            className="w-full sm:w-auto h-12 px-8 rounded bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Premium Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Personnel', value: statistics?.total_teachers || 0, icon: Users, color: 'blue', sub: 'Verified across all depts' },
          { label: 'Active Roster', value: statistics?.active_teachers || 0, icon: UserCheck, color: 'emerald', sub: 'Eligible for distribution' },
          { label: 'Pending Requests', value: distributionRequestStats?.pending_requests || 0, icon: Clock, color: 'amber', sub: 'Awaiting admin review' },
          { label: 'Active Channels', value: groupPagination.total, icon: Building2, color: 'purple', sub: 'Distribution groups' }
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            <div className="relative flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">{stat.label}</span>
                <div className="flex items-center gap-3">
                  <h3 className="text-4xl font-black text-slate-900 leading-none">{stat.value}</h3>
                  <div className={`p-1.5 bg-${stat.color}-50 rounded`}>
                    <TrendingUp className={`w-4 h-4 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1">
                  {stat.sub}
                  <ArrowUpRight className="w-3 h-3" />
                </p>
              </div>
              <div className={`p-4 bg-${stat.color}-50 rounded-[20px] text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Interactive Interface */}
      <Tabs defaultValue="all" className="space-y-6 md:space-y-8">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="h-auto md:h-16 p-2 bg-slate-100 rounded-[24px] border border-slate-200 flex sm:inline-flex w-full sm:w-auto min-w-max">
            {[
              { value: 'all', label: 'Personnel', icon: Users },
              { value: 'groups', label: 'Groups', icon: Layers },
              { value: 'distributions', label: 'Distributions', icon: Package },
              { value: 'requests', label: 'Requests', icon: ClipboardList }
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-1 sm:flex-none px-4 md:px-8 py-3 md:h-full rounded-[18px] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-black text-slate-500 gap-2 md:gap-3 transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Personnel Directory Tab */}
        <TabsContent value="all" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="relative md:col-span-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search personnel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 rounded border-slate-200 bg-slate-50/50 shadow-inner focus:bg-white"
                  />
                </div>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="h-14 rounded border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Global Directory</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-14 rounded border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Roster Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Verified Active</SelectItem>
                    <SelectItem value="inactive">Currently Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGroup?.toString() || "all"} onValueChange={(v) => setSelectedGroup(v === "all" ? null : parseInt(v))}>
                  <SelectTrigger className="h-14 rounded border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Filter by Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {allGroups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loadingTeachers ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-48 bg-slate-50 rounded-[32px] animate-pulse" />)}
                </div>
              ) : teachers.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Zero personnel matched</h3>
                  <p className="text-slate-400 mt-2">Refine your search parameters to find results</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="group p-6 bg-white border border-slate-100 rounded-[32px] hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 rounded flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <span className="text-lg font-black text-slate-400 group-hover:text-blue-600">{teacher.full_name.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{teacher.full_name}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {teacher.employee_id}</p>
                          </div>
                        </div>
                        <Badge className={`${teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'} font-black px-3 py-1 rounded-sm`}>
                          {teacher.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded group-hover:bg-white group-hover:border-slate-100 border border-transparent transition-all">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded group-hover:bg-white group-hover:border-slate-100 border border-transparent transition-all">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{teacher.department}</span>
                        </div>
                      </div>

                      {teacher.active_borrows_count > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-black text-slate-800">{teacher.active_borrows_count} Items Assigned</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination UI */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  Record {((teacherPagination.currentPage - 1) * 12) + 1} - {Math.min(teacherPagination.currentPage * 12, teacherPagination.total)} of {teacherPagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-sm border-slate-200" disabled={teacherPagination.currentPage === 1} onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-1 px-4">
                    <span className="text-sm font-black text-slate-900">{teacherPagination.currentPage}</span>
                    <span className="text-sm font-bold text-slate-400">/</span>
                    <span className="text-sm font-bold text-slate-400">{teacherPagination.lastPage}</span>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-sm border-slate-200" disabled={teacherPagination.currentPage === teacherPagination.lastPage} onClick={() => setTeacherPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Groups Tab */}
        <TabsContent value="groups" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingGroups ? (
              [1, 2, 3].map(n => <div key={n} className="h-64 bg-slate-100 rounded-[40px] animate-pulse" />)
            ) : groups.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <Layers className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900">No Distribution Groups</h3>
                <p className="text-slate-400 mt-2">Initialize a new group to start collective distributions</p>
                <Button onClick={() => setShowCreateGroupModal(true)} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-12 rounded">Create First Group</Button>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="group bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden flex flex-col">
                  <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-slate-50 rounded-sm group-hover:bg-blue-50 transition-colors">
                        <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <Badge className={`${group.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'} font-black px-3 h-7`}>
                        {group.is_active ? 'ACTIVE CHANNEL' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{group.group_name}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px]">{group.description || 'No descriptive metadata provided for this distribution channel.'}</p>
                  </div>
                  
                  <div className="px-8 py-6 bg-slate-50/50 border-y border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Verified Members</span>
                      <span className="text-xl font-black text-slate-800">{group.teachers_count} Personnel</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Channel Type</span>
                      <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{group.group_type}</span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-3 bg-white">
                    <Button onClick={() => handleViewGroup(group)} variant="outline" className="h-12 rounded border-slate-100 font-bold hover:bg-slate-50 text-slate-600">View Roster</Button>
                    <Button onClick={() => handleManageMembers(group)} className="h-12 rounded bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg">Manage</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Active Distributions Tab */}
        <TabsContent value="distributions" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Distribution Ledger</CardTitle>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time allocation tracking</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Filter records..." 
                    value={distributionSearch}
                    onChange={(e) => setDistributionSearch(e.target.value)}
                    className="pl-10 h-11 rounded-sm border-slate-100 bg-slate-50" 
                  />
                </div>
                <Select value={distributionStatus} onValueChange={setDistributionStatus}>
                  <SelectTrigger className="w-[160px] h-11 rounded-sm border-slate-100 bg-slate-50">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="rounded-sm border border-slate-100 overflow-hidden bg-white shadow-inner">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Allocated On</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loadingDistributions ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-300 italic">Accessing ledger...</td></tr>
                    ) : distributions.length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic font-bold">No distribution records found</td></tr>
                    ) : (
                      distributions.map((dist) => (
                        <tr key={dist.id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                {dist.category?.category_name || dist.item?.item_name || '—'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                {dist.category?.category_code || dist.item?.item_code || `ID #${dist.id}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{dist.teacher?.full_name || '—'}</span>
                              <span className="text-xs font-medium text-slate-400">{dist.teacher?.department || ''}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-black h-7 px-3">{dist.quantity_distributed}</Badge>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-600">{new Date(dist.distribution_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {dist.expected_return_date && (
                                <span className="text-[10px] font-black text-slate-400 uppercase mt-0.5">Due: {new Date(dist.expected_return_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {getStatusBadge(dist.status)}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {dist.status === 'active' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedDistribution(dist); setShowReturnModal(true); }} className="h-9 rounded-sm border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold">Process Return</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleReportDamaged(dist)} className="h-9 w-9 rounded-sm p-0 text-slate-300 hover:text-orange-600 hover:bg-orange-50" title="Report Damaged"><XCircle className="w-4 h-4" /></Button>
                                </>
                              )}
                              {['returned', 'cancelled', 'lost'].includes(dist.status) && (
                                <Button size="sm" variant="ghost" onClick={() => handleArchiveDistribution(dist)} className="h-9 w-9 rounded-sm p-0 text-slate-300 hover:text-red-600 hover:bg-red-50" title="Archive Record"><Archive className="w-4 h-4" /></Button>
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

        {/* Incoming Requests Tab */}
        <TabsContent value="requests" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">Personnel Requests</CardTitle>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Pending allocation requests from faculty</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search requests..." 
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="pl-10 h-11 rounded-sm border-slate-100 bg-slate-50" 
                    />
                  </div>
                  <Select value={requestStatus} onValueChange={setRequestStatus}>
                    <SelectTrigger className="w-[160px] h-11 rounded-sm border-slate-100 bg-slate-50">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Global Queue</SelectItem>
                      <SelectItem value="pending">Awaiting Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-amber-50 rounded border border-amber-100 flex flex-col">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Awaiting Review</span>
                  <span className="text-xl font-black text-amber-900">{distributionRequestStats?.pending_requests || 0}</span>
                </div>
                <div className="p-4 bg-emerald-50 rounded border border-emerald-100 flex flex-col">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Approved Cases</span>
                  <span className="text-xl font-black text-emerald-900">{distributionRequestStats?.approved_requests || 0}</span>
                </div>
                <div className="p-4 bg-blue-50 rounded border border-blue-100 flex flex-col">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Active Distributions</span>
                  <span className="text-xl font-black text-blue-900">{distributionRequestStats?.distributed_requests || 0}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Queue</span>
                  <span className="text-xl font-black text-slate-900">{distributionRequestStats?.total_requests || 0}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 pt-0">
               <div className="rounded-sm border border-slate-100 overflow-hidden bg-white shadow-inner">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Requested Item</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Req. Qty</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Request Date</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loadingRequests ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-300 italic">Syncing request queue...</td></tr>
                    ) : distributionRequests.length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic font-bold">The request queue is currently empty</td></tr>
                    ) : (
                      distributionRequests.map((req) => (
                        <tr key={req.id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{req.item?.item_name || 'Personnel Equipment'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{req.item?.item_code || 'CAT-GEN-00'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{req.teacher.full_name}</span>
                              <span className="text-xs font-medium text-slate-400">{req.teacher.department}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-black h-7 px-3">{req.quantity_requested}</Badge>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-500">
                            {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-5">
                            {getRequestStatusBadge(req.status)}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Button size="sm" onClick={() => handleViewRequest(req)} className="h-10 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 shadow-md transition-all active:scale-95">Review Request</Button>
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

      {/* Global Application Modals */}
      {showCreateGroupModal && (
        <CreateGroupModal teachers={teachers} onClose={() => setShowCreateGroupModal(false)} onSuccess={handleGroupCreated} />
      )}

      {showViewGroupModal && selectedGroupData && (
        <ViewGroupModal group={selectedGroupData} onClose={() => { setShowViewGroupModal(false); setSelectedGroupData(null); }} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['distribution-groups'] })} />
      )}

      {showCreateDistributionModal && (
        <CreateDistributionModal onClose={() => setShowCreateDistributionModal(false)} onSuccess={() => { setShowCreateDistributionModal(false); queryClient.invalidateQueries({ queryKey: ['item-distributions'] }); }} />
      )}

      {showReturnModal && selectedDistribution && (
        <ReturnDistributionModal distribution={selectedDistribution} onClose={() => { setShowReturnModal(false); setSelectedDistribution(null); }} onSuccess={() => { setShowReturnModal(false); setSelectedDistribution(null); queryClient.invalidateQueries({ queryKey: ['item-distributions'] }); }} />
      )}

      {showViewRequestModal && selectedRequest && (
        <ViewDistributionRequestModal request={selectedRequest} onClose={() => { setShowViewRequestModal(false); setSelectedRequest(null); }} onSuccess={() => { setShowViewRequestModal(false); setSelectedRequest(null); queryClient.invalidateQueries({ queryKey: ['distribution-requests'] }); queryClient.invalidateQueries({ queryKey: ['item-distributions'] }); queryClient.invalidateQueries({ queryKey: ['request-stats'] }); }} />
      )}
      
      {showManageMembersModal && selectedGroupData && (
        <ManageGroupMembersModal isOpen={showManageMembersModal} onClose={() => { setShowManageMembersModal(false); setSelectedGroupData(null); }} onSuccess={() => { setShowManageMembersModal(false); setSelectedGroupData(null); queryClient.invalidateQueries({ queryKey: ['distribution-groups'] }); }} group={selectedGroupData} />
      )}

      {/* High-Fidelity Security Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 rounded-[40px] border-none overflow-hidden">
            <div className="bg-gradient-to-br from-red-600 to-rose-700 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="w-20 h-20 bg-white/20 rounded-[32px] backdrop-blur-xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Access Authorization</h2>
              <p className="text-white/70 text-sm font-medium mt-2">Administrative credentials required for archival</p>
            </div>
            <CardContent className="p-10 space-y-8 bg-white">
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Verify Password</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={verifyPassword} 
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder="Enter security token..."
                    className="h-14 rounded border-slate-200 bg-slate-50 focus:bg-white text-lg shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndExecute()}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded">
                    <Settings className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => { setShowVerifyModal(false); setVerifyPassword(''); setPendingAction(null); }} className="flex-1 h-14 rounded font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50">Cancel</Button>
                <Button 
                  onClick={handleVerifyAndExecute} 
                  disabled={verifying}
                  className="flex-[2] h-14 rounded bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  {verifying ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Archive"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
