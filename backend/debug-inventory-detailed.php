<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\ToolEquipment;

echo "=== DETAILED INVENTORY DEBUG ===\n\n";

// Check database connection
try {
    DB::connection()->getPdo();
    echo "✅ Database connected\n\n";
} catch (\Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Check table exists
$tableExists = DB::select("SHOW TABLES LIKE 'tools_equipment'");
if (empty($tableExists)) {
    echo "❌ Table 'tools_equipment' does not exist!\n";
    exit(1);
}
echo "✅ Table 'tools_equipment' exists\n\n";

// Get table structure
echo "Table Structure:\n";
$columns = DB::select("DESCRIBE tools_equipment");
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}
echo "\n";

// Count total records
$totalCount = DB::table('tools_equipment')->count();
echo "Total records in table: $totalCount\n";

// Count non-deleted records
$activeCount = DB::table('tools_equipment')->whereNull('deleted_at')->count();
echo "Active records (not deleted): $activeCount\n\n";

// Get all records using raw query
echo "Raw Query Results:\n";
$rawItems = DB::select("SELECT id, item_code, item_name, category, status, deleted_at FROM tools_equipment");
foreach ($rawItems as $item) {
    $deletedStatus = $item->deleted_at ? " [DELETED]" : "";
    echo "  ID: {$item->id} | Code: {$item->item_code} | Name: {$item->item_name} | Status: {$item->status}{$deletedStatus}\n";
}
echo "\n";

// Get records using Eloquent
echo "Eloquent Query Results:\n";
$eloquentItems = ToolEquipment::all();
echo "Count: {$eloquentItems->count()}\n";
foreach ($eloquentItems as $item) {
    echo "  ID: {$item->id} | Code: {$item->item_code} | Name: {$item->item_name}\n";
}
echo "\n";

// Get records without soft deletes
echo "Eloquent Query (with trashed):\n";
$allItems = ToolEquipment::withTrashed()->get();
echo "Count: {$allItems->count()}\n";
foreach ($allItems as $item) {
    $deletedStatus = $item->deleted_at ? " [DELETED at {$item->deleted_at}]" : "";
    echo "  ID: {$item->id} | Code: {$item->item_code} | Name: {$item->item_name}{$deletedStatus}\n";
}
echo "\n";

// Simulate the API query
echo "Simulating API Query:\n";
$query = ToolEquipment::query();
$query->orderBy('created_at', 'desc');
$items = $query->get();
echo "Count: {$items->count()}\n";
foreach ($items as $item) {
    echo "  ID: {$item->id} | Code: {$item->item_code} | Name: {$item->item_name} | Status: {$item->status}\n";
}
echo "\n";

// Check if items have the condition attribute
if ($items->count() > 0) {
    $firstItem = $items->first();
    echo "First Item Details:\n";
    echo "  ID: {$firstItem->id}\n";
    echo "  Code: {$firstItem->item_code}\n";
    echo "  Name: {$firstItem->item_name}\n";
    echo "  Category: {$firstItem->category}\n";
    echo "  Status: {$firstItem->status}\n";
    echo "  Condition (accessor): {$firstItem->condition}\n";
    echo "  Condition Status (column): {$firstItem->condition_status}\n";
    echo "  Qty Total: {$firstItem->quantity_total}\n";
    echo "  Qty Available: {$firstItem->quantity_available}\n";
    echo "  Deleted At: " . ($firstItem->deleted_at ?? 'NULL') . "\n";
    echo "\n";
    
    echo "First Item JSON:\n";
    echo json_encode($firstItem->toArray(), JSON_PRETTY_PRINT) . "\n\n";
}

echo "=== DEBUG COMPLETE ===\n";
