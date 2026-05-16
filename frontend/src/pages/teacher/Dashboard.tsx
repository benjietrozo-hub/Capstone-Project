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
  Archive,
  MapPin,
  Building2
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
  pending_distributions: number;
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
    pending_distributions: 0,
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
    {
      title: "Pending Acceptance",
      description: "Items to acknowledge",
      icon: UserCheck,
      url: "/teacher/my-inventory?tab=pending",
      color: "from-amber-500 to-orange-600",
      value: stats.pending_distributions.toString(),
      change: stats.pending_distributions > 0 ? "Action Required" : "0",
      trend: stats.pending_distributions > 0 ? "down" : "neutral"
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
      
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Card */}
        <Card className="mb-4 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {dashboardStats.map((stat) => (
              <Card
                key={stat.title}
                className="group cursor-pointer relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 hover:border-blue-300/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 shadow-sm"
                onClick={() => navigate(stat.url)}
              >
                {/* Decorative background elements */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-[2.5] transition-transform duration-700 ease-out pointer-events-none`} />
                <div className={`absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-gradient-to-tr ${stat.color} opacity-5 group-hover:scale-[2] transition-transform duration-700 ease-out delay-100 pointer-events-none`} />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-sm bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-bold ${getTrendColor(stat.trend)}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-1.5">
                    <p className="text-3xl font-extrabold tracking-tight text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-colors duration-300">
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

        {/* Quick Actions Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => navigate("/teacher/inventory")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2">
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
                <div className="w-12 h-12 rounded bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
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
