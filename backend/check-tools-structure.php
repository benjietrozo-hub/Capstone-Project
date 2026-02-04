<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TOOLS_EQUIPMENT TABLE STRUCTURE ===\n\n";

$columns = \Illuminate\Support\Facades\Schema::getColumnListing('tools_equipment');

echo "Columns in tools_equipment table:\n";
foreach ($columns as $column) {
    echo "  - {$column}\n";
}

echo "\nTotal columns: " . count($columns) . "\n";
