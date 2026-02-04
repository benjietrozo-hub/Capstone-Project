<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Admin Account Management\n";
echo "========================================\n\n";

// Show current accounts
echo "Current admin accounts:\n\n";
$admins = DB::table('admins')->get();
$index = 1;
foreach ($admins as $admin) {
    echo "{$index}. ID: {$admin->id}\n";
    echo "   Email: {$admin->email}\n";
    echo "   Username: {$admin->username}\n";
    echo "   Full Name: {$admin->full_name}\n";
    echo "   Status: {$admin->status}\n";
    echo "\n";
    $index++;
}

echo "========================================\n";
echo "What would you like to do?\n";
echo "========================================\n\n";
echo "1. Keep only benjie.trozo@csucc.edu.ph (delete others)\n";
echo "2. Update email to benjie.trozo@gmail.com and delete others\n";
echo "3. Keep all accounts (no changes)\n";
echo "4. Exit\n";
echo "\n";
echo "Enter your choice (1-4): ";

$handle = fopen("php://stdin", "r");
$choice = trim(fgets($handle));
fclose($handle);

switch ($choice) {
    case '1':
        // Keep benjie.trozo@csucc.edu.ph
        echo "\n✓ Keeping benjie.trozo@csucc.edu.ph\n";
        $keepEmail = 'benjie.trozo@csucc.edu.ph';
        
        $deleted = DB::table('admins')->where('email', '!=', $keepEmail)->delete();
        echo "✓ Deleted {$deleted} admin account(s)\n";
        
        echo "\nRemaining account:\n";
        $remaining = DB::table('admins')->first();
        echo "  Email: {$remaining->email}\n";
        echo "  Username: {$remaining->username}\n";
        echo "  Full Name: {$remaining->full_name}\n";
        break;
        
    case '2':
        // Update to gmail.com
        echo "\n✓ Updating email to benjie.trozo@gmail.com\n";
        
        $account = DB::table('admins')->where('email', 'benjie.trozo@csucc.edu.ph')->first();
        if ($account) {
            DB::table('admins')
                ->where('id', $account->id)
                ->update(['email' => 'benjie.trozo@gmail.com']);
            echo "✓ Email updated\n";
            
            $deleted = DB::table('admins')->where('id', '!=', $account->id)->delete();
            echo "✓ Deleted {$deleted} other admin account(s)\n";
            
            echo "\nRemaining account:\n";
            $remaining = DB::table('admins')->first();
            echo "  Email: {$remaining->email}\n";
            echo "  Username: {$remaining->username}\n";
            echo "  Full Name: {$remaining->full_name}\n";
        } else {
            echo "❌ Account not found!\n";
        }
        break;
        
    case '3':
        echo "\n✓ No changes made. All accounts kept.\n";
        break;
        
    case '4':
        echo "\n✓ Exiting without changes.\n";
        exit(0);
        
    default:
        echo "\n❌ Invalid choice. No changes made.\n";
        exit(1);
}

echo "\n========================================\n";
echo "✓ Done!\n";
echo "========================================\n";
