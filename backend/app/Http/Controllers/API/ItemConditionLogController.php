<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ItemConditionLog;
use App\Models\InventoryItem;
use App\Models\ItemDistribution;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ItemConditionLogController extends Controller
{
    /**
     * List condition logs with optional filters
     */
    public function index(Request $request)
    {
        try {
            $query = ItemConditionLog::with([
                'item',
                'itemDistribution.category',
            ]);

            if ($request->has('item_id')) {
                $query->where('item_id', $request->item_id);
            }

            if ($request->has('log_type') && $request->log_type !== 'all') {
                $query->where('log_type', $request->log_type);
            }

            if ($request->has('item_distribution_id')) {
                $query->where('item_distribution_id', $request->item_distribution_id);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            return response()->json(['success' => true, 'data' => $logs]);
        } catch (\Exception $e) {
            \Log::error('ItemConditionLog index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch condition logs',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a generic condition log entry
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_id'              => 'required|exists:inventory_items,id',
            'item_distribution_id' => 'nullable|exists:item_distributions,id',
            'log_type'             => 'required|in:damage,repair,maintenance,inspection,disposal,transfer,other',
            'condition_before'     => 'nullable|in:excellent,good,fair,poor,damaged,disposed',
            'condition_after'      => 'nullable|in:excellent,good,fair,poor,damaged,disposed',
            'description'          => 'required|string',
            'notes'                => 'nullable|string',
            'cost'                 => 'nullable|numeric|min:0',
        ]);

        try {
            $user = Auth::guard('sanctum')->user();

            DB::beginTransaction();

            $log = ItemConditionLog::create([
                'item_id'              => $request->item_id,
                'item_distribution_id' => $request->item_distribution_id,
                'log_type'             => $request->log_type,
                'condition_before'     => $request->condition_before,
                'condition_after'      => $request->condition_after,
                'description'          => $request->description,
                'notes'                => $request->notes,
                'cost'                 => $request->cost,
                'reported_by_type'     => get_class($user),
                'reported_by_id'       => $user->id,
                'logged_at'            => now(),
            ]);

            // Update item condition if condition_after is provided
            if ($request->condition_after) {
                InventoryItem::where('id', $request->item_id)
                    ->update(['condition' => $request->condition_after]);
            }

            SystemLog::create([
                'log_type'    => 'condition_log',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'create',
                'description' => "Condition log ({$request->log_type}) created for item #{$request->item_id}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Condition log created successfully',
                'data'    => $log->load('item'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('ItemConditionLog store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create condition log',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single condition log
     */
    public function show($id)
    {
        try {
            $log = ItemConditionLog::with([
                'item',
                'itemDistribution.category',
            ])->findOrFail($id);

            return response()->json(['success' => true, 'data' => $log]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Log not found', 'error' => $e->getMessage()], 404);
        }
    }

    /**
     * Report damage to an item
     */
    public function reportDamage(Request $request)
    {
        $request->validate([
            'item_id'              => 'required|exists:inventory_items,id',
            'item_distribution_id' => 'nullable|exists:item_distributions,id',
            'description'          => 'required|string',
            'severity'             => 'required|in:minor,moderate,severe,total_loss',
            'notes'                => 'nullable|string',
            'estimated_repair_cost'=> 'nullable|numeric|min:0',
        ]);

        try {
            $user = Auth::guard('sanctum')->user();
            $item = InventoryItem::findOrFail($request->item_id);

            DB::beginTransaction();

            $conditionBefore = $item->condition ?? 'good';

            // Map severity to condition
            $conditionAfter = match($request->severity) {
                'minor'      => 'fair',
                'moderate'   => 'poor',
                'severe'     => 'damaged',
                'total_loss' => 'disposed',
                default      => 'poor',
            };

            $log = ItemConditionLog::create([
                'item_id'              => $item->id,
                'item_distribution_id' => $request->item_distribution_id,
                'log_type'             => 'damage',
                'condition_before'     => $conditionBefore,
                'condition_after'      => $conditionAfter,
                'description'          => $request->description,
                'notes'                => $request->notes,
                'cost'                 => $request->estimated_repair_cost,
                'reported_by_type'     => get_class($user),
                'reported_by_id'       => $user->id,
                'logged_at'            => now(),
                'metadata'             => json_encode(['severity' => $request->severity]),
            ]);

            // Update item condition
            $item->update(['condition' => $conditionAfter]);

            // If total loss, mark item as disposed
            if ($request->severity === 'total_loss') {
                $item->update(['status' => 'disposed']);
            }

            SystemLog::create([
                'log_type'    => 'condition_log',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'report_damage',
                'description' => "Damage reported for item #{$item->id} ({$item->serial_number}): {$request->severity}",
                'ip_address'  => $request->ip(),
                'severity'    => 'warning',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Damage reported successfully',
                'data'    => $log->load('item'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('reportDamage error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to report damage', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Log a repair on an item
     */
    public function logRepair(Request $request)
    {
        $request->validate([
            'item_id'              => 'required|exists:inventory_items,id',
            'item_distribution_id' => 'nullable|exists:item_distributions,id',
            'description'          => 'required|string',
            'condition_after'      => 'required|in:excellent,good,fair,poor',
            'repair_cost'          => 'nullable|numeric|min:0',
            'repaired_by'          => 'nullable|string',
            'notes'                => 'nullable|string',
        ]);

        try {
            $user = Auth::guard('sanctum')->user();
            $item = InventoryItem::findOrFail($request->item_id);

            DB::beginTransaction();

            $log = ItemConditionLog::create([
                'item_id'              => $item->id,
                'item_distribution_id' => $request->item_distribution_id,
                'log_type'             => 'repair',
                'condition_before'     => $item->condition ?? 'poor',
                'condition_after'      => $request->condition_after,
                'description'          => $request->description,
                'notes'                => $request->notes,
                'cost'                 => $request->repair_cost,
                'reported_by_type'     => get_class($user),
                'reported_by_id'       => $user->id,
                'logged_at'            => now(),
                'metadata'             => json_encode(['repaired_by' => $request->repaired_by]),
            ]);

            // Update item condition and status
            $item->update([
                'condition' => $request->condition_after,
                'status'    => 'available', // Repaired items go back to available
            ]);

            SystemLog::create([
                'log_type'    => 'condition_log',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'log_repair',
                'description' => "Repair logged for item #{$item->id} ({$item->serial_number}), condition restored to {$request->condition_after}",
                'ip_address'  => $request->ip(),
                'severity'    => 'info',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair logged successfully',
                'data'    => $log->load('item'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('logRepair error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to log repair', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Record disposal of an item
     */
    public function recordDisposal(Request $request)
    {
        $request->validate([
            'item_id'              => 'required|exists:inventory_items,id',
            'item_distribution_id' => 'nullable|exists:item_distributions,id',
            'disposal_reason'      => 'required|string',
            'disposal_method'      => 'required|in:scrapped,donated,sold,lost,stolen,other',
            'notes'                => 'nullable|string',
            'disposal_value'       => 'nullable|numeric|min:0',
        ]);

        try {
            $user = Auth::guard('sanctum')->user();
            $item = InventoryItem::findOrFail($request->item_id);

            DB::beginTransaction();

            $log = ItemConditionLog::create([
                'item_id'              => $item->id,
                'item_distribution_id' => $request->item_distribution_id,
                'log_type'             => 'disposal',
                'condition_before'     => $item->condition ?? 'poor',
                'condition_after'      => 'disposed',
                'description'          => $request->disposal_reason,
                'notes'                => $request->notes,
                'cost'                 => $request->disposal_value,
                'reported_by_type'     => get_class($user),
                'reported_by_id'       => $user->id,
                'logged_at'            => now(),
                'metadata'             => json_encode(['disposal_method' => $request->disposal_method]),
            ]);

            // Mark item as disposed
            $item->update([
                'condition'    => 'disposed',
                'status'       => 'disposed',
                'disposal_date'=> now(),
                'disposal_reason' => $request->disposal_reason,
            ]);

            // If item is in a distribution, mark that distribution as disposed
            if ($request->item_distribution_id) {
                ItemDistribution::where('id', $request->item_distribution_id)
                    ->update([
                        'status'         => 'disposed',
                        'disposal_date'  => now(),
                        'disposal_reason'=> $request->disposal_reason,
                    ]);
            }

            SystemLog::create([
                'log_type'    => 'condition_log',
                'user_id'     => $user->id,
                'user_type'   => $user instanceof \App\Models\Admin ? 'admin' : 'teacher',
                'action'      => 'record_disposal',
                'description' => "Item #{$item->id} ({$item->serial_number}) disposed via {$request->disposal_method}: {$request->disposal_reason}",
                'ip_address'  => $request->ip(),
                'severity'    => 'warning',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Disposal recorded successfully',
                'data'    => $log->load('item'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('recordDisposal error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to record disposal', 'error' => $e->getMessage()], 500);
        }
    }
}
