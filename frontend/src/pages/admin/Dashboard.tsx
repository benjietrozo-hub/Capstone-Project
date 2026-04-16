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
  Minus
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useState, useEffect } from "react";
import { adminAPI } from "../../api";

interface DashboardData {
  total_items: number;
  available_items: number;
  borrowed_items: number;
  total_teachers: number;
  pending_requests: number;
  overdue_items: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_items: 0,
    available_items: 0,
    borrowed_items: 0,
    total_teachers: 0,
    pending_requests: 0,
    overdue_items: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      title: "User Management",
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
      value: "0",
      change: "0%",
      trend: "neutral"
    },
    {
      title: "Reports",
      description: "Issue reports",
      icon: FileText,
      url: "/admin/reports",
      color: "from-green-500 to-emerald-500",
      value: "0",
      change: "+0%",
      trend: "up"
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

  return (
    <div>
      <NavHeader 
        title="Admin Dashboard" 
        subtitle="Complete System Control - Manage your inventory system"
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
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Complete System Control - Manage your inventory system</p>
      </div>
      
      <div className="container mx-auto p-3 sm:p-6">
        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading dashboard statistics...</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Card
                key={stat.title}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-l-4"
                style={{ borderLeftColor: `hsl(var(--primary))` }}
                onClick={() => navigate(stat.url)}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-xs sm:text-sm font-medium ${getTrendColor(stat.trend)}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
