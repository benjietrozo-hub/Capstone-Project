<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING INVENTORY API ===\n\n";

// Test 1: Direct model query
echo "1. Testing direct model query...\n";
try {
    $items = \App\Models\ToolEquipment::take(3)->get();
    echo "   ✓ Found {$items->count()} items\n";
    foreach($items as $item) {
        echo "   - {$item->item_code}: {$item->item_name}\n";
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 2: Paginated query (like API)
echo "\n2. Testing paginated query...\n";
try {
    $items = \App\Models\ToolEquipment::paginate(15);
    echo "   ✓ Total items: {$items->total()}\n";
    echo "   ✓ Per page: {$items->perPage()}\n";
    echo "   ✓ Current page: {$items->currentPage()}\n";
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 3: Check for missing columns
echo "\n3. Checking for missing columns...\n";
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('tools_equipment');
$requiredColumns = ['item_code', 'item_name', 'category', 'quantity_available', 'quantity_total', 'condition', 'status'];

foreach($requiredColumns as $col) {
    if (in_array($col, $columns)) {
        echo "   ✓ {$col} exists\n";
    } else {
        echo "   ✗ {$col} MISSING!\n";
    }
}

// Test 4: Check condition column mapping
echo "\n4. Testing condition column...\n";
try {
    $item = \App\Models\ToolEquipment::first();
    if ($item) {
        echo "   Item: {$item->item_name}\n";
        echo "   Condition (accessor): {$item->condition}\n";
        echo "   Condition_status (raw): {$item->condition_status}\n";
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
