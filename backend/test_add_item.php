<?php

// Test adding an item directly to inventory
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\ToolEquipment;

echo "=== Testing Add Item Functionality ===\n";

try {
    // Test data for new item
    $testItem = [
        'item_code' => 'TEST' . rand(1000, 9999),
        'item_name' => 'Test Item ' . rand(1, 100),
        'description' => 'Test description for item',
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

    echo "Test Data:\n";
    echo json_encode($testItem, JSON_PRETTY_PRINT) . "\n\n";

    // Test validation rules
    $rules = [
        'item_code' => 'required|string|unique:tools_equipment',
        'item_name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'category' => 'required|string',
        'quantity_total' => 'required|integer|min:0',
        'condition' => 'required|in:excellent,good,fair,poor,damaged',
        'location' => 'nullable|string|max:255',
        'unit_price' => 'nullable|numeric|min:0',
        'acquisition_date' => 'nullable|date',
        'notes' => 'nullable|string',
        'image' => 'nullable|image|max:2048',
    ];

    // Map condition to condition_status for validation
    $testItemForValidation = $testItem;
    $testItemForValidation['condition'] = $testItem['condition_status'];
    unset($testItemForValidation['condition_status']);

    $validator = Illuminate\Support\Facades\Validator::make($testItemForValidation, $rules);

    if ($validator->fails()) {
        echo "❌ Validation Errors:\n";
        foreach ($validator->errors()->all() as $error) {
            echo "  - $error\n";
        }
    } else {
        echo "✅ Validation: PASSED\n";
        
        // Test database insertion
        $item = ToolEquipment::create($testItem);
        
        if ($item) {
            echo "✅ SUCCESS: Item created with ID: " . $item->id . "\n";
            echo "  Item Code: " . $item->item_code . "\n";
            echo "  Item Name: " . $item->item_name . "\n";
            echo "  Category: " . $item->category . "\n";
            echo "  Quantity: " . $item->quantity_total . "\n";
            echo "  Condition: " . $item->condition_status . "\n";
        } else {
            echo "❌ FAILED: Could not create item\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . "\n";
    echo "  Line: " . $e->getLine() . "\n";
    
    if ($e->getPrevious()) {
        echo "  Previous: " . $e->getPrevious()->getMessage() . "\n";
    }
}

echo "\n=== Test Complete ===\n";
?>
