<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BorrowRequest;
use App\Services\NotificationService;
use App\Services\EmailNotificationService;
use Carbon\Carbon;

class SendOverdueNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:send-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send overdue notifications for items that were not returned on time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();
        
        $this->info("Checking for overdue items as of: {$today}");
        
        // Get all borrowed items that are overdue (including items due today)
        $overdueRequests = BorrowRequest::with(['teacher', 'item'])
            ->where('status', 'borrowed')
            ->whereDate('expected_return_date', '<=', $today)
            ->get();
        
        if ($overdueRequests->isEmpty()) {
            $this->info('No overdue items found.');
            return 0;
        }
        
        $this->info("Found {$overdueRequests->count()} overdue item(s).");
        
        $sentToTeachers = 0;
        $sentToAdmins = 0;
        
        foreach ($overdueRequests as $borrowRequest) {
            try {
                $daysOverdue = Carbon::parse($borrowRequest->expected_return_date)->diffInDays(Carbon::today());
                
                // Determine message based on whether it's due today or already overdue
                if ($daysOverdue == 0) {
                    $teacherMessage = "REMINDER: {$borrowRequest->item->item_name} is due for return TODAY. Please return it by end of day.";
                    $adminMessage = "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} has {$borrowRequest->item->item_name} due for return TODAY.";
                } else {
                    $teacherMessage = "URGENT: {$borrowRequest->item->item_name} is {$daysOverdue} day(s) overdue. Please return it immediately.";
                    $adminMessage = "{$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} has {$borrowRequest->item->item_name} overdue by {$daysOverdue} day(s).";
                }
                
                // Send notification to teacher
                NotificationService::send(
                    $borrowRequest->teacher_id,
                    'teacher',
                    'item_overdue',
                    $daysOverdue == 0 ? 'Item Due Today' : 'Item Overdue',
                    $teacherMessage,
                    $borrowRequest->id,
                    'borrow_request'
                );
                
                // Send email notification to teacher
                EmailNotificationService::notifyItemOverdue($borrowRequest, $daysOverdue);
                
                $this->line("✓ Sent overdue notice to {$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name}");
                $sentToTeachers++;
                
                // Notify all admins (including super admin) about overdue items
                NotificationService::broadcast(
                    'admin',
                    'item_overdue_admin',
                    $daysOverdue == 0 ? 'Item Due Today Alert' : 'Overdue Item Alert',
                    $adminMessage,
                    $borrowRequest->id,
                    'borrow_request'
                );
                
                $sentToAdmins++;
                
            } catch (\Exception $e) {
                $this->error("✗ Failed to send overdue notice for borrow request #{$borrowRequest->id}: {$e->getMessage()}");
            }
        }
        
        $this->info("\nSent {$sentToTeachers} notification(s) to teachers.");
        $this->info("Sent {$sentToAdmins} notification(s) to all admins (including super admin).");
        
        return 0;
    }
}
