<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = ['tools_equipment', 'suppliers', 'purchase_orders', 'borrow_requests', 'teachers'];
foreach($tables as $t) {
    $cols = Illuminate\Support\Facades\Schema::getColumnListing($t);
    echo $t . ' has deleted_at: ' . (in_array('deleted_at', $cols) ? 'yes' : 'no') . "\n";
}
