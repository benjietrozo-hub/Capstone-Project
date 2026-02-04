<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ALL TEACHERS (INCLUDING SOFT DELETED) ===\n\n";

$teachers = \App\Models\Teacher::withTrashed()->get(['id', 'username', 'email', 'employee_id', 'deleted_at']);

foreach ($teachers as $teacher) {
    echo "ID: {$teacher->id}\n";
    echo "Username: {$teacher->username}\n";
    echo "Email: {$teacher->email}\n";
    echo "Employee ID: {$teacher->employee_id}\n";
    echo "Deleted: " . ($teacher->deleted_at ? "YES ({$teacher->deleted_at})" : "NO") . "\n";
    echo "---\n";
}

echo "\nTotal: " . $teachers->count() . " teachers\n";
echo "Active: " . \App\Models\Teacher::count() . " teachers\n";
echo "Deleted: " . \App\Models\Teacher::onlyTrashed()->count() . " teachers\n";
