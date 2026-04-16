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
        'reference_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::created(function ($log) {
            // Broadcast log to all admin users via WebSocket
            if (class_exists('\App\WebSocket\WebSocketBroadcaster')) {
                try {
                    \App\WebSocket\WebSocketBroadcaster::broadcast([
                        'type' => 'log_update',
                        'target' => [
                            'user_type' => 'admin'
                        ],
                        'data' => $log->toArray()
                    ]);
                } catch (\Exception $e) {
                    // Silently fail if WebSocket is not available
                    \Log::debug('Failed to broadcast log update: ' . $e->getMessage());
                }
            }
        });
    }

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
