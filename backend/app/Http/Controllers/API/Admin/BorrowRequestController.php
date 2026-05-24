<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\InventoryItem;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowRequestController extends Controller
{
    use LogsActivity;
    
    public function index(Request $request)
    {
        $query = BorrowRequest::with(['teacher', 'category', 'inventoryItems']);
        
        if ($request->status) {
            $statuses = explode(',', $request->status);
            if (count($statuses) > 1) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $request->status);
            }
        }
        if ($request->date_from) $query->whereDate('date_requested', '>=', $request->date_from);
        if ($request->date_to) $query->whereDate('date_requested', '<=', $request->date_to);
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('teacher', fn($q) => $q->where('first_name', 'like', "%{$search}%")
                                                      ->orWhere('last_name', 'like', "%{$search}%"))
                  ->orWhereHas('category', fn($q) => $q->where('category_name', 'like', "%{$search}%"));
            });
        }
        
        $query->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc');
        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function approve(Request $request, $id)
    {
        $br = BorrowRequest::with(['category', 'teacher'])->findOrFail($id);
        
        if ($br->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be approved'], 422);
        }
        
        $v = $request->validate([
            'admin_notes' => 'nullable|string',
            'inventory_item_ids' => 'required|array',
            'inventory_item_ids.*' => 'exists:inventory_items,id',
            'expected_return_date' => 'nullable|date|after_or_equal:today'
        ]);
        
        if (count($v['inventory_item_ids']) !== $br->quantity_requested) {
            return response()->json([
                'success' => false,
                'message' => "You must select exactly {$br->quantity_requested} items to approve this request."
            ], 422);
        }
        
        // Verify all selected items are actually available and belong to the correct category
        $items = InventoryItem::whereIn('id', $v['inventory_item_ids'])->get();
        
        foreach ($items as $item) {
            if ($item->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => "Item {$item->serial_number} is currently {$item->status} and cannot be assigned."
                ], 422);
            }
            if ($item->category_id !== $br->category_id) {
                return response()->json([
                    'success' => false,
                    'message' => "Item {$item->serial_number} does not belong to the requested category."
                ], 422);
            }
        }
        
        DB::beginTransaction();
        try {
            // Update items to 'borrowed'
            InventoryItem::whereIn('id', $v['inventory_item_ids'])->update(['status' => 'borrowed']);
            
            // Attach items to the pivot table
            $syncData = [];
            foreach ($v['inventory_item_ids'] as $itemId) {
                $syncData[$itemId] = ['status' => 'borrowed', 'created_at' => now(), 'updated_at' => now()];
            }
            $br->inventoryItems()->attach($syncData);
            
            // Update request status
            $br->update([
                'status' => 'borrowed',
                'admin_notes' => $v['admin_notes'] ?? null,
                'expected_return_date' => $v['expected_return_date'] ?? $br->expected_return_date,
                'approved_by' => auth()->id(),
                'issued_by' => auth()->id()
            ]);
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process approval', 'error' => $e->getMessage()], 500);
        }
        
        // Log activity
        $this->logActivity(
            'borrow_request_approved',
            "Approved borrow request for {$br->category->category_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            'info'
        );
        
        // Send notification
        NotificationService::notifyBorrowRequestApproved($br);
        
        return response()->json($br->load(['category', 'teacher', 'inventoryItems']));
    }

    public function reject(Request $request, $id)
    {
        $br = BorrowRequest::with(['category', 'teacher'])->findOrFail($id);
        
        if ($br->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be rejected'], 422);
        }
        
        $v = $request->validate(['admin_notes' => 'required']);
        $br->update(['status' => 'rejected', 'admin_notes' => $v['admin_notes']]);
        
        $this->logActivity(
            'borrow_request_rejected',
            "Rejected borrow request for {$br->category->category_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            'warning'
        );
        
        NotificationService::notifyBorrowRequestRejected($br);
        
        return response()->json($br->load(['category', 'teacher']));
    }

    public function return(Request $request, $id)
    {
        $br = BorrowRequest::with(['category', 'teacher', 'inventoryItems'])->findOrFail($id);
        
        if ($br->status !== 'borrowed') {
            return response()->json([
                'success' => false,
                'message' => 'Only borrowed requests can be returned',
                'current_status' => $br->status
            ], 422);
        }
        
        $v = $request->validate([
            'admin_notes' => 'nullable|string',
            'condition_on_return' => 'required|string|in:good,damaged,lost',
            'penalty_amount' => 'nullable|numeric|min:0',
            'actual_return_date' => 'nullable|date',
            'inventory_item_ids' => 'nullable|array',
            'inventory_item_ids.*' => 'exists:inventory_items,id'
        ]);
        
        $itemIdsToReturn = $v['inventory_item_ids'] ?? $br->inventoryItems->pluck('id')->toArray();
        $condition = $v['condition_on_return'];
        $penalty = $v['penalty_amount'] ?? 0;
        
        DB::beginTransaction();
        try {
            // Update the items based on condition
            foreach ($itemIdsToReturn as $itemId) {
                $item = InventoryItem::find($itemId);
                if (!$item) continue;

                $newStatus = 'available';
                $newCondition = $item->condition;

                if ($condition === 'lost') {
                    $newStatus = 'lost';
                } elseif ($condition === 'damaged') {
                    $newStatus = 'damaged';
                    $newCondition = 'damaged';
                }

                $item->update([
                    'status' => $newStatus,
                    'condition' => $newCondition
                ]);

                // Log condition change if not good
                if ($condition !== 'good') {
                    DB::table('item_condition_logs')->insert([
                        'item_id' => $item->id,
                        'reported_by_type' => 'admin',
                        'reported_by_id' => auth()->id(),
                        'log_type' => $condition === 'lost' ? 'inspection' : 'damage',
                        'condition_before' => $item->getOriginal('condition'),
                        'condition_after' => $newCondition,
                        'description' => "Return reported as {$condition}. " . ($v['admin_notes'] ?? ''),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
            
            // Update the pivot table
            foreach ($itemIdsToReturn as $itemId) {
                $br->inventoryItems()->updateExistingPivot($itemId, [
                    'status' => 'returned',
                    'returned_at' => $v['actual_return_date'] ?? now(),
                    'condition_on_return' => $condition,
                    'penalty_amount' => $penalty,
                    'updated_at' => now()
                ]);
            }
            
            // Check if ALL items have been returned
            $stillBorrowedCount = $br->inventoryItems()->wherePivot('status', 'borrowed')->whereNotIn('inventory_items.id', $itemIdsToReturn)->count();
            
            if ($stillBorrowedCount === 0) {
                $br->update([
                    'status' => 'returned',
                    'admin_notes' => $v['admin_notes'] ?? $br->admin_notes,
                    'condition_on_return' => $condition,
                    'penalty_amount' => $penalty,
                    'actual_return_date' => $v['actual_return_date'] ?? now()->toDateString(),
                    'date_returned' => $v['actual_return_date'] ?? now()->toDateString(),
                    'received_by' => auth()->id()
                ]);
            }
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process return', 'error' => $e->getMessage()], 500);
        }
        
        $this->logActivity(
            'item_returned',
            "Items returned ({$condition}) for {$br->category->category_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            $condition === 'good' ? 'info' : 'warning'
        );
        
        NotificationService::notifyItemReturned($br, $condition, $penalty);
        
        return response()->json([
            'success' => true,
            'data' => $br->fresh(['category', 'teacher', 'inventoryItems'])
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'pending' => BorrowRequest::where('status', 'pending')->count(),
            'approved' => BorrowRequest::where('status', 'approved')->count(),
            'borrowed' => BorrowRequest::where('status', 'borrowed')->count(),
            'overdue' => BorrowRequest::where('status', 'borrowed')
                ->where('expected_return_date', '<', now()->toDateString())
                ->count(),
            'returned_today' => BorrowRequest::where('status', 'returned')
                // Note: previously actual_return_date, we now check updated_at or if you want to add a column
                ->whereDate('updated_at', today()) 
                ->count(),
            'total_this_month' => BorrowRequest::whereMonth('created_at', now()->month)->count()
        ]);
    }
}
