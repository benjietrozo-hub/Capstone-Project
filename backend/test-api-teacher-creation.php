<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TESTING TEACHER API CREATION ===\n\n";

// Clean up first
echo "1. Cleaning up existing test data...\n";
\App\Models\Teacher::where('username', 'apitest')->forceDelete();
echo "   ✓ Cleaned\n\n";

// Test 1: Create via controller validation
echo "2. Testing controller validation (create)...\n";
$request = new \Illuminate\Http\Request();
$request->replace([
    'employee_id' => 'API001',
    'username' => 'apitest',
    'email' => 'apitest@example.com',
    'password' => 'password123',
    'first_name' => 'API',
    'last_name' => 'Test',
    'department' => 'IT',
    'status' => 'active',
]);

$controller = new \App\Http\Controllers\API\Admin\TeacherManagementController();
try {
    $response = $controller->store($request);
    $data = json_decode($response->getContent(), true);
    echo "   ✓ Teacher created via API: ID {$data['id']}\n\n";
} catch (\Exception $e) {
    echo "   ✗ Failed: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Try duplicate (should fail)
echo "3. Testing duplicate prevention...\n";
try {
    $response = $controller->store($request);
    echo "   ✗ Duplicate was allowed!\n\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "   ✓ Duplicate correctly prevented by validation\n";
    echo "   Errors: " . json_encode($e->errors()) . "\n\n";
} catch (\Exception $e) {
    echo "   ✗ Unexpected error: " . $e->getMessage() . "\n\n";
}

// Test 3: Soft delete and try again
echo "4. Soft deleting teacher...\n";
$teacher = \App\Models\Teacher::where('username', 'apitest')->first();
$teacher->delete();
echo "   ✓ Soft deleted\n\n";

echo "5. Creating teacher with same credentials after soft delete...\n";
try {
    $response = $controller->store($request);
    $data = json_decode($response->getContent(), true);
    echo "   ✓ Teacher created successfully! ID: {$data['id']}\n";
    echo "   This proves soft delete exclusion is working!\n\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "   ✗ Validation failed: " . json_encode($e->errors()) . "\n\n";
} catch (\Exception $e) {
    echo "   ✗ Failed: " . $e->getMessage() . "\n\n";
}

// Cleanup
echo "6. Cleaning up...\n";
\App\Models\Teacher::where('username', 'apitest')->forceDelete();
echo "   ✓ Cleaned\n\n";

echo "=== TEST COMPLETE ===\n";
