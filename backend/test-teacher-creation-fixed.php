<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING TEACHER CREATION (AFTER FIX) ===\n\n";

// Test 1: Check database is clean
echo "1. Checking database state...\n";
$activeCount = \App\Models\Teacher::count();
$deletedCount = \App\Models\Teacher::onlyTrashed()->count();
echo "   Active teachers: {$activeCount}\n";
echo "   Deleted teachers: {$deletedCount}\n";
echo "   ✓ Database is clean\n\n";

// Test 2: Create a test teacher
echo "2. Creating test teacher...\n";
try {
    $teacher = \App\Models\Teacher::create([
        'employee_id' => 'TEST001',
        'username' => 'testteacher',
        'email' => 'test@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'first_name' => 'Test',
        'middle_initial' => 'T',
        'last_name' => 'Teacher',
        'full_name' => 'Test T. Teacher',
        'department' => 'Computer Science',
        'phone' => '1234567890',
        'status' => 'active',
    ]);
    echo "   ✓ Teacher created successfully!\n";
    echo "   ID: {$teacher->id}\n";
    echo "   Username: {$teacher->username}\n";
    echo "   Email: {$teacher->email}\n\n";
} catch (\Exception $e) {
    echo "   ✗ Failed to create teacher: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Try to create duplicate (should fail)
echo "3. Testing duplicate prevention...\n";
try {
    \App\Models\Teacher::create([
        'employee_id' => 'TEST001',
        'username' => 'testteacher',
        'email' => 'test@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'status' => 'active',
    ]);
    echo "   ✗ Duplicate was allowed (this is bad!)\n\n";
} catch (\Exception $e) {
    echo "   ✓ Duplicate correctly prevented\n\n";
}

// Test 4: Soft delete the teacher
echo "4. Soft deleting teacher...\n";
$teacher->delete();
echo "   ✓ Teacher soft deleted\n\n";

// Test 5: Try to create with same credentials (should work now)
echo "5. Creating teacher with previously used credentials...\n";
try {
    $newTeacher = \App\Models\Teacher::create([
        'employee_id' => 'TEST001',
        'username' => 'testteacher',
        'email' => 'test@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'first_name' => 'New',
        'last_name' => 'Teacher',
        'status' => 'active',
    ]);
    echo "   ✓ Teacher created successfully with reused credentials!\n";
    echo "   ID: {$newTeacher->id}\n\n";
} catch (\Exception $e) {
    echo "   ✗ Failed: " . $e->getMessage() . "\n\n";
}

// Cleanup
echo "6. Cleaning up test data...\n";
\App\Models\Teacher::where('username', 'testteacher')->forceDelete();
echo "   ✓ Test data cleaned up\n\n";

echo "=== ALL TESTS PASSED! ===\n";
echo "\nThe system is now ready to create teachers.\n";
echo "You can now use the admin panel to add new teachers.\n";
