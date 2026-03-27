<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;

echo "========================================\n";
echo "Creating Test Teacher Account\n";
echo "========================================\n\n";

// Check if teacher already exists
$existingTeacher = Teacher::where('email', 'teacher@test.com')->first();

if ($existingTeacher) {
    echo "⚠️  Teacher account already exists!\n\n";
    echo "Updating password to: teacher123\n\n";
    
    $existingTeacher->password = Hash::make('teacher123');
    $existingTeacher->status = 'active';
    $existingTeacher->save();
    
    echo "✅ Password updated successfully!\n\n";
} else {
    echo "Creating new teacher account...\n\n";
    
    $teacher = Teacher::create([
        'username' => 'teacher.test',
        'email' => 'teacher@test.com',
        'password' => Hash::make('teacher123'),
        'first_name' => 'Test',
        'middle_initial' => 'T',
        'last_name' => 'Teacher',
        'full_name' => 'Test T. Teacher',
        'department' => 'General',
        'employee_id' => 'TEACH001',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ Teacher account created successfully!\n\n";
}

echo "========================================\n";
echo "Teacher Login Credentials\n";
echo "========================================\n\n";
echo "Email:    teacher@test.com\n";
echo "Username: teacher.test\n";
echo "Password: teacher123\n\n";
echo "========================================\n";
echo "You can now login at: http://localhost:5173\n";
echo "========================================\n\n";
