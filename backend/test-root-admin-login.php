<?php

/**
 * Test Root Admin Login
 * 
 * This script tests if the root admin can login successfully
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

echo "\n";
echo "🔍 Testing Root Admin Login\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";

try {
    // Test 1: Find admin by email
    echo "Test 1: Finding admin by email...\n";
    $admin = Admin::where('email', 'benjie.trozo@csucc.edu.ph')->first();
    
    if (!$admin) {
        echo "❌ Admin not found by email!\n";
        exit(1);
    }
    echo "✅ Admin found by email\n";
    echo "   ID: {$admin->id}\n";
    echo "   Username: {$admin->username}\n";
    echo "   Email: {$admin->email}\n";
    echo "\n";

    // Test 2: Find admin by username
    echo "Test 2: Finding admin by username...\n";
    $adminByUsername = Admin::where('username', 'benjie.trozo')->first();
    
    if (!$adminByUsername) {
        echo "❌ Admin not found by username!\n";
        exit(1);
    }
    echo "✅ Admin found by username\n";
    echo "\n";

    // Test 3: Verify password
    echo "Test 3: Verifying password...\n";
    $passwordCorrect = Hash::check('p@ssw0rd', $admin->password);
    
    if (!$passwordCorrect) {
        echo "❌ Password verification failed!\n";
        exit(1);
    }
    echo "✅ Password verified successfully\n";
    echo "\n";

    // Test 4: Check account status
    echo "Test 4: Checking account status...\n";
    if ($admin->status !== 'active') {
        echo "❌ Account is not active! Status: {$admin->status}\n";
        exit(1);
    }
    echo "✅ Account is active\n";
    echo "\n";

    // Test 5: Simulate login
    echo "Test 5: Simulating login process...\n";
    $admin->update(['last_login' => now()]);
    $token = $admin->createToken('test-token')->plainTextToken;
    echo "✅ Login simulation successful\n";
    echo "   Token generated: " . substr($token, 0, 20) . "...\n";
    echo "   Last login updated: {$admin->last_login}\n";
    echo "\n";

    // Clean up test token
    $admin->tokens()->where('name', 'test-token')->delete();

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ ALL TESTS PASSED!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n";
    echo "🎉 Root admin login is working correctly!\n";
    echo "\n";
    echo "You can now login with:\n";
    echo "  • Email: benjie.trozo@csucc.edu.ph\n";
    echo "  • Username: benjie.trozo\n";
    echo "  • Password: p@ssw0rd\n";
    echo "\n";

} catch (\Exception $e) {
    echo "\n";
    echo "❌ Error during testing: " . $e->getMessage() . "\n";
    echo "\n";
    exit(1);
}
