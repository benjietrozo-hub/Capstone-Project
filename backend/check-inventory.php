<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== INVENTORY CHECK ===\n\n";

$count = \App\Models\ToolEquipment::count();
echo "Total inventory items: {$count}\n\n";

if ($count > 0) {
    echo "Sample items:\n";
    $items = \App\Models\ToolEquipment::take(5)->get(['id', 'item_code', 'item_name', 'quantity_available', 'status']);
    foreach($items as $item) {
        echo "  ID: {$item->id}, Code: {$item->item_code}, Name: {$item->item_name}, Available: {$item->quantity_available}, Status: {$item->status}\n";
    }
} else {
    echo "⚠️  No inventory items found in database!\n";
    echo "\nTo add sample inventory, you can:\n";
    echo "1. Use the admin panel to add items manually\n";
    echo "2. Run a seeder script\n";
    echo "3. Import from a CSV/SQL file\n";
}
