<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClassroomController extends Controller
{
    /**
     * Get all classrooms
     */
    public function index(Request $request)
    {
        try {
            $query = Classroom::with(['assignedTeacher', 'department']);

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Filter by department
            if ($request->has('department_id')) {
                $query->byDepartment($request->department_id);
            }

            // Filter by teacher
            if ($request->has('teacher_id')) {
                $query->byTeacher($request->teacher_id);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('room_number', 'like', "%{$search}%")
                      ->orWhere('building', 'like', "%{$search}%")
                      ->orWhere('room_type', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'room_number');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $classrooms = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $classrooms
            ]);
        } catch (\Exception $e) {
            \Log::error('Classroom index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classrooms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get classroom statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_classrooms' => Classroom::count(),
                'active_classrooms' => Classroom::active()->count(),
                'inactive_classrooms' => Classroom::where('is_active', false)->count(),
                'assigned_classrooms' => Classroom::whereNotNull('assigned_teacher_id')->count(),
                'unassigned_classrooms' => Classroom::whereNull('assigned_teacher_id')->count(),
                'by_type' => Classroom::select('room_type', DB::raw('count(*) as count'))
                    ->whereNotNull('room_type')
                    ->groupBy('room_type')
                    ->get()
                    ->pluck('count', 'room_type'),
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
     * Get a single classroom
     */
    public function show($id)
    {
        try {
            $classroom = Classroom::with(['assignedTeacher', 'department', 'distributions'])
                ->withCount('distributions')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $classroom
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Classroom not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new classroom
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_number' => 'required|string|max:50',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'room_type' => 'nullable|string|max:100',
            'assigned_teacher_id' => 'nullable|exists:teachers,id',
            'department_id' => 'nullable|exists:departments,id',
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

            $classroom = Classroom::create($request->all());

            SystemLog::create([
                'log_type' => 'classroom',
                'action' => 'created',
                'description' => "Created classroom: {$classroom->room_number}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $classroom->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Classroom created successfully',
                'data' => $classroom->load(['assignedTeacher', 'department'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create classroom',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a classroom
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'room_number' => 'sometimes|required|string|max:50',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'room_type' => 'nullable|string|max:100',
            'assigned_teacher_id' => 'nullable|exists:teachers,id',
            'department_id' => 'nullable|exists:departments,id',
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
            $classroom = Classroom::findOrFail($id);
            $classroom->update($request->all());

            SystemLog::create([
                'log_type' => 'classroom',
                'action' => 'updated',
                'description' => "Updated classroom: {$classroom->room_number}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $classroom->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Classroom updated successfully',
                'data' => $classroom->load(['assignedTeacher', 'department'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update classroom',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a classroom
     */
    public function destroy($id)
    {
        try {
            $classroom = Classroom::findOrFail($id);
            
            // Check if classroom has active distributions
            if ($classroom->distributions()->whereIn('status', ['pending_acceptance', 'assigned'])->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete classroom with active item assignments. Please recall or transfer items first.'
                ], 422);
            }

            $classroomName = $classroom->room_number;
            $classroom->delete();

            SystemLog::create([
                'log_type' => 'classroom',
                'action' => 'deleted',
                'description' => "Deleted classroom: {$classroomName}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Classroom deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete classroom',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get classroom inventory
     */
    public function inventory($id)
    {
        try {
            $classroom = Classroom::findOrFail($id);
            
            $inventory = $classroom->distributions()
                ->with(['inventoryItems', 'distributedBy'])
                ->whereIn('status', ['pending_acceptance', 'assigned'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'classroom' => $classroom,
                    'inventory' => $inventory,
                    'total_items' => $inventory->sum('quantity_distributed')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classroom inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
