<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking Database Accounts...\n\n";

// Check Admin accounts
echo "=== ADMIN ACCOUNTS ===\n";
try {
    $admins = \App\Models\Admin::all();
    if ($admins->isEmpty()) {
        echo "No admin accounts found in database.\n";
    } else {
        foreach ($admins as $admin) {
            echo "ID: {$admin->id}\n";
            echo "Email: {$admin->email}\n";
            echo "Username: {$admin->username}\n";
            echo "Status: {$admin->status}\n";
            echo "Created: {$admin->created_at}\n";
            echo "---\n";
        }
    }
} catch (\Exception $e) {
    echo "Error checking admins: " . $e->getMessage() . "\n";
}

echo "\n=== TEACHER ACCOUNTS ===\n";
try {
    $teachers = \App\Models\Teacher::all();
    if ($teachers->isEmpty()) {
        echo "No teacher accounts found in database.\n";
    } else {
        foreach ($teachers as $teacher) {
            echo "ID: {$teacher->id}\n";
            echo "Email: {$teacher->email}\n";
            echo "Username: {$teacher->username}\n";
            echo "Status: {$teacher->status}\n";
            echo "Department: {$teacher->department}\n";
            echo "---\n";
        }
    }
} catch (\Exception $e) {
    echo "Error checking teachers: " . $e->getMessage() . "\n";
}

echo "\n=== TESTING LOGIN CREDENTIALS ===\n";

// Test common admin credentials
$testCredentials = [
    ['email' => 'admin@olineims.com', 'password' => 'Admin@123456'],
    ['email' => 'benjie.trozo@csucc.edu.ph', 'password' => 'p@ssw0rd'],
    ['email' => 'benjie@csucc.edu.ph', 'password' => 'password'],
];

foreach ($testCredentials as $cred) {
    echo "\nTesting: {$cred['email']}\n";
    
    // Check if admin exists
    $admin = \App\Models\Admin::where('email', $cred['email'])->first();
    if ($admin) {
        echo "  Account found: Status = {$admin->status}\n";
        
        // Test password
        if (\Illuminate\Support\Facades\Hash::check($cred['password'], $admin->password)) {
            echo "  Password: CORRECT\n";
        } else {
            echo "  Password: INCORRECT\n";
        }
    } else {
        echo "  Account: NOT FOUND\n";
    }
}

echo "\n=== CREATING/RESETTING ADMIN ACCOUNT ===\n";

// Create admin account if it doesn't exist
$adminEmail = 'admin@olineims.com';
$adminPassword = 'Admin@123456';

$admin = \App\Models\Admin::where('email', $adminEmail)->first();
if (!$admin) {
    echo "Creating admin account...\n";
    $admin = \App\Models\Admin::create([
        'email' => $adminEmail,
        'username' => 'admin',
        'password' => \Illuminate\Support\Facades\Hash::make($adminPassword),
        'status' => 'active',
        'first_name' => 'System',
        'last_name' => 'Administrator',
    ]);
    echo "Admin account created successfully!\n";
} else {
    echo "Admin account already exists.\n";
    if ($admin->status !== 'active') {
        echo "Activating admin account...\n";
        $admin->status = 'active';
        $admin->save();
        echo "Admin account activated.\n";
    }
    
    // Reset password if needed
    if (!\Illuminate\Support\Facades\Hash::check($adminPassword, $admin->password)) {
        echo "Resetting admin password...\n";
        $admin->password = \Illuminate\Support\Facades\Hash::make($adminPassword);
        $admin->save();
        echo "Admin password reset.\n";
    }
}

echo "\n=== FINAL CREDENTIALS ===\n";
echo "Email: {$adminEmail}\n";
echo "Password: {$adminPassword}\n";
echo "Status: Active\n";

echo "\n=== TESTING BENJIE ACCOUNT ===\n";

$benjieEmail = 'benjie.trozo@csucc.edu.ph';
$benjiePassword = 'p@ssw0rd';

$benjie = \App\Models\Admin::where('email', $benjieEmail)->first();
if (!$benjie) {
    echo "Creating Benjie admin account...\n";
    $benjie = \App\Models\Admin::create([
        'email' => $benjieEmail,
        'username' => 'benjie.trozo',
        'password' => \Illuminate\Support\Facades\Hash::make($benjiePassword),
        'status' => 'active',
        'first_name' => 'Benjie',
        'last_name' => 'Trozo',
    ]);
    echo "Benjie account created successfully!\n";
} else {
    echo "Benjie account found: Status = {$benjie->status}\n";
    if ($benjie->status !== 'active') {
        echo "Activating Benjie account...\n";
        $benjie->status = 'active';
        $benjie->save();
        echo "Benjie account activated.\n";
    }
    
    if (!\Illuminate\Support\Facades\Hash::check($benjiePassword, $benjie->password)) {
        echo "Resetting Benjie password...\n";
        $benjie->password = \Illuminate\Support\Facades\Hash::make($benjiePassword);
        $benjie->save();
        echo "Benjie password reset.\n";
    }
}

echo "\nBenjie Credentials:\n";
echo "Email: {$benjieEmail}\n";
echo "Password: {$benjiePassword}\n";
echo "Username: benjie.trozo\n";

echo "\n=== LOGIN TEST ===\n";
echo "Try these credentials in the login form:\n";
echo "1. Email: admin@olineims.com | Password: Admin@123456\n";
echo "2. Email: benjie.trozo@csucc.edu.ph | Password: p@ssw0rd\n";
