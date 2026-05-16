<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the maintenance mode setting
        $maintenanceSetting = SystemSetting::where('key', 'maintenance_mode')->first();
        
        $isMaintenanceMode = $maintenanceSetting && $maintenanceSetting->value === true;

        // If maintenance mode is active, block non-admin users.
        if ($isMaintenanceMode) {
            // Let the admin continue (or if not authenticated, block them if they are trying to access protected routes)
            // For public routes, we might want to block everyone except admin login.
            
            // Allow admin authentication and admin dashboard
            if ($request->is('api/auth/admin/login') || $request->is('api/admin/*') || $request->is('api/system/maintenance/status')) {
                return $next($request);
            }
            
            // If it's a teacher trying to login or an authenticated teacher
            $user = $request->user();
            if ($user && $user instanceof \App\Models\Admin) {
                return $next($request);
            }
            
            // Block others
            return response()->json([
                'status' => 'error',
                'message' => 'System is currently under maintenance. Please try again later.',
                'maintenance_mode' => true
            ], 503);
        }

        return $next($request);
    }
}
