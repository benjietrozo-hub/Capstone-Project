<?php

namespace App\Traits;

use App\Models\SystemLog;

trait LogsActivity
{
    /**
     * Log an activity to the system logs with optional model changes snapshot
     */
    protected function logActivity($action, $description, $severity = 'info', $metadata = [], $model = null)
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

        // Capture model changes if provided
        $changes = [];
        if ($model && method_exists($model, 'getChanges')) {
            $changedKeys = array_keys($model->getChanges());
            foreach ($changedKeys as $key) {
                if ($key !== 'updated_at') {
                    $changes[$key] = [
                        'old' => $model->getOriginal($key),
                        'new' => $model->getAttribute($key)
                    ];
                }
            }
        }

        \App\Jobs\ProcessSystemLog::dispatch([
            'log_type' => 'transaction',
            'action' => $action,
            'description' => $description,
            'user_id' => $user->id,
            'user_type' => $userType,
            'user_name' => $userName,
            'severity' => $severity,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'reference_id' => $model ? $model->id : null,
            'metadata' => [
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'correlation_id' => request()->attributes->get('correlation_id'),
                'changes' => !empty($changes) ? $changes : null,
                ...$metadata
            ],
        ]);
    }
}
