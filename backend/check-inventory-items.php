<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ToolEquipment;

echo "=== Checking Inventory Items ===\n\n";

$count = ToolEquipment::count();
echo "Total items in database: $count\n\n";

if ($count > 0) {
    echo "Sample items:\n";
    $items = ToolEquipment::take(10)->get();
    foreach ($items as $item) {
        echo "ID: {$item->id}\n";
        echo "Code: {$item->item_code}\n";
        echo "Name: {$item->item_name}\n";
        echo "Category: {$item->category}\n";
        echo "Status: {$item->status}\n";
        echo "Qty Total: {$item->quantity_total}\n";
        echo "Qty Available: {$item->quantity_available}\n";
        echo "---\n";
    }
} else {
    echo "No items found in database!\n";
    echo "Creating sample items...\n\n";
    
    $sampleItems = [
        [
            'item_code' => 'TOOL-001',
            'item_name' => 'Hammer',
            'description' => 'Standard claw hammer',
            'category' => 'Hand Tools',
            'quantity_total' => 10,
            'quantity_available' => 10,
            'quantity_borrowed' => 0,
            'condition_status' => 'good',
            'status' => 'active',
            'location' => 'Storage Room A',
            'unit_price' => 15.99,
        ],
        [
            'item_code' => 'TOOL-002',
            'item_name' => 'Screwdriver Set',
            'description' => '10-piece screwdriver set',
            'category' => 'Hand Tools',
            'quantity_total' => 5,
            'quantity_available' => 5,
            'quantity_borrowed' => 0,
            'condition_status' => 'excellent',
            'status' => 'active',
            'location' => 'Storage Room A',
            'unit_price' => 25.50,
        ],
        [
            'item_code' => 'EQUIP-001',
            'item_name' => 'Laptop',
            'description' => 'Dell Latitude 5420',
            'category' => 'Electronics',
            'quantity_total' => 3,
            'quantity_available' => 3,
            'quantity_borrowed' => 0,
            'condition_status' => 'excellent',
            'status' => 'active',
            'location' => 'IT Room',
            'unit_price' => 899.99,
        ],
        [
            'item_code' => 'EQUIP-002',
            'item_name' => 'Projector',
            'description' => 'Epson PowerLite',
            'category' => 'Electronics',
            'quantity_total' => 2,
            'quantity_available' => 2,
            'quantity_borrowed' => 0,
            'condition_status' => 'good',
            'status' => 'active',
            'location' => 'AV Room',
            'unit_price' => 450.00,
        ],
        [
            'item_code' => 'LAB-001',
            'item_name' => 'Microscope',
            'description' => 'Digital microscope',
            'category' => 'Laboratory Equipment',
            'quantity_total' => 4,
            'quantity_available' => 4,
            'quantity_borrowed' => 0,
            'condition_status' => 'excellent',
            'status' => 'active',
            'location' => 'Science Lab',
            'unit_price' => 350.00,
        ],
    ];
    
    foreach ($sampleItems as $itemData) {
        $item = ToolEquipment::create($itemData);
        echo "Created: {$item->item_code} - {$item->item_name}\n";
    }
    
    echo "\nSample items created successfully!\n";
}

echo "\n=== Done ===\n";
