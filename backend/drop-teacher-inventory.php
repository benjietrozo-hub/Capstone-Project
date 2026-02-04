<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Dropping teacher_inventory table...\n";

try {
    DB::statement('DROP TABLE IF EXISTS teacher_inventory');
    echo "✓ Table dropped successfully\n";
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
