<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Admin;
use App\Models\Teacher;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\SystemNotificationMail;

class EmailNotificationService
{
    /**
     * Email notification types that should be sent
     */
    private static $emailEnabledTypes = [
        'borrow_request_created',
        'borrow_request_approved', 
        'borrow_request_rejected',
        'item_returned',
        'item_returned_issue',
        'distribution_request_created',
        'distribution_approved',
        'distribution_rejected',
        'item_distributed',
        'distribution_returned',
        'low_stock',
        'item_overdue',
    ];

    /**
     * Send email notification based on system notification
     */
    public static function sendEmailNotification($userId, $userType, $type, $title, $message, $relatedId = null, $relatedType = null)
    {
        // Check if email notifications are enabled for this type
        if (!in_array($type, self::$emailEnabledTypes)) {
            return false;
        }

        try {
            // Get user email
            $email = self::getUserEmail($userId, $userType);
            if (!$email) {
                Log::warning("No email found for user {$userId} of type {$userType}");
                return false;
            }

            // Prepare email data
            $emailData = [
                'user_type' => $userType,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'related_id' => $relatedId,
                'related_type' => $relatedType,
                'recipient_email' => $email,
            ];

            // Send email
            // Queue email for background processing
            Mail::to($email)->queue(new SystemNotificationMail($emailData));

            Log::info("Email notification sent to {$email} for type: {$type}");
            return true;

        } catch (\Exception $e) {
            Log::error("Failed to send email notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send email to all users of a specific type
     */
    public static function broadcastEmail($userType, $type, $title, $message, $relatedId = null, $relatedType = null)
    {
        if (!in_array($type, self::$emailEnabledTypes)) {
            return false;
        }

        try {
            // Get all active users of this type
            if ($userType === 'admin') {
                $users = Admin::where('status', 'active')->get();
            } elseif ($userType === 'teacher') {
                $users = Teacher::where('status', 'active')->get();
            } else {
                return false;
            }

            $sentCount = 0;
            foreach ($users as $user) {
                if (self::sendEmailNotification($user->id, $userType, $type, $title, $message, $relatedId, $relatedType)) {
                    $sentCount++;
                }
            }

            Log::info("Broadcast email sent to {$sentCount} {$userType}(s) for type: {$type}");
            return $sentCount;

        } catch (\Exception $e) {
            Log::error("Failed to broadcast email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user email based on user type and ID
     */
    private static function getUserEmail($userId, $userType)
    {
        try {
            if ($userType === 'admin') {
                $user = Admin::find($userId);
                return $user ? $user->email : null;
            } elseif ($userType === 'teacher') {
                $user = Teacher::find($userId);
                return $user ? $user->email : null;
            }
            return null;
        } catch (\Exception $e) {
            Log::error("Error getting user email: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Send email for borrow request created
     */
    public static function notifyBorrowRequestCreated($borrowRequest)
    {
        self::broadcastEmail(
            'admin',
            'borrow_request_created',
            'New Borrow Request',
            "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} requested {$borrowRequest->quantity_requested} unit(s) of {$borrowRequest->item->item_name}",
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Send email for borrow request approved
     */
    public static function notifyBorrowRequestApproved($borrowRequest)
    {
        self::sendEmailNotification(
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
     * Send email for borrow request rejected
     */
    public static function notifyBorrowRequestRejected($borrowRequest)
    {
        $reason = $borrowRequest->admin_notes ? " Reason: {$borrowRequest->admin_notes}" : "";
        self::sendEmailNotification(
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
     * Send email for item returned
     */
    public static function notifyItemReturned($borrowRequest, $condition = 'good', $penalty = 0)
    {
        $categoryName = $borrowRequest->category->category_name ?? ($borrowRequest->item->item_name ?? 'Equipment');
        $qty = $borrowRequest->quantity_requested;

        if ($condition === 'good') {
            $title = 'Item Return Confirmed';
            $message = "Your return of {$qty} unit(s) of {$categoryName} has been confirmed. Condition: Good.";
        } elseif ($condition === 'damaged') {
            $title = 'Item Returned — Marked as Damaged';
            $message = "Your return of {$qty} unit(s) of {$categoryName} has been processed. The item(s) were marked as DAMAGED.";
            if ($penalty > 0) {
                $message .= " A penalty of ₱" . number_format($penalty, 2) . " has been applied.";
            }
        } else {
            $title = 'Item Return — Marked as Lost';
            $message = "Your return of {$qty} unit(s) of {$categoryName} has been processed. The item(s) were marked as LOST.";
            if ($penalty > 0) {
                $message .= " A penalty of ₱" . number_format($penalty, 2) . " has been applied.";
            }
        }

        self::sendEmailNotification(
            $borrowRequest->teacher_id,
            'teacher',
            'item_returned',
            $title,
            $message,
            $borrowRequest->id,
            'borrow_request'
        );
    }

    /**
     * Send email for distribution request created
     */
    public static function notifyDistributionRequestCreated($distributionRequest)
    {
        self::broadcastEmail(
            'admin',
            'distribution_request_created',
            'New Distribution Request',
            "{$distributionRequest->teacher->first_name} {$distributionRequest->teacher->last_name} requested {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->item->item_name}",
            $distributionRequest->id,
            'distribution_request'
        );
    }

    /**
     * Send email for distribution request approved
     */
    public static function notifyDistributionRequestApproved($distributionRequest)
    {
        self::sendEmailNotification(
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
     * Send email for distribution request rejected
     */
    public static function notifyDistributionRequestRejected($distributionRequest)
    {
        $reason = $distributionRequest->admin_notes ? " Reason: {$distributionRequest->admin_notes}" : "";
        self::sendEmailNotification(
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
     * Send email for low stock alert
     */
    public static function notifyLowStock($item)
    {
        self::broadcastEmail(
            'admin',
            'low_stock',
            'Low Stock Alert',
            "{$item->item_name} is running low. Current quantity: {$item->quantity_available}",
            $item->id,
            'inventory'
        );
    }

    /**
     * Send email for overdue items
     */
    public static function notifyItemOverdue($borrowRequest, $daysOverdue)
    {
        if ($daysOverdue == 0) {
            $teacherMessage = "REMINDER: {$borrowRequest->item->item_name} is due for return TODAY. Please return it by end of day.";
            $adminMessage = "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} has {$borrowRequest->item->item_name} due for return TODAY.";
            $title = 'Item Due Today';
        } else {
            $teacherMessage = "URGENT: {$borrowRequest->item->item_name} is {$daysOverdue} day(s) overdue. Please return it immediately.";
            $adminMessage = "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} has {$borrowRequest->item->item_name} overdue by {$daysOverdue} day(s).";
            $title = 'Item Overdue';
        }

        // Send to teacher
        self::sendEmailNotification(
            $borrowRequest->teacher_id,
            'teacher',
            'item_overdue',
            $title,
            $teacherMessage,
            $borrowRequest->id,
            'borrow_request'
        );

        // Send to all admins
        self::broadcastEmail(
            'admin',
            'item_overdue_admin',
            $title . ' Alert',
            $adminMessage,
            $borrowRequest->id,
            'borrow_request'
        );
    }


}
