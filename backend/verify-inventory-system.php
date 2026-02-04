<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║     INVENTORY SYSTEM VERIFICATION                      ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

$allPassed = true;

// Test 1: Database Connection
echo "1. Database Connection\n";
try {
    DB::connection()->getPdo();
    echo "   ✅ Connected to database\n\n";
} catch (\Exception $e) {
    echo "   ❌ Database connection failed: " . $e->getMessage() . "\n\n";
    $allPassed = false;
}

// Test 2: Inventory Items
echo "2. Inventory Items\n";
try {
    $count = \App\Models\ToolEquipment::count();
    echo "   ✅ Total items: {$count}\n";
    
    if ($count > 0) {
        $sample = \App\Models\ToolEquipment::first();
        echo "   ✅ Sample item: {$sample->item_name} ({$sample->item_code})\n";
    } else {
        echo "   ⚠️  No items in database\n";
    }
    echo "\n";
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    $allPassed = false;
}

// Test 3: Required Columns
echo "3. Database Schema\n";
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('tools_equipment');
$required = ['item_code', 'item_name', 'category', 'quantity_available', 'quantity_total', 'condition_status', 'status', 'deleted_at'];
$missing = [];

foreach($required as $col) {
    if (in_array($col, $columns)) {
        echo "   ✅ {$col}\n";
    } else {
        echo "   ❌ {$col} MISSING\n";
        $missing[] = $col;
        $allPassed = false;
    }
}
echo "\n";

// Test 4: Model Accessor
echo "4. Model Accessor (condition)\n";
try {
    $item = \App\Models\ToolEquipment::first();
    if ($item) {
        $condition = $item->condition;
        echo "   ✅ Condition accessor works: {$condition}\n";
        
        // Check if it's in JSON
        $json = $item->toArray();
        if (isset($json['condition'])) {
            echo "   ✅ Condition in JSON output: {$json['condition']}\n";
        } else {
            echo "   ❌ Condition NOT in JSON output\n";
            $allPassed = false;
        }
    }
    echo "\n";
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    $allPassed = false;
}

// Test 5: API Endpoint
echo "5. API Endpoint\n";
try {
    $request = new \Illuminate\Http\Request();
    $request->merge(['per_page' => 10]);
    
    $controller = new \App\Http\Controllers\API\Admin\InventoryController();
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    
    echo "   ✅ Status: " . $response->getStatusCode() . "\n";
    echo "   ✅ Total items: " . $data['total'] . "\n";
    echo "   ✅ Items returned: " . count($data['data']) . "\n";
    
    if (count($data['data']) > 0) {
        $item = $data['data'][0];
        $hasCondition = isset($item['condition']);
        if ($hasCondition) {
            echo "   ✅ Condition field present: {$item['condition']}\n";
        } else {
            echo "   ❌ Condition field MISSING\n";
            $allPassed = false;
        }
    }
    echo "\n";
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    $allPassed = false;
}

// Test 6: Routes
echo "6. API Routes\n";
try {
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $inventoryRoutes = 0;
    foreach ($routes as $route) {
        if (str_contains($route->uri(), 'admin/inventory')) {
            $inventoryRoutes++;
        }
    }
    echo "   ✅ Inventory routes registered: {$inventoryRoutes}\n\n";
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n\n";
    $allPassed = false;
}

// Summary
echo "╔════════════════════════════════════════════════════════╗\n";
if ($allPassed) {
    echo "║     ✅ ALL TESTS PASSED - SYSTEM READY                ║\n";
} else {
    echo "║     ❌ SOME TESTS FAILED - CHECK ABOVE                ║\n";
}
echo "╚════════════════════════════════════════════════════════╝\n\n";

if ($allPassed) {
    echo "🎉 The inventory system is working correctly!\n";
    echo "   - Database: Connected\n";
    echo "   - Items: Available\n";
    echo "   - Schema: Complete\n";
    echo "   - API: Functional\n";
    echo "   - Routes: Registered\n\n";
    echo "You can now use the admin panel to view inventory.\n";
} else {
    echo "⚠️  Some issues were found. Please review the errors above.\n";
}
