<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\DistributionGroup;
use App\Models\Teacher;
use App\Models\SystemLog;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DistributionListController extends Controller
{
    // Get all teachers with grouping options
    public function index(Request $request)
    {
        try {
            $query = Teacher::query();

            // Fix N+1 issue by using withCount for active borrows
            $query->withCount(['borrowRequests as active_borrows_count' => function($q) {
                $q->whereIn('status', ['approved', 'borrowed']);
            }]);

            // Filters
            if ($request->has('department') && $request->department !== 'all') {
                $query->where('department', $request->department);
            }

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Group filter
            if ($request->has('group_id') && $request->group_id !== 'all') {
                $query->whereHas('distributionGroups', function($q) use ($request) {
                    $q->where('distribution_groups.id', $request->group_id);
                });
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('teacher_id', 'like', "%{$search}%");
                });
            }

            // Support both pagination and full list (for export)
            if ($request->has('all')) {
                $teachers = $query->orderBy('last_name')->get();
                $data = $teachers->map(function($teacher) {
                    return $this->formatTeacherData($teacher);
                });
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            $perPage = $request->get('per_page', 10);
            $teachers = $query->orderBy('last_name')->paginate($perPage);

            // Map paginated items
            $teachers->getCollection()->transform(function($teacher) {
                return $this->formatTeacherData($teacher);
            });

            return response()->json([
                'success' => true,
                'data' => $teachers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distribution list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to format teacher data consistently
     */
    private function formatTeacherData($teacher)
    {
        return [
            'id' => $teacher->id,
            'teacher_id' => $teacher->teacher_id,
            'employee_id' => $teacher->teacher_id, // Map for frontend compatibility
            'full_name' => $teacher->full_name,
            'first_name' => $teacher->first_name,
            'middle_initial' => $teacher->middle_initial,
            'last_name' => $teacher->last_name,
            'email' => $teacher->email,
            'phone' => $teacher->phone,
            'department' => $teacher->department,
            'status' => $teacher->status,
            'last_login' => $teacher->last_login,
            'active_borrows_count' => $teacher->active_borrows_count ?? 0,
        ];
    }

    // Get statistics
    public function statistics()
    {
        try {
            $totalTeachers = Teacher::count();
            $activeTeachers = Teacher::where('status', 'active')->count();
            $inactiveTeachers = Teacher::where('status', 'inactive')->count();
            
            $departmentCounts = Teacher::select('department', DB::raw('count(*) as count'))
                ->whereNotNull('department')
                ->groupBy('department')
                ->get()
                ->pluck('count', 'department');

            // Only get active (non-deleted) groups with manual teacher count
            $groups = DistributionGroup::withCount('teachers')
                ->where('is_active', true)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_teachers' => $totalTeachers,
                    'active_teachers' => $activeTeachers,
                    'inactive_teachers' => $inactiveTeachers,
                    'departments' => $departmentCounts,
                    'groups' => $groups,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Distribution statistics error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get all departments
    public function departments()
    {
        try {
            $departments = Teacher::select('department')
                ->distinct()
                ->whereNotNull('department')
                ->orderBy('department')
                ->pluck('department');

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

    // Get all distribution groups
    public function groups(Request $request)
    {
        try {
            $query = DistributionGroup::withCount('teachers')
                ->where('is_active', true)
                ->orderBy('group_name');

            if ($request->has('all')) {
                return response()->json([
                    'success' => true,
                    'data' => $query->get()
                ]);
            }

            $groups = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            \Log::error('Distribution groups error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Show a specific distribution group
    public function showGroup($id)
    {
        try {
            $group = DistributionGroup::with(['teachers' => function($query) {
                    $query->select('teachers.id', 'teacher_id', 'first_name', 'last_name', 'email', 'department', 'status');
                }])
                ->where('is_active', true)
                ->find($id);

            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => 'Group not found'
                ], 404);
            }

            // Add manual teachers_count to avoid SoftDeletes issues
            $group->teachers_count = $group->teachers->count();

            return response()->json([
                'success' => true,
                'data' => $group
            ]);
        } catch (\Exception $e) {
            \Log::error('Show group error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Create a new distribution group
    public function createGroup(Request $request)
    {
        // Log the incoming request data for debugging
        \Log::info('Create group request data: ' . json_encode($request->all()));
        
        $validator = Validator::make($request->all(), [
            'group_name' => 'required|string|max:255|unique:distribution_groups',
            'group_type' => 'required|in:department,grade_level,role,custom',
            'visibility' => 'required|in:private,shared,public',
            'description' => 'nullable|string',
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:teachers,id',
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

            $group = DistributionGroup::create([
                'group_name' => $request->group_name,
                'group_type' => $request->group_type,
                'list_type' => 'user',
                'visibility' => $request->visibility,
                'description' => $request->description,
                'is_active' => true,
                'created_by' => auth()->id(),
            ]);

            // Log the created group for debugging
            \Log::info('Group created: ' . json_encode($group->toArray()));

            $group->teachers()->attach($request->teacher_ids);

            // Notify teachers about being added to the group
            NotificationService::notifyDistributionGroupCreated($group, $request->teacher_ids);

            // Log the action
            SystemLog::create([
                'admin_id' => auth()->id(),
                'action' => 'create_distribution_group',
                'description' => "Created distribution group: {$group->group_name}",
                'ip_address' => request()->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution group created successfully',
                'data' => $group->load('teachers')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update a distribution group
    public function updateGroup(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'group_name' => 'required|string|max:255|unique:distribution_groups,group_name,' . $id,
            'group_type' => 'required|in:department,grade_level,role,custom',
            'description' => 'nullable|string',
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:teachers,id',
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
            $group = DistributionGroup::findOrFail($id);

            DB::beginTransaction();

            $group->update([
                'group_name' => $request->group_name,
                'group_type' => $request->group_type,
                'description' => $request->description,
                'is_active' => $request->is_active ?? $group->is_active,
            ]);

            // Get current teacher IDs
            $currentTeacherIds = $group->teachers()->pluck('teachers.id')->toArray();
            $newTeacherIds = $request->teacher_ids;
            
            // Calculate added and removed teachers
            $addedTeacherIds = array_diff($newTeacherIds, $currentTeacherIds);
            $removedTeacherIds = array_diff($currentTeacherIds, $newTeacherIds);

            $group->teachers()->sync($request->teacher_ids);

            // Notify teachers about group changes
            if (!empty($addedTeacherIds) || !empty($removedTeacherIds)) {
                NotificationService::notifyDistributionGroupUpdated($group, $addedTeacherIds, $removedTeacherIds);
            }

            // Log the action
            SystemLog::create([
                'admin_id' => auth()->id(),
                'action' => 'update_distribution_group',
                'description' => "Updated distribution group: {$group->group_name}",
                'ip_address' => request()->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution group updated successfully',
                'data' => $group->load('teachers')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete a distribution group
    public function deleteGroup($id)
    {
        try {
            $group = DistributionGroup::findOrFail($id);
            $groupName = $group->group_name;

            // Set deleted_by before soft deleting (admin context)
            $group->deleted_by = auth()->id();
            $group->save();
            $group->delete();

            // Log the action
            SystemLog::create([
                'admin_id' => auth()->id(),
                'action' => 'delete_distribution_group',
                'description' => "Archived distribution group: {$groupName}",
                'ip_address' => request()->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Distribution group archived successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Delete distribution group error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Export distribution list
    public function export(Request $request)
    {
        try {
            $query = Teacher::query();

            // Apply filters
            $templateName = null;
            if ($request->has('group_id')) {
                $group = DistributionGroup::findOrFail($request->group_id);
                $teacherIds = $group->teachers()->pluck('teachers.id');
                $query->whereIn('id', $teacherIds);
                $templateName = $group->group_name; // Get template/group name
            }

            if ($request->has('department') && $request->department !== 'all') {
                $query->where('department', $request->department);
            }

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $teachers = $query->orderBy('last_name')->get();

            $data = $teachers->map(function($teacher) use ($templateName) {
                return [
                    'Employee ID' => $teacher->employee_id,
                    'Full Name' => $teacher->full_name,
                    'Email' => $teacher->email,
                    'Phone' => $teacher->phone ?? 'N/A',
                    'Department' => $teacher->department,
                    'Status' => ucfirst($teacher->status),
                    'Template/Group Used' => $templateName ?? 'Individual Selection',
                    'Last Login' => $teacher->last_login ? $teacher->last_login->format('Y-m-d H:i:s') : 'Never',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'template_info' => [
                    'template_used' => $templateName ?? 'Individual Selection',
                    'export_type' => $templateName ? 'Group Distribution' : 'Individual Distribution'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export distribution list',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
