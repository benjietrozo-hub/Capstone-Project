<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
                        $userType = $request->user_type ?? (Auth::user() instanceof \App\Models\Admin ? 'admin' : 'teacher');


            $query = Notification::forUser($user->id, $userType);

            // Filter by read status
            if ($request->has('is_read')) {
                $query->where('is_read', $request->is_read === 'true' || $request->is_read === '1');
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            $notifications = $query->orderBy('created_at', 'desc')
                                  ->paginate($request->per_page ?? 20);

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
                        $userType = $request->user_type ?? (Auth::user() instanceof \App\Models\Admin ? 'admin' : 'teacher');


            $count = Notification::forUser($user->id, $userType)
                                ->unread()
                                ->count();

            return response()->json([
                'success' => true,
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            $userType = $user instanceof \App\Models\Admin ? 'admin' : 'teacher';

            $notification = Notification::forUser($user->id, $userType)
                                       ->findOrFail($id);

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'data' => $notification
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            $userType = $request->user_type ?? ($user instanceof \App\Models\Admin ? 'admin' : 'teacher');

            Notification::forUser($user->id, $userType)
                       ->unread()
                       ->update([
                           'is_read' => true,
                           'read_at' => now()
                       ]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            $userType = $user instanceof \App\Models\Admin ? 'admin' : 'teacher';

            $notification = Notification::forUser($user->id, $userType)
                                       ->findOrFail($id);

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete all read notifications
     */
    public function deleteAllRead(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            $userType = $request->user_type ?? ($user instanceof \App\Models\Admin ? 'admin' : 'teacher');

            Notification::forUser($user->id, $userType)
                       ->where('is_read', true)
                       ->delete();

            return response()->json([
                'success' => true,
                'message' => 'All read notifications deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
