import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ChevronRight, Filter } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

type FilterType = 'all' | 'unread' | 'read';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');

  const userRole = localStorage.getItem('role') || 'teacher';
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return n.is_read;
    return true;
  });

  const getNotificationRoute = (type: string) => {
    if (userRole === 'admin') {
      switch (type) {
        case 'borrow_request_created':
        case 'borrow_request_approved':
        case 'borrow_request_rejected':
          return '/admin/reservations?tab=requests';
        case 'distribution_request_created':
        case 'distribution_approved':
        case 'distribution_rejected':
          return '/admin/distribution-requests';
        case 'low_stock':
          return '/admin/inventory';
        case 'item_distributed':
        case 'distribution_returned':
          return '/admin/distribution-list';
        default:
          return '/admin/dashboard';
      }
    } else {
      switch (type) {
        case 'borrow_request_approved':
        case 'borrow_request_rejected':
        case 'item_returned':
        case 'item_overdue':
          return '/teacher/reservations?tab=requests';
        case 'distribution_approved':
        case 'distribution_rejected':
          return '/teacher/distribution-requests';
        case 'added_to_group':
        case 'removed_from_group':
          return '/teacher/distribution-groups';
        case 'item_distributed':
        case 'distribution_returned':
          return '/teacher/my-inventory';
        default:
          return '/teacher/dashboard';
      }
    }
  };

  const handleClick = (n: any) => {
    if (!n.is_read) markAsRead(n.id);
    navigate(getNotificationRoute(n.type));
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7)   return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  const typeLabel: Record<string, string> = {
    distribution_approved:        'Distribution',
    distribution_rejected:        'Distribution',
    distribution_request_created: 'Distribution',
    borrow_request_approved:      'Borrow',
    borrow_request_rejected:      'Borrow',
    borrow_request_created:       'Borrow',
    item_returned:                'Return',
    item_overdue:                 'Overdue',
    low_stock:                    'Inventory',
    item_distributed:             'Distribution',
    added_to_group:               'Group',
    removed_from_group:           'Group',
  };

  const typeBadgeColor: Record<string, string> = {
    distribution_approved:        'bg-emerald-100 text-emerald-700',
    distribution_rejected:        'bg-rose-100 text-rose-700',
    distribution_request_created: 'bg-blue-100 text-blue-700',
    borrow_request_approved:      'bg-emerald-100 text-emerald-700',
    borrow_request_rejected:      'bg-rose-100 text-rose-700',
    borrow_request_created:       'bg-blue-100 text-blue-700',
    item_returned:                'bg-slate-100 text-slate-700',
    item_overdue:                 'bg-amber-100 text-amber-700',
    low_stock:                    'bg-amber-100 text-amber-700',
    item_distributed:             'bg-purple-100 text-purple-700',
    added_to_group:               'bg-indigo-100 text-indigo-700',
    removed_from_group:           'bg-slate-100 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader title="Notifications">
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-sm">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">All Notifications</h1>
              <p className="text-sm text-slate-500">
                {notifications.length} total · {unreadCount} unread
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unread', 'read'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-blue-500 text-[10px] text-white px-1.5 min-w-[18px] h-[18px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No notifications here</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'unread' ? 'You\'re all caught up!' : 'Nothing to show.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {filtered.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 group transition-colors hover:bg-slate-50 ${
                  !n.is_read ? 'bg-blue-50/40' : ''
                }`}
              >
                {/* Unread indicator */}
                <div className="mt-2 shrink-0">
                  {!n.is_read
                    ? <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                    : <span className="w-2 h-2 rounded-full bg-transparent block" />
                  }
                </div>

                {/* Content — clickable */}
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => handleClick(n)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                      {n.title}
                    </span>
                    {typeLabel[n.type] && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadgeColor[n.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeLabel[n.type]}
                      </span>
                    )}
                  </div>
                  {n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {formatTime(n.created_at || n.timestamp || '')}
                  </span>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button
                      title="Mark as read"
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
