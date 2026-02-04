<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING INVENTORY MODEL ===\n\n";

try {
    $count = \App\Models\ToolEquipment::count();
    echo "✓ Total items: {$count}\n\n";
    
    $items = \App\Models\ToolEquipment::take(3)->get();
    echo "Sample items:\n";
    foreach($items as $item) {
        echo "  ID: {$item->id}\n";
        echo "  Code: {$item->item_code}\n";
        echo "  Name: {$item->item_name}\n";
        echo "  Category: {$item->category}\n";
        echo "  Available: {$item->quantity_available}/{$item->quantity_total}\n";
        echo "  Condition: {$item->condition}\n";
        echo "  Status: {$item->status}\n";
        echo "  ---\n";
    }
    
    echo "\n✅ Inventory model is working correctly!\n";
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
