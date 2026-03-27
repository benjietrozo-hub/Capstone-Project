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

// Dashboard stat cards matching sidebar items
const dashboardStats = [
  {
    title: "Total Inventory",
    description: "Items in stock",
    icon: Package,
    url: "/admin/inventory",
    color: "from-blue-500 to-cyan-500",
    value: "0",
    change: "+0%",
    trend: "up"
  },
  {
    title: "Reservations",
    description: "Active reservations",
    icon: Calendar,
    url: "/admin/reservations",
    color: "from-purple-500 to-pink-500",
    value: "0",
    change: "+0%",
    trend: "up"
  },
  {
    title: "Purchase Orders",
    description: "Pending orders",
    icon: ShoppingCart,
    url: "/admin/purchase-orders",
    color: "from-orange-500 to-red-500",
    value: "0",
    change: "0%",
    trend: "neutral"
  },
  {
    title: "Distribution List",
    description: "Active distributions",
    icon: List,
    url: "/admin/distribution",
    color: "from-teal-500 to-green-500",
    value: "0",
    change: "+0%",
    trend: "up"
  },
  {
    title: "User Management",
    description: "Total users",
    icon: Users,
    url: "/admin/teachers",
    color: "from-indigo-500 to-purple-500",
    value: "0",
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
    description: "Generated reports",
    icon: FileText,
    url: "/admin/reports",
    color: "from-green-500 to-emerald-500",
    value: "0",
    change: "+0%",
    trend: "up"
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

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
      </div>
    </div>
  );
}
