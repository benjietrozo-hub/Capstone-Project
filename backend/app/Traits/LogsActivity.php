<?php

namespace App\Traits;

use App\Models\SystemLog;

trait LogsActivity
{
    /**
     * Log an activity to the system logs
     */
    protected function logActivity($action, $description, $severity = 'info', $metadata = [])
    {
        $user = auth()->user();
        
        if (!$user) {
            return;
        }

        // Determine user type
        $userType = null;
        $userName = null;
        
        if ($user instanceof \App\Models\Admin) {
            $userType = 'admin';
            $userName = $user->first_name . ' ' . $user->last_name;
        } elseif ($user instanceof \App\Models\Teacher) {
            $userType = 'teacher';
            $userName = $user->first_name . ' ' . $user->last_name;
        }

        SystemLog::logActivity(
            'transaction',
            $action,
            $description,
            $user->id,
            $userType,
            $userName,
            $severity
        );
    }
}
