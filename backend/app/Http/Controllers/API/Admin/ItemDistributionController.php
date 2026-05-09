<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemDistribution;
use App\Models\InventoryItem;
use App\Models\SystemLog;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItemDistributionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = ItemDistribution::with(['category', 'teacher', 'distributedBy', 'inventoryItems']);

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('teacher_id')) {
                $query->where('teacher_id', $request->teacher_id);
            }

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('category', function($catQuery) use ($search) {
                        $catQuery->where('category_name', 'like', "%{$search}%");
                    })->orWhereHas('teacher', function($teacherQuery) use ($search) {
                        $teacherQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%");
                    });
                });
            }

            $distributions = $query->orderBy('distribution_date', 'desc')->paginate(15);

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statistics()
    {
        try {
            $totalDistributions = ItemDistribution::count();
            $activeDistributions = ItemDistribution::where('status', 'active')->count();
            $returnedDistributions = ItemDistribution::where('status', 'returned')->count();
            $overdueDistributions = ItemDistribution::where('status', 'active')->where('expected_return_date', '<', now())->count();
            $totalQuantityDistributed = ItemDistribution::where('status', 'active')->sum('quantity_distributed');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_distributions' => $totalDistributions,
                    'active_distributions' => $activeDistributions,
                    'returned_distributions' => $returnedDistributions,
                    'pending_acceptance_distributions' => ItemDistribution::where('status', 'pending_acceptance')->count(),
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:item_categories,id',
            'teacher_id' => 'required|exists:teachers,id',
            'inventory_item_ids' => 'required|array|min:1',
            'inventory_item_ids.*' => 'exists:inventory_items,id',
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

            $quantity = count($request->inventory_item_ids);
            
            // Check availability
            $items = InventoryItem::whereIn('id', $request->inventory_item_ids)->get();
            foreach ($items as $item) {
                if ($item->status !== 'available') {
                    return response()->json(['success' => false, 'message' => "Item {$item->serial_number} is not available"], 422);
                }
            }

            // Create distribution
            $distribution = ItemDistribution::create([
                'category_id' => $request->category_id,
                'teacher_id' => $request->teacher_id,
                'distributed_by' => auth()->id(),
                'quantity_distributed' => $quantity,
                'status' => 'pending_acceptance',
                'distribution_date' => $request->distribution_date,

                'expected_return_date' => $request->expected_return_date,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'condition_on_distribution' => $request->condition_on_distribution,
            ]);

            // Update item statuses and attach to pivot
            InventoryItem::whereIn('id', $request->inventory_item_ids)->update(['status' => 'distributed']);
            
            $syncData = [];
            foreach ($request->inventory_item_ids as $itemId) {
                $syncData[$itemId] = ['status' => 'distributed', 'created_at' => now(), 'updated_at' => now()];
            }
            $distribution->inventoryItems()->attach($syncData);


            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'created',
                'description' => "Distributed {$quantity} units to teacher",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item distributed successfully',
                'data' => $distribution->load(['category', 'teacher', 'distributedBy', 'inventoryItems'])
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

    public function show($id)
    {
        try {
            $distribution = ItemDistribution::with(['category', 'teacher', 'distributedBy', 'inventoryItems'])->findOrFail($id);
            return response()->json(['success' => true, 'data' => $distribution]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Distribution not found', 'error' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'expected_return_date' => 'nullable|date',
            'admin_notes' => 'nullable|string',
            'status' => 'sometimes|in:active,returned,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $distribution = ItemDistribution::findOrFail($id);
            $distribution->update($request->only(['expected_return_date', 'admin_notes', 'status']));

            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'updated',
                'description' => "Updated distribution #{$distribution->id}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            return response()->json(['success' => true, 'message' => 'Distribution updated successfully', 'data' => $distribution->load(['category', 'teacher', 'distributedBy', 'inventoryItems'])]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update distribution', 'error' => $e->getMessage()], 500);
        }
    }

    public function markAsReturned(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'actual_return_date' => 'required|date',
            'condition_on_return' => 'required|in:excellent,good,fair,poor',
            'admin_notes' => 'nullable|string',
            'inventory_item_ids' => 'nullable|array',
            'inventory_item_ids.*' => 'exists:inventory_items,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $distribution = ItemDistribution::with('inventoryItems')->findOrFail($id);

            if (!in_array($distribution->status, ['active', 'pending_acceptance'])) {
                return response()->json(['success' => false, 'message' => 'Distribution is not active or pending'], 422);
            }


            $itemIdsToReturn = $request->inventory_item_ids ?? $distribution->inventoryItems->pluck('id')->toArray();

            // Update item statuses to available
            InventoryItem::whereIn('id', $itemIdsToReturn)->update(['status' => 'available']);
            
            foreach ($itemIdsToReturn as $itemId) {
                $distribution->inventoryItems()->updateExistingPivot($itemId, [
                    'status' => 'returned',
                    'returned_at' => $request->actual_return_date,
                    'updated_at' => now()
                ]);
            }

            $stillDistributedCount = $distribution->inventoryItems()->wherePivot('status', 'distributed')->whereNotIn('inventory_items.id', $itemIdsToReturn)->count();

            if ($stillDistributedCount === 0) {
                $distribution->update([
                    'status' => 'returned',
                    'actual_return_date' => $request->actual_return_date,
                    'condition_on_return' => $request->condition_on_return,
                    'admin_notes' => $request->admin_notes,
                ]);
            }

            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'returned',
                'description' => "Returned units for distribution #{$distribution->id}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Marked as returned successfully', 'data' => $distribution->fresh(['category', 'teacher', 'distributedBy', 'inventoryItems'])]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to mark as returned', 'error' => $e->getMessage()], 500);
        }
    }

    public function cancel(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $distribution = ItemDistribution::findOrFail($id);

            if (!in_array($distribution->status, ['active', 'pending_acceptance'])) {
                return response()->json(['success' => false, 'message' => 'Distribution is not active or pending'], 422);
            }


            // Update items back to available
            $itemIds = $distribution->inventoryItems->pluck('id')->toArray();
            InventoryItem::whereIn('id', $itemIds)->update(['status' => 'available']);
            
            $distribution->update([
                'status' => 'cancelled',
                'admin_notes' => $request->admin_notes ?? 'Cancelled by admin',
            ]);

            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'cancelled',
                'description' => "Cancelled distribution #{$distribution->id}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Distribution cancelled successfully', 'data' => $distribution->load(['category', 'teacher', 'distributedBy', 'inventoryItems'])]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to cancel distribution', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $distribution = ItemDistribution::findOrFail($id);
            if ($distribution->status === 'active') {
                return response()->json(['success' => false, 'message' => 'Cannot delete active distribution. Please cancel it first.'], 422);
            }
            $distribution->delete();
            return response()->json(['success' => true, 'message' => 'Distribution deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete distribution', 'error' => $e->getMessage()], 500);
        }
    }
}
