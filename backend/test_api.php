<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Reports API...\n";

// Test the API directly
try {
    $reports = \App\Models\Report::with(['teacher', 'item'])->get();
    
    echo "Found " . $reports->count() . " reports\n";
    
    foreach ($reports as $report) {
        echo "Report ID: " . $report->id . "\n";
        echo "Type: " . $report->report_type . "\n";
        echo "Status: " . $report->status . "\n";
        echo "Teacher: " . ($report->teacher ? $report->teacher->full_name : 'N/A') . "\n";
        echo "Item: " . ($report->item ? $report->item->item_name : 'N/A') . "\n";
        echo "---\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nAPI test completed!\n";
