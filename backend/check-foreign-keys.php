<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking foreign keys referencing 'admin' table...\n\n";

$result = DB::select("
    SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE REFERENCED_TABLE_NAME = 'admin'
    AND TABLE_SCHEMA = 'inventory_system'
");

if (empty($result)) {
    echo "No foreign keys found.\n";
} else {
    foreach ($result as $fk) {
        echo "Table: {$fk->TABLE_NAME}\n";
        echo "Column: {$fk->COLUMN_NAME}\n";
        echo "Constraint: {$fk->CONSTRAINT_NAME}\n";
        echo "References: {$fk->REFERENCED_TABLE_NAME}.{$fk->REFERENCED_COLUMN_NAME}\n";
        echo str_repeat("-", 50) . "\n";
    }
}
