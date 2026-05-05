<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use App\Models\InventoryItem;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$teacherId = 1;

try {
    $query = InventoryItem::whereHas('distributions', function ($q) use ($teacherId) {
        $q->where('teacher_id', $teacherId)
          ->where('item_distributions.status', 'active');
    })->with('category');

    // parentCategories equivalent
    $parents = $query->get()->groupBy(function($item) {
        return $item->category ? $item->category->parent_category : 'Uncategorized';
    })->map(function($items, $parent) {
        return [
            'parent_category' => $parent,
            'kind_count' => $items->pluck('category.category_name')->unique()->count(),
            'item_count' => $items->count()
        ];
    })->values();

    echo "Parent Categories:\n";
    echo json_encode($parents, JSON_PRETTY_PRINT) . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
