<?php

// Test the create inventory API endpoint
header('Content-Type: application/json');

// Include Laravel bootstrap
$app = require_once __DIR__ . '/bootstrap/app.php';

// Test data for creating inventory item
$testData = [
    'item_code' => 'TEST001',
    'item_name' => 'Test Item',
    'description' => 'Test description for item',
    'category' => 'Test',
    'quantity_total' => 10,
    'condition' => 'good',
    'location' => 'Test Location',
    'unit_price' => 99.99,
    'acquisition_date' => date('Y-m-d'),
    'notes' => 'Test notes',
];

echo "=== Testing Create Inventory API ===\n";
echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Test the validation rules
use Illuminate\Support\Facades\Validator;
use App\Models\ToolEquipment;

$validator = Validator::make($testData, [
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
]);

if ($validator->fails()) {
    echo "Validation Errors:\n";
    echo json_encode($validator->errors()->all(), JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Validation: PASSED\n";
}

// Check if item_code already exists
$existingItem = ToolEquipment::where('item_code', $testData['item_code'])->first();
if ($existingItem) {
    echo "Item Code Already Exists: {$existingItem->item_code} - {$existingItem->item_name}\n";
} else {
    echo "Item Code: Available\n";
}

// Test database connection
try {
    $count = ToolEquipment::count();
    echo "Current Database Count: $count\n";
} catch (Exception $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
