import { useState, useEffect } from "react";
import { 
  Search, Users, Package, Calendar, CheckCircle, XCircle, 
  Clock, AlertCircle, Eye, Play, X, Filter, ChevronRight, 
  ArrowUpRight, Info, Settings, ShieldCheck, TrendingUp, Layers, Archive
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CreateDistributionModal from "@/components/admin/CreateDistributionModal";
import { Label } from "@/components/ui/label";

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

interface BulkDistributionStats {
  total_distributions: number;
  pending_distributions: number;
  processing_distributions: number;
  completed_distributions: number;
  cancelled_distributions: number;
  total_items_distributed: number;
}

export default function BulkDistributionsPage() {
  const [distributions, setDistributions] = useState<BulkDistribution[]>([]);
  const [stats, setStats] = useState<BulkDistributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<BulkDistribution | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Security verification for cancellation/archival
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchDistributions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDistributions();
  }, [statusFilter, groupFilter]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (groupFilter !== "all") params.group_id = groupFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setDistributions(response.data.data.data || response.data.data);
    } catch (error: any) {
      console.error("Error fetching bulk distributions:", error);
      toast.error("Cloud sync failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/bulk-distributions/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleProcessDistribution = async (id: number) => {
    toast.info("Initializing allocation pipeline...");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/bulk-distributions/${id}/process`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bulk allocation completed successfully");
      fetchDistributions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Pipeline execution failed");
    }
  };

  const triggerCancelWorkflow = (id: number) => {
    setPendingActionId(id);
    setShowVerifyModal(true);
  };

  const handleCancelExecution = async () => {
    if (!verifyPassword) {
      toast.error("Administrative authorization required");
      return;
    }

    try {
      setVerifying(true);
      const token = localStorage.getItem("token");
      
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/verify-password`, 
        { password: verifyPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (pendingActionId) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/bulk-distributions/${pendingActionId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Bulk distribution archived");
        fetchDistributions();
        fetchStats();
      }

      setShowVerifyModal(false);
      setVerifyPassword('');
      setPendingActionId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authorization failed");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, JSX.Element> = {
      pending: <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black px-3 h-7">PENDING</Badge>,
      processing: <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black px-3 h-7 animate-pulse">PROCESSING</Badge>,
      completed: <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 h-7">COMPLETED</Badge>,
      cancelled: <Badge className="bg-slate-50 text-slate-400 border-slate-100 font-black px-3 h-7">ARCHIVED</Badge>,
    };
    return variants[status] || <Badge className="font-black px-3 h-7">{status.toUpperCase()}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-5 h-5 text-amber-500" />,
      processing: <Play className="w-5 h-5 text-blue-500" />,
      completed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      cancelled: <XCircle className="w-5 h-5 text-slate-400" />,
    };
    return icons[status] || <Clock className="w-5 h-5" />;
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesSearch = searchQuery === "" || 
      d.item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && !distributions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Distribution Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bulk Distributions</h1>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Coordinated asset allocation for personnel groups and departments
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="h-14 px-8 rounded-[20px] bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200 transition-all active:scale-95 gap-3"
        >
          <Users className="w-5 h-5" />
          Initiate Bulk Distribution
        </Button>
      </div>

      {/* Premium Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[
            { label: 'Total Operations', value: stats.total_distributions, icon: Package, color: 'blue', sub: 'Historical records' },
            { label: 'Pending Cycle', value: stats.pending_distributions, icon: Clock, color: 'amber', sub: 'Awaiting execution' },
            { label: 'In Progress', value: stats.processing_distributions, icon: Play, color: 'blue', sub: 'Active allocation' },
            { label: 'Finalized', value: stats.completed_distributions, icon: CheckCircle, color: 'emerald', sub: 'Successful cycles' },
            { label: 'Archived', value: stats.cancelled_distributions, icon: XCircle, color: 'slate', sub: 'Cancelled operations' },
            { label: 'Units Deployed', value: stats.total_items_distributed, icon: TrendingUp, color: 'purple', sub: 'Total items moved' }
          ].map((stat, i) => (
            <div key={i} className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-200" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{stat.label}</span>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Interface */}
      <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by asset identifier or target group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 rounded-2xl border-slate-200 bg-slate-50/50 shadow-inner focus:bg-white text-lg font-medium"
              />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[220px] h-16 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                  <SelectValue placeholder="Pipeline Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">Global Lifecycle</SelectItem>
                  <SelectItem value="pending">Awaiting Review</SelectItem>
                  <SelectItem value="processing">Active Cycle</SelectItem>
                  <SelectItem value="completed">Finalized</SelectItem>
                  <SelectItem value="cancelled">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            <Info className="w-4 h-4" />
            Showing {filteredDistributions.length} synchronized records
          </div>
        </CardContent>
      </Card>

      {/* Distribution Registry */}
      <div className="grid grid-cols-1 gap-6">
        {filteredDistributions.length === 0 ? (
          <Card className="rounded-[40px] border-slate-100 border-dashed bg-slate-50/50">
            <CardContent className="py-24 text-center">
              <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mx-auto mb-8 border border-slate-100">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Registry Entry Empty</h3>
              <p className="text-slate-400 mt-2 font-medium">No bulk distributions match your current filtered parameters.</p>
              <Button onClick={() => setShowCreateModal(true)} variant="outline" className="mt-8 rounded-2xl h-12 px-8 border-slate-200 font-black">Initiate New Operation</Button>
            </CardContent>
          </Card>
        ) : (
          filteredDistributions.map((distribution) => (
            <div key={distribution.id} className="group bg-white border border-slate-100 rounded-[40px] p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${distribution.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : distribution.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} transition-colors group-hover:scale-105 duration-500`}>
                      <Package className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{distribution.item.item_name}</h3>
                        {getStatusBadge(distribution.status)}
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{distribution.item.item_code} • {distribution.item.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Channel</span>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{distribution.group.group_name}</span>
                        <Badge variant="outline" className="text-[10px] h-5 rounded-lg border-slate-100">{distribution.group.teachers_count} Members</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation Matrix</span>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>{distribution.total_quantity} Total Units</span>
                        <span className="text-xs text-slate-400 font-medium">({distribution.quantity_per_member} per unit)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle Timeline</span>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(distribution.distribution_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto xl:pl-8 xl:border-l border-slate-100">
                  <Button
                    variant="outline"
                    className="flex-1 xl:flex-none h-14 w-14 rounded-2xl border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    onClick={() => {
                      setSelectedDistribution(distribution);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="w-6 h-6" />
                  </Button>
                  
                  {distribution.status === 'pending' && (
                    <Button
                      className="flex-[2] xl:flex-none h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 gap-3"
                      onClick={() => handleProcessDistribution(distribution.id)}
                    >
                      <Play className="w-5 h-5" />
                      Execute Cycle
                    </Button>
                  )}
                  
                  {['pending', 'processing'].includes(distribution.status) && (
                    <Button
                      variant="outline"
                      className="flex-1 xl:flex-none h-14 w-14 rounded-2xl border-slate-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      onClick={() => triggerCancelWorkflow(distribution.id)}
                    >
                      <Archive className="w-6 h-6" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal Entry */}
      {showCreateModal && (
        <CreateDistributionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDistributions();
            fetchStats();
          }}
        />
      )}

      {/* Premium Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-10 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Cycle Intelligence</h2>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Reference ID: BD-{selectedDistribution.id.toString().padStart(6, '0')}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDetailsModal(false)}
                className="relative z-10 h-12 w-12 rounded-2xl text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Asset Metadata
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Operation Status</span>
                      {getStatusBadge(selectedDistribution.status)}
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Item Identity</span>
                      <span className="text-sm font-black text-slate-900">{selectedDistribution.item.item_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Global Category</span>
                      <Badge variant="outline" className="font-black border-slate-100 uppercase text-[10px]">{selectedDistribution.item.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Target Intelligence
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Channel Name</span>
                      <span className="text-sm font-black text-slate-900">{selectedDistribution.group.group_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Active Roster</span>
                      <span className="text-sm font-black text-slate-900">{selectedDistribution.group.teachers_count} Personnel</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Channel Type</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedDistribution.group.group_type}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Allocation Matrix
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Total Volume</span>
                      <span className="text-sm font-black text-blue-600">{selectedDistribution.total_quantity} Units</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Per Personnel</span>
                      <span className="text-sm font-black text-slate-900">{selectedDistribution.quantity_per_member} Units</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">Cycle Date</span>
                      <span className="text-sm font-black text-slate-900">{new Date(selectedDistribution.distribution_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Deployment Table */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    Personnel Allocation Log
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 h-6 px-2 font-black">{selectedDistribution.itemDistributions.length} Recipients</Badge>
                  </h3>
                </div>
                
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Communications</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedDistribution.itemDistributions.map((itemDist) => (
                        <tr key={itemDist.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase">
                                {itemDist.teacher.full_name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-800">{itemDist.teacher.full_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-500">
                            {itemDist.teacher.email}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-black px-3 h-7">{itemDist.quantity_distributed} Units</Badge>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Badge className={`${itemDist.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400'} font-black text-[10px] tracking-widest uppercase`}>
                              {itemDist.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata Notes */}
              {(selectedDistribution.purpose || selectedDistribution.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  {selectedDistribution.purpose && (
                    <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100/50">
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Operation Purpose
                      </h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedDistribution.purpose}"</p>
                    </div>
                  )}
                  {selectedDistribution.notes && (
                    <div className="bg-amber-50/50 p-8 rounded-[32px] border border-amber-100/50">
                      <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Administrative Notes
                      </h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedDistribution.notes}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-100 bg-white flex justify-end">
               <Button 
                onClick={() => setShowDetailsModal(false)}
                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all active:scale-95"
               >
                 Close Analysis
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* High-Fidelity Security Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 rounded-[40px] border-none overflow-hidden">
            <div className="bg-gradient-to-br from-rose-600 to-rose-800 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="w-20 h-20 bg-white/20 rounded-[32px] backdrop-blur-xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Operation Termination</h2>
              <p className="text-white/70 text-sm font-medium mt-2">Administrative authorization required to archive cycle</p>
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
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white text-lg shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleCancelExecution()}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-lg">
                    <Settings className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => { setShowVerifyModal(false); setVerifyPassword(''); setPendingActionId(null); }} className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50">Cancel</Button>
                <Button 
                  onClick={handleCancelExecution} 
                  disabled={verifying}
                  className="flex-[2] h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-100 active:scale-95 transition-all"
                >
                  {verifying ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Archival"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
