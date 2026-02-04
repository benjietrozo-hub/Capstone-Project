<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\ToolEquipment;
use App\Models\Teacher;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_items' => ToolEquipment::count(),
            'available_items' => ToolEquipment::sum('quantity_available'),
            'borrowed_items' => ToolEquipment::sum('quantity_borrowed'),
            'total_teachers' => Teacher::active()->count(),
            'pending_requests' => BorrowRequest::pending()->count(),
            'overdue_items' => BorrowRequest::overdue()->count(),
        ]);
    }

    public function statistics(Request $request)
    {
        $days = $request->get('days', 30);
        $stats = BorrowRequest::selectRaw('DATE(date_requested) as date, COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            ->where('date_requested', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        return response()->json(['borrow_stats' => $stats]);
    }
}
