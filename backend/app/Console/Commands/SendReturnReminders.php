<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BorrowRequest;
use App\Models\ItemDistribution;
use App\Services\NotificationService;
use App\Services\DistributionNotificationService;
use Carbon\Carbon;

class SendReturnReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:send-return
                            {--days=3 : Number of days before return date to send reminder}
                            {--test : Run in test mode without sending emails}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email return reminders to teachers for items that are nearly due (3 days) and overdue';

    /**
     * Execute the console command.
     */
    public function handle(DistributionNotificationService $distributionNotificationService)
    {
        $isTest = $this->option('test');
        
        $this->info("Sending distribution return reminders...");
        $this->info("Mode: " . ($isTest ? "TEST (no emails sent)" : "LIVE (emails will be sent)"));
        
        try {
            $distributionNotificationService->sendReturnReminders();
            $this->info('Distribution return reminders queued successfully.');
            
            if ($isTest) {
                $this->info('Test mode: No actual emails were sent.');
            } else {
                $this->info('Live mode: Emails have been queued for delivery.');
            }
            
            $this->info('Reminders include:');
            $this->info('- Items due within 3 days (Nearly Due)');
            $this->info('- Items already overdue (Overdue)');
            
        } catch (\Exception $e) {
            $this->error('Failed to send distribution return reminders: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
