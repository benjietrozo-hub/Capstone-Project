<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LoginAttempt extends Model
{
    protected $fillable = [
        'identifier',
        'ip_address',
        'batch',
        'attempts_in_batch',
        'locked_until',
        'total_attempts_today', // Track daily attempts
        'last_attempt_at',     // Track last attempt time
    ];

    protected $casts = [
        'locked_until' => 'datetime',
    ];

    /**
     * Get or create login attempt record
     */
    public static function getOrCreate($identifier, $ipAddress)
    {
        $attempt = self::where('identifier', $identifier)
            ->where('ip_address', $ipAddress)
            ->first();

        if (!$attempt) {
            $attempt = self::create([
                'identifier' => $identifier,
                'ip_address' => $ipAddress,
                'batch' => 1,
                'attempts_in_batch' => 0,
            ]);
        }

        return $attempt;
    }

    /**
     * Check if account is locked
     */
    public function isLocked()
    {
        if ($this->locked_until && Carbon::now()->lessThan($this->locked_until)) {
            return true;
        }

        // If lock expired, just clear the locked_until timestamp
        // Don't reset batch - keep progression
        if ($this->locked_until && Carbon::now()->greaterThanOrEqualTo($this->locked_until)) {
            $this->locked_until = null;
            $this->save();
        }

        return false;
    }

    /**
     * Get remaining lock time in seconds
     */
    public function getRemainingLockTime()
    {
        if (!$this->locked_until) {
            return 0;
        }

        $remaining = Carbon::now()->diffInSeconds($this->locked_until, false);
        return max(0, (int) ceil($remaining));
    }

    /**
     * Record failed attempt with enhanced security
     */
    public function recordFailedAttempt()
    {
        $this->attempts_in_batch++;
        $this->total_attempts_today = ($this->total_attempts_today ?? 0) + 1;
        $this->last_attempt_at = now();
        
        // Check if batch limit reached (3 attempts per batch)
        if ($this->attempts_in_batch >= 3) {
            $this->applyLockout();
        }
        
        // Check daily limit (50 attempts per day)
        if ($this->total_attempts_today >= 50) {
            $this->applyDailyLockout();
        }
        
        $this->save();
    }

    /**
     * Apply lockout based on batch
     */
    private function applyLockout()
    {
        switch ($this->batch) {
            case 1:
                // First batch: 30 seconds
                $this->locked_until = Carbon::now()->addSeconds(30);
                $this->batch = 2;
                $this->attempts_in_batch = 0;
                break;
            case 2:
                // Second batch: 1 minute
                $this->locked_until = Carbon::now()->addMinute();
                $this->batch = 3;
                $this->attempts_in_batch = 0;
                break;
            case 3:
                // Third batch: 2 minutes
                $this->locked_until = Carbon::now()->addMinutes(2);
                $this->batch = 4;
                $this->attempts_in_batch = 0;
                break;
            case 4:
                // Final lockout: 15 minutes
                $this->locked_until = Carbon::now()->addMinutes(15);
                break;
        }
    }

    /**
     * Apply daily lockout for excessive attempts
     */
    private function applyDailyLockout()
    {
        // Lock for 24 hours if daily limit exceeded
        $this->locked_until = Carbon::now()->addDay();
        $this->batch = 1;
        $this->attempts_in_batch = 0;
        $this->total_attempts_today = 0; // Reset for next day
    }

    /**
     * Reset daily attempts at midnight or after successful login
     */
    public function resetDailyAttempts()
    {
        // Only reset if it's a new day
        if (!$this->last_attempt_at || Carbon::now()->diffInDays($this->last_attempt_at) >= 1) {
            $this->total_attempts_today = 0;
        }
    }

    /**
     * Reset attempts after successful login
     */
    public function resetAttempts()
    {
        $this->batch = 1;
        $this->attempts_in_batch = 0;
        $this->locked_until = null;
        $this->total_attempts_today = 0; // Reset daily attempts
        $this->save();
    }

    /**
     * Get remaining attempts in current batch
     */
    public function getRemainingAttempts()
    {
        return max(0, 3 - $this->attempts_in_batch);
    }

    /**
     * Get lockout message based on batch and daily limits
     */
    public function getLockoutMessage()
    {
        if ($this->batch == 4 && $this->locked_until) {
            return 'Your account is temporarily locked for your account safety. Please contact administrator or wait 15 minutes.';
        }
        
        if ($this->locked_until && Carbon::now()->greaterThanOrEqualTo($this->locked_until)) {
            $remaining = $this->getRemainingLockTime();
            $minutes = floor($remaining / 60);
            $seconds = $remaining % 60;
            
            // Check if it's a daily lockout
            if ($this->total_attempts_today >= 50) {
                return 'Daily attempt limit exceeded. Please wait 24 hours before trying again.';
            }

            if ($minutes > 0) {
                return "Too many failed attempts. Please wait {$minutes} minute(s) and {$seconds} second(s) before trying again.";
            }

            return "Too many failed attempts. Please wait {$seconds} second(s) before trying again.";
        }

        return null;
    }
}
