<?php

namespace App\Services;

use App\Models\Notification;
use App\WebSocket\WebSocketBroadcaster;

class NotificationService
{
    /**
     * Create and broadcast a notification
     */
    public static function send($userId, $userType, $type, $title, $message, $relatedId = null, $relatedType = null)
    {
        // Create notification in database
        $notification = Notification::create([
            'user_id' => $userId,
            'user_type' => $userType,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'reference_id' => $relatedId,
            'related_table' => $relatedType,
            'is_read' => false,
        ]);

        // Broadcast via WebSocket
        WebSocketBroadcaster::sendToUser($userId, $userType, [
            'id' => $notification->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'related_id' => $relatedId,
            'related_type' => $relatedType,
            'timestamp' => $notification->created_at->toISOString(),
        ]);

        // Send email notification
        EmailNotificationService::sendEmailNotification($userId, $userType, $type, $title, $message, $relatedId, $relatedType);

        return $notification;
    }

    /**
     * Broadcast to all users of a specific type
     */
    public static function broadcast($userType, $type, $title, $message, $relatedId = null, $relatedType = null)
    {
        // Create notifications in database for all users of this type
        if ($userType === 'admin') {
            $users = \App\Models\Admin::where('status', 'active')->get();
        } elseif ($userType === 'teacher') {
            $users = \App\Models\Teacher::where('status', 'active')->get();
        } else {
            $users = collect();
        }

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'user_type' => $userType,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'reference_id' => $relatedId,
                'related_table' => $relatedType,
                'is_read' => false,
            ]);
        }

        // Also broadcast via WebSocket for real-time updates
        WebSocketBroadcaster::broadcastToUserType($userType, [
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'related_id' => $relatedId,
            'related_type' => $relatedType,
            'timestamp' => now()->toISOString(),
        ]);

        // Send email notifications to all users
        EmailNotificationService::broadcastEmail($userType, $type, $title, $message, $relatedId, $relatedType);
    }

    /**
     * Notify about borrow request creation
     */
    public static function notifyBorrowRequestCreated($borrowRequest)
    {
        // Notify all admins
        self::broadcast(
            'admin',
            'borrow_request_created',
            'New Borrow Request',
            "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} requested {$borrowRequest->quantity_requested} unit(s) of {$borrowRequest->item->item_name}",
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Notify about borrow request approval
     */
    public static function notifyBorrowRequestApproved($borrowRequest)
    {
        self::send(
            $borrowRequest->teacher_id,
            'teacher',
            'borrow_request_approved',
            'Borrow Request Approved',
            "Your request for {$borrowRequest->quantity_requested} unit(s) of {$borrowRequest->item->item_name} has been approved and issued",
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Notify about borrow request rejection
     */
    public static function notifyBorrowRequestRejected($borrowRequest)
    {
        $reason = $borrowRequest->admin_notes ? " Reason: {$borrowRequest->admin_notes}" : "";
        self::send(
            $borrowRequest->teacher_id,
            'teacher',
            'borrow_request_rejected',
            'Borrow Request Rejected',
            "Your request for {$borrowRequest->quantity_requested} unit(s) of {$borrowRequest->item->item_name} has been rejected.{$reason}",
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Notify about item return
     */
    public static function notifyItemReturned($borrowRequest)
    {
        self::send(
            $borrowRequest->teacher_id,
            'teacher',
            'item_returned',
            'Item Return Confirmed',
            "Your return of {$borrowRequest->quantity_requested} unit(s) of {$borrowRequest->item->item_name} has been confirmed",
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Notify about distribution request creation
     */
    public static function notifyDistributionRequestCreated($distributionRequest)
    {
        // Notify all admins
        self::broadcast(
            'admin',
            'distribution_request_created',
            'New Distribution Request',
            "{$distributionRequest->teacher->first_name} {$distributionRequest->teacher->last_name} requested {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->item->item_name}",
            $distributionRequest->id,
            'distribution_request'
        );
    }

    /**
     * Notify about distribution request approval
     */
    public static function notifyDistributionRequestApproved($distributionRequest)
    {
        self::send(
            $distributionRequest->teacher_id,
            'teacher',
            'distribution_approved',
            'Distribution Request Approved',
            "Your request for {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->item->item_name} has been approved and distributed",
            $distributionRequest->id,
            'distribution_request'
        );
    }

    /**
     * Notify about distribution request rejection
     */
    public static function notifyDistributionRequestRejected($distributionRequest)
    {
        $reason = $distributionRequest->admin_notes ? " Reason: {$distributionRequest->admin_notes}" : "";
        self::send(
            $distributionRequest->teacher_id,
            'teacher',
            'distribution_rejected',
            'Distribution Request Rejected',
            "Your request for {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->item->item_name} has been rejected.{$reason}",
            $distributionRequest->id,
            'distribution_request'
        );
    }

    /**
     * Notify about distribution group creation
     */
    public static function notifyDistributionGroupCreated($group, $teacherIds)
    {
        foreach ($teacherIds as $teacherId) {
            self::send(
                $teacherId,
                'teacher',
                'added_to_group',
                'Added to Distribution Group',
                "You have been added to the distribution group: {$group->group_name}",
                $group->id,
                'distribution_group'
            );
        }
    }

    /**
     * Notify about distribution group update
     */
    public static function notifyDistributionGroupUpdated($group, $addedTeacherIds, $removedTeacherIds)
    {
        // Notify added teachers
        foreach ($addedTeacherIds as $teacherId) {
            self::send(
                $teacherId,
                'teacher',
                'added_to_group',
                'Added to Distribution Group',
                "You have been added to the distribution group: {$group->group_name}",
                $group->id,
                'distribution_group'
            );
        }

        // Notify removed teachers
        foreach ($removedTeacherIds as $teacherId) {
            self::send(
                $teacherId,
                'teacher',
                'removed_from_group',
                'Removed from Distribution Group',
                "You have been removed from the distribution group: {$group->group_name}",
                $group->id,
                'distribution_group'
            );
        }
    }

    /**
     * Notify about item distribution
     */
    public static function notifyItemDistributed($distribution)
    {
        self::send(
            $distribution->teacher_id,
            'teacher',
            'item_distributed',
            'Items Distributed',
            "{$distribution->quantity_distributed} unit(s) of {$distribution->item->item_name} have been distributed to you",
            $distribution->id,
            'item_distribution'
        );
    }

    /**
     * Notify about distribution return
     */
    public static function notifyDistributionReturned($distribution)
    {
        self::send(
            $distribution->teacher_id,
            'teacher',
            'distribution_returned',
            'Distribution Return Confirmed',
            "Your return of {$distribution->quantity_distributed} unit(s) of {$distribution->item->item_name} has been confirmed",
            $distribution->id,
            'item_distribution'
        );
    }

    /**
     * Notify about low stock
     */
    public static function notifyLowStock($item)
    {
        self::broadcast(
            'admin',
            'low_stock',
            'Low Stock Alert',
            "{$item->item_name} is running low. Current quantity: {$item->quantity_available}",
            $item->id,
            'inventory'
        );
    }

    /**
     * Notify about purchase order creation
     */
    public static function notifyPurchaseOrderCreated($purchaseOrder)
    {
        self::broadcast(
            'admin',
            'purchase_order_created',
            'New Purchase Order',
            "Purchase order #{$purchaseOrder->po_number} has been created for {$purchaseOrder->supplier->supplier_name}",
            $purchaseOrder->id,
            'purchase_order'
        );
    }

    /**
     * Notify about purchase order received
     */
    public static function notifyPurchaseOrderReceived($purchaseOrder)
    {
        self::broadcast(
            'admin',
            'purchase_order_received',
            'Purchase Order Received',
            "Purchase order #{$purchaseOrder->po_number} has been received and inventory updated",
            $purchaseOrder->id,
            'purchase_order'
        );
    }

    /**
     * Broadcast inventory update
     */
    public static function broadcastInventoryUpdate($item)
    {
        WebSocketBroadcaster::broadcastToUserType('admin', [
            'type' => 'inventory_update',
            'item' => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'quantity_available' => $item->quantity_available,
                'quantity_total' => $item->quantity_total,
            ],
            'timestamp' => now()->toISOString(),
        ]);

        WebSocketBroadcaster::broadcastToUserType('teacher', [
            'type' => 'inventory_update',
            'item' => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'quantity_available' => $item->quantity_available,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Broadcast dashboard stats update
     */
    public static function broadcastStatsUpdate($userType, $stats)
    {
        WebSocketBroadcaster::broadcastStats($userType, $stats);
    }
}
