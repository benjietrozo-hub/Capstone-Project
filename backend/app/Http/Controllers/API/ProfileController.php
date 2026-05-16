<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Models\SystemLog;

class ProfileController extends Controller
{
    private function splitFullName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $firstName = array_shift($parts) ?: '';
        $lastName = count($parts) > 0 ? array_pop($parts) : '';
        $middleName = trim(implode(' ', $parts));

        return [$firstName, $middleName ?: null, $lastName ?: $firstName];
    }

    /**
     * Update personal profile details
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $updates = [
            'phone' => $validated['phone'] ?? null,
        ];

        [$firstName, $middleName, $lastName] = $this->splitFullName($validated['full_name']);

        if ($user instanceof \App\Models\Teacher) {
            $updates['first_name'] = $firstName;
            $updates['middle_initial'] = $middleName ? mb_substr($middleName, 0, 10) : null;
            $updates['last_name'] = $lastName;
            $updates['department'] = $validated['department'] ?? null;
        } elseif ($user instanceof \App\Models\Admin) {
            $updates['first_name'] = $firstName;
            $updates['middle_name'] = $middleName;
            $updates['last_name'] = $lastName;
        }

        // Handle Image Upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('profile_image')->store('profile_images', 'public');
            $updates['profile_image'] = $path;
        }

        $user->forceFill($updates)->save();
        $user->refresh();

        SystemLog::logActivity(
            'profile_update',
            'Update Profile',
            'Updated personal profile details',
            $user->id,
            $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
            $user->full_name
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Update account credentials (email and username)
     */
    public function updateAccount(Request $request)
    {
        $user = $request->user();
        $table = $user->getTable(); // 'admins' or 'teachers'

        $request->validate([
            'username' => ['required', 'string', 'min:3', Rule::unique($table)->ignore($user->id)],
            'email' => ['required', 'email', Rule::unique($table)->ignore($user->id)],
            'password_confirm' => 'required|string',
        ]);

        if (!Hash::check($request->password_confirm, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Incorrect password. Verification failed.'
            ], 403);
        }

        $user->update([
            'username' => $request->username,
            'email' => $request->email,
        ]);

        SystemLog::logActivity(
            'account_update',
            'Update Account',
            'Updated account technical details (Email/Username)',
            $user->id,
            $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
            $user->full_name
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Account details updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Current password is incorrect.'
            ], 403);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        SystemLog::logActivity(
            'password_change',
            'Change Password',
            'Changed account password',
            $user->id,
            $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
            $user->full_name
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully'
        ]);
    }
}
