<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\ItemCategory;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing ItemCategory::parentCategories logic...\n";
    
    $parents = ItemCategory::selectRaw("COALESCE(parent_category, 'Uncategorized') as parent_category")
        ->selectRaw('COUNT(item_categories.id) as kind_count')
        ->selectRaw('SUM((SELECT COUNT(*) FROM inventory_items WHERE inventory_items.category_id = item_categories.id AND inventory_items.deleted_at IS NULL)) as item_count')
        ->leftJoin('master_categories', function($join) {
            $join->on(DB::raw("COALESCE(item_categories.parent_category, 'Uncategorized')"), '=', 'master_categories.name');
        })
        ->addSelect('master_categories.description', 'master_categories.image')
        ->groupBy('parent_category', 'master_categories.description', 'master_categories.image')
        ->get();

    echo "Success! Found " . count($parents) . " parent categories.\n";
    print_r($parents->toArray());

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
