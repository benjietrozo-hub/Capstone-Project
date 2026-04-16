<?php

namespace App\Jobs;

use App\Models\Teacher;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendDistributionNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    protected $teacher;
    protected $type;
    protected $data;
    protected $senderId;

    /**
     * Create a new job instance.
     */
    public function __construct(Teacher $teacher, string $type, array $data, int $senderId = null)
    {
        $this->teacher = $teacher;
        $this->type = $type;
        $this->data = $data;
        $this->senderId = $senderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Create database notification
            $this->createDatabaseNotification();

            // Send email notification
            $this->sendEmailNotification();

            Log::info("Distribution notification sent to teacher {$this->teacher->id} for type: {$this->type}");
        } catch (\Exception $e) {
            Log::error("Failed to send distribution notification: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create database notification
     */
    protected function createDatabaseNotification(): void
    {
        $title = $this->getNotificationTitle();
        $message = $this->getNotificationMessage();

        Notification::create([
            'user_id' => $this->teacher->id,
            'user_type' => 'teacher',
            'type' => 'distribution',
            'title' => $title,
            'message' => $message,
            'data' => json_encode($this->data),
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Send email notification
     */
    protected function sendEmailNotification(): void
    {
        if (empty($this->teacher->email)) {
            Log::warning("Teacher {$this->teacher->id} has no email address");
            return;
        }

        $subject = $this->getEmailSubject();
        $emailData = [
            'teacher' => $this->teacher,
            'type' => $this->type,
            'data' => $this->data,
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
        ];

        try {
            Mail::send('emails.distribution-notification', $emailData, function ($message) use ($subject) {
                $message->to($this->teacher->email)
                       ->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error("Failed to send email to {$this->teacher->email}: " . $e->getMessage());
            // Don't throw here, continue with database notification
        }
    }

    /**
     * Get notification title based on type
     */
    protected function getNotificationTitle(): string
    {
        $titles = [
            'bulk_distributed' => 'Items Distributed to Your Group',
            'item_distributed' => 'Item Distributed to You',
            'distribution_cancelled' => 'Distribution Cancelled',
            'distribution_returned' => 'Item Return Reminder',
            'distribution_due_soon' => 'Item Return Due Soon',
            'distribution_overdue' => 'Overdue Item Return',
            'bulk_distribution_approved' => 'Bulk Distribution Approved',
            'bulk_distribution_processed' => 'Bulk Distribution Processed',
        ];

        return $titles[$this->type] ?? 'Distribution Update';
    }

    /**
     * Get notification message based on type
     */
    protected function getNotificationMessage(): string
    {
        switch ($this->type) {
            case 'bulk_distributed':
                $itemName = $this->data['item_name'] ?? 'Item';
                $quantity = $this->data['quantity'] ?? 0;
                $groupName = $this->data['group_name'] ?? 'Group';
                return "You have been assigned {$quantity} unit(s) of {$itemName} through group distribution ({$groupName}).";

            case 'item_distributed':
                $itemName = $this->data['item_name'] ?? 'Item';
                $quantity = $this->data['quantity'] ?? 0;
                $returnDate = $this->data['expected_return_date'] ?? null;
                $message = "You have been assigned {$quantity} unit(s) of {$itemName}.";
                if ($returnDate) {
                    $message .= " Expected return date: " . date('F j, Y', strtotime($returnDate));
                }
                return $message;

            case 'distribution_cancelled':
                $itemName = $this->data['item_name'] ?? 'Item';
                return "The distribution of {$itemName} has been cancelled.";

            case 'distribution_returned':
                $itemName = $this->data['item_name'] ?? 'Item';
                $daysOverdue = $this->data['days_overdue'] ?? 0;
                if ($daysOverdue > 0) {
                    return "Your assigned item ({$itemName}) is {$daysOverdue} days overdue. Please return it as soon as possible.";
                }
                return "Reminder: Please return your assigned item ({$itemName}) soon.";

            case 'distribution_due_soon':
                $itemName = $this->data['item_name'] ?? 'Item';
                $daysUntilDue = $this->data['days_until_due'] ?? 0;
                return "Your assigned item ({$itemName}) is due for return in {$daysUntilDue} day(s). Please prepare for return.";

            case 'distribution_overdue':
                $itemName = $this->data['item_name'] ?? 'Item';
                $daysOverdue = $this->data['days_overdue'] ?? 0;
                return "Your assigned item ({$itemName}) is {$daysOverdue} days overdue. Immediate return required.";

            case 'bulk_distribution_approved':
                $itemName = $this->data['item_name'] ?? 'Item';
                $groupName = $this->data['group_name'] ?? 'Group';
                return "The bulk distribution request for {$itemName} to {$groupName} has been approved.";

            case 'bulk_distribution_processed':
                $itemName = $this->data['item_name'] ?? 'Item';
                $groupName = $this->data['group_name'] ?? 'Group';
                return "Bulk distribution of {$itemName} to {$groupName} has been processed and items assigned.";

            default:
                return 'You have a distribution-related update.';
        }
    }

    /**
     * Get email subject
     */
    protected function getEmailSubject(): string
    {
        return $this->getNotificationTitle() . ' - Inventory Management System';
    }
}
