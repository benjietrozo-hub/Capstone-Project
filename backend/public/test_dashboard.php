<?php

// Simple test to check dashboard data
header('Content-Type: application/json');

try {
    // Include Laravel bootstrap
    require __DIR__ . '/../vendor/autoload.php';
    
    // Use Laravel's app container to resolve models
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    
    use App\Models\ToolEquipment;
    use App\Models\Teacher;
    use App\Models\BorrowRequest;
    
    // Test database connection
    $totalItems = ToolEquipment::count();
    $availableItems = ToolEquipment::sum('quantity_available');
    $borrowedItems = ToolEquipment::sum('quantity_borrowed');
    $totalTeachers = Teacher::active()->count();
    $pendingRequests = BorrowRequest::pending()->count();
    $overdueItems = BorrowRequest::overdue()->count();
    
    $dashboardData = [
        'success' => true,
        'data' => [
            'total_items' => $totalItems,
            'available_items' => $availableItems,
            'borrowed_items' => $borrowedItems,
            'total_teachers' => $totalTeachers,
            'pending_requests' => $pendingRequests,
            'overdue_items' => $overdueItems,
        ]
    ];
    
    echo json_encode($dashboardData, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
