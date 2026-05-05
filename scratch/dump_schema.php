<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tables = DB::select('SHOW TABLES');
    $schema = [];
    foreach ($tables as $table) {
        $tableName = array_values((array)$table)[0];
        $columns = DB::select("SHOW COLUMNS FROM `$tableName`");
        $colNames = [];
        foreach ($columns as $col) {
            $colNames[] = $col->Field . " (" . $col->Type . ")";
        }
        $schema[$tableName] = $colNames;
    }
    
    echo json_encode($schema, JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
