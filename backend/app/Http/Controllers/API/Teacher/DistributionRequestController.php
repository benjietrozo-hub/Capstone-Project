<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DistributionRequest;
use App\Models\ItemCategory;
use App\Models\Notification;
use App\Models\SystemLog;
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

            $requests = DistributionRequest::with(['category', 'reviewedBy'])
                ->where('teacher_id', $teacher->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
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
            $items = ItemCategory::where('available_items', '>', 0)
                ->select('id', 'category_name', 'description', 'available_items')
                ->orderBy('category_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
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
            'category_id' => 'required|exists:item_categories,id',
            'quantity_requested' => 'required|integer|min:1',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $teacher = Auth::guard('sanctum')->user();

            // Check if item has enough quantity
            $category = ItemCategory::findOrFail($request->category_id);
            if ($category->available_items < $request->quantity_requested) {
                return response()->json([
                    'success' => false,
                    'message' => "Only {$category->available_items} units available"
                ], 400);
            }

            DB::beginTransaction();

            // Create distribution request
            $distributionRequest = DistributionRequest::create([
                'teacher_id' => $teacher->id,
                'category_id' => $request->category_id,
                'quantity_requested' => $request->quantity_requested,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Load relationships for notification
            $distributionRequest->load(['category', 'teacher']);

            // Notify all admins about new distribution request
            NotificationService::notifyDistributionRequestCreated($distributionRequest);

            // Log the action
            SystemLog::create([
                'user_id' => $teacher->id,
                'user_type' => 'teacher',
                'action' => 'create',
                'model' => 'DistributionRequest',
                'model_id' => $distributionRequest->id,
                'description' => "Teacher requested distribution of {$request->quantity_requested} unit(s) of {$category->category_name}",
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution request submitted successfully',
                'data' => $distributionRequest->load(['category', 'teacher'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create distribution request',
                'error' => $e->getMessage()
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
                'total_requests' => DistributionRequest::where('teacher_id', $teacher->id)->count(),
                'pending_requests' => DistributionRequest::where('teacher_id', $teacher->id)->pending()->count(),
                'approved_requests' => DistributionRequest::where('teacher_id', $teacher->id)->approved()->count(),
                'rejected_requests' => DistributionRequest::where('teacher_id', $teacher->id)->rejected()->count(),
                'distributed_requests' => DistributionRequest::where('teacher_id', $teacher->id)->distributed()->count(),
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
     * Cancel a pending distribution request
     */
    public function cancel($id)
    {
        try {
            $teacher = Auth::guard('sanctum')->user();

            $request = DistributionRequest::where('teacher_id', $teacher->id)
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
                'user_id' => $teacher->id,
                'user_type' => 'teacher',
                'action' => 'delete',
                'model' => 'DistributionRequest',
                'model_id' => $id,
                'description' => "Teacher cancelled distribution request for category ID {$request->category_id}",
                'ip_address' => request()->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Distribution request cancelled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel distribution request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
