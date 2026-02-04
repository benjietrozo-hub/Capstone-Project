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

interface Notification {
  id: string;
  title: string;
  message?: string;
  timestamp: string;
}

interface NotificationProfileProps {
  notifications?: Notification[];
  unreadCount?: number;
  currentUser?: any;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationProfile: React.FC<NotificationProfileProps> = ({ 
  notifications = [], 
  unreadCount = 0, 
  currentUser = null,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {}
}) => {
  const navigate = useNavigate();
  
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

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 min-w-[16px]">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-72 max-h-80 overflow-auto">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-xs text-muted-foreground">
              No notifications yet.
            </DropdownMenuItem>
          ) : (
            <>
              {notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id}
                  className="flex items-start gap-3 text-xs cursor-pointer"
                  onClick={() => onMarkAsRead(n.id)}
                >
                  <div className="flex-1">
                    <span className="font-medium">{n.title}</span>
                    {n.message && (
                      <span className="text-muted-foreground block mt-1">{n.message}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-xs text-blue-600 cursor-pointer"
                onClick={onMarkAllAsRead}
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
