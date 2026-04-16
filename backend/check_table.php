<?php

// Simple database structure check
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Checking tools_equipment table structure ===\n";

// Check if table exists
if (Schema::hasTable('tools_equipment')) {
    echo "✅ Table 'tools_equipment' exists\n";
    
    // Get column information
    $columns = Schema::getColumnListing('tools_equipment');
    echo "Columns:\n";
    foreach ($columns as $column) {
        $type = DB::connection()->getDoctrineColumn('tools_equipment', $column)->getType()->getName();
        echo "  - $column ($type)\n";
    }
    
    echo "\n=== Sample data check ===\n";
    $sample = DB::table('tools_equipment')->limit(1)->first();
    if ($sample) {
        echo "Sample item found:\n";
        echo "  - ID: {$sample->id}\n";
        echo "  - Item Code: {$sample->item_code}\n";
        echo "  - Item Name: {$sample->item_name}\n";
        echo "  - Category: '{$sample->category}'\n";
        echo "  - Category Length: " . strlen($sample->category) . "\n";
    } else {
        echo "❌ No sample data found\n";
    }
} else {
    echo "❌ Table 'tools_equipment' does not exist\n";
}

echo "\n=== Test complete ===\n";
?>
