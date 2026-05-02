<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tid = $request->user()->id;
        
        // Get comprehensive statistics
        $totalRequests = BorrowRequest::where('teacher_id', $tid)->count();
        $pendingRequests = BorrowRequest::where('teacher_id', $tid)->where('status', 'pending')->count();
        $approvedRequests = BorrowRequest::where('teacher_id', $tid)->where('status', 'approved')->count();
        $borrowedItems = BorrowRequest::where('teacher_id', $tid)->where('status', 'borrowed')->count();
        $returnedItems = BorrowRequest::where('teacher_id', $tid)->where('status', 'returned')->count();
        $rejectedRequests = BorrowRequest::where('teacher_id', $tid)->where('status', 'rejected')->count();
        
        // Get overdue items count
        $overdueItems = BorrowRequest::where('teacher_id', $tid)
            ->where('status', 'borrowed')
            ->whereDate('expected_return_date', '<=', now()->toDateString())
            ->count();
        
        // Get available items count (items with status = 'available')
        $availableItems = \App\Models\InventoryItem::where('status', 'available')->count();
        
        return response()->json([
            'total_requests' => $totalRequests,
            'pending_requests' => $pendingRequests,
            'approved_requests' => $approvedRequests,
            'borrowed_items' => $borrowedItems,
            'returned_items' => $returnedItems,
            'rejected_requests' => $rejectedRequests,
            'overdue_items' => $overdueItems,
            'available_items' => $availableItems,
            'recent_requests' => BorrowRequest::with(['category'])->where('teacher_id', $tid)->latest()->limit(5)->get(),
        ]);
    }
}
