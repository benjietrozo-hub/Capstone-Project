<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CLEANING UP SOFT-DELETED TEACHERS ===\n\n";

$deletedTeachers = \App\Models\Teacher::onlyTrashed()->get();

echo "Found " . $deletedTeachers->count() . " soft-deleted teachers:\n\n";

foreach ($deletedTeachers as $teacher) {
    echo "- ID: {$teacher->id}, Username: {$teacher->username}, Email: {$teacher->email}\n";
}

if ($deletedTeachers->count() > 0) {
    echo "\nPermanently deleting these teachers...\n";
    
    foreach ($deletedTeachers as $teacher) {
        $teacher->forceDelete();
        echo "✓ Deleted teacher ID {$teacher->id} ({$teacher->username})\n";
    }
    
    echo "\n✅ Cleanup complete! All soft-deleted teachers have been permanently removed.\n";
} else {
    echo "\n✅ No soft-deleted teachers found. Database is clean!\n";
}
