<?php

// Simple API test without authentication
require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';

echo "=== Simple API Test ===\n";

try {
    // Test database connection
    
    $connection = DB::connection();
    echo "Database connection: " . ($connection ? "OK" : "FAILED") . "\n";
    
    // Test if we can query the tools_equipment table
    $count = DB::table('tools_equipment')->count();
    echo "Tools equipment count: " . $count . "\n";
    
    // Test if we can create a simple item
    $testItem = [
        'item_code' => 'TEST' . time(),
        'item_name' => 'Test Item',
        'description' => 'Test description',
        'category' => 'Test',
        'quantity_total' => 10,
        'quantity_available' => 10,
        'quantity_borrowed' => 0,
        'condition_status' => 'good',
        'location' => 'Test Location',
        'unit_price' => 99.99,
        'acquisition_date' => date('Y-m-d'),
        'status' => 'active',
    ];
    
    echo "Creating test item...\n";
    $id = DB::table('tools_equipment')->insertGetId($testItem);
    echo "Created item with ID: " . $id . "\n";
    
    // Test if we can retrieve it
    $item = DB::table('tools_equipment')->where('id', $id)->first();
    echo "Retrieved item: " . $item->item_name . "\n";
    
    // Clean up
    DB::table('tools_equipment')->where('id', $id)->delete();
    echo "Test item cleaned up\n";
    
    echo "API Test: PASSED\n";
    
} catch (Exception $e) {
    echo "API Test: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "=== Test Complete ===\n";
?>
