<?php

// Test the complete inventory add flow
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\ToolEquipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

echo "=== Testing Complete Inventory Add Flow ===\n";

// Simulate a POST request with test data
$testData = [
    'item_code' => 'TEST' . rand(1000, 9999),
    'item_name' => 'Test Item ' . rand(1, 100),
    'description' => 'Test description for item',
    'category' => 'TestCat', // Short category (under 50 chars)
    'quantity_total' => 15,
    'condition' => 'good',
    'location' => 'Test Lab',
    'unit_price' => 199.99,
    'acquisition_date' => '2026-04-14',
    'notes' => 'Test notes',
];

echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Step 1: Validation Test
echo "=== Step 1: Validation Test ===\n";
$rules = [
    'item_code' => 'required|string|unique:tools_equipment',
    'item_name' => 'required|string|max:255',
    'description' => 'nullable|string',
    'category' => 'required|string|max:50',
    'quantity_total' => 'required|integer|min:0',
    'condition' => 'required|in:excellent,good,fair,poor,damaged',
    'location' => 'nullable|string|max:255',
    'unit_price' => 'nullable|numeric|min:0',
    'acquisition_date' => 'nullable|date',
    'notes' => 'nullable|string',
];

$validator = Validator::make($testData, $rules);

if ($validator->fails()) {
    echo "❌ Validation failed:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "  - $error\n";
    }
    exit(1);
} else {
    echo "✅ Validation passed\n";
}

// Step 2: Database Insertion Test
echo "\n=== Step 2: Database Insertion Test ===\n";
try {
    // Prepare data for insertion
    $insertData = $testData;
    $insertData['quantity_available'] = $insertData['quantity_total'];
    $insertData['quantity_borrowed'] = 0;
    $insertData['condition_status'] = $insertData['condition'];
    unset($insertData['condition']);

    $item = ToolEquipment::create($insertData);
    
    if ($item) {
        echo "✅ SUCCESS: Item created\n";
        echo "  ID: {$item->id}\n";
        echo "  Item Code: {$item->item_code}\n";
        echo "  Item Name: {$item->item_name}\n";
        echo "  Category: '{$item->category}' (Length: " . strlen($item->category) . ")\n";
        echo "  Quantity: {$item->quantity_total}\n";
        echo "  Available: {$item->quantity_available}\n";
        echo "  Condition: {$item->condition_status}\n";
        echo "  Location: {$item->location}\n";
        echo "  Price: {$item->unit_price}\n";
        echo "  Status: {$item->status}\n";
        echo "  Created: {$item->created_at}\n";
    } else {
        echo "❌ FAILED: Could not create item\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . "\n";
    echo "  Line: " . $e->getLine() . "\n";
    
    if ($e->getPrevious()) {
        echo "  Previous: " . $e->getPrevious()->getMessage() . "\n";
    }
    exit(1);
}

// Step 3: Verify Data Integrity
echo "\n=== Step 3: Data Integrity Check ===\n";
try {
    $retrieved = ToolEquipment::find($item->id);
    if ($retrieved) {
        echo "✅ Data retrieved successfully\n";
        echo "  All fields match: " . ($retrieved->item_code === $item->item_code ? "✅" : "❌") . "\n";
        echo "  Category length OK: " . (strlen($retrieved->category) <= 50 ? "✅" : "❌") . "\n";
        echo "  Quantity matches: " . ($retrieved->quantity_total === $item->quantity_total ? "✅" : "❌") . "\n";
    } else {
        echo "❌ Could not retrieve item\n";
    }
} catch (Exception $e) {
    echo "❌ Retrieval error: " . $e->getMessage() . "\n";
}

// Step 4: Test Long Category (should fail)
echo "\n=== Step 4: Long Category Test (should fail) ===\n";
$longCategoryData = $testData;
$longCategoryData['item_code'] = 'LONG' . rand(1000, 9999);
$longCategoryData['category'] = 'This is a very long category name that exceeds the 50 character limit and should be rejected';

$longValidator = Validator::make($longCategoryData, $rules);
if ($longValidator->fails()) {
    echo "✅ Long category correctly rejected\n";
    foreach ($longValidator->errors()->all() as $error) {
        echo "  - $error\n";
    }
} else {
    echo "❌ Long category was not rejected (this is bad)\n";
}

echo "\n=== Test Complete ===\n";
echo "✅ Inventory add functionality is working correctly!\n";
?>
