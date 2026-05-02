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
        $stats = \Illuminate\Support\Facades\Cache::remember('admin_dashboard_stats', 300, function () {
            return [
                'total_items' => (int) DB::table('inventory_items')->count(),
                'available_items' => (int) DB::table('inventory_items')->where('status', 'available')->count(),
                'borrowed_items' => (int) DB::table('inventory_items')->where('status', 'borrowed')->count(),
                'total_teachers' => (int) DB::table('teachers')->where('status', 'active')->count(),
                'pending_requests' => (int) DB::table('borrow_requests')->where('status', 'pending')->count(),
                'overdue_items' => (int) DB::table('borrow_requests')
                    ->where('status', 'approved')
                    ->where('expected_return_date', '<', now())
                    ->count(),
                'total_logs' => (int) DB::table('system_logs')->count(),
                'total_reports' => (int) DB::table('reports')->count(),
            ];
        });

        return response()->json($stats);
    }

    public function statistics(Request $request)
    {
        $days = $request->get('days', 30);
        $cacheKey = "admin_borrow_stats_{$days}";

        $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($days) {
            return DB::table('borrow_requests')
                ->selectRaw('DATE(date_requested) as date, COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
                ->where('date_requested', '>=', now()->subDays($days))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();
        });

        return response()->json(['borrow_stats' => $stats]);
    }
}
