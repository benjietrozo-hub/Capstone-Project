<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Teacher;

$updated = Teacher::where('teacher_id', 'T001')->update(['role' => 'admin']);

if ($updated) {
    echo "✅ Success: Loren Torres (T001) is now an Administrator.\n";
} else {
    echo "❌ Error: Could not find teacher with ID T001.\n";
}
