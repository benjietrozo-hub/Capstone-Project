import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';

interface Notification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: string;
  timestamp?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'teacher';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  console.log('[NotificationContext] Initialized with:', { 
    hasToken: !!token, 
    role, 
    userId: user?.id,
    userEmail: user?.email 
  });

  // Initialize WebSocket
  const { addListener, removeListener } = useWebSocket(user?.id, role);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      console.log('[NotificationContext] Fetching notifications for role:', role);
      const response = await axiosInstance.get(`/${role}/notifications`, {
        params: { user_type: role }
      });

      console.log('[NotificationContext] Response:', response.data);

      if (response.data.success) {
        const notifs = response.data.data.data || response.data.data || [];
        console.log('[NotificationContext] Parsed notifications:', notifs.length, 'items');
        setNotifications(notifs);
        const unread = notifs.filter((n: Notification) => !n.is_read).length;
        console.log('[NotificationContext] Unread count:', unread);
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('[NotificationContext] Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axiosInstance.get(`/${role}/notifications/unread-count`, {
        params: { user_type: role }
      });

      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [token, role]);

  const markAsRead = useCallback(async (id: string | number) => {
    if (!token) return;

    // Optimistically update UI immediately
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await axiosInstance.post(`/${role}/notifications/${id}/read`, {});
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      
      toast.error('Failed to mark notification as read');
    }
  }, [token, role]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await axiosInstance.post(`/${role}/notifications/mark-all-read`, { user_type: role });

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [token, role]);

  const deleteNotification = useCallback(async (id: string | number) => {
    if (!token) return;

    try {
      await axiosInstance.delete(`/${role}/notifications/${id}`);

      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [token, role, fetchUnreadCount]);

  // Handle incoming WebSocket notifications
  useEffect(() => {
    const handleNotification = (data: any) => {
      console.log('Received notification via WebSocket:', data);
      
      // Create notification object from WebSocket data
      const notification: Notification = {
        id: data.id || Date.now(), // Use timestamp as fallback ID
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.related_id,
        related_type: data.related_type,
        is_read: false,
        created_at: data.timestamp || new Date().toISOString(),
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      // Add to notifications list at the top
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);

      // Show toast notification with better styling
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            // This will be handled by the notification click in the dropdown
            console.log('View notification:', notification.id);
          },
        },
      });
    };

    addListener('notification', handleNotification);

    return () => {
      removeListener('notification', handleNotification);
    };
  }, [addListener, removeListener]);

  // Fetch notifications on mount
  useEffect(() => {
    if (token && user?.id) {
      console.log('[NotificationContext] Fetching notifications on mount');
      fetchNotifications();
      fetchUnreadCount();
    } else {
      console.log('[NotificationContext] Skipping fetch - missing token or user ID', { 
        hasToken: !!token, 
        hasUserId: !!user?.id 
      });
    }
  }, [token, user?.id, fetchNotifications, fetchUnreadCount]);

  // Poll for notifications every 30 seconds as fallback
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
