<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new Illuminate\Http\Request();
$ctrl = new App\Http\Controllers\API\Admin\ArchiveController();

echo "Stats:\n";
echo json_encode($ctrl->stats()->getData()) . "\n\n";

$inventoryId = App\Models\ToolEquipment::onlyTrashed()->first()->id ?? null;
if ($inventoryId) {
    echo "Restoring Inventory Item ID $inventoryId:\n";
    echo json_encode($ctrl->restore(new Illuminate\Http\Request(), 'inventory', $inventoryId)->getData()) . "\n\n";
    
    // Now archive it back so we can test forceDelete
    $item = App\Models\ToolEquipment::find($inventoryId);
    $item->delete();
    
    echo "Force Deleting Inventory Item ID $inventoryId:\n";
    echo json_encode($ctrl->forceDelete(new Illuminate\Http\Request(), 'inventory', $inventoryId)->getData()) . "\n\n";
} else {
    echo "No trashed inventory item to test.\n\n";
}

// Re-archive some items if they were permanently deleted so the user has something in trash
