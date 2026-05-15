<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Department;
use App\Models\Classroom;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EntityController extends Controller
{
    /**
     * Get all entities managed by the authenticated teacher
     */
    public function myEntities()
    {
        try {
            $teacher = Auth::user();

            $entities = [
                'personal' => [
                    'type' => 'Teacher',
                    'id' => $teacher->id,
                    'name' => $teacher->full_name,
                    'can_request' => true,
                    'current_items' => $teacher->distributions()
                        ->whereIn('status', ['pending_acceptance', 'assigned'])
                        ->count()
                ],
                'departments' => $teacher->headedDepartments()
                    ->active()
                    ->withCount(['distributions' => function($query) {
                        $query->whereIn('status', ['pending_acceptance', 'assigned']);
                    }])
                    ->get()
                    ->map(function($dept) {
                        return [
                            'type' => 'Department',
                            'id' => $dept->id,
                            'name' => $dept->full_name,
                            'code' => $dept->code,
                            'can_request' => true,
                            'current_items' => $dept->distributions_count
                        ];
                    }),
                'classrooms' => $teacher->assignedClassrooms()
                    ->active()
                    ->withCount(['distributions' => function($query) {
                        $query->whereIn('status', ['pending_acceptance', 'assigned']);
                    }])
                    ->get()
                    ->map(function($classroom) {
                        return [
                            'type' => 'Classroom',
                            'id' => $classroom->id,
                            'name' => $classroom->full_name,
                            'room_number' => $classroom->room_number,
                            'building' => $classroom->building,
                            'can_request' => true,
                            'current_items' => $classroom->distributions_count
                        ];
                    }),
                'clubs' => $teacher->advisedClubs()
                    ->active()
                    ->withCount(['distributions' => function($query) {
                        $query->whereIn('status', ['pending_acceptance', 'assigned']);
                    }])
                    ->get()
                    ->map(function($club) {
                        return [
                            'type' => 'Club',
                            'id' => $club->id,
                            'name' => $club->full_name,
                            'code' => $club->code,
                            'category' => $club->category,
                            'can_request' => true,
                            'current_items' => $club->distributions_count
                        ];
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $entities
            ]);
        } catch (\Exception $e) {
            \Log::error('My entities error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch entities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory for a specific classroom
     */
    public function classroomInventory($id)
    {
        try {
            $teacher = Auth::user();
            $classroom = Classroom::findOrFail($id);

            // Check permission
            if ($classroom->assigned_teacher_id !== $teacher->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this classroom inventory'
                ], 403);
            }

            $inventory = $classroom->distributions()
                ->with(['inventoryItems.category', 'distributedBy'])
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

    /**
     * Get inventory for a specific club
     */
    public function clubInventory($id)
    {
        try {
            $teacher = Auth::user();
            $club = Club::findOrFail($id);

            // Check permission
            if ($club->advisor_teacher_id !== $teacher->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this club inventory'
                ], 403);
            }

            $inventory = $club->distributions()
                ->with(['inventoryItems.category', 'distributedBy'])
                ->whereIn('status', ['pending_acceptance', 'assigned'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'club' => $club,
                    'inventory' => $inventory,
                    'total_items' => $inventory->sum('quantity_distributed')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch club inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory for a specific department
     */
    public function departmentInventory($id)
    {
        try {
            $teacher = Auth::user();
            $department = Department::findOrFail($id);

            // Check permission
            if ($department->head_teacher_id !== $teacher->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this department inventory'
                ], 403);
            }

            $inventory = $department->distributions()
                ->with(['inventoryItems.category', 'distributedBy'])
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

    /**
     * Get all classrooms assigned to teacher
     */
    public function myClassrooms()
    {
        try {
            $teacher = Auth::user();
            $classrooms = $teacher->assignedClassrooms()
                ->active()
                ->with('department')
                ->withCount(['distributions' => function($query) {
                    $query->whereIn('status', ['pending_acceptance', 'assigned']);
                }])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $classrooms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classrooms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all clubs advised by teacher
     */
    public function myClubs()
    {
        try {
            $teacher = Auth::user();
            $clubs = $teacher->advisedClubs()
                ->active()
                ->withCount(['distributions' => function($query) {
                    $query->whereIn('status', ['pending_acceptance', 'assigned']);
                }])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $clubs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch clubs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all departments headed by teacher
     */
    public function myDepartments()
    {
        try {
            $teacher = Auth::user();
            $departments = $teacher->headedDepartments()
                ->active()
                ->withCount(['distributions' => function($query) {
                    $query->whereIn('status', ['pending_acceptance', 'assigned']);
                }, 'classrooms'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
