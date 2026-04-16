<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\BorrowRequest;

echo "=== Dashboard Data Test ===\n\n";

try {
    // Test ToolEquipment counts
    $totalItems = ToolEquipment::count();
    $availableItems = ToolEquipment::sum('quantity_available');
    $borrowedItems = ToolEquipment::sum('quantity_borrowed');
    
    echo "ToolEquipment Data:\n";
    echo "- Total Items: $totalItems\n";
    echo "- Available Items: $availableItems\n";
    echo "- Borrowed Items: $borrowedItems\n\n";
    
    // Test Teacher counts
    $totalTeachers = Teacher::active()->count();
    
    echo "Teacher Data:\n";
    echo "- Total Active Teachers: $totalTeachers\n\n";
    
    // Test BorrowRequest counts
    $pendingRequests = BorrowRequest::pending()->count();
    $overdueItems = BorrowRequest::overdue()->count();
    
    echo "BorrowRequest Data:\n";
    echo "- Pending Requests: $pendingRequests\n";
    echo "- Overdue Items: $overdueItems\n\n";
    
    // Test the actual database connection
    $sampleItems = ToolEquipment::limit(3)->get(['item_code', 'item_name', 'quantity_available']);
    echo "Sample Items in Database:\n";
    foreach ($sampleItems as $item) {
        echo "- {$item->item_code}: {$item->item_name} (Available: {$item->quantity_available})\n";
    }
    
    echo "\n=== Dashboard API Response ===\n";
    
    // Simulate the exact API response
    $dashboardData = [
        'total_items' => $totalItems,
        'available_items' => $availableItems,
        'borrowed_items' => $borrowedItems,
        'total_teachers' => $totalTeachers,
        'pending_requests' => $pendingRequests,
        'overdue_items' => $overdueItems,
    ];
    
    echo json_encode($dashboardData, JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
