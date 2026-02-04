<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\ToolEquipment;
use App\Models\Admin;

echo "=== Testing Inventory API ===\n\n";

// Check if admin exists
$admin = Admin::where('username', 'rootadmin')->first();
if (!$admin) {
    echo "ERROR: Root admin not found!\n";
    exit(1);
}

echo "Admin found: {$admin->username}\n";
echo "Admin ID: {$admin->id}\n\n";

// Test the query that the controller uses
echo "Testing inventory query...\n";
$query = ToolEquipment::query();

// Default sorting
$query->orderBy('created_at', 'desc');

// Get paginated results (simulating what the controller does)
$perPage = 15;
$items = $query->paginate($perPage);

echo "Total items: {$items->total()}\n";
echo "Per page: {$items->perPage()}\n";
echo "Current page: {$items->currentPage()}\n";
echo "Items on this page: {$items->count()}\n\n";

if ($items->count() > 0) {
    echo "Items returned:\n";
    foreach ($items as $item) {
        echo "- {$item->item_code}: {$item->item_name} (Status: {$item->status})\n";
    }
} else {
    echo "No items returned!\n";
}

echo "\n=== Testing JSON Response ===\n";
$jsonResponse = $items->toArray();
echo "Data array count: " . count($jsonResponse['data']) . "\n";
echo "First item: " . json_encode($jsonResponse['data'][0] ?? null, JSON_PRETTY_PRINT) . "\n";

echo "\n=== Done ===\n";
