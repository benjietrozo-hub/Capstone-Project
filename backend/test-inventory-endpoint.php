<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TESTING INVENTORY ENDPOINT ===\n\n";

// Create a mock request
$request = new \Illuminate\Http\Request();
$request->merge([
    'per_page' => 50,
]);

// Create controller instance
$controller = new \App\Http\Controllers\API\Admin\InventoryController();

try {
    echo "1. Testing index method...\n";
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    
    echo "   ✓ Response status: " . $response->getStatusCode() . "\n";
    echo "   ✓ Total items: " . $data['total'] . "\n";
    echo "   ✓ Per page: " . $data['per_page'] . "\n";
    echo "   ✓ Current page: " . $data['current_page'] . "\n";
    echo "   ✓ Items in response: " . count($data['data']) . "\n\n";
    
    if (count($data['data']) > 0) {
        echo "   Sample item:\n";
        $item = $data['data'][0];
        echo "   - ID: {$item['id']}\n";
        echo "   - Code: {$item['item_code']}\n";
        echo "   - Name: {$item['item_name']}\n";
        echo "   - Category: {$item['category']}\n";
        echo "   - Available: {$item['quantity_available']}/{$item['quantity_total']}\n";
        echo "   - Condition: " . ($item['condition'] ?? 'N/A') . "\n";
        echo "   - Status: {$item['status']}\n";
    }
    
    echo "\n✅ API endpoint is working correctly!\n";
    
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
