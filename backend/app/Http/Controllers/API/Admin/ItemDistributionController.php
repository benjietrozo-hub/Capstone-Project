<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemDistribution;
use App\Models\ToolEquipment;
use App\Models\Teacher;
use App\Models\SystemLog;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItemDistributionController extends Controller
{
    /**
     * Get all item distributions
     */
    public function index(Request $request)
    {
        try {
            $query = ItemDistribution::with(['item', 'teacher', 'distributedBy']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by teacher
            if ($request->has('teacher_id')) {
                $query->where('teacher_id', $request->teacher_id);
            }

            // Filter by item
            if ($request->has('item_id')) {
                $query->where('item_id', $request->item_id);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('item', function($itemQuery) use ($search) {
                        $itemQuery->where('item_name', 'like', "%{$search}%")
                                 ->orWhere('item_code', 'like', "%{$search}%");
                    })->orWhereHas('teacher', function($teacherQuery) use ($search) {
                        $teacherQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%");
                    });
                });
            }

            $distributions = $query->orderBy('distribution_date', 'desc')
                                  ->paginate(15);

            // Add distributed_by_admin alias for frontend compatibility
            $distributions->getCollection()->transform(function ($distribution) {
                $distribution->distributed_by_admin = $distribution->distributedBy;
                return $distribution;
            });

            return response()->json([
                'success' => true,
                'data' => $distributions
            ]);
        } catch (\Exception $e) {
            \Log::error('ItemDistribution index error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get distribution statistics
     */
    public function statistics()
    {
        try {
            $totalDistributions = ItemDistribution::count();
            $activeDistributions = ItemDistribution::active()->count();
            $returnedDistributions = ItemDistribution::returned()->count();
            $overdueDistributions = ItemDistribution::overdue()->count();

            $totalQuantityDistributed = ItemDistribution::active()->sum('quantity_distributed');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_distributions' => $totalDistributions,
                    'active_distributions' => $activeDistributions,
                    'returned_distributions' => $returnedDistributions,
                    'overdue_distributions' => $overdueDistributions,
                    'total_quantity_distributed' => $totalQuantityDistributed,
                ]
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
     * Create a new distribution
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_id' => 'required|exists:tools_equipment,id',
            'teacher_id' => 'required|exists:teachers,id',
            'quantity_distributed' => 'required|integer|min:1',
            'distribution_date' => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:distribution_date',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
            'condition_on_distribution' => 'required|in:excellent,good,fair,poor',
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

            // Check if item has enough quantity
            $item = ToolEquipment::findOrFail($request->item_id);
            if ($item->quantity_available < $request->quantity_distributed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient quantity available. Available: ' . $item->quantity_available
                ], 422);
            }

            // Create distribution
            $distribution = ItemDistribution::create([
                'item_id' => $request->item_id,
                'teacher_id' => $request->teacher_id,
                'distributed_by' => auth()->id(),
                'quantity_distributed' => $request->quantity_distributed,
                'status' => 'active',
                'distribution_date' => $request->distribution_date,
                'expected_return_date' => $request->expected_return_date,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'condition_on_distribution' => $request->condition_on_distribution,
            ]);

            // Update item quantities
            $item->quantity_available -= $request->quantity_distributed;
            $item->save();

            // Load relationships for notification
            $distribution->load(['item', 'teacher']);

            // Notify teacher about distribution
            NotificationService::notifyItemDistributed($distribution);

            // Broadcast inventory update
            NotificationService::broadcastInventoryUpdate($item);

            // Log the action
            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'created',
                'description' => "Distributed {$request->quantity_distributed} units of {$item->item_name} to teacher",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item distributed successfully',
                'data' => $distribution->load(['item', 'teacher', 'distributedBy'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific distribution
     */
    public function show($id)
    {
        try {
            $distribution = ItemDistribution::with(['item', 'teacher', 'distributedBy'])
                                           ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $distribution
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Distribution not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a distribution
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'expected_return_date' => 'nullable|date',
            'admin_notes' => 'nullable|string',
            'status' => 'sometimes|in:active,returned,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $distribution = ItemDistribution::findOrFail($id);

            $distribution->update($request->only([
                'expected_return_date',
                'admin_notes',
                'status'
            ]));

            // Log the action
            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'updated',
                'description' => "Updated distribution #{$distribution->id}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Distribution updated successfully',
                'data' => $distribution->load(['item', 'teacher', 'distributedBy'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark distribution as returned
     */
    public function markAsReturned(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'actual_return_date' => 'required|date',
            'condition_on_return' => 'required|in:excellent,good,fair,poor',
            'admin_notes' => 'nullable|string',
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

            $distribution = ItemDistribution::findOrFail($id);

            if ($distribution->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Distribution is not active'
                ], 422);
            }

            // Update distribution
            $distribution->update([
                'status' => 'returned',
                'actual_return_date' => $request->actual_return_date,
                'condition_on_return' => $request->condition_on_return,
                'admin_notes' => $request->admin_notes,
            ]);

            // Return quantity to inventory
            $item = $distribution->item;
            $item->quantity_available += $distribution->quantity_distributed;
            $item->save();

            // Load relationships for notification
            $distribution->load(['item', 'teacher']);

            // Notify teacher about return confirmation
            NotificationService::notifyDistributionReturned($distribution);

            // Broadcast inventory update
            NotificationService::broadcastInventoryUpdate($item);

            // Log the action
            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'returned',
                'description' => "Returned {$distribution->quantity_distributed} units of {$item->item_name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution marked as returned successfully',
                'data' => $distribution->load(['item', 'teacher', 'distributedBy'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as returned',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a distribution
     */
    public function cancel(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $distribution = ItemDistribution::findOrFail($id);

            if ($distribution->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Distribution is not active'
                ], 422);
            }

            // Update distribution
            $distribution->update([
                'status' => 'cancelled',
                'admin_notes' => $request->admin_notes ?? 'Cancelled by admin',
            ]);

            // Return quantity to inventory
            $item = $distribution->item;
            $item->quantity_available += $distribution->quantity_distributed;
            $item->save();

            // Log the action
            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'cancelled',
                'description' => "Cancelled distribution of {$distribution->quantity_distributed} units of {$item->item_name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution cancelled successfully',
                'data' => $distribution->load(['item', 'teacher', 'distributedBy'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a distribution
     */
    public function destroy($id)
    {
        try {
            $distribution = ItemDistribution::findOrFail($id);

            if ($distribution->status === 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete active distribution. Please cancel it first.'
                ], 422);
            }

            $distribution->delete();

            return response()->json([
                'success' => true,
                'message' => 'Distribution deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
