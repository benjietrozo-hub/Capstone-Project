<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking report_type column...\n";

// Get column info
$column = \DB::select("SHOW COLUMNS FROM reports WHERE Field = 'report_type'");
if ($column) {
    echo "report_type: " . $column[0]->Type . "\n";
}

$statusColumn = \DB::select("SHOW COLUMNS FROM reports WHERE Field = 'status'");
if ($statusColumn) {
    echo "status: " . $statusColumn[0]->Type . "\n";
}

// Try to create a report with shorter type
echo "\nCreating report with shorter type...\n";
$teacher = \App\Models\Teacher::first();
$item = \App\Models\ToolEquipment::first();

if ($teacher && $item) {
    try {
        $report = \App\Models\Report::create([
            'teacher_id' => $teacher->id,
            'item_id' => $item->id,
            'report_type' => 'dam', // Shorter value
            'description' => 'Sample damage report for testing',
            'status' => 'open',
            'date_reported' => now(),
        ]);
        
        echo "Created sample report with ID: " . $report->id . "\n";
        echo "Report Type: " . $report->report_type . "\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
