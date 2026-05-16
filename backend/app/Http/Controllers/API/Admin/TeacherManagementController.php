<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherManagementController extends Controller
{
    use LogsActivity;
    public function index(Request $request)
    {
        $q = Teacher::query();
        
        // Exclude users who are admins (exist in admins table)
        // This prevents confusion - admins should not appear in teacher management
        $q->whereNotIn('email', function($query) {
            $query->select('email')
                  ->from('admins')
                  ->whereNull('deleted_at');
        });
        
        if ($request->search) {
            $s = $request->search;
            $q->where(fn($q) => $q->where('first_name', 'like', "%{$s}%")
                                  ->orWhere('last_name', 'like', "%{$s}%")
                                  ->orWhere('email', 'like', "%{$s}%")
                                  ->orWhere('teacher_id', 'like', "%{$s}%"));
        }
        if ($request->status) $q->where('status', $request->status);
        if ($request->department) $q->where('department', $request->department);
        return response()->json($q->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'teacher_id' => 'required|unique:teachers,teacher_id,NULL,id,deleted_at,NULL', 
            'username' => 'required|unique:teachers,username,NULL,id,deleted_at,NULL', 
            'email' => 'required|email|unique:teachers,email,NULL,id,deleted_at,NULL', 
            'password' => 'required|min:8', 
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|max:10',
            'last_name' => 'required|string|max:255',
            'department' => 'nullable', 
            'phone' => 'nullable',
            'role' => 'nullable|string|in:teacher,admin'
        ]);
        $v['password'] = Hash::make($v['password']);
        $v['status'] = 'active';
        $v['password_change_required'] = true; // Force password change on first login
        
        $teacher = Teacher::create($v);

        // If role is admin, also create an admin record
        if (isset($v['role']) && $v['role'] === 'admin') {
            \App\Models\Admin::create([
                'username' => $teacher->username,
                'email' => $teacher->email,
                'password' => $teacher->password, // Already hashed
                'first_name' => $teacher->first_name,
                'middle_name' => $teacher->middle_initial,
                'last_name' => $teacher->last_name,
                'phone' => $teacher->phone,
                'status' => 'active',
                'admin_type' => 'regular_admin',
                'can_manage_all_admins' => false,
                'can_manage_own_profile_only' => false,
                'password_change_required' => true,
            ]);
        }
        
        // Send Welcome Email
        \App\Services\PHPMailerService::sendWelcomeEmail($teacher, $request->password);
        
        // Log activity
        $this->logActivity(
            'account_created',
            "Created new " . ($v['role'] ?? 'teacher') . " account: {$teacher->first_name} {$teacher->last_name} ({$teacher->teacher_id})",
            'info'
        );
        
        return response()->json($teacher, 201);
    }

    public function show(string $id)
    {
        return response()->json(Teacher::with(['borrowRequests', 'reports'])->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $t = Teacher::findOrFail($id);
        $v = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'middle_initial' => 'nullable|max:10',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:teachers,email,' . $id . ',id,deleted_at,NULL', 
            'department' => 'nullable', 
            'phone' => 'nullable', 
            'status' => 'sometimes|in:active,inactive,suspended', 
            'role' => 'sometimes|string|in:teacher,admin',
            'password' => 'nullable|min:8'
        ]);
        if (isset($v['password'])) $v['password'] = Hash::make($v['password']);
        $t->update($v);
        
        // Handle promotion to admin
        if (isset($v['role']) && $v['role'] === 'admin') {
            // Check if admin record already exists
            $adminExists = \App\Models\Admin::where('email', $t->email)->exists();
            if (!$adminExists) {
                \App\Models\Admin::create([
                    'username' => $t->username,
                    'email' => $t->email,
                    'password' => $t->password, // Reuse teacher password
                    'first_name' => $t->first_name,
                    'middle_name' => $t->middle_initial,
                    'last_name' => $t->last_name,
                    'phone' => $t->phone,
                    'status' => 'active',
                    'admin_type' => 'regular_admin',
                    'can_manage_all_admins' => false,
                    'can_manage_own_profile_only' => false,
                ]);
            }
        }

        // Log activity
        $this->logActivity(
            'teacher_updated',
            "Updated teacher account: {$t->first_name} {$t->last_name} ({$t->teacher_id})" . (isset($v['role']) && $v['role'] === 'admin' ? " [PROMOTED TO ADMIN]" : ""),
            'info'
        );
        
        return response()->json($t);
    }

    public function destroy(string $id)
    {
        $teacher = Teacher::findOrFail($id);
        $teacherName = $teacher->first_name . ' ' . $teacher->last_name;
        $teacherId = $teacher->teacher_id;

        $teacher->delete();

        // Log activity
        $this->logActivity(
            'teacher_archived',
            "Archived teacher account: {$teacherName} ({$teacherId})",
            'warning'
        );

        return response()->json(null, 204);
    }

    public function validateUnique(Request $request)
    {
        $field = $request->field;
        $value = $request->value;
        $excludeId = $request->exclude_id;

        if (!in_array($field, ['teacher_id', 'username', 'email'])) {
            return response()->json(['valid' => false, 'message' => 'Invalid field'], 400);
        }

        $exists = Teacher::where($field, $value)
            ->where('id', '!=', $excludeId)
            ->whereNull('deleted_at')
            ->exists();

        // Also check admins table for email/username
        if (!$exists && ($field === 'email' || $field === 'username')) {
            $exists = \App\Models\Admin::where($field, $value)
                ->whereNull('deleted_at')
                ->exists();
        }

        return response()->json([
            'valid' => !$exists,
            'message' => $exists ? "This " . str_replace('_', ' ', $field) . " is already taken." : null
        ]);
    }
}
