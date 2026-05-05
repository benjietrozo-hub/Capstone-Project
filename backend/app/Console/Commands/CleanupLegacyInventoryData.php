<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupLegacyInventoryData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:cleanup-legacy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Removes Legacy ID and Old Item Code from custom_attributes and standardizes property numbers.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
