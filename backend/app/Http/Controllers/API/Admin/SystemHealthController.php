<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\SystemLog;

class SystemHealthController extends Controller
{
    public function getStatus()
    {
        // Simple health checks
        $dbStatus = 'Healthy';
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'Disconnected';
        }

        $activeUsers = Admin::where('status', 'active')->count() + Teacher::where('status', 'active')->count();
        $recentLogs = SystemLog::where('created_at', '>=', now()->subHours(24))->count();
        
        // Mocking uptime for local dev simulation
        $uptime = '99.98%'; 
        $lastBackup = Cache::get('last_backup_time', 'Never');
        
        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'Online',
                'database' => $dbStatus,
                'uptime' => $uptime,
                'active_sessions' => $activeUsers,
                'activity_24h' => $recentLogs,
                'last_backup' => $lastBackup,
                'api_latency' => '45ms',
                'version' => 'v2.1.0-stable'
            ]
        ]);
    }
}
