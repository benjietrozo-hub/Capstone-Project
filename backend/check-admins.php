<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Current Admin Accounts\n";
echo "========================================\n\n";

$admins = DB::table('admins')->get();

echo "Total admin accounts: " . $admins->count() . "\n\n";

foreach ($admins as $admin) {
    echo "ID: {$admin->id}\n";
    echo "Username: {$admin->username}\n";
    echo "Email: {$admin->email}\n";
    echo "Full Name: {$admin->full_name}\n";
    echo "Status: {$admin->status}\n";
    echo "Created: {$admin->created_at}\n";
    echo str_repeat("-", 50) . "\n";
}

echo "\n========================================\n";
