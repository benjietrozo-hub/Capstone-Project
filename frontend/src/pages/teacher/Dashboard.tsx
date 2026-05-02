import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  ClipboardList, 
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Clock,
  XCircle,
  Archive
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useState, useEffect } from "react";
import { teacherAPI } from "../../api";
import toast from "react-hot-toast";

interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  borrowed_items: number;
  returned_items: number;
  rejected_requests: number;
  available_items: number;
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    borrowed_items: 0,
    returned_items: 0,
    rejected_requests: 0,
    available_items: 0,
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
      const response = await teacherAPI.getDashboard();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Total Requests",
      description: "All borrow requests",
      icon: ClipboardList,
      url: "/teacher/reservations?tab=requests",
      color: "from-blue-500 to-cyan-500",
      value: stats.total_requests.toString(),
      change: "+0%",
      trend: "neutral"
    },
    {
      title: "Pending Requests",
      description: "Awaiting approval",
      icon: Clock,
      url: "/teacher/reservations?tab=requests",
      color: "from-yellow-500 to-orange-500",
      value: stats.pending_requests.toString(),
      change: "0%",
      trend: "neutral"
    },
    {
      title: "Approved Requests",
      description: "Ready to collect",
      icon: CheckCircle,
      url: "/teacher/reservations?tab=requests",
      color: "from-green-500 to-emerald-500",
      value: stats.approved_requests.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Borrowed Items",
      description: "Currently with you",
      icon: Archive,
      url: "/teacher/reservations?tab=borrowed",
      color: "from-purple-500 to-pink-500",
      value: stats.borrowed_items.toString(),
      change: "0%",
      trend: "neutral"
    },
    {
      title: "Returned Items",
      description: "Successfully returned",
      icon: CheckCircle,
      url: "/teacher/reservations?tab=requests",
      color: "from-teal-500 to-green-500",
      value: stats.returned_items.toString(),
      change: "+0%",
      trend: "up"
    },
    {
      title: "Available Items",
      description: "Ready to borrow",
      icon: Package,
      url: "/teacher/inventory",
      color: "from-indigo-500 to-blue-500",
      value: stats.available_items.toString(),
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

  return (
    <div>
      <NavHeader 
        title="Teacher Dashboard" 
        subtitle="Lab Management - Access your resources and track your requests"
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
        <h1 className="text-lg font-bold text-gray-900 mb-1">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600">Lab Management - Access your resources and track your requests</p>
      </div>
      
      <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Welcome back, {currentUser?.full_name || 'Teacher'}!
                </CardTitle>
                <CardDescription>
                  Here's an overview of your equipment requests and available resources.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading dashboard statistics...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {dashboardStats.map((stat) => (
              <Card
                key={stat.title}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-l-4"
                style={{ borderLeftColor: `hsl(var(--primary))` }}
                onClick={() => navigate(stat.url)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => navigate("/teacher/inventory")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Browse Inventory</CardTitle>
                <CardDescription>View and request available equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary font-medium">
                  View Details →
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => navigate("/teacher/reservations")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">My Reservations</CardTitle>
                <CardDescription>Track your borrowed items and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary font-medium">
                  View Details →
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
