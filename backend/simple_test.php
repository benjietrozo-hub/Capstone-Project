<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\BorrowRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "=== Simple Database Test ===\n";

try {
    // Clear existing data
    DB::table('tools_equipment')->delete();
    DB::table('teachers')->delete();
    DB::table('borrow_requests')->delete();

    // Create one simple teacher
    $teacher = Teacher::create([
        'teacher_id' => 'T001',
        'employee_id' => 'EMP001',
        'username' => 'test.user',
        'email' => 'test@school.edu',
        'first_name' => 'Test',
        'last_name' => 'User',
        'department' => 'Science',
        'phone' => '123-456-7890',
        'status' => 'active',
        'password' => Hash::make('password'),
    ]);

    echo "Created teacher: {$teacher->id}\n";

    // Create one simple item
    $item = ToolEquipment::create([
        'item_code' => 'TEST001',
        'item_name' => 'Test Item',
        'description' => 'Test description',
        'category' => 'Test',
        'quantity_total' => 10,
        'quantity_available' => 8,
        'quantity_borrowed' => 2,
        'condition_status' => 'good',
        'location' => 'Test Location',
        'unit_price' => 99.99,
        'acquisition_date' => now(),
        'status' => 'active',
    ]);

    echo "Created item: {$item->id}\n";

    // Create one simple borrow request
    $request = BorrowRequest::create([
        'teacher_id' => $teacher->id,
        'item_id' => $item->id,
        'quantity_requested' => 1,
        'purpose' => 'Test purpose',
        'borrow_date' => now(),
        'expected_return_date' => now()->addDays(7),
        'status' => 'pending',
        'condition_before' => 'good',
    ]);

    echo "Created borrow request: {$request->id}\n";

    // Test dashboard data
    $totalItems = ToolEquipment::count();
    $availableItems = ToolEquipment::sum('quantity_available');
    $borrowedItems = ToolEquipment::sum('quantity_borrowed');
    $totalTeachers = Teacher::active()->count();
    $pendingRequests = BorrowRequest::pending()->count();
    $overdueItems = BorrowRequest::overdue()->count();

    echo "\n=== Dashboard Data ===\n";
    echo "Total Items: $totalItems\n";
    echo "Available Items: $availableItems\n";
    echo "Borrowed Items: $borrowedItems\n";
    echo "Total Teachers: $totalTeachers\n";
    echo "Pending Requests: $pendingRequests\n";
    echo "Overdue Items: $overdueItems\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
