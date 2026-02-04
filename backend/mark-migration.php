<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Mark the teachers table migration as run
DB::table('migrations')->insert([
    'migration' => '2026_01_29_045535_create_teachers_table',
    'batch' => 1
]);

echo "Migration marked as run\n";
