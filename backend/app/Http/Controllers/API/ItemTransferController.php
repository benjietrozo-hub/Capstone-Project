<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ItemTransfer;
use App\Models\ItemDistribution;
use App\Models\InventoryItem;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ItemTransferController extends Controller
{
    /**
     * List all transfers (admin) or transfers for the authenticated teacher's entities
     */
    public function index(Request $request)
    {
        try {
            $query = ItemTransfer::with([
                'itemDistribution.category',
                'requestedBy',
                'approvedBy',
            ]);

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $transfers = $query->orderBy('created_at', 'desc')->get();

            // Append human-readable entity names
            $transfers->transform(function ($t) {
                $t->from_entity_name = $this->resolveEntityName($t->from_assignable_type, $t->from_assignable_id);
                $t->to_entity_name   = $this->resolveEntityName($t->to_assignable_type, $t->to_assignable_id);
                return $t;
            });

            return response()->json(['success' => true, 'data' => $transfers]);
        } catch (\Exception $e) {
            \Log::error('ItemTransfer index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transfers',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request a transfer of an item distribution to another entity
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_distribution_id'  => 'required|exists:item_distributions,id',
            'to_assignable_type'    => 'required|in:Teacher,Classroom,Club,Department',
            'to_assignable_id'      => 'required|integer',
            'transfer_reason'       => 'required|string|max:1000',
            'notes'                 => 'nullable|string',
        ]);

        try {
            $user = Auth::guard('sanctum')->user();

            $distribution = ItemDistribution::findOrFail($request->item_distribution_id);

            $morphMap = [
                'Teacher'    => 'App\\Models\\Teacher',
                'Classroom'  => 'App\\Models\\Classroom',
                'Club'       => 'App\\Models\\Club',
                'Department' => 'App\\Models\\Department',
            ];

            DB::beginTransaction();

            $transfer = ItemTransfer::create([
                'item_distribution_id'  => $distribution->id,
                'from_assignable_type'  => $distribution->assignable_type,
                'from_assignable_id'    => $distribution->assignable_id,
                'to_assignable_type'    => $morphMap[$request->to_assignable_type],
                'to_assignable_id'      => $request->to_assignable_id,
                'transfer_reason'       => $request->transfer_reason,
                'notes'                 => $request->notes,
                'status'                => 'pending',
                'requested_by'          => $user->id,
                'requested_by_type'     => get_class($user),
                'transfer_date'         => now(),
            ]);

            SystemLog::create([
                'log_type'    => 'item_transfer',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'create',
                'description' => "Transfer requested for distribution #{$distribution->id}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer request submitted successfully',
                'data'    => $transfer->load('itemDistribution.category'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('ItemTransfer store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transfer request',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single transfer
     */
    public function show($id)
    {
        try {
            $transfer = ItemTransfer::with([
                'itemDistribution.category',
                'itemDistribution.inventoryItems',
                'requestedBy',
                'approvedBy',
            ])->findOrFail($id);

            $transfer->from_entity_name = $this->resolveEntityName($transfer->from_assignable_type, $transfer->from_assignable_id);
            $transfer->to_entity_name   = $this->resolveEntityName($transfer->to_assignable_type, $transfer->to_assignable_id);

            return response()->json(['success' => true, 'data' => $transfer]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transfer not found',
                'error'   => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Approve a pending transfer
     */
    public function approve(Request $request, $id)
    {
        $request->validate(['notes' => 'nullable|string']);

        try {
            $admin    = Auth::guard('sanctum')->user();
            $transfer = ItemTransfer::with('itemDistribution')->findOrFail($id);

            if ($transfer->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Only pending transfers can be approved'], 400);
            }

            DB::beginTransaction();

            $transfer->update([
                'status'      => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'notes'       => $request->notes ?? $transfer->notes,
            ]);

            SystemLog::create([
                'log_type'    => 'item_transfer',
                'user_id'     => $admin->id,
                'user_type'   => 'admin',
                'action'      => 'approve',
                'description' => "Transfer #{$id} approved",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Transfer approved', 'data' => $transfer]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to approve transfer', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reject a pending transfer
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['rejection_reason' => 'required|string']);

        try {
            $admin    = Auth::guard('sanctum')->user();
            $transfer = ItemTransfer::findOrFail($id);

            if ($transfer->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Only pending transfers can be rejected'], 400);
            }

            $transfer->update([
                'status'           => 'rejected',
                'approved_by'      => $admin->id,
                'approved_at'      => now(),
                'rejection_reason' => $request->rejection_reason,
            ]);

            SystemLog::create([
                'log_type'    => 'item_transfer',
                'user_id'     => $admin->id,
                'user_type'   => 'admin',
                'action'      => 'reject',
                'description' => "Transfer #{$id} rejected: {$request->rejection_reason}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            return response()->json(['success' => true, 'message' => 'Transfer rejected', 'data' => $transfer]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to reject transfer', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Complete an approved transfer — actually moves the distribution to the new entity
     */
    public function complete(Request $request, $id)
    {
        try {
            $admin    = Auth::guard('sanctum')->user();
            $transfer = ItemTransfer::with('itemDistribution')->findOrFail($id);

            if ($transfer->status !== 'approved') {
                return response()->json(['success' => false, 'message' => 'Only approved transfers can be completed'], 400);
            }

            DB::beginTransaction();

            // Move the distribution to the new entity
            $transfer->itemDistribution->update([
                'assignable_type'       => $transfer->to_assignable_type,
                'assignable_id'         => $transfer->to_assignable_id,
                'transferred_from_type' => $transfer->from_assignable_type,
                'transferred_from_id'   => $transfer->from_assignable_id,
                'transfer_date'         => now(),
            ]);

            $transfer->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            SystemLog::create([
                'log_type'    => 'item_transfer',
                'user_id'     => $admin->id,
                'user_type'   => 'admin',
                'action'      => 'complete',
                'description' => "Transfer #{$id} completed — items moved to " . class_basename($transfer->to_assignable_type) . " #{$transfer->to_assignable_id}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Transfer completed successfully', 'data' => $transfer]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to complete transfer', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cancel a pending transfer
     */
    public function cancel(Request $request, $id)
    {
        try {
            $user     = Auth::guard('sanctum')->user();
            $transfer = ItemTransfer::findOrFail($id);

            if (!in_array($transfer->status, ['pending', 'approved'])) {
                return response()->json(['success' => false, 'message' => 'This transfer cannot be cancelled'], 400);
            }

            $transfer->update(['status' => 'cancelled']);

            SystemLog::create([
                'log_type'    => 'item_transfer',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'cancel',
                'description' => "Transfer #{$id} cancelled",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            return response()->json(['success' => true, 'message' => 'Transfer cancelled']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to cancel transfer', 'error' => $e->getMessage()], 500);
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function resolveEntityName(?string $morphType, ?int $morphId): ?string
    {
        if (!$morphType || !$morphId) return null;

        try {
            $model = app($morphType)->find($morphId);
            if (!$model) return class_basename($morphType) . " #{$morphId}";

            return match(class_basename($morphType)) {
                'Teacher'    => ($model->first_name ?? '') . ' ' . ($model->last_name ?? ''),
                'Classroom'  => $model->room_name ?? $model->room_number ?? "Classroom #{$morphId}",
                'Club'       => $model->club_name ?? "Club #{$morphId}",
                'Department' => $model->department_name ?? "Department #{$morphId}",
                default      => class_basename($morphType) . " #{$morphId}",
            };
        } catch (\Exception $e) {
            return class_basename($morphType) . " #{$morphId}";
        }
    }
}
