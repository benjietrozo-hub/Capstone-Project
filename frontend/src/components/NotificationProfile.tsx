import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { ConfirmationModal } from "./common/ConfirmationModal";
import { useState } from "react";

interface NotificationProfileProps {
  currentUser?: any;
  notifications?: any[];
  unreadCount?: number;
  onMarkAsRead?: () => void;
  onMarkAllAsRead?: () => void;
}

const PREVIEW_LIMIT = 5;

const NotificationProfile: React.FC<NotificationProfileProps> = ({
  currentUser = null,
}) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userRole = localStorage.getItem("role") || currentUser?.role || "teacher";

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Set a flag BEFORE clearing storage
    window.__LOGGING_OUT__ = true;
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force immediate redirect (no React Router involved)
    window.location.href = "/login";
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":   return "bg-red-500 text-white";
      case "teacher": return "bg-blue-500 text-white";
      default:        return "bg-gray-500 text-white";
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case "admin":   return "Admin";
      case "teacher": return "Teacher";
      default:        return "User";
    }
  };

  // Show all notifications (read + unread), newest first, capped at PREVIEW_LIMIT
  const displayNotifications = notifications.slice(0, PREVIEW_LIMIT);
  const hasMore = notifications.length > PREVIEW_LIMIT;

  const getNotificationRoute = (type: string) => {
    if (userRole === "admin") {
      switch (type) {
        case "borrow_request_created":
        case "borrow_request_approved":
        case "borrow_request_rejected":
        case "item_overdue_admin":
          return "/admin/reservations?tab=requests";
        case "distribution_request_created":
        case "distribution_approved":
        case "distribution_rejected":
          return "/admin/distribution-requests";
        case "low_stock":
          return "/admin/inventory";
        case "item_distributed":
        case "distribution_returned":
          return "/admin/distribution-list";
        default:
          return "/admin/dashboard";
      }
    } else {
      switch (type) {
        case "borrow_request_approved":
        case "borrow_request_rejected":
        case "item_returned":
        case "return_reminder":
        case "item_overdue":
          return "/teacher/reservations?tab=requests";
        case "distribution_approved":
        case "distribution_rejected":
          return "/teacher/distribution-requests";
        case "added_to_group":
        case "removed_from_group":
          return "/teacher/distribution-groups";
        case "item_distributed":
        case "distribution_returned":
          return "/teacher/my-inventory";
        default:
          return "/teacher/dashboard";
      }
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read on click (stays visible in list)
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    navigate(getNotificationRoute(notification.type));
  };

  const handleViewAll = () => {
    const route = userRole === "admin" ? "/admin/notifications" : "/teacher/notifications";
    navigate(route);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1)   return "Just now";
    if (diffMins < 60)  return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7)   return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-3">
      {/* ── Notification Bell ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 min-w-[16px] animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" className="w-80 p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-500 text-[10px] text-white px-1.5 min-w-[18px] h-[18px]">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">No notifications yet.</p>
              </div>
            ) : (
              displayNotifications.map((n, idx) => (
                <div key={n.id}>
                  <button
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors group ${
                      !n.is_read ? "bg-blue-50/60" : ""
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 shrink-0">
                      {!n.is_read ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-transparent block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug truncate ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                        {formatTime(n.created_at || n.timestamp || "")}
                      </span>
                    </div>
                  </button>
                  {idx < displayNotifications.length - 1 && (
                    <div className="h-px bg-border/50 mx-4" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer — View More */}
          {(hasMore || notifications.length > 0) && (
            <>
              <div className="h-px bg-border" />
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 transition-colors"
              >
                View all notifications
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Profile Menu ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-black text-left max-w-[160px] truncate">
              {currentUser?.email || "Unknown user"}
            </span>
            <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${getRoleBadgeColor(userRole)}`}>
              {getRoleDisplay(userRole)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-56">
          <DropdownMenuLabel>Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start text-xs">
            <span className="font-medium">{currentUser?.email || "Unknown"}</span>
            <span className="text-muted-foreground capitalize">
              Role: {getRoleDisplay(userRole)}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogoutClick}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the system."
        type="logout"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        showCancel={true}
      />
    </div>
  );
};

export default NotificationProfile;
