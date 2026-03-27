<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)
                     ->orWhere('email', $request->username)
                     ->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($admin->status !== 'active') {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive. Please contact support.'],
            ]);
        }

        $admin->update(['last_login' => now()]);
        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'user' => $admin,
            'token' => $token,
            'role' => 'admin',
        ]);
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
        $newToken = $user->createToken('admin-token', [
            'expires_at' => now()->addHour(), // 1 hour expiration
        ])->plainTextToken;
        
        return response()->json([
            'token' => $newToken,
            'user' => $user,
            'role' => 'admin',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
