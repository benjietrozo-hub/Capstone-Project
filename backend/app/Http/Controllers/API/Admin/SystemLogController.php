<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::query()->orderBy('created_at', 'desc');

        // Filter by log type
        if ($request->has('log_type') && $request->log_type) {
            $query->where('log_type', $request->log_type);
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        // Filter by user type
        if ($request->has('user_type') && $request->user_type) {
            $query->where('user_type', $request->user_type);
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    public function statistics()
    {
        $stats = \Illuminate\Support\Facades\Cache::remember('system_log_stats', 300, function () {
            return [
                'total_logs' => SystemLog::count(),
                'today_logs' => SystemLog::whereDate('created_at', today())->count(),
                'login_attempts' => SystemLog::where('log_type', 'auth')
                    ->where('action', 'login')
                    ->count(),
                'failed_logins' => SystemLog::where('log_type', 'auth')
                    ->where('action', 'login_failed')
                    ->count(),
                'by_type' => SystemLog::selectRaw('log_type, COUNT(*) as count')
                    ->groupBy('log_type')
                    ->get()
                    ->pluck('count', 'log_type'),
                'by_action' => SystemLog::selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->orderByDesc('count')
                    ->limit(10)
                    ->get()
                    ->pluck('count', 'action'),
                'by_severity' => SystemLog::selectRaw('severity, COUNT(*) as count')
                    ->groupBy('severity')
                    ->get()
                    ->pluck('count', 'severity'),
                'recent_critical' => SystemLog::where('severity', 'critical')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
                'recent_failed_logins' => SystemLog::where('action', 'login_failed')
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get(),
            ];
        });

        return response()->json($stats);
    }

    public function show($id)
    {
        $log = SystemLog::findOrFail($id);
        return response()->json($log);
    }
}
