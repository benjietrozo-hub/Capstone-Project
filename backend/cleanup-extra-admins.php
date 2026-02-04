<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Admin Account Cleanup\n";
echo "========================================\n\n";

// Your account email
$keepEmail = 'benjie.trozo@csucc.edu.ph'; // Change this if needed

echo "Current admin accounts:\n";
$admins = DB::table('admins')->get();
foreach ($admins as $admin) {
    echo "  - ID: {$admin->id}, Email: {$admin->email}, Username: {$admin->username}\n";
}

echo "\n";
echo "Account to keep: {$keepEmail}\n";
echo "\n";

// Find the account to keep
$keepAccount = DB::table('admins')->where('email', $keepEmail)->first();

if (!$keepAccount) {
    echo "❌ ERROR: Account {$keepEmail} not found!\n";
    echo "\nAvailable accounts:\n";
    foreach ($admins as $admin) {
        echo "  - {$admin->email}\n";
    }
    echo "\nPlease update the \$keepEmail variable in this script.\n";
    exit(1);
}

echo "✓ Found account to keep: {$keepAccount->full_name} ({$keepAccount->email})\n\n";

// Get accounts to delete
$deleteAccounts = DB::table('admins')
    ->where('email', '!=', $keepEmail)
    ->get();

if ($deleteAccounts->count() === 0) {
    echo "✓ No extra accounts to delete. You already have only one admin account.\n";
    exit(0);
}

echo "Accounts to be deleted:\n";
foreach ($deleteAccounts as $account) {
    echo "  - ID: {$account->id}, Email: {$account->email}, Username: {$account->username}\n";
}

echo "\n";
echo "⚠️  WARNING: This will permanently delete " . $deleteAccounts->count() . " admin account(s)!\n";
echo "\n";
echo "Press Enter to continue or Ctrl+C to cancel...\n";
$handle = fopen("php://stdin", "r");
$line = fgets($handle);
fclose($handle);

echo "\nDeleting extra admin accounts...\n";

foreach ($deleteAccounts as $account) {
    DB::table('admins')->where('id', $account->id)->delete();
    echo "✓ Deleted: {$account->email}\n";
}

echo "\n";
echo "========================================\n";
echo "✓ Cleanup Complete!\n";
echo "========================================\n\n";

echo "Remaining admin account:\n";
$remaining = DB::table('admins')->get();
foreach ($remaining as $admin) {
    echo "  - ID: {$admin->id}\n";
    echo "    Email: {$admin->email}\n";
    echo "    Username: {$admin->username}\n";
    echo "    Full Name: {$admin->full_name}\n";
}

echo "\n✓ You now have " . $remaining->count() . " admin account(s).\n";
echo "\n========================================\n";
