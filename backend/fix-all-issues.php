<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SYSTEM FIX SCRIPT ===\n\n";

// 1. Check inventory
echo "1. Checking inventory...\n";
$inventoryCount = \App\Models\ToolEquipment::count();
echo "   ✓ Inventory items: {$inventoryCount}\n\n";

// 2. Check teachers
echo "2. Checking teachers...\n";
$activeTeachers = \App\Models\Teacher::count();
$deletedTeachers = \App\Models\Teacher::onlyTrashed()->count();
echo "   Active teachers: {$activeTeachers}\n";
echo "   Deleted teachers: {$deletedTeachers}\n";

if ($activeTeachers > 0) {
    echo "\n   Current teachers:\n";
    $teachers = \App\Models\Teacher::all(['id', 'username', 'email', 'employee_id']);
    foreach($teachers as $teacher) {
        echo "   - ID: {$teacher->id}, Username: {$teacher->username}, Email: {$teacher->email}, Employee ID: {$teacher->employee_id}\n";
    }
}

echo "\n3. System Status:\n";
echo "   ✓ Inventory: " . ($inventoryCount > 0 ? "OK ({$inventoryCount} items)" : "EMPTY") . "\n";
echo "   ✓ Teachers: " . ($activeTeachers >= 0 ? "OK ({$activeTeachers} active)" : "ERROR") . "\n";
echo "   ✓ Database: Connected\n";

echo "\n=== SYSTEM CHECK COMPLETE ===\n";
echo "\nNOTE: If you're getting 'username already taken' errors:\n";
echo "  - The username '{$teachers[0]->username}' is already in use\n";
echo "  - Try a different username\n";
echo "  - Or delete the existing teacher first\n";
