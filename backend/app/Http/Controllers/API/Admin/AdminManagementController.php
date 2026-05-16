<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminManagementController extends Controller
{
    use LogsActivity;
    
    public function index(Request $request)
    {
        $q = Admin::query();
        
        if ($request->search) {
            $s = $request->search;
            $q->where(fn($q) => $q->where('first_name', 'like', "%{$s}%")
                                  ->orWhere('last_name', 'like', "%{$s}%")
                                  ->orWhere('email', 'like', "%{$s}%")
                                  ->orWhere('username', 'like', "%{$s}%"));
        }
        
        if ($request->status) {
            $q->where('status', $request->status);
        }
        
        return response()->json($q->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'username' => 'required|unique:admins,username,NULL,id,deleted_at,NULL',
            'email' => 'required|email|unique:admins,email,NULL,id,deleted_at,NULL',
            'password' => 'required|min:8',
            'first_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|max:10',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable',
        ]);
        
        $v['password'] = Hash::make($v['password']);
        $v['status'] = 'active';
        $v['password_change_required'] = true; // Force password change on first login
        
        $admin = Admin::create($v);
        
        // Send Welcome Email
        \App\Services\PHPMailerService::sendWelcomeEmail($admin, $request->password);
        
        // Log activity
        $this->logActivity(
            'admin_created',
            "Created new admin account and sent welcome email: {$admin->first_name} {$admin->last_name} ({$admin->username})",
            'info'
        );
        
        return response()->json($admin, 201);
    }

    public function show(string $id)
    {
        return response()->json(Admin::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $admin = Admin::findOrFail($id);
        
        $v = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'middle_initial' => 'nullable|max:10',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:admins,email,' . $id . ',id,deleted_at,NULL',
            'phone' => 'nullable',
            'status' => 'sometimes|in:active,inactive,suspended',
            'password' => 'nullable|min:8'
        ]);
        
        if (isset($v['password'])) {
            $v['password'] = Hash::make($v['password']);
        }
        
        $admin->update($v);
        
        // Log activity
        $this->logActivity(
            'admin_updated',
            "Updated admin account: {$admin->first_name} {$admin->last_name} ({$admin->username})",
            'info'
        );
        
        return response()->json($admin);
    }

    public function destroy(string $id)
    {
        $admin = Admin::findOrFail($id);
        $adminName = $admin->first_name . ' ' . $admin->last_name;
        $adminUsername = $admin->username;

        $admin->delete();

        // Log activity
        $this->logActivity(
            'admin_archived',
            "Archived admin account: {$adminName} ({$adminUsername})",
            'warning'
        );

        return response()->json(null, 204);
    }

    public function demote(string $id)
    {
        $admin = Admin::findOrFail($id);
        
        // Don't allow demoting yourself or root admin if needed (optional logic)
        if ($admin->admin_type === 'root_admin') {
            return response()->json(['message' => 'Cannot demote the Root Administrator.'], 403);
        }

        if (auth()->id() == $admin->id && auth()->user() instanceof Admin) {
             return response()->json(['message' => 'You cannot demote your own account.'], 403);
        }

        try {
            return \Illuminate\Support\Facades\DB::transaction(function() use ($admin) {
                // 1. Find or Create Teacher record
                $teacher = \App\Models\Teacher::where('email', $admin->email)->first();
                
                if ($teacher) {
                    $teacher->update([
                        'role' => 'teacher',
                        'status' => 'active'
                    ]);
                } else {
                    // Create a new teacher record if they didn't have one
                    \App\Models\Teacher::create([
                        'teacher_id' => 'TCH-' . strtoupper(substr($admin->username, 0, 3)) . rand(100, 999),
                        'username' => $admin->username,
                        'email' => $admin->email,
                        'password' => $admin->password, // Keep the same password
                        'first_name' => $admin->first_name,
                        'middle_initial' => $admin->middle_name,
                        'last_name' => $admin->last_name,
                        'phone' => $admin->phone,
                        'status' => 'active',
                        'role' => 'teacher',
                    ]);
                }

                // 2. Delete Admin record
                $adminName = $admin->first_name . ' ' . $admin->last_name;
                $admin->delete();

                // Log activity
                $this->logActivity(
                    'admin_demoted',
                    "Demoted administrator to teacher: {$adminName} ({$admin->username})",
                    'warning'
                );

                return response()->json(['message' => 'Administrator successfully demoted to teacher.']);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to demote administrator: ' . $e->getMessage()], 500);
        }
    }
}
