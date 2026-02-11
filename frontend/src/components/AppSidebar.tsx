import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Settings,
  Package,
  Boxes,
  ClipboardList,
  Users,
  Home,
  ChevronRight,
  Search,
  Bell,
  Calendar,
  ShoppingCart,
  List,
  FileText,
  ScrollText,
  Activity,
  Truck,
  Trash2,
  Send
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: number;
}

const adminItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Inventory", url: "/admin/inventory", icon: Boxes },
  { title: "Reservations", url: "/admin/reservations", icon: Calendar },
  { title: "Purchase Orders", url: "/admin/purchase-orders", icon: ShoppingCart },
  { title: "Suppliers", url: "/admin/suppliers", icon: Truck },
  { title: "Distribution List", url: "/admin/distribution", icon: List },
  { title: "User Management", url: "/admin/teachers", icon: Users },
  { title: "Activity Logs", url: "/admin/logs", icon: Activity },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Trash", url: "/admin/trash", icon: Trash2 },
];

const teacherItems: MenuItem[] = [
  { title: "Browse Inventory", url: "/teacher/inventory", icon: Boxes },
  { title: "My Reservations", url: "/teacher/reservations", icon: Calendar },
  { title: "Distribution Requests", url: "/teacher/distribution-requests", icon: Send },
  { title: "Distribution Groups", url: "/teacher/distribution-groups", icon: Users },
  { title: "Activity Logs", url: "/teacher/activity-logs", icon: Activity },
];

const configItems: MenuItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "News", url: "/news", icon: Bell, badge: 1 },
];

export function AppSidebar() {
  const { open: sidebarOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("teacher");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(storedRole || user.role || "teacher");
    }
  }, []);

  const menuItems = userRole === "admin" 
    ? adminItems
    : teacherItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#5B8DEF] to-[#0063F7] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">OlineIMS</h2>
                <p className="text-xs text-sidebar-foreground/70">Inventory System</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-sidebar-accent/50 text-sidebar-foreground placeholder:text-sidebar-foreground/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-primary/50 border border-sidebar-border/30"
              />
            </div>
          </div>
        )}

        {/* Main Menu */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`
                        group relative rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
                        }
                      `}
                    >
                      <NavLink to={item.url} className="flex items-center justify-between w-full px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sidebar-foreground'}`} />
                          {sidebarOpen && (
                            <span className="font-medium text-sm">{item.title}</span>
                          )}
                        </div>
                        {sidebarOpen && (
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-white' : 'text-sidebar-foreground/50'}`} />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration Section */}
        <div className="mt-auto">
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
              Configuration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {configItems.map((item) => {
                  const isActive = currentPath === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`
                          group relative rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white shadow-lg shadow-blue-500/30' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
                          }
                        `}
                      >
                        <NavLink to={item.url} className="flex items-center justify-between w-full px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sidebar-foreground'}`} />
                            {sidebarOpen && (
                              <span className="font-medium text-sm">{item.title}</span>
                            )}
                          </div>
                          {sidebarOpen && item.badge && (
                            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                          {sidebarOpen && !item.badge && (
                            <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sidebar-foreground/50'}`} />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
