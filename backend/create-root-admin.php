<?php

/**
 * Create Root Admin Script
 * 
 * This script creates a root admin account in the database.
 * Email: benjie.trozo@csucc.edu.ph
 * Password: p@ssw0rd
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

try {
    // Check if admin already exists
    $existingAdmin = Admin::where('email', 'benjie.trozo@csucc.edu.ph')
                          ->orWhere('username', 'benjie.trozo')
                          ->first();

    if ($existingAdmin) {
        echo "❌ Admin already exists!\n";
        echo "   Email: {$existingAdmin->email}\n";
        echo "   Username: {$existingAdmin->username}\n";
        echo "\n";
        echo "Do you want to update the password? (yes/no): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        $response = trim($line);
        fclose($handle);

        if (strtolower($response) === 'yes' || strtolower($response) === 'y') {
            $existingAdmin->password = Hash::make('p@ssw0rd');
            $existingAdmin->save();
            echo "\n✅ Password updated successfully!\n";
            echo "   Email: {$existingAdmin->email}\n";
            echo "   Username: {$existingAdmin->username}\n";
            echo "   Password: p@ssw0rd\n";
        } else {
            echo "\n❌ Operation cancelled.\n";
        }
        exit(0);
    }

    // Create new root admin
    $admin = Admin::create([
        'username' => 'benjie.trozo',
        'email' => 'benjie.trozo@csucc.edu.ph',
        'password' => Hash::make('p@ssw0rd'),
        'full_name' => 'Benjie Trozo',
        'phone' => null,
        'status' => 'active',
        'last_login' => null,
    ]);

    echo "\n";
    echo "✅ Root Admin Created Successfully!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "   ID:       {$admin->id}\n";
    echo "   Username: {$admin->username}\n";
    echo "   Email:    {$admin->email}\n";
    echo "   Password: p@ssw0rd\n";
    echo "   Status:   {$admin->status}\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n";
    echo "🔐 You can now login with:\n";
    echo "   Email/Username: benjie.trozo@csucc.edu.ph or benjie.trozo\n";
    echo "   Password: p@ssw0rd\n";
    echo "\n";
    echo "⚠️  IMPORTANT: Please change this password after first login!\n";
    echo "\n";

} catch (\Exception $e) {
    echo "\n";
    echo "❌ Error creating admin: " . $e->getMessage() . "\n";
    echo "\n";
    exit(1);
}
