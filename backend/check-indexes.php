<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEACHERS TABLE INDEXES ===\n\n";

$indexes = DB::select("SHOW INDEX FROM teachers");

foreach ($indexes as $index) {
    echo "Index: {$index->Key_name}\n";
    echo "  Column: {$index->Column_name}\n";
    echo "  Unique: " . ($index->Non_unique == 0 ? 'YES' : 'NO') . "\n";
    echo "  Type: {$index->Index_type}\n";
    echo "---\n";
}
