<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ItemDistribution;
use App\Models\InventoryItem;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ItemDistributionController extends Controller
{
    /**
     * Get distributions for the authenticated teacher
     */
    public function index(Request $request)
    {
        try {
            $teacherId = Auth::id();
            $query = ItemDistribution::with(['category', 'distributedBy', 'inventoryItems'])
                ->where('teacher_id', $teacherId);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                // Default to showing active and pending
                $query->whereIn('status', ['active', 'pending_acceptance']);
            }

            $distributions = $query->orderBy('distribution_date', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $distributions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept a pending distribution (Digital Signature/Acknowledge)
     */
    public function accept($id)
    {
        try {
            DB::beginTransaction();

            $teacherId = Auth::id();
            $distribution = ItemDistribution::where('teacher_id', $teacherId)
                ->where('status', 'pending_acceptance')
                ->findOrFail($id);

            $distribution->update([
                'status' => 'active',
                'notes' => ($distribution->notes ? $distribution->notes . "\n" : "") . "Accepted by teacher on " . now()->toDateTimeString()
            ]);

            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'accepted',
                'description' => "Teacher accepted distribution #{$distribution->id}",
                'user_type' => 'teacher',
                'user_id' => $teacherId,
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution accepted and confirmed.',
                'data' => $distribution->load(['category', 'inventoryItems'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a pending distribution
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        try {
            DB::beginTransaction();

            $teacherId = Auth::id();
            $distribution = ItemDistribution::with('inventoryItems')->where('teacher_id', $teacherId)
                ->where('status', 'pending_acceptance')
                ->findOrFail($id);

            // Set items back to available
            $itemIds = $distribution->inventoryItems->pluck('id')->toArray();
            InventoryItem::whereIn('id', $itemIds)->update(['status' => 'available']);

            $distribution->update([
                'status' => 'rejected',
                'notes' => ($distribution->notes ? $distribution->notes . "\n" : "") . "Rejected by teacher: " . $request->reason
            ]);

            SystemLog::create([
                'log_type' => 'distribution',
                'action' => 'rejected',
                'description' => "Teacher rejected distribution #{$distribution->id}. Reason: {$request->reason}",
                'user_type' => 'teacher',
                'user_id' => $teacherId,
                'reference_id' => $distribution->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution rejected and items returned to available stock.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
