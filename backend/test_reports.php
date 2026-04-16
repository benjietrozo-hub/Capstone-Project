<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Reports...\n\n";

// Check reports count
$reportsCount = \App\Models\Report::count();
echo "Total Reports: " . $reportsCount . "\n\n";

// Get sample reports
$reports = \App\Models\Report::with(['teacher', 'item'])->take(3)->get();

if ($reports->isEmpty()) {
    echo "No reports found. Creating sample report...\n";
    
    // Create a sample report
    $teacher = \App\Models\Teacher::first();
    $item = \App\Models\ToolEquipment::first();
    
    if ($teacher && $item) {
        $report = \App\Models\Report::create([
            'teacher_id' => $teacher->id,
            'item_id' => $item->id,
            'report_type' => 'damaged',
            'description' => 'Sample damage report for testing',
            'status' => 'pending',
            'date_reported' => now(),
        ]);
        
        echo "Created sample report with ID: " . $report->id . "\n";
    }
} else {
    echo "Sample Reports:\n";
    foreach ($reports as $report) {
        echo "ID: " . $report->id . "\n";
        echo "Code: " . $report->report_code . "\n";
        echo "Status: " . $report->status . "\n";
        echo "Teacher: " . ($report->teacher ? $report->teacher->full_name : 'N/A') . "\n";
        echo "Item: " . ($report->item ? $report->item->item_name : 'N/A') . "\n";
        echo "Description: " . $report->description . "\n";
        echo "---\n";
    }
}

echo "\nReports test completed!\n";
