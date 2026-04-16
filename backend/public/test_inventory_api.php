<?php

// Test the create inventory API endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include Laravel bootstrap
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Simulate a POST request to create inventory
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    echo "=== Testing Create Inventory API ===\n";
    echo "Received Data:\n";
    echo json_encode($input, JSON_PRETTY_PRINT) . "\n\n";
    
    // Test validation
    use Illuminate\Support\Facades\Validator;
    
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
    ];
    
    $validator = Validator::make($input, $rules);
    
    if ($validator->fails()) {
        echo "Validation Errors:\n";
        echo json_encode($validator->errors()->all(), JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "Validation: PASSED\n";
        
        // Test actual database insertion
        try {
            use App\Models\ToolEquipment;
            
            $validated = $validator->validated();
            $validated['quantity_available'] = $validated['quantity_total'];
            $validated['quantity_borrowed'] = 0;
            
            $item = ToolEquipment::create($validated);
            
            echo "SUCCESS: Item created with ID: " . $item->id . "\n";
            echo "Item Code: " . $item->item_code . "\n";
            echo "Item Name: " . $item->item_name . "\n";
            
        } catch (Exception $e) {
            echo "ERROR: " . $e->getMessage() . "\n";
            echo "File: " . $e->getFile() . "\n";
            echo "Line: " . $e->getLine() . "\n";
        }
    }
} else {
    echo "=== Create Inventory API Test ===\n";
    echo "Please send a POST request to this endpoint with inventory data\n\n";
    
    echo "Example payload:\n";
    echo json_encode([
        'item_code' => 'TEST001',
        'item_name' => 'Test Item',
        'description' => 'Test description',
        'category' => 'Test',
        'quantity_total' => 10,
        'condition' => 'good',
        'location' => 'Test Location',
        'unit_price' => 99.99,
        'acquisition_date' => date('Y-m-d'),
        'notes' => 'Test notes'
    ], JSON_PRETTY_PRINT) . "\n";
}
?>
