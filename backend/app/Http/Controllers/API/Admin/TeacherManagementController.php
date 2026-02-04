<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherManagementController extends Controller
{
    public function index(Request $request)
    {
        $q = Teacher::query();
        if ($request->search) {
            $s = $request->search;
            $q->where(fn($q) => $q->where('first_name', 'like', "%{$s}%")
                                  ->orWhere('last_name', 'like', "%{$s}%")
                                  ->orWhere('email', 'like', "%{$s}%")
                                  ->orWhere('employee_id', 'like', "%{$s}%"));
        }
        if ($request->status) $q->where('status', $request->status);
        if ($request->department) $q->where('department', $request->department);
        return response()->json($q->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'employee_id' => 'required|unique:teachers,employee_id,NULL,id,deleted_at,NULL', 
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
        return response()->json(Teacher::create($v), 201);
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
        return response()->json($t);
    }

    public function destroy(string $id)
    {
        Teacher::findOrFail($id)->delete();
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
