<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use App\Models\InventoryItem;
use App\Models\ItemDistribution;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Let's get the first teacher
    $teacher = \App\Models\Teacher::first();
    if (!$teacher) {
        echo "No teachers found.\n";
        exit;
    }

    echo "Teacher: {$teacher->id} - {$teacher->first_name} {$teacher->last_name}\n";

    // How to get their active items?
    $items = InventoryItem::whereHas('distributions', function ($query) use ($teacher) {
        $query->where('teacher_id', $teacher->id)
              ->where('item_distributions.status', 'active');
    })->get();

    echo "Found " . $items->count() . " active items distributed to this teacher via relationship (if it exists).\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
