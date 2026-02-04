<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$migration = '2026_02_03_090818_remove_unique_constraints_from_teachers_table';

$exists = DB::table('migrations')->where('migration', $migration)->exists();

if (!$exists) {
    DB::table('migrations')->insert([
        'migration' => $migration,
        'batch' => 3
    ]);
    echo "✓ Marked migration as run\n";
} else {
    echo "- Migration already marked\n";
}
