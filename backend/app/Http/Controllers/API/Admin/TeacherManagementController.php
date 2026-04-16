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
            'phone' => 'nullable'
        ]);
        $v['password'] = Hash::make($v['password']);
        $v['status'] = 'active';
        $teacher = Teacher::create($v);
        
        // Log activity
        $this->logActivity(
            'teacher_created',
            "Created new teacher account: {$teacher->first_name} {$teacher->last_name} ({$teacher->teacher_id})",
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
            'password' => 'nullable|min:8'
        ]);
        if (isset($v['password'])) $v['password'] = Hash::make($v['password']);
        $t->update($v);
        
        // Log activity
        $this->logActivity(
            'teacher_updated',
            "Updated teacher account: {$t->first_name} {$t->last_name} ({$t->teacher_id})",
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
            'teacher_deleted',
            "Deleted teacher account: {$teacherName} ({$teacherId})",
            'warning'
        );
        
        return response()->json(null, 204);
    }

    public function departments()
    {
        $departments = Teacher::whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->pluck('department');
        return response()->json($departments);
    }
}
