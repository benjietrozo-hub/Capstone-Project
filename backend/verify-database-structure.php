<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "========================================\n";
echo "Database Structure Verification\n";
echo "========================================\n\n";

$tables = DB::select('SHOW TABLES');
$databaseName = env('DB_DATABASE');
$tableKey = "Tables_in_{$databaseName}";

echo "Connected to database: {$databaseName}\n\n";

$expectedTables = [
    'admins' => 'Admin users',
    'teachers' => 'Teacher users',
    'tools_equipment' => 'Inventory items',
    'borrow_requests' => 'Borrow requests',
    'teacher_inventory' => 'Teacher personal inventory',
    'inventory_logs' => 'Inventory change logs',
    'system_logs' => 'System activity logs',
    'notifications' => 'User notifications',
    'reports' => 'Issue reports',
    'personal_access_tokens' => 'API tokens (Sanctum)',
    'password_reset_tokens' => 'Password resets',
    'sessions' => 'User sessions',
    'cache' => 'Cache storage',
    'cache_locks' => 'Cache locks',
    'jobs' => 'Queue jobs',
    'job_batches' => 'Batch jobs',
    'failed_jobs' => 'Failed jobs',
    'migrations' => 'Migration tracking',
];

$unexpectedTables = [
    'users' => 'Unused (using admins/teachers instead)',
    'telescope_entries' => 'Development tool (not needed)',
    'telescope_entries_tags' => 'Development tool (not needed)',
    'telescope_monitoring' => 'Development tool (not needed)',
];

echo "EXPECTED TABLES:\n";
echo str_repeat("-", 80) . "\n";

$foundTables = [];
foreach ($tables as $table) {
    $tableName = $table->$tableKey;
    $foundTables[] = $tableName;
}

$allGood = true;

foreach ($expectedTables as $tableName => $description) {
    $exists = in_array($tableName, $foundTables);
    $status = $exists ? "✓ EXISTS" : "✗ MISSING";
    $color = $exists ? "" : " [WARNING]";
    
    printf("%-30s %-15s %s%s\n", $tableName, $status, $description, $color);
    
    if (!$exists && $tableName !== 'system_logs') {
        $allGood = false;
    }
}

echo "\n";
echo "UNEXPECTED TABLES (Should be removed):\n";
echo str_repeat("-", 80) . "\n";

$foundUnexpected = false;
foreach ($unexpectedTables as $tableName => $description) {
    if (in_array($tableName, $foundTables)) {
        printf("%-30s %-15s %s [SHOULD REMOVE]\n", $tableName, "✗ FOUND", $description);
        $foundUnexpected = true;
    }
}

if (!$foundUnexpected) {
    echo "✓ No unexpected tables found\n";
}

echo "\n";
echo "SUMMARY:\n";
echo str_repeat("-", 80) . "\n";
echo "Total tables: " . count($foundTables) . "\n";
echo "Expected tables found: " . count(array_intersect($foundTables, array_keys($expectedTables))) . "/" . count($expectedTables) . "\n";
echo "Unexpected tables: " . count(array_intersect($foundTables, array_keys($unexpectedTables))) . "\n";

echo "\n";

if ($foundUnexpected) {
    echo "⚠️  ACTION REQUIRED:\n";
    echo "Run: php artisan migrate\n";
    echo "This will remove unused tables and add system_logs table.\n";
} elseif (!in_array('system_logs', $foundTables)) {
    echo "⚠️  ACTION REQUIRED:\n";
    echo "Run: php artisan migrate\n";
    echo "This will add the new system_logs table.\n";
} else {
    echo "✓ Database structure is clean and up to date!\n";
}

echo "\n";
echo "========================================\n";
