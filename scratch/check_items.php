<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use App\Models\InventoryItem;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = InventoryItem::count();
    echo "Total items in inventory_items: " . $count . "\n";
    
    $latest = InventoryItem::latest()->limit(5)->get();
    echo "Latest 5 items:\n";
    foreach ($latest as $item) {
        echo "- ID: {$item->id}, Name: {$item->item_name}, SN: {$item->serial_number}, Created: {$item->created_at}\n";
    }

    $aspire = InventoryItem::where('item_name', 'like', '%Aspire%')->get();
    echo "\nSearching for 'Aspire':\n";
    foreach ($aspire as $item) {
        echo "- ID: {$item->id}, Name: {$item->item_name}, SN: {$item->serial_number}\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
