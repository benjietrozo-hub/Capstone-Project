<?php
/**
 * Test script to verify admin filtering
 * Run: php backend/test_admin_filter.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use App\Models\Teacher;

echo "=== Admin Filter Test ===\n\n";

// Get all admin emails
$adminEmails = Admin::whereNull('deleted_at')->pluck('email')->toArray();
echo "Admin emails in database:\n";
foreach ($adminEmails as $email) {
    echo "  - $email\n";
}
echo "\n";

// Get all teacher emails
$teacherEmails = Teacher::whereNull('deleted_at')->pluck('email')->toArray();
echo "Teacher emails in database:\n";
foreach ($teacherEmails as $email) {
    echo "  - $email\n";
}
echo "\n";

// Find overlaps
$overlaps = array_intersect($adminEmails, $teacherEmails);
echo "Emails that exist in BOTH tables (should be filtered out):\n";
if (empty($overlaps)) {
    echo "  (none)\n";
} else {
    foreach ($overlaps as $email) {
        echo "  - $email\n";
    }
}
echo "\n";

// Test the actual query
$teachers = Teacher::whereNotIn('email', function($query) {
    $query->select('email')
          ->from('admins')
          ->whereNull('deleted_at');
})->get();

echo "Teachers after filtering (should NOT include admins):\n";
foreach ($teachers as $teacher) {
    echo "  - {$teacher->email} ({$teacher->first_name} {$teacher->last_name})\n";
}
echo "\n";

echo "Total teachers after filter: " . $teachers->count() . "\n";
echo "Total teachers before filter: " . Teacher::whereNull('deleted_at')->count() . "\n";
echo "Difference (admins filtered): " . (Teacher::whereNull('deleted_at')->count() - $teachers->count()) . "\n";
