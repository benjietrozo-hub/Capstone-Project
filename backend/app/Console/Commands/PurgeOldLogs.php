<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PurgeOldLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:purge {days=90}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purge system logs older than the specified number of days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->argument('days');
        $date = now()->subDays($days);
        
        $count = \App\Models\SystemLog::where('created_at', '<', $date)->count();
        
        if ($count === 0) {
            $this->info("No logs older than {$days} days found.");
            return;
        }

        $this->info("Found {$count} logs older than {$days} days.");
        
        // Use delete directly for efficiency
        \App\Models\SystemLog::where('created_at', '<', $date)->delete();
        $this->info("Successfully purged {$count} old logs.");
    }
}
