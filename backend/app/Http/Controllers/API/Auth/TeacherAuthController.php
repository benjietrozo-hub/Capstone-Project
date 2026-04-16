<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TeacherAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $teacher = Teacher::where('username', $request->username)
                         ->orWhere('email', $request->username)
                         ->orWhere('teacher_id', $request->username)
                         ->first();

        if (!$teacher || !Hash::check($request->password, $teacher->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($teacher->status !== 'active') {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive. Please contact support.'],
            ]);
        }

        $teacher->update(['last_login' => now()]);
        $token = $teacher->createToken('teacher-token')->plainTextToken;

        return response()->json([
            'user' => $teacher,
            'token' => $token,
            'role' => 'teacher',
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|string|unique:teachers',
            'username' => 'required|string|unique:teachers',
            'email' => 'required|email|unique:teachers',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:10',
            'last_name' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $teacher = Teacher::create([
            'teacher_id' => $request->teacher_id,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'first_name' => $request->first_name,
            'middle_initial' => $request->middle_initial,
            'last_name' => $request->last_name,
            'department' => $request->department,
            'phone' => $request->phone,
            'status' => 'active',
        ]);

        $token = $teacher->createToken('teacher-token')->plainTextToken;

        return response()->json([
            'user' => $teacher,
            'token' => $token,
            'role' => 'teacher',
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Refresh authentication token
     */
    public function refreshToken(Request $request)
    {
        $user = $request->user();
        
        // Revoke old token
        $request->user()->currentAccessToken()->delete();
        
        // Create new token with expiration
        $newToken = $user->createToken('teacher-token', [
            'expires_at' => now()->addHour(), // 1 hour expiration
        ])->plainTextToken;
        
        return response()->json([
            'token' => $newToken,
            'user' => $user,
            'role' => 'teacher',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
