<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DistributionRequest;
use App\Models\ItemCategory;
use App\Models\Notification;
use App\Models\SystemLog;
use App\Models\Classroom;
use App\Models\Club;
use App\Models\Department;
use App\Models\DistributionGroup;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DistributionRequestController extends Controller
{
    /**
     * Get all distribution requests for the authenticated teacher
     */
    public function index()
    {
        try {
            $teacher = Auth::guard('sanctum')->user();

            // Get requests where teacher is the requester (requested_by)
            // This includes requests for self and for entities they manage
            $requests = DistributionRequest::with(['category', 'reviewedBy', 'requestedFor'])
                ->where('requested_by', $teacher->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($request) {
                    // Add entity name for display
                    $entityName = 'Unknown';
                    if ($request->requestedFor) {
                        if ($request->requested_for_type === 'App\\Models\\Teacher') {
                            $entityName = $request->requestedFor->full_name . ' (Personal)';
                        } elseif ($request->requested_for_type === 'App\\Models\\Classroom') {
                            $entityName = $request->requestedFor->full_name;
                        } elseif ($request->requested_for_type === 'App\\Models\\Club') {
                            $entityName = $request->requestedFor->full_name;
                        } elseif ($request->requested_for_type === 'App\\Models\\Department') {
                            $entityName = $request->requestedFor->full_name;
                        }
                    }
                    
                    $request->requested_for_name = $entityName;
                    return $request;
                });

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            \Log::error('Distribution requests index error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distribution requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available items for distribution request
     */
    public function availableItems()
    {
        try {
            // Get all categories and filter those with available items
            $categories = ItemCategory::with('inventoryItems')
                ->get()
                ->filter(function($category) {
                    return $category->available_items > 0;
                })
                ->map(function($category) {
                    return [
                        'id' => $category->id,
                        'category_name' => $category->category_name,
                        'description' => $category->description,
                        'available_items' => $category->available_items,
                        'total_items' => $category->total_items,
                    ];
                })
                ->values()
                ->sortBy('category_name')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            \Log::error('Available items error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new distribution request
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id'          => 'required|exists:item_categories,id',
            'quantity_requested'   => 'required|integer|min:1',
            'reason'               => 'required|string',
            'notes'                => 'nullable|string',
            'priority'             => 'nullable|in:low,normal,high,urgent',
            // Entity selection (optional — defaults to self)
            'requested_for_type'   => 'nullable|in:Teacher,Classroom,Club,Department,DistributionGroup',
            'requested_for_id'     => 'nullable|integer',
        ]);

        try {
            $teacher = Auth::guard('sanctum')->user();

            // --- Resolve the target entity ---
            $requestedForType = $request->requested_for_type ?? 'Teacher';
            $requestedForId   = $request->requested_for_id   ?? $teacher->id;
            $entityModelMap   = [
                'Teacher'           => 'App\\Models\\Teacher',
                'Classroom'         => 'App\\Models\\Classroom',
                'Club'              => 'App\\Models\\Club',
                'Department'        => 'App\\Models\\Department',
                'DistributionGroup' => 'App\\Models\\DistributionGroup',
            ];
            $morphType = $entityModelMap[$requestedForType];

            // --- Permission check ---
            if ($requestedForType === 'Classroom') {
                $classroom = Classroom::findOrFail($requestedForId);
                if ($classroom->assigned_teacher_id !== $teacher->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not the assigned teacher for this classroom.'
                    ], 403);
                }
            } elseif ($requestedForType === 'Club') {
                $club = Club::findOrFail($requestedForId);
                if ($club->advisor_teacher_id !== $teacher->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not the advisor for this club.'
                    ], 403);
                }
            } elseif ($requestedForType === 'Department') {
                $department = Department::findOrFail($requestedForId);
                if ($department->head_teacher_id !== $teacher->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not the head of this department.'
                    ], 403);
                }
            } elseif ($requestedForType === 'DistributionGroup') {
                $group = DistributionGroup::findOrFail($requestedForId);
                $isMember = $group->teachers()->where('teachers.id', $teacher->id)->exists();
                $isCreator = (int) $group->created_by === $teacher->id;
                if (!$isMember && !$isCreator) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not a member or creator of this distribution group.'
                    ], 403);
                }
            } elseif ($requestedForType === 'Teacher') {
                if ((int)$requestedForId !== $teacher->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only request for yourself.'
                    ], 403);
                }
            }

            // --- Check available stock ---
            $category = ItemCategory::findOrFail($request->category_id);
            if ($category->available_items < $request->quantity_requested) {
                return response()->json([
                    'success' => false,
                    'message' => "Only {$category->available_items} unit(s) available for this category."
                ], 400);
            }

            DB::beginTransaction();

            $distributionRequest = DistributionRequest::create([
                'teacher_id'          => $teacher->id,
                'category_id'         => $request->category_id,
                'quantity_requested'  => $request->quantity_requested,
                'reason'              => $request->reason,
                'notes'               => $request->notes,
                'status'              => 'pending',
                'requested_for_type'  => $morphType,
                'requested_for_id'    => $requestedForId,
                'requested_by'        => $teacher->id,
                'priority'            => $request->priority ?? 'normal',
            ]);

            $distributionRequest->load(['category', 'teacher']);

            NotificationService::notifyDistributionRequestCreated($distributionRequest);

            SystemLog::create([
                'log_type'    => 'distribution_request',
                'user_id'     => $teacher->id,
                'user_type'   => 'teacher',
                'action'      => 'create',
                'description' => "Teacher requested {$request->quantity_requested} unit(s) of {$category->category_name} for {$requestedForType} #{$requestedForId}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution request submitted successfully',
                'data'    => $distributionRequest->load(['category', 'teacher'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Distribution request store error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create distribution request',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for teacher's distribution requests
     */
    public function statistics()
    {
        try {
            $teacher = Auth::guard('sanctum')->user();

            $stats = [
                'total_requests' => DistributionRequest::where('requested_by', $teacher->id)->count(),
                'pending_requests' => DistributionRequest::where('requested_by', $teacher->id)->pending()->count(),
                'approved_requests' => DistributionRequest::where('requested_by', $teacher->id)->approved()->count(),
                'rejected_requests' => DistributionRequest::where('requested_by', $teacher->id)->rejected()->count(),
                'distributed_requests' => DistributionRequest::where('requested_by', $teacher->id)->distributed()->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('Distribution request statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a pending distribution request
     */
    public function cancel($id)
    {
        try {
            $teacher = Auth::guard('sanctum')->user();

            $request = DistributionRequest::where('requested_by', $teacher->id)
                ->where('id', $id)
                ->firstOrFail();

            if ($request->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending requests can be cancelled'
                ], 400);
            }

            $request->delete();

            // Log the action
            SystemLog::create([
                'log_type' => 'distribution_request',
                'user_id' => $teacher->id,
                'user_type' => 'teacher',
                'action' => 'delete',
                'description' => "Teacher cancelled distribution request for category ID {$request->category_id}",
                'ip_address' => request()->ip(),
                'severity' => 'info',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Distribution request cancelled successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Cancel distribution request error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel distribution request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
