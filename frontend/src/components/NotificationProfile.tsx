import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";

interface NotificationProfileProps {
  currentUser?: any;
  notifications?: any[];
  unreadCount?: number;
  onMarkAsRead?: () => void;
  onMarkAllAsRead?: () => void;
}

const NotificationProfile: React.FC<NotificationProfileProps> = ({ 
  currentUser = null
}) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  // Get role from localStorage since it's stored separately
  const userRole = localStorage.getItem("role") || currentUser?.role || "teacher";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'teacher':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Teacher';
      default:
        return 'User';
    }
  };

  // Get only unread notifications, limited to 5
  const displayNotifications = notifications
    .filter(n => !n.is_read)
    .slice(0, 5);

  // Handle notification click - navigate to related page (don't mark as read to keep visible)
  const handleNotificationClick = (notification: any) => {
    // Navigate based on notification type and related data
    const { type, related_type, related_id } = notification;

    if (userRole === 'admin') {
      switch (type) {
        case 'borrow_request_created':
        case 'borrow_request_approved':
        case 'borrow_request_rejected':
        case 'item_overdue_admin':
          // Navigate to Reservations page with requests tab
          navigate('/admin/reservations?tab=requests');
          break;
        
        case 'distribution_request_created':
        case 'distribution_approved':
        case 'distribution_rejected':
          navigate('/admin/distribution-requests');
          break;
        
        case 'low_stock':
          navigate('/admin/inventory');
          break;
        
        case 'purchase_order_created':
        case 'purchase_order_received':
          navigate('/admin/purchase-orders');
          break;
        
        case 'item_distributed':
        case 'distribution_returned':
          navigate('/admin/distribution-list');
          break;
        
        default:
          // For unknown types, go to dashboard
          navigate('/admin/dashboard');
      }
    } else if (userRole === 'teacher') {
      switch (type) {
        case 'borrow_request_approved':
        case 'borrow_request_rejected':
        case 'item_returned':
        case 'return_reminder':
        case 'item_overdue':
          navigate('/teacher/my-requests');
          break;
        
        case 'distribution_approved':
        case 'distribution_rejected':
          navigate('/teacher/distribution-requests');
          break;
        
        case 'added_to_group':
        case 'removed_from_group':
          navigate('/teacher/distribution-groups');
          break;
        
        case 'item_distributed':
        case 'distribution_returned':
          navigate('/teacher/my-inventory');
          break;
        
        default:
          navigate('/teacher/dashboard');
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 min-w-[16px] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-80 max-h-96 overflow-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {displayNotifications.length === 0 ? (
            <DropdownMenuItem className="text-xs text-muted-foreground justify-center py-4">
              No new notifications
            </DropdownMenuItem>
          ) : (
            <>
              {displayNotifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id}
                  className="flex items-start gap-3 text-xs cursor-pointer py-3 px-4 hover:bg-accent transition-colors"
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{n.title}</span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      )}
                    </div>
                    {n.message && (
                      <p className="text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(n.created_at || n.timestamp || '').toLocaleString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-xs text-blue-600 cursor-pointer font-medium"
                onClick={markAllAsRead}
              >
                Mark all as read
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationProfile;
