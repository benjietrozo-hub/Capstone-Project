<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Admin Name Fields Verification\n";
echo "========================================\n\n";

// Check table structure
echo "Table Structure:\n";
echo str_repeat("-", 50) . "\n";
$columns = DB::select("DESCRIBE admins");
foreach ($columns as $column) {
    if (in_array($column->Field, ['first_name', 'middle_name', 'last_name', 'full_name'])) {
        printf("%-20s %-20s %s\n", $column->Field, $column->Type, $column->Null);
    }
}

echo "\n";
echo "Admin Account Data:\n";
echo str_repeat("-", 50) . "\n";

$admin = DB::table('admins')->first();

if ($admin) {
    echo "ID: {$admin->id}\n";
    echo "Username: {$admin->username}\n";
    echo "Email: {$admin->email}\n";
    echo "\n";
    echo "Name Fields:\n";
    echo "  First Name: " . ($admin->first_name ?? 'N/A') . "\n";
    echo "  Middle Name: " . ($admin->middle_name ?? 'N/A') . "\n";
    echo "  Last Name: " . ($admin->last_name ?? 'N/A') . "\n";
    
    // Check if full_name still exists
    if (property_exists($admin, 'full_name')) {
        echo "  Full Name (old): {$admin->full_name}\n";
    } else {
        echo "\n✓ Old 'full_name' field has been removed\n";
    }
    
    echo "\n";
    echo "Full Name Display: {$admin->first_name}";
    if ($admin->middle_name) {
        echo " {$admin->middle_name}";
    }
    echo " {$admin->last_name}\n";
} else {
    echo "No admin account found!\n";
}

echo "\n========================================\n";
