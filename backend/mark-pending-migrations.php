<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== MARKING PENDING MIGRATIONS AS RUN ===\n\n";

$pendingMigrations = [
    '2026_01_29_045535_create_tools_equipment_table',
    '2026_01_29_045536_create_borrow_requests_table',
    '2026_01_29_045536_create_notifications_table',
    '2026_01_29_045537_create_reports_table',
    '2026_01_29_045538_create_inventory_logs_table',
];

foreach ($pendingMigrations as $migration) {
    // Check if already exists
    $exists = DB::table('migrations')->where('migration', $migration)->exists();
    
    if (!$exists) {
        DB::table('migrations')->insert([
            'migration' => $migration,
            'batch' => 1
        ]);
        echo "✓ Marked: {$migration}\n";
    } else {
        echo "- Already marked: {$migration}\n";
    }
}

echo "\n✅ All pending migrations marked as run!\n";
