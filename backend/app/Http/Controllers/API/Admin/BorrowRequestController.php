<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

class BorrowRequestController extends Controller
{
    use LogsActivity;
    public function index(Request $request)
    {
        $query = BorrowRequest::with(['teacher', 'item']);
        if ($request->status) $query->where('status', $request->status);
        if ($request->date_from) $query->whereDate('borrow_date', '>=', $request->date_from);
        if ($request->date_to) $query->whereDate('borrow_date', '<=', $request->date_to);
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('teacher', fn($q) => $q->where('first_name', 'like', "%{$search}%")
                                                      ->orWhere('last_name', 'like', "%{$search}%"))
                  ->orWhereHas('item', fn($q) => $q->where('item_name', 'like', "%{$search}%"));
            });
        }
        $query->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc');
        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function approve(Request $request, $id)
    {
        $br = BorrowRequest::with(['item', 'teacher'])->findOrFail($id);
        if ($br->status !== 'pending') return response()->json(['message' => 'Only pending requests can be approved'], 422);
        
        // Check if item is still available
        if (!$br->item->isAvailable) {
            return response()->json([
                'success' => false,
                'message' => 'This item is currently not available for borrowing',
                'details' => [
                    'item_name' => $br->item->item_name,
                    'item_code' => $br->item->item_code,
                    'quantity_available' => $br->item->quantity_available,
                    'quantity_requested' => $br->quantity_requested
                ]
            ], 422);
        }
        
        // Check if requested quantity is available
        if ($br->quantity_requested > $br->item->quantity_available) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient quantity available for this request',
                'details' => [
                    'item_name' => $br->item->item_name,
                    'item_code' => $br->item->item_code,
                    'quantity_requested' => $br->quantity_requested,
                    'quantity_available' => $br->item->quantity_available
                ]
            ], 422);
        }
        
        // Check if there are already approved requests for this item that haven't been returned
        $existingBorrowed = BorrowRequest::where('item_id', $br->item_id)
            ->where('status', 'borrowed')
            ->exists();
            
        if ($existingBorrowed) {
            return response()->json([
                'success' => false,
                'message' => 'This item is currently borrowed by another user. Please wait for it to be returned before approving new requests.',
                'details' => [
                    'item_name' => $br->item->item_name,
                    'item_code' => $br->item->item_code,
                    'status' => 'Currently Borrowed'
                ]
            ], 422);
        }
        
        $v = $request->validate([
            'admin_notes' => 'nullable'
        ]);
        
        // Update status to 'borrowed' directly - item is immediately issued to teacher
        $br->update([
            'status' => 'borrowed',
            'admin_notes' => $v['admin_notes'] ?? null
        ]);
        
        $br->item->updateQuantities();
        
        // Log activity
        $this->logActivity(
            'borrow_request_approved',
            "Approved borrow request for {$br->item->item_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            'info'
        );
        
        // Send notification to teacher
        NotificationService::notifyBorrowRequestApproved($br);
        
        // Broadcast inventory update
        NotificationService::broadcastInventoryUpdate($br->item);
        
        return response()->json($br->load(['item', 'teacher']));
    }

    public function reject(Request $request, $id)
    {
        $br = BorrowRequest::with(['item', 'teacher'])->findOrFail($id);
        if ($br->status !== 'pending') return response()->json(['message' => 'Only pending requests can be rejected'], 422);
        $v = $request->validate(['admin_notes' => 'required']);
        $br->update(['status' => 'rejected', 'admin_notes' => $v['admin_notes']]);
        
        // Log activity
        $this->logActivity(
            'borrow_request_rejected',
            "Rejected borrow request for {$br->item->item_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            'warning'
        );
        
        // Send notification to teacher
        NotificationService::notifyBorrowRequestRejected($br);
        
        return response()->json($br->load(['item', 'teacher']));
    }

    public function issue(Request $request, $id)
    {
        $br = BorrowRequest::findOrFail($id);
        if ($br->status !== 'approved') return response()->json(['message' => 'Only approved requests can be issued'], 422);
        $br->update(['status' => 'borrowed']);
        return response()->json($br->load(['item', 'teacher']));
    }

    public function return(Request $request, $id)
    {
        $br = BorrowRequest::with(['item', 'teacher'])->findOrFail($id);
        if ($br->status !== 'borrowed') {
            return response()->json([
                'success' => false,
                'message' => 'Only borrowed items can be returned',
                'current_status' => $br->status
            ], 422);
        }
        
        $v = $request->validate(['return_notes' => 'nullable|string']);
        
        $br->update([
            'status' => 'returned',
            'actual_return_date' => now()->toDateString(),
            'admin_notes' => $v['return_notes'] ?? $br->admin_notes
        ]);
        $br->item->updateQuantities();
        
        // Log activity
        $this->logActivity(
            'item_returned',
            "Item returned: {$br->item->item_name} by {$br->teacher->first_name} {$br->teacher->last_name}",
            'info'
        );
        
        // Send notification to teacher
        NotificationService::notifyItemReturned($br);
        
        // Broadcast inventory update
        NotificationService::broadcastInventoryUpdate($br->item);
        
        return response()->json([
            'success' => true,
            'data' => $br->load(['item', 'teacher'])
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
                ->whereDate('actual_return_date', today())
                ->count(),
            'total_this_month' => BorrowRequest::whereMonth('created_at', now()->month)->count()
        ]);
    }
}
