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
        $admin = Admin::create($v);
        
        // Log activity
        $this->logActivity(
            'admin_created',
            "Created new admin account: {$admin->first_name} {$admin->last_name} ({$admin->username})",
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
}
