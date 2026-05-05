<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = DB::table('tools_equipment')->count();
    echo "Total items in tools_equipment: " . $count . "\n";
    
    $latest = DB::table('tools_equipment')->latest()->limit(5)->get();
    echo "Latest 5 items in tools_equipment:\n";
    foreach ($latest as $item) {
        $itemArray = (array)$item;
        $name = $itemArray['name'] ?? $itemArray['item_name'] ?? 'N/A';
        echo "- ID: {$item->id}, Name: $name\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
