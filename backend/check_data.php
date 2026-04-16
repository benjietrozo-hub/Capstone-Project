<?php

// Simple database connection and data check
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Get database connection
$db = $app->make('Illuminate\Database\ConnectionInterface');

echo "=== Database Connection Test ===\n";
echo "Database connected: " . ($db ? "Yes" : "No") . "\n\n";

try {
    // Check if tables exist and have data
    $tables = ['tools_equipment', 'teachers', 'borrow_requests'];
    
    foreach ($tables as $table) {
        $count = $db->table($table)->count();
        echo "$table: $count records\n";
    }
    
    echo "\n=== Sample Data Check ===\n";
    
    // Check for sample items
    $items = $db->table('tools_equipment')->limit(3)->get(['item_code', 'item_name', 'quantity_available']);
    if ($items->count() > 0) {
        echo "Sample items found:\n";
        foreach ($items as $item) {
            echo "- {$item->item_code}: {$item->item_name} (Available: {$item->quantity_available})\n";
        }
    } else {
        echo "No items found in tools_equipment table.\n";
    }
    
    // Check for teachers
    $teachers = $db->table('teachers')->limit(3)->get(['teacher_id', 'first_name', 'last_name', 'status']);
    if ($teachers->count() > 0) {
        echo "Sample teachers found:\n";
        foreach ($teachers as $teacher) {
            echo "- {$teacher->teacher_id}: {$teacher->first_name} {$teacher->last_name} (Status: {$teacher->status})\n";
        }
    } else {
        echo "No teachers found in teachers table.\n";
    }
    
    // Check for borrow requests
    $requests = $db->table('borrow_requests')->limit(3)->get(['id', 'teacher_id', 'status']);
    if ($requests->count() > 0) {
        echo "Sample borrow requests found:\n";
        foreach ($requests as $request) {
            echo "- Request {$request->id}: Teacher {$request->teacher_id} (Status: {$request->status})\n";
        }
    } else {
        echo "No borrow requests found in borrow_requests table.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
