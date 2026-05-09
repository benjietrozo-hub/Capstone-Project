<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\DistributionRequest;
use App\Models\ItemDistribution;
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
     * Get all distribution requests
     */
    public function index(Request $request)
    {
        try {
            $query = DistributionRequest::with(['teacher', 'item', 'reviewedBy']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            // Add reviewed_by_admin alias for frontend compatibility
            $requests->transform(function ($request) {
                $request->reviewed_by_admin = $request->reviewedBy;
                return $request;
            });

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            \Log::error('DistributionRequest index error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distribution requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for distribution requests
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_requests' => DistributionRequest::count(),
                'pending_requests' => DistributionRequest::pending()->count(),
                'approved_requests' => DistributionRequest::approved()->count(),
                'rejected_requests' => DistributionRequest::rejected()->count(),
                'distributed_requests' => DistributionRequest::distributed()->count(),
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
     * Get a single distribution request
     */
    public function show($id)
    {
        try {
            $request = DistributionRequest::with(['teacher', 'item', 'reviewedBy', 'distribution'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $request
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Distribution request not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'nullable|string',
            'condition_on_distribution' => 'required|in:excellent,good,fair,poor',
            'inventory_item_ids' => 'required|array',
            'inventory_item_ids.*' => 'exists:inventory_items,id'
        ]);

        try {
            $admin = Auth::guard('sanctum')->user();

            $distributionRequest = DistributionRequest::with(['teacher', 'category'])
                ->findOrFail($id);

            if ($distributionRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending requests can be approved'
                ], 400);
            }
            
            if (count($request->inventory_item_ids) !== $distributionRequest->quantity_requested) {
                return response()->json([
                    'success' => false,
                    'message' => "You must select exactly {$distributionRequest->quantity_requested} items to approve this request."
                ], 422);
            }

            // Verify all selected items are actually available
            $items = \App\Models\InventoryItem::whereIn('id', $request->inventory_item_ids)->get();
            
            foreach ($items as $item) {
                if ($item->status !== 'available') {
                    return response()->json([
                        'success' => false,
                        'message' => "Item {$item->serial_number} is currently {$item->status} and cannot be assigned."
                    ], 422);
                }
                if ($item->category_id !== $distributionRequest->category_id) {
                    return response()->json([
                        'success' => false,
                        'message' => "Item {$item->serial_number} does not belong to the requested category."
                    ], 422);
                }
            }

            DB::beginTransaction();

            // Create item distribution
            $distribution = ItemDistribution::create([
                'category_id' => $distributionRequest->category_id,
                'teacher_id' => $distributionRequest->teacher_id,
                'distributed_by' => $admin->id,
                'quantity_distributed' => $distributionRequest->quantity_requested,
                'status' => 'pending_acceptance',
                'distribution_date' => now(),
                'purpose' => $distributionRequest->reason,

                'notes' => $distributionRequest->notes,
                'admin_notes' => $request->admin_notes,
                'condition_on_distribution' => $request->condition_on_distribution,
            ]);

            // Update item statuses to distributed
            \App\Models\InventoryItem::whereIn('id', $request->inventory_item_ids)->update(['status' => 'distributed']);

            
            $syncData = [];
            foreach ($request->inventory_item_ids as $itemId) {
                $syncData[$itemId] = ['status' => 'distributed', 'created_at' => now(), 'updated_at' => now()];
            }
            $distribution->inventoryItems()->attach($syncData);

            // Update distribution request
            $distributionRequest->update([
                'status' => 'distributed',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'admin_notes' => $request->admin_notes,
                'distribution_id' => $distribution->id,
            ]);

            // Notify teacher
            NotificationService::notifyDistributionRequestApproved($distributionRequest);
            
            // Log the action
            SystemLog::create([
                'user_id' => $admin->id,
                'user_type' => 'admin',
                'action' => 'approve',
                'model' => 'DistributionRequest',
                'model_id' => $id,
                'description' => "Admin approved and distributed {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->category->category_name} to {$distributionRequest->teacher->first_name} {$distributionRequest->teacher->last_name}",
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution request approved and items distributed successfully',
                'data' => $distributionRequest->load(['reviewedBy', 'distribution.inventoryItems'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve distribution request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a distribution request
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'required|string',
        ]);

        try {
            $admin = Auth::guard('sanctum')->user();

            $distributionRequest = DistributionRequest::with(['teacher', 'item'])
                ->findOrFail($id);

            if ($distributionRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending requests can be rejected'
                ], 400);
            }

            DB::beginTransaction();

            // Update distribution request
            $distributionRequest->update([
                'status' => 'rejected',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'admin_notes' => $request->admin_notes,
            ]);

            // Notify teacher
            NotificationService::notifyDistributionRequestRejected($distributionRequest);

            // Log the action
            SystemLog::create([
                'user_id' => $admin->id,
                'user_type' => 'admin',
                'action' => 'reject',
                'model' => 'DistributionRequest',
                'model_id' => $id,
                'description' => "Admin rejected distribution request for {$distributionRequest->quantity_requested} unit(s) of {$distributionRequest->item->item_name} from {$distributionRequest->teacher->first_name} {$distributionRequest->teacher->last_name}",
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution request rejected successfully',
                'data' => $distributionRequest->load('reviewedBy')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject distribution request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
