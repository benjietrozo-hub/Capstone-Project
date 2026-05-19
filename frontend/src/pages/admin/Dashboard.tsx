import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Calendar, 
  ShoppingCart, 
  List, 
  Users, 
  ScrollText, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Building2,
  Trash2
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import SystemHealthCard from '@/components/admin/SystemHealthCard';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "../../components/common/Skeleton";
import { adminAPI } from "../../api";

interface DashboardData {
  total_items: number;
  available_items: number;
  borrowed_items: number;
  total_teachers: number;
  pending_requests: number;
  overdue_items: number;
  total_logs: number;
  total_reports: number;
  ready_for_disposal: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    data: dashboardDataResponse, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await adminAPI.getDashboard();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const dashboardData = dashboardDataResponse || {
    total_items: 0,
    available_items: 0,
    borrowed_items: 0,
    total_teachers: 0,
    pending_requests: 0,
    overdue_items: 0,
    total_logs: 0,
    total_reports: 0,
    ready_for_disposal: 0,
  };

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const dashboardStats = [
    {
      title: "Total Inventory",
      description: "Items in stock",
      icon: Package,
      url: "/admin/inventory",
      color: "from-blue-500 to-cyan-500",
      value: dashboardData.total_items.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Available Items",
      description: "Ready to borrow",
      icon: Package,
      url: "/admin/inventory",
      color: "from-teal-500 to-green-500",
      value: dashboardData.available_items.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Borrowed Items",
      description: "Currently borrowed",
      icon: Calendar,
      url: "/admin/reservations",
      color: "from-orange-500 to-red-500",
      value: dashboardData.borrowed_items.toString(),
      change: "0%",
      trend: "neutral"
    },
    {
      title: "Pending Requests",
      description: "Awaiting approval",
      icon: List,
      url: "/admin/reservations",
      color: "from-purple-500 to-pink-500",
      value: dashboardData.pending_requests.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Overdue Items",
      description: "Items overdue",
      icon: ShoppingCart,
      url: "/admin/reservations",
      color: "from-red-500 to-orange-500",
      value: dashboardData.overdue_items.toString(),
      change: "0%",
      trend: "down"
    },
    {
      title: "Teacher Management",
      description: "Total teachers",
      icon: Users,
      url: "/admin/teachers",
      color: "from-indigo-500 to-purple-500",
      value: dashboardData.total_teachers.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "System Logs",
      description: "Recent activities",
      icon: ScrollText,
      url: "/admin/logs",
      color: "from-gray-500 to-slate-500",
      value: dashboardData.total_logs.toString(),
      change: "0%",
      trend: "neutral"
    },
    {
      title: "Reports",
      description: "Issue reports",
      icon: FileText,
      url: "/admin/reports",
      color: "from-green-500 to-emerald-500",
      value: dashboardData.total_reports.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Disposal Queue",
      description: "Ready for disposal",
      icon: Trash2,
      url: "/admin/inventory?status=ready_for_disposal",
      color: "from-rose-600 to-red-700",
      value: dashboardData.ready_for_disposal.toString(),
      change: "0%",
      trend: "neutral"
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const dashboardTitle = (
    <div className="flex flex-col">
      <span className="tracking-tight">
        Property Inventory Management System
      </span>
    </div>
  );

  const dashboardSubtitle = (
    <div className="flex flex-col mt-0.5 space-y-0.5">
      <div className="flex items-center text-white/90 font-medium">
        <Building2 className="w-3 h-3 mr-1.5 opacity-90" />
        <span className="tracking-wide">Caloc-an Elementary School</span>
      </div>
      <div className="flex items-center text-blue-100/80 opacity-80">
        <MapPin className="w-2.5 h-2.5 mr-1.5 opacity-70" />
        Caloc-an, Magallanes, Agusan del Norte
      </div>
    </div>
  );

  return (
    <div>
      <NavHeader 
        title={dashboardTitle} 
        subtitle={dashboardSubtitle}
        showBackButton={false}
        showHomeButton={false}
        showMenuButton={true}
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-gradient-to-b from-blue-50 to-white border-b px-4 py-3 shadow-sm">
        <h1 className="text-xs font-bold text-blue-900 mb-1 leading-snug">
          Property Inventory Management System
        </h1>
        <div className="flex items-center text-gray-700 font-semibold text-[10px] mb-1">
          <Building2 className="w-3 h-3 mr-1 text-blue-600" />
          Caloc-an Elementary School
        </div>
        <div className="flex items-start text-gray-500 text-[10px] leading-tight">
          <MapPin className="w-2.5 h-2.5 mr-1 mt-0.5 flex-shrink-0 text-blue-500" />
          Caloc-an, Magallanes, Agusan del Norte
        </div>
      </div>
      
      <div className="container mx-auto p-3 sm:p-6">
        {/* Stats Grid */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Card
                key={stat.title}
                className="group cursor-pointer relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 hover:border-blue-300/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 shadow-sm"
                onClick={() => navigate(stat.url)}
              >
                {/* Decorative background elements */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-[2.5] transition-transform duration-700 ease-out pointer-events-none`} />
                <div className={`absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-gradient-to-tr ${stat.color} opacity-5 group-hover:scale-[2] transition-transform duration-700 ease-out delay-100 pointer-events-none`} />
                
                <CardHeader className="pb-2 sm:pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-xs sm:text-sm font-bold ${getTrendColor(stat.trend)}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-1.5">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-colors duration-300">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{stat.title}</p>
                    <p className="text-xs font-medium text-slate-500">{stat.description}</p>
                  </div>
                </CardContent>
                
                {/* Bottom animated border */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${stat.color} transition-all duration-500 ease-out`} />
              </Card>
            ))}
          </div>
        )}

        {/* System Health Section */}
        {!loading && (
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealthCard />
              <Card className="border-none shadow-md bg-white overflow-hidden flex flex-col justify-center p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">System Overview</p>
                  <h4 className="text-xl font-black text-gray-900">Property Control & Audit</h4>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                    Welcome to the PIMS Administration Portal. This interface provides real-time oversight of school assets, equipment distribution lists, and active accountability tracking for
                    <span className="font-bold text-gray-800"> Caloc-an Elementary School</span>.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Mode</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full uppercase">Production Active</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
