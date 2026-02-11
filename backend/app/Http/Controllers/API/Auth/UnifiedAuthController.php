<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UnifiedAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Try to find user in admin table first
        $admin = Admin::where('username', $request->username)
                     ->orWhere('email', $request->username)
                     ->first();

        if ($admin && Hash::check($request->password, $admin->password)) {
            if ($admin->status !== 'active') {
                // Log failed login attempt
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

            $admin->update(['last_login' => now()]);
            $token = $admin->createToken('admin-token')->plainTextToken;

            // Log successful login
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
                'role' => 'admin',
            ]);
        }

        // Try to find user in teacher table
        $teacher = Teacher::where('username', $request->username)
                         ->orWhere('email', $request->username)
                         ->orWhere('employee_id', $request->username)
                         ->first();

        if ($teacher && Hash::check($request->password, $teacher->password)) {
            if ($teacher->status !== 'active') {
                // Log failed login attempt
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

            $teacher->update(['last_login' => now()]);
            $token = $teacher->createToken('teacher-token')->plainTextToken;

            // Log successful login
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
                'role' => 'teacher',
            ]);
        }

        // Log failed login attempt
        SystemLog::logActivity(
            'auth',
            'login_failed',
            'Invalid credentials for username: ' . $request->username,
            null,
            null,
            $request->username,
            'warning'
        );

        // If no user found or password incorrect
        throw ValidationException::withMessages([
            'username' => ['The provided credentials are incorrect.'],
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
}
