<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\API\Admin\InventoryController;
use App\Models\Admin;

echo "=== SIMULATING ACTUAL API CALL ===\n\n";

// Get admin user
$admin = Admin::where('username', 'benjie.trozo')->first();
if (!$admin) {
    echo "❌ Admin not found!\n";
    exit(1);
}

echo "✅ Admin found: {$admin->username} (ID: {$admin->id})\n\n";

// Create a mock request
$request = Request::create('/api/admin/inventory', 'GET', [
    'per_page' => 50,
]);

// Set the authenticated user
$request->setUserResolver(function () use ($admin) {
    return $admin;
});

echo "Calling InventoryController->index()...\n";

try {
    $controller = new InventoryController();
    $response = $controller->index($request);
    
    $data = json_decode($response->getContent(), true);
    
    echo "Response Status: {$response->getStatusCode()}\n";
    echo "Total Items: " . ($data['total'] ?? 0) . "\n";
    echo "Items Count: " . count($data['data'] ?? []) . "\n\n";
    
    if (!empty($data['data'])) {
        echo "Items:\n";
        foreach ($data['data'] as $item) {
            echo "  - {$item['item_code']}: {$item['item_name']}\n";
        }
    } else {
        echo "❌ No items in response!\n";
    }
    
    echo "\nFull Response:\n";
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== DONE ===\n";
