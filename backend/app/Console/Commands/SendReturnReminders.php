<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BorrowRequest;
use App\Services\NotificationService;
use Carbon\Carbon;

class SendReturnReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:send-return
                            {--days=1 : Number of days before return date to send reminder}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send return reminders to teachers for items that are nearly due';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $daysBeforeReturn = $this->option('days');
        $targetDate = Carbon::today()->addDays($daysBeforeReturn)->toDateString();
        
        $this->info("Checking for items due on: {$targetDate}");
        
        // Get all borrowed items that are due on the target date
        $borrowRequests = BorrowRequest::with(['teacher', 'item'])
            ->where('status', 'borrowed')
            ->whereDate('expected_return_date', $targetDate)
            ->get();
        
        if ($borrowRequests->isEmpty()) {
            $this->info('No items due for return on this date.');
            return 0;
        }
        
        $this->info("Found {$borrowRequests->count()} item(s) due for return.");
        
        $sentCount = 0;
        
        foreach ($borrowRequests as $borrowRequest) {
            try {
                // Send reminder notification to teacher
                NotificationService::send(
                    $borrowRequest->teacher_id,
                    'teacher',
                    'return_reminder',
                    'Return Reminder',
                    "Reminder: {$borrowRequest->item->item_name} is due for return on {$borrowRequest->expected_return_date}. Please return it on time.",
                    $borrowRequest->id,
                    'borrow_request'
                );
                
                $this->line("✓ Sent reminder to {$borrowRequest->teacher->first_name} {$borrowRequest->teacher->last_name} for {$borrowRequest->item->item_name}");
                $sentCount++;
                
            } catch (\Exception $e) {
                $this->error("✗ Failed to send reminder for borrow request #{$borrowRequest->id}: {$e->getMessage()}");
            }
        }
        
        $this->info("\nSent {$sentCount} reminder(s) successfully.");
        
        return 0;
    }
}
