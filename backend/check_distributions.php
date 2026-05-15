<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ITEM DISTRIBUTIONS ===\n";
$dists = \App\Models\ItemDistribution::withTrashed()->get();
foreach ($dists as $d) {
    echo "ID:{$d->id} | status:{$d->status} | category_id:{$d->category_id} | teacher_id:{$d->teacher_id} | assignable_type:{$d->assignable_type} | deleted_at:{$d->deleted_at}\n";
}

echo "\n=== WHAT /admin/distributions RETURNS ===\n";
// Simulate the index query
$query = \App\Models\ItemDistribution::with(['category', 'teacher', 'distributedBy', 'inventoryItems']);
$results = $query->orderBy('created_at', 'desc')->get();
echo "Count: " . $results->count() . "\n";
foreach ($results as $d) {
    echo "ID:{$d->id} | status:{$d->status} | category:{$d->category?->category_name}\n";
}

echo "\n=== DISTRIBUTION REQUESTS ===\n";
$reqs = \App\Models\DistributionRequest::all();
foreach ($reqs as $r) {
    echo "ID:{$r->id} | status:{$r->status} | distribution_id:{$r->distribution_id}\n";
}
