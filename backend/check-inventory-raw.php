<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== INVENTORY RAW DATA ===\n\n";

$items = DB::table('tools_equipment')->take(5)->get();

echo "Total items: " . DB::table('tools_equipment')->count() . "\n\n";

if ($items->count() > 0) {
    echo "Sample items:\n";
    foreach($items as $item) {
        echo "ID: {$item->id}\n";
        echo "Name: {$item->item_name}\n";
        echo "Category: {$item->category}\n";
        echo "Available: {$item->quantity_available}\n";
        echo "Total: {$item->quantity_total}\n";
        echo "---\n";
    }
} else {
    echo "No items found\n";
}
