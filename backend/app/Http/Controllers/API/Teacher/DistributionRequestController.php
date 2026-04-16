<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DistributionRequest;
use App\Models\ToolEquipment;
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

            $requests = DistributionRequest::with(['item', 'reviewedBy'])
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
            $items = ToolEquipment::where('quantity_available', '>', 0)
                ->where('status', 'active')
                ->select('id', 'item_code', 'item_name', 'category', 'quantity_available')
                ->orderBy('item_name')
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
            'item_id' => 'required|exists:tools_equipment,id',
            'quantity_requested' => 'required|integer|min:1',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $teacher = Auth::guard('sanctum')->user();

            // Check if item has enough quantity
            $item = ToolEquipment::findOrFail($request->item_id);
            if ($item->quantity_available < $request->quantity_requested) {
                return response()->json([
                    'success' => false,
                    'message' => "Only {$item->quantity_available} units available"
                ], 400);
            }

            DB::beginTransaction();

            // Create distribution request
            $distributionRequest = DistributionRequest::create([
                'teacher_id' => $teacher->id,
                'item_id' => $request->item_id,
                'quantity_requested' => $request->quantity_requested,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Load relationships for notification
            $distributionRequest->load(['item', 'teacher']);

            // Notify all admins about new distribution request
            NotificationService::notifyDistributionRequestCreated($distributionRequest);

            // Log the action
            SystemLog::create([
                'user_id' => $teacher->id,
                'user_type' => 'teacher',
                'action' => 'create',
                'model' => 'DistributionRequest',
                'model_id' => $distributionRequest->id,
                'description' => "Teacher requested distribution of {$request->quantity_requested} unit(s) of {$item->item_name}",
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution request submitted successfully',
                'data' => $distributionRequest->load(['item', 'teacher'])
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
                'description' => "Teacher cancelled distribution request for {$request->item->item_name}",
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
