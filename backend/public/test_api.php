<?php

// Simple API test
header('Content-Type: application/json');

// Include Laravel bootstrap
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Get the kernel and handle the request
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Simulate the dashboard controller response
use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\BorrowRequest;

try {
    $totalItems = ToolEquipment::count();
    $availableItems = ToolEquipment::sum('quantity_available');
    $borrowedItems = ToolEquipment::sum('quantity_borrowed');
    $totalTeachers = Teacher::active()->count();
    $pendingRequests = BorrowRequest::pending()->count();
    $overdueItems = BorrowRequest::overdue()->count();
    
    $dashboardData = [
        'total_items' => $totalItems,
        'available_items' => $availableItems,
        'borrowed_items' => $borrowedItems,
        'total_teachers' => $totalTeachers,
        'pending_requests' => $pendingRequests,
        'overdue_items' => $overdueItems,
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $dashboardData
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
