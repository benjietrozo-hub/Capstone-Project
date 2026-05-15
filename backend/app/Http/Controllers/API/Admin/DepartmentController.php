<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Get all departments
     */
    public function index(Request $request)
    {
        try {
            $query = Department::with(['headTeacher', 'classrooms']);

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('building', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $departments = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            \Log::error('Department index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_departments' => Department::count(),
                'active_departments' => Department::active()->count(),
                'inactive_departments' => Department::where('is_active', false)->count(),
                'departments_with_head' => Department::whereNotNull('head_teacher_id')->count(),
                'total_classrooms' => DB::table('classrooms')->whereNotNull('department_id')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single department
     */
    public function show($id)
    {
        try {
            $department = Department::with(['headTeacher', 'classrooms', 'distributions'])
                ->withCount(['classrooms', 'distributions'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $department
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new department
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:departments,code',
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'budget_code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $department = Department::create($request->all());

            SystemLog::create([
                'log_type' => 'department',
                'action' => 'created',
                'description' => "Created department: {$department->name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $department->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => $department->load('headTeacher')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a department
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50|unique:departments,code,' . $id,
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'budget_code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $department = Department::findOrFail($id);
            $department->update($request->all());

            SystemLog::create([
                'log_type' => 'department',
                'action' => 'updated',
                'description' => "Updated department: {$department->name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $department->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => $department->load('headTeacher')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a department
     */
    public function destroy($id)
    {
        try {
            $department = Department::findOrFail($id);
            
            // Check if department has classrooms
            if ($department->classrooms()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete department with assigned classrooms. Please reassign or delete classrooms first.'
                ], 422);
            }

            // Check if department has active distributions
            if ($department->distributions()->whereIn('status', ['pending_acceptance', 'assigned'])->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete department with active item assignments. Please recall or transfer items first.'
                ], 422);
            }

            $departmentName = $department->name;
            $department->delete();

            SystemLog::create([
                'log_type' => 'department',
                'action' => 'deleted',
                'description' => "Deleted department: {$departmentName}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department inventory
     */
    public function inventory($id)
    {
        try {
            $department = Department::findOrFail($id);
            
            $inventory = $department->distributions()
                ->with(['inventoryItems', 'distributedBy'])
                ->whereIn('status', ['pending_acceptance', 'assigned'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'department' => $department,
                    'inventory' => $inventory,
                    'total_items' => $inventory->sum('quantity_distributed')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch department inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
