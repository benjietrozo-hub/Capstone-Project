<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DistributionGroup;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DistributionGroupController extends Controller
{
    /**
     * Get all distribution groups (with visibility filtering)
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $teacherId = $user instanceof Teacher ? $user->id : null;

            $query = DistributionGroup::active()->visible($teacherId);

            // Filter by type
            if ($request->has('type')) {
                $query->byType($request->type);
            }

            // Filter by list_type
            if ($request->has('list_type')) {
                if ($request->list_type === 'system') {
                    $query->system();
                } elseif ($request->list_type === 'user') {
                    $query->userCreated();
                } elseif ($request->list_type === 'mine') {
                    $query->where('created_by', $teacherId);
                }
            }

            // Filter by department
            if ($request->has('department')) {
                $query->byDepartment($request->department);
            }

            $groups = $query->orderBy('list_type', 'asc')
                           ->orderBy('group_name', 'asc')
                           ->withCount('teachers')
                           ->with(['creator' => function($q) {
                               $q->select('id', 'first_name', 'last_name', 'email');
                           }])
                           ->paginate($request->get('per_page', 10));

            // Get counts for summary/tabs (ignoring pagination and current filters)
            $baseQuery = DistributionGroup::active()->visible($teacherId);
            $summary = [
                'total' => (clone $baseQuery)->count(),
                'system' => (clone $baseQuery)->system()->count(),
                'user' => (clone $baseQuery)->userCreated()->count(),
                'mine' => $teacherId ? DistributionGroup::active()->where('created_by', $teacherId)->count() : 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $groups,
                'summary' => $summary
            ]);

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distribution groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific distribution group
     */
    public function show($id)
    {
        try {
            $group = DistributionGroup::with(['teachers', 'creator'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Distribution group not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new distribution group (teacher-created)
     */
    public function store(Request $request)
    {
        try {
            \Log::info('DistributionGroup store method called');
            \Log::info('Request input: ' . json_encode($request->all()));
            
            $validator = Validator::make($request->all(), [
                'group_name' => 'required|string|max:255',
                'group_type' => 'required|string|in:department,role,custom',
                'description' => 'nullable|string',
                'visibility' => 'required|string|in:private,shared',
                'department' => 'nullable|string|max:255',
                'teacher_ids' => 'nullable|array',
                'teacher_ids.*' => 'exists:teachers,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $userClass = $user ? get_class($user) : null;
            $teacherId = null;

            if ($user instanceof Teacher || $userClass === 'App\\Models\\Teacher') {
                $teacherId = $user->id;
            } elseif ($user instanceof \App\Models\Admin || $userClass === 'App\\Models\\Admin') {
                $linkedTeacher = Teacher::where('email', $user->email)->first();
                $teacherId = $linkedTeacher ? $linkedTeacher->id : null;
            }

            // Guard: cannot create a group without a resolvable teacher identity
            if (!$teacherId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to identify the creator. Your account must be linked to a teacher profile.',
                    'debug_class' => $userClass,
                    'debug_user_id' => $user->id ?? null,
                ], 403);
            }

            $group = DistributionGroup::create([
                'group_name' => $request->group_name,
                'group_type' => $request->group_type,
                'list_type' => 'user', // User-created lists
                'visibility' => $request->visibility,
                'created_by' => $teacherId,
                'department' => $request->department,
                'description' => $request->description,
                'is_active' => true,
            ]);

            // Attach teachers if provided
            if ($request->has('teacher_ids') && is_array($request->teacher_ids) && count($request->teacher_ids) > 0) {
                $group->teachers()->attach($request->teacher_ids);
            }

            $group->load(['teachers', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Distribution group created successfully',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating distribution group: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            \Log::error('Request data: ' . json_encode($request->all()));
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a distribution group
     */
    public function update(Request $request, $id)
    {
        try {
            $group = DistributionGroup::findOrFail($id);

            // Prevent updating system groups
            if ($group->list_type === 'system') {
                return response()->json([
                    'success' => false,
                    'message' => 'System distribution groups cannot be modified'
                ], 403);
            }

            // Check permission: Admin can edit anything, Teachers can only edit their own
            $user = $request->user();
            $isAdmin = $user instanceof \App\Models\Admin;
            $teacherId = null;

            if ($user instanceof Teacher) {
                $teacherId = $user->id;
            } elseif ($isAdmin) {
                // Try to find the corresponding teacher record for this admin
                $teacher = Teacher::where('email', $user->email)->first();
                $teacherId = $teacher ? $teacher->id : null;
            }
            
            // Ownership check
            if (!$isAdmin) {
                if ($group->created_by !== $teacherId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to update this group'
                    ], 403);
                }
            }

            $validator = Validator::make($request->all(), [
                'group_name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'visibility' => 'sometimes|required|string|in:private,shared',
                'is_active' => 'sometimes|boolean',
                'teacher_ids' => 'sometimes|nullable|array',
                'teacher_ids.*' => 'exists:teachers,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $group->update($request->only([
                'group_name',
                'description',
                'visibility',
                'is_active'
            ]));

            // Update teachers if provided
            if ($request->has('teacher_ids')) {
                $group->teachers()->sync($request->teacher_ids);
            }

            $group->load(['teachers', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Distribution group updated successfully',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a distribution group
     */
    public function destroy(Request $request, $id)
    {
        try {
            $group = DistributionGroup::findOrFail($id);

            // Prevent deleting system groups
            if ($group->list_type === 'system') {
                return response()->json([
                    'success' => false,
                    'message' => 'System distribution groups cannot be deleted'
                ], 403);
            }

            // Check permission
            $user = $request->user();
            $isAdmin = $user instanceof \App\Models\Admin;
            $teacherId = null;

            if ($user instanceof Teacher) {
                $teacherId = $user->id;
            } elseif ($isAdmin) {
                $teacher = Teacher::where('email', $user->email)->first();
                $teacherId = $teacher ? $teacher->id : null;
            }
            
            if (!$isAdmin) {
                if ($group->created_by !== $teacherId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to delete this group'
                    ], 403);
                }
            }

            // Set deleted_by before soft deleting
            $group->deleted_by = $teacherId;
            $group->save();
            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'Distribution group archived successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add teachers to a distribution group
     */
    public function addTeachers(Request $request, $id)
    {
        try {
            $group = DistributionGroup::findOrFail($id);

            $validator = Validator::make($request->all(), [
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

            // Check permission: Admin can edit anything, Teachers can only edit their own
            $user = $request->user();
            $isAdmin = $user instanceof \App\Models\Admin;
            
            if (!$isAdmin) {
                $teacherId = $user instanceof Teacher ? $user->id : null;
                if ($group->created_by !== $teacherId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to modify this group'
                    ], 403);
                }
            }


            $group->teachers()->syncWithoutDetaching($request->teacher_ids);
            $group->load(['teachers', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Teachers added to distribution group successfully',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add teachers to distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove teachers from a distribution group
     */
    public function removeTeachers(Request $request, $id)
    {
        try {
            $group = DistributionGroup::findOrFail($id);

            $validator = Validator::make($request->all(), [
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

            // Check permission: Admin can edit anything, Teachers can only edit their own
            $user = $request->user();
            $isAdmin = $user instanceof \App\Models\Admin;
            
            if (!$isAdmin) {
                $teacherId = $user instanceof Teacher ? $user->id : null;
                if ($group->created_by !== $teacherId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to modify this group'
                    ], 403);
                }
            }


            $group->teachers()->detach($request->teacher_ids);
            $group->load(['teachers', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Teachers removed from distribution group successfully',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove teachers from distribution group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get groups that a specific teacher belongs to
     */
    public function teacherGroups(Request $request, $teacherId = null)
    {
        try {
            // If no teacherId provided, use authenticated user
            if (!$teacherId) {
                $user = $request->user();
                $teacherId = $user instanceof Teacher ? $user->id : null;
            }

            if (!$teacherId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher ID is required'
                ], 400);
            }

            $teacher = Teacher::findOrFail($teacherId);
            $groups = $teacher->distributionGroups()
                             ->active()
                             ->withCount('teachers')
                             ->with(['creator' => function($q) {
                                 $q->select('id', 'first_name', 'last_name', 'email');
                             }])
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teacher groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
