import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3, Package, ClipboardList, TrendingUp, Calendar,
  Download, Printer, ChevronDown, ChevronRight, Filter,
  CheckCircle, XCircle, Clock, ArrowUpRight, RotateCcw,
  ShieldCheck, Boxes, FileText, AlertTriangle, Layers
} from "lucide-react";
import { teacherAPI } from "../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BorrowRequest {
  id: number;
  item_name?: string;
  category_name?: string;
  quantity: number;
  status: string;
  created_at: string;
  return_date?: string;
}

interface DistributionRequest {
  id: number;
  category?: { category_name: string };
  quantity_requested: number;
  status: string;
  created_at: string;
  reason?: string;
}

interface Distribution {
  id: number;
  item?: { item_name: string; item_code: string };
  quantity_distributed: number;
  status: string;
  distribution_date: string;
  condition_on_distribution?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByYear<T extends { created_at: string }>(items: T[]) {
  return items.reduce((acc, item) => {
    const year = new Date(item.created_at).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:     { label: "Pending",     cls: "bg-amber-50 text-amber-600 border-amber-100" },
  approved:    { label: "Approved",    cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  rejected:    { label: "Rejected",    cls: "bg-rose-50 text-rose-600 border-rose-100" },
  cancelled:   { label: "Cancelled",   cls: "bg-slate-50 text-slate-400 border-slate-100" },
  active:      { label: "Active",      cls: "bg-blue-50 text-blue-600 border-blue-100" },
  returned:    { label: "Returned",    cls: "bg-teal-50 text-teal-600 border-teal-100" },
  distributed: { label: "Distributed", cls: "bg-purple-50 text-purple-600 border-purple-100" },
  issued:      { label: "Issued",      cls: "bg-indigo-50 text-indigo-600 border-indigo-100" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-slate-50 text-slate-500" };
  return (
    <Badge className={`font-black text-[10px] h-6 px-3 uppercase tracking-widest border ${s.cls}`}>
      {s.label}
    </Badge>
  );
}

// ─── Collapsible Year Section ─────────────────────────────────────────────────

function YearSection({ year, count, children }: { year: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(year === new Date().getFullYear().toString());
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-900 rounded-sm">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg">FY {year}</span>
          <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-black text-[10px] px-3">
            {count} Records
          </Badge>
        </div>
        {open
          ? <ChevronDown className="w-5 h-5 text-slate-400" />
          : <ChevronRight className="w-5 h-5 text-slate-400" />
        }
      </button>
      {open && <div className="border-t border-slate-50">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherReportsPage() {
  const [activeTab, setActiveTab] = useState<"borrows" | "distributions" | "requests">("borrows");
  const [filterStatus, setFilterStatus] = useState("all");

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const { data: borrowStats } = useQuery({
    queryKey: ["teacher-borrow-stats"],
    queryFn: () => teacherAPI.getBorrowRequestsStats().then(r => r.data.data),
  });

  const { data: rawBorrows = [], isLoading: loadingBorrows } = useQuery({
    queryKey: ["teacher-borrow-report"],
    queryFn: async () => {
      const res = await teacherAPI.getBorrowRequests({ per_page: 500, all: true });
      const d = res.data?.data;
      return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
    },
  });

  const { data: rawDistributions = [], isLoading: loadingDist } = useQuery({
    queryKey: ["teacher-dist-report"],
    queryFn: async () => {
      const res = await teacherAPI.getDistributions({ per_page: 500 });
      const d = res.data?.data;
      return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
    },
  });

  const { data: rawRequests = [], isLoading: loadingReqs } = useQuery({
    queryKey: ["teacher-dist-requests-report"],
    queryFn: async () => {
      const res = await teacherAPI.getTeacherDistributionRequests({ per_page: 500 });
      const d = res.data?.data;
      return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
    },
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredBorrows = useMemo(() =>
    rawBorrows.filter((r: BorrowRequest) => filterStatus === "all" || r.status === filterStatus),
    [rawBorrows, filterStatus]
  );

  const filteredDist = useMemo(() =>
    rawDistributions.filter((d: Distribution) => filterStatus === "all" || d.status === filterStatus),
    [rawDistributions, filterStatus]
  );

  const filteredReqs = useMemo(() =>
    rawRequests.filter((r: DistributionRequest) => filterStatus === "all" || r.status === filterStatus),
    [rawRequests, filterStatus]
  );

  // ── Print ──────────────────────────────────────────────────────────────────

  const handlePrint = () => {
    const pw = window.open("", "_blank");
    if (!pw) return;
    const items = activeTab === "borrows" ? filteredBorrows
      : activeTab === "distributions" ? filteredDist
      : filteredReqs;

    const rows = items.map((item: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${activeTab === "borrows"
          ? (item.item_name || item.category_name || "—")
          : activeTab === "distributions"
          ? (item.item?.item_name || "—")
          : (item.category?.category_name || "—")}
        </td>
        <td>${activeTab === "borrows" ? item.quantity
          : activeTab === "distributions" ? item.quantity_distributed
          : item.quantity_requested}</td>
        <td>${item.status?.toUpperCase()}</td>
        <td>${fmtDate(item.created_at)}</td>
      </tr>`).join("");

    pw.document.write(`<html><head><title>My Report — OIMS</title>
      <style>
        body{font-family:sans-serif;padding:32px;color:#333}
        h1{color:#0f172a;font-size:20px;margin-bottom:4px}
        p{font-size:12px;color:#64748b;margin-bottom:24px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
        th{background:#f8fafc;font-weight:800;text-transform:uppercase;font-size:10px;letter-spacing:.1em}
      </style></head>
      <body>
        <h1>Personal Activity Report — ${activeTab === "borrows" ? "Borrow Requests" : activeTab === "distributions" ? "Item Distributions" : "Distribution Requests"}</h1>
        <p>Generated by: ${currentUser?.full_name || "Teacher"} &nbsp;|&nbsp; ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>`);
    pw.document.close();
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const handleExport = () => {
    const items = activeTab === "borrows" ? filteredBorrows
      : activeTab === "distributions" ? filteredDist
      : filteredReqs;

    const header = ["No.", "Item", "Qty", "Status", "Date"].join(",");
    const csvRows = items.map((item: any, i: number) => [
      i + 1,
      `"${activeTab === "borrows" ? (item.item_name || item.category_name || "—")
         : activeTab === "distributions" ? (item.item?.item_name || "—")
         : (item.category?.category_name || "—")}"`,
      activeTab === "borrows" ? item.quantity
        : activeTab === "distributions" ? item.quantity_distributed
        : item.quantity_requested,
      item.status,
      fmtDate(item.created_at),
    ].join(","));

    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my_report_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Report exported successfully");
  };

  // ── Stats Cards ────────────────────────────────────────────────────────────

  const statCards = [
    { label: "Total Requests",  value: borrowStats?.total_requests  ?? rawBorrows.length, icon: ClipboardList, color: "blue" },
    { label: "Approved",        value: borrowStats?.approved_requests ?? rawBorrows.filter((r:any)=>r.status==="approved").length, icon: CheckCircle,  color: "emerald" },
    { label: "Active Borrows",  value: borrowStats?.borrowed_items  ?? rawBorrows.filter((r:any)=>r.status==="issued").length,   icon: Package,      color: "purple" },
    { label: "Distributions",   value: rawDistributions.length,                                                                    icon: Boxes,        color: "amber" },
  ];

  const TABS = [
    { id: "borrows",       label: "Borrow Requests",       icon: ClipboardList },
    { id: "distributions", label: "Item Distributions",    icon: Package },
    { id: "requests",      label: "Distribution Requests", icon: Layers },
  ] as const;

  const isLoading = loadingBorrows || loadingDist || loadingReqs;

  // ── Render Table ───────────────────────────────────────────────────────────

  function renderTable(items: any[]) {
    if (items.length === 0) return (
      <tr>
        <td colSpan={5} className="py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center border border-slate-100">
              <FileText className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No records found</p>
          </div>
        </td>
      </tr>
    );

    const grouped = groupByYear(items);
    return Object.keys(grouped).sort((a, b) => +b - +a).map(year => (
      <tr key={year}>
        <td colSpan={5} className="p-0">
          <YearSection year={year} count={grouped[year].length}>
            <table className="w-full">
              <tbody className="divide-y divide-slate-50">
                {grouped[year].map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        #{String(item.id).padStart(4, "0")}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-bold text-slate-800 text-sm">
                        {activeTab === "borrows"
                          ? (item.item_name || item.category_name || "General Item")
                          : activeTab === "distributions"
                          ? (item.item?.item_name || "—")
                          : (item.category?.category_name || "General Asset")}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-black h-6 px-3">
                        {activeTab === "borrows" ? item.quantity
                          : activeTab === "distributions" ? item.quantity_distributed
                          : item.quantity_requested}
                      </Badge>
                    </td>
                    <td className="px-8 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-8 py-4 text-sm font-bold text-slate-400">{fmtDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </YearSection>
        </td>
      </tr>
    ));
  }

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-10">
      <NavHeader 
        title="My Reports" 
        subtitle="Personal activity log"
        showBackButton={false}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-4 md:p-10 space-y-6 md:space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded shadow-lg shadow-blue-200">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Reports</h1>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2 pl-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Personal activity log — {currentUser?.full_name || "Teacher"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} variant="outline" className="h-12 px-6 rounded border-slate-200 bg-white font-bold gap-2 hover:bg-slate-50">
            <Printer className="w-4 h-4 text-slate-400" />
            Print
          </Button>
          <Button onClick={handleExport} className="h-12 px-8 rounded bg-slate-900 hover:bg-slate-800 text-white font-black gap-2 shadow-xl shadow-slate-200 active:scale-95 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="group bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/5 rounded-full -mr-16 -mt-16 blur-2xl`} />
            <div className="relative flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">{s.label}</span>
                <div className="flex items-center gap-3">
                  <h3 className="text-4xl font-black text-slate-900 leading-none">{s.value}</h3>
                  <div className={`p-1.5 bg-${s.color}-50 rounded`}>
                    <TrendingUp className={`w-4 h-4 text-${s.color}-600`} />
                  </div>
                </div>
              </div>
              <div className={`p-4 bg-${s.color}-50 rounded-[20px] text-${s.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Filter */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[20px]">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFilterStatus("all"); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-[16px] font-black text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] h-11 rounded border-slate-200 bg-slate-50 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded border-slate-100 font-bold">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="distributed">Distributed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="p-8">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling records...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {renderTable(
                  activeTab === "borrows" ? filteredBorrows
                    : activeTab === "distributions" ? filteredDist
                    : filteredReqs
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
