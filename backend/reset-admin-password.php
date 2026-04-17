<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

echo "========================================\n";
echo "Resetting Admin Password\n";
echo "========================================\n\n";

$admin = Admin::where('email', 'loren.torres@gmail.com')->first();

if (!$admin) {
    echo "ERROR: Admin account not found!\n";
    exit(1);
}

// Reset password
$newPassword = 'p@ssw0rd';
$admin->password = Hash::make($newPassword);
$admin->status = 'active';
$admin->save();

echo "Password reset successfully!\n\n";
echo "========================================\n";
echo "Login Credentials:\n";
echo "========================================\n";
echo "Email: loren.torres@gmail.com\n";
echo "Username: loren.torres\n";
echo "Password: {$newPassword}\n";
echo "========================================\n\n";
