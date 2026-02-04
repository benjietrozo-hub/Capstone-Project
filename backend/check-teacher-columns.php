<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Teachers Table - Name Columns\n";
echo "========================================\n\n";

$columns = DB::select("DESCRIBE teachers");

echo "Name-related columns:\n";
echo str_repeat("-", 50) . "\n";
foreach ($columns as $column) {
    if (strpos($column->Field, 'name') !== false) {
        printf("%-20s %-20s %s\n", $column->Field, $column->Type, $column->Null);
    }
}

echo "\n";
echo "Sample teacher data:\n";
echo str_repeat("-", 50) . "\n";

$teacher = DB::table('teachers')->first();

if ($teacher) {
    echo "ID: {$teacher->id}\n";
    echo "Email: {$teacher->email}\n";
    if (property_exists($teacher, 'full_name')) {
        echo "Full Name: " . ($teacher->full_name ?? 'NULL') . "\n";
    }
    if (property_exists($teacher, 'first_name')) {
        echo "First Name: " . ($teacher->first_name ?? 'NULL') . "\n";
    }
    if (property_exists($teacher, 'middle_initial')) {
        echo "Middle Initial: " . ($teacher->middle_initial ?? 'NULL') . "\n";
    }
    if (property_exists($teacher, 'last_name')) {
        echo "Last Name: " . ($teacher->last_name ?? 'NULL') . "\n";
    }
} else {
    echo "No teachers found in database.\n";
}

echo "\n========================================\n";
