<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\SystemLog;
use App\Models\LoginAttempt;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class UnifiedAuthController extends Controller
{
    public function login(Request $request)
    {
        // Debug logging
        \Log::info('=== LOGIN ATTEMPT DEBUG ===');
        \Log::info('Request data:', $request->all());
        \Log::info('Request headers:', $request->headers->all());
        
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $ipAddress = $request->ip() ?? '127.0.0.1';
        $identifier = $request->username;

        // Get or create login attempt record
        $loginAttempt = LoginAttempt::getOrCreate($identifier, $ipAddress);

        // Check if account is locked
        if ($loginAttempt->isLocked()) {
            $remainingTime = $loginAttempt->getRemainingLockTime();
            
            SystemLog::logActivity(
                'auth',
                'login_blocked',
                'Login attempt blocked due to account lock: ' . $identifier,
                null,
                null,
                $identifier,
                'warning'
            );

            return response()->json([
                'message' => $loginAttempt->getLockoutMessage(),
                'locked' => true,
                'locked_until' => $loginAttempt->locked_until,
                'remaining_seconds' => $remainingTime,
                'batch' => $loginAttempt->batch,
            ], 429);
        }

        // Try to find user in admin table first
        $admin = Admin::where('username', $request->username)
                     ->orWhere('email', $request->username)
                     ->first();

        if ($admin && Hash::check($request->password, $admin->password)) {
            if ($admin->status !== 'active') {
                SystemLog::logActivity(
                    'auth',
                    'login_failed',
                    'Inactive account login attempt',
                    $admin->id,
                    'admin',
                    $admin->first_name . ' ' . $admin->last_name,
                    'warning'
                );

                throw ValidationException::withMessages([
                    'username' => ['Your account is inactive. Please contact support.'],
                ]);
            }

            // Successful login - reset attempts
            $loginAttempt->resetAttempts();

            // Create token with expiration (3 hours)
            $token = $admin->createToken('admin-token', ['*'], now()->addHours(3))->plainTextToken;

            // Create refresh token (longer expiration)
            $refreshToken = $admin->createToken('admin-refresh', ['*'], now()->addDays(7))->plainTextToken;

            $admin->update(['last_login' => now()]);

            SystemLog::logActivity(
                'auth',
                'login',
                'Admin logged in successfully',
                $admin->id,
                'admin',
                $admin->first_name . ' ' . $admin->last_name,
                'info'
            );

            return response()->json([
                'user' => $admin,
                'token' => $token,
                'refresh_token' => $refreshToken,
                'role' => 'admin',
                'password_change_required' => $admin->password_change_required,
            ]);
        }

        // Try to find user in teacher table
        $teacher = Teacher::where('username', $request->username)
                         ->orWhere('email', $request->username)
                         ->orWhere('teacher_id', $request->username)
                         ->first();

        if ($teacher && Hash::check($request->password, $teacher->password)) {
            if ($teacher->status !== 'active') {
                SystemLog::logActivity(
                    'auth',
                    'login_failed',
                    'Inactive account login attempt',
                    $teacher->id,
                    'teacher',
                    $teacher->first_name . ' ' . $teacher->last_name,
                    'warning'
                );

                throw ValidationException::withMessages([
                    'username' => ['Your account is inactive. Please contact support.'],
                ]);
            }

            // Successful login - reset attempts
            $loginAttempt->resetAttempts();

            // Create token with expiration (3 hours)
            $token = $teacher->createToken('teacher-token', ['*'], now()->addHours(3))->plainTextToken;

            // Create refresh token (longer expiration)
            $refreshToken = $teacher->createToken('teacher-refresh', ['*'], now()->addDays(7))->plainTextToken;

            $teacher->update(['last_login' => now()]);

            SystemLog::logActivity(
                'auth',
                'login',
                'Teacher logged in successfully',
                $teacher->id,
                'teacher',
                $teacher->first_name . ' ' . $teacher->last_name,
                'info'
            );

            return response()->json([
                'user' => $teacher,
                'token' => $token,
                'refresh_token' => $refreshToken,
                'role' => 'teacher',
                'password_change_required' => $teacher->password_change_required,
            ], 201);
        }

        // Failed login - record attempt
        $loginAttempt->recordFailedAttempt();
        $remainingAttempts = $loginAttempt->getRemainingAttempts();

        SystemLog::logActivity(
            'auth',
            'login_failed',
            'Invalid credentials for username: ' . $request->username . ' (Batch: ' . $loginAttempt->batch . ', Remaining: ' . $remainingAttempts . ')',
            null,
            null,
            $request->username,
            'warning'
        );

        // Check if just got locked
        if ($loginAttempt->isLocked()) {
            $remainingTime = $loginAttempt->getRemainingLockTime();
            
            return response()->json([
                'message' => $loginAttempt->getLockoutMessage(),
                'locked' => true,
                'locked_until' => $loginAttempt->locked_until,
                'remaining_seconds' => $remainingTime,
                'batch' => $loginAttempt->batch,
            ], 429);
        }

        // Return error with remaining attempts
        $message = 'The provided credentials are incorrect.';
        if ($remainingAttempts > 0) {
            $message .= " You have {$remainingAttempts} attempt(s) remaining.";
        }

        throw ValidationException::withMessages([
            'username' => [$message],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Determine user type and name
        $userType = $user instanceof Admin ? 'admin' : 'teacher';
        $userName = $user->first_name . ' ' . $user->last_name;
        
        // Log logout
        SystemLog::logActivity(
            'auth',
            'logout',
            ucfirst($userType) . ' logged out',
            $user->id,
            $userType,
            $userName,
            'info'
        );
        
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function refreshToken(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $refreshTokenString = $request->refresh_token;

        // Try to find the token in database
        $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($refreshTokenString);

        if (!$personalAccessToken) {
            return response()->json(['message' => 'Invalid refresh token'], 401);
        }

        // Check if token has expired
        if ($personalAccessToken->expires_at && $personalAccessToken->expires_at->isPast()) {
            return response()->json(['message' => 'Refresh token expired'], 401);
        }

        $user = $personalAccessToken->tokenable;

        // Check if user is still active
        if ($user->status !== 'active') {
            return response()->json(['message' => 'User account is inactive'], 401);
        }

        // Create new access token (3 hours)
        $newToken = $user->createToken('access-token', ['*'], now()->addHours(3))->plainTextToken;

        return response()->json([
            'token' => $newToken,
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Try to find user in admin table first
        $admin = Admin::where('email', $request->email)->first();
        $user = $admin;
        $userType = 'admin';

        // If not found in admin, try teacher table
        if (!$admin) {
            $teacher = Teacher::where('email', $request->email)->first();
            $user = $teacher;
            $userType = 'teacher';
        }

        // Always return success message for security (don't reveal if email exists)
        if (!$user) {
            return response()->json([
                'message' => 'If an account exists with this email, you will receive a password reset link.'
            ]);
        }

        // Generate reset token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Store the token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'user_type' => $userType,
            'created_at' => Carbon::now()
        ]);

        // Generate reset URL
        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        // Send email
        try {
            Mail::to($request->email)->send(new PasswordResetMail(
                $resetUrl,
                $user->first_name . ' ' . $user->last_name
            ));

            // Log password reset request
            SystemLog::logActivity(
                'auth',
                'password_reset_requested',
                'Password reset email sent',
                $user->id,
                $userType,
                $user->first_name . ' ' . $user->last_name,
                'info'
            );
        } catch (\Exception $e) {
            // Log error but don't reveal to user
            \Log::error('Password reset email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'If an account exists with this email, you will receive a password reset link.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Find the token record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'email' => ['Invalid or expired reset token.'],
            ]);
        }

        // Check if token is expired (60 minutes)
        if (Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'email' => ['This password reset link has expired.'],
            ]);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid reset token.'],
            ]);
        }

        // Find and update user
        if ($resetRecord->user_type === 'admin') {
            $user = Admin::where('email', $request->email)->first();
        } else {
            $user = Teacher::where('email', $request->email)->first();
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Log password reset
        SystemLog::logActivity(
            'auth',
            'password_reset',
            'Password was reset successfully',
            $user->id,
            $resetRecord->user_type,
            $user->first_name . ' ' . $user->last_name,
            'info'
        );

        return response()->json([
            'message' => 'Password has been reset successfully. You can now login with your new password.'
        ]);
    }

    /**
     * Verify the current user's password for secure actions
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();
        
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided password is incorrect.'
            ], 422);
        }

        return response()->json([
            'message' => 'Password verified successfully.'
        ]);
    }

    /**
     * Send OTP for forced password reset
     */
    public function sendOTP(Request $request)
    {
        $user = $request->user();
        
        // Generate a 6-digit OTP
        $otp = sprintf("%06d", mt_rand(1, 999999));
        
        // Set expiration (3 minutes)
        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(3);
        $user->save();
        
        // Send OTP Email
        $sent = \App\Services\PHPMailerService::sendOTPEmail($user, $otp);
        
        if ($sent) {
            SystemLog::logActivity(
                'auth',
                'otp_generated',
                'Security OTP generated and sent to email',
                $user->id,
                $user instanceof Admin ? 'admin' : 'teacher',
                $user->first_name . ' ' . $user->last_name,
                'info'
            );
            
            return response()->json(['message' => 'OTP has been sent to your email.']);
        }
        
        return response()->json(['message' => 'Failed to send OTP email. Please try again.'], 500);
    }

    /**
     * Verify OTP without resetting password
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->otp_code || $user->otp_code !== $request->otp) {
             return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        if (!$user->otp_expires_at || $user->otp_expires_at->isPast()) {
             return response()->json(['message' => 'Verification code has expired.'], 422);
        }

        return response()->json(['message' => 'Code verified successfully.']);
    }

    /**
     * Reset password after OTP verification (Forced Reset)
     */
    public function resetForcedPassword(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // 1. Verify OTP
        if (!$user->otp_code || $user->otp_code !== $request->otp) {
             return response()->json(['message' => 'Invalid OTP code.'], 422);
        }

        // 2. Check Expiration
        if (!$user->otp_expires_at || $user->otp_expires_at->isPast()) {
             return response()->json(['message' => 'OTP has expired. Please request a new one.'], 422);
        }

        // 3. Security Check: Cannot use old password
        if (Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'New password cannot be the same as your old password. Please choose a different one.',
                'errors' => [
                    'password' => ['The new password cannot be the same as the old password.']
                ]
            ], 422);
        }

        // 4. Update Password
        $user->password = Hash::make($request->password);
        $user->password_change_required = false;
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        SystemLog::logActivity(
            'auth',
            'forced_password_reset_success',
            'Mandatory password reset completed successfully',
            $user->id,
            $user instanceof Admin ? 'admin' : 'teacher',
            $user->first_name . ' ' . $user->last_name,
            'info'
        );

        return response()->json(['message' => 'Password reset successfully. You now have full access.']);
    }
}
