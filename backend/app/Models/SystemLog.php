<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'log_type',
        'user_type',
        'user_id',
        'user_name',
        'action',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
        'severity',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function logActivity($type, $action, $description = null, $userId = null, $userType = null, $userName = null, $severity = 'info')
    {
        return self::create([
            'log_type' => $type,
            'user_type' => $userType,
            'user_id' => $userId,
            'user_name' => $userName,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => $severity,
            'metadata' => [
                'url' => request()->fullUrl(),
                'method' => request()->method(),
            ],
        ]);
    }
}
