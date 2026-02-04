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
        
        // Get available items count (items with quantity_available > 0)
        $availableItems = \App\Models\ToolEquipment::where('quantity_available', '>', 0)
            ->where('status', 'active')
            ->count();
        
        return response()->json([
            'total_requests' => $totalRequests,
            'pending_requests' => $pendingRequests,
            'approved_requests' => $approvedRequests,
            'borrowed_items' => $borrowedItems,
            'returned_items' => $returnedItems,
            'rejected_requests' => $rejectedRequests,
            'available_items' => $availableItems,
            'recent_requests' => BorrowRequest::with(['item'])->where('teacher_id', $tid)->latest()->limit(5)->get(),
        ]);
    }
}
