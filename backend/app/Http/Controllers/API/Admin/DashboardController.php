<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use Illuminate\Support\Facades\DB;
use App\Models\Teacher;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_items' => DB::table('tools_equipment')->count(),
            'available_items' => DB::table('tools_equipment')->sum('quantity_available'),
            'borrowed_items' => DB::table('tools_equipment')->sum('quantity_borrowed'),
            'total_teachers' => DB::table('teachers')->where('status', 'active')->count(),
            'pending_requests' => DB::table('borrow_requests')->where('status', 'pending')->count(),
            'overdue_items' => DB::table('borrow_requests')->where('status', 'approved')->where('due_date', '<', now())->count(),
        ]);
    }

    public function statistics(Request $request)
    {
        $days = $request->get('days', 30);
        $stats = DB::table('borrow_requests')
            ->selectRaw('DATE(date_requested) as date, COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            ->where('date_requested', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
        return response()->json(['borrow_stats' => $stats]);
    }
}
