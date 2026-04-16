<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BulkDistribution;
use App\Models\DistributionGroup;
use App\Models\ToolEquipment;
use App\Models\ItemDistribution;
use App\Services\DistributionNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BulkDistributionController extends Controller
{
    protected $notificationService;

    public function __construct(DistributionNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all bulk distributions
     */
    public function index(Request $request)
    {
        try {
            \Log::info('BulkDistribution index called');
            \Log::info('Request params: ' . json_encode($request->all()));
            
            // Use basic relationships first to avoid nested relationship issues
            $query = BulkDistribution::with(['group', 'item', 'distributedBy']);
            \Log::info('Using basic relationships: group, item, distributedBy');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by group
            if ($request->has('group_id')) {
                $query->where('group_id', $request->group_id);
            }

            // Filter by date range
            if ($request->has('date_from')) {
                $query->whereDate('distribution_date', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('distribution_date', '<=', $request->date_to);
            }

            $distributions = $query->orderBy('created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $distributions
            ]);
        } catch (\Exception $e) {
            \Log::error('BulkDistribution index error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bulk distributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new bulk distribution
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'group_id' => 'required|exists:distribution_groups,id',
                'item_id' => 'required|exists:tools_equipment,id',
                'total_quantity' => 'required|integer|min:1',
                'purpose' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:500',
                'distribution_date' => 'required|date|after_or_equal:today',
                'expected_return_date' => 'nullable|date|after:distribution_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get group and item
            $group = DistributionGroup::with('teachers')->findOrFail($request->group_id);
            $item = ToolEquipment::findOrFail($request->item_id);

            // Check if group has teachers
            if ($group->teachers->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Distribution group has no members'
                ], 422);
            }

            // Calculate quantity per member
            $quantityPerMember = floor($request->total_quantity / $group->teachers->count());
            
            if ($quantityPerMember < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total quantity is insufficient for all group members'
                ], 422);
            }

            // Check if enough quantity is available
            if ($item->quantity_available < $request->total_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient quantity available. Available: ' . $item->quantity_available
                ], 422);
            }

            // Create bulk distribution
            $bulkDistribution = BulkDistribution::create([
                'group_id' => $request->group_id,
                'item_id' => $request->item_id,
                'distributed_by' => auth()->id(),
                'total_quantity' => $request->total_quantity,
                'quantity_per_member' => $quantityPerMember,
                'status' => 'pending',
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'distribution_date' => $request->distribution_date,
                'expected_return_date' => $request->expected_return_date,
            ]);

            // Send notifications to group members
            $this->notificationService->notifyBulkDistributionCreated($bulkDistribution, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Bulk distribution created successfully',
                'data' => $bulkDistribution->load(['group', 'item', 'distributedBy'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create bulk distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific bulk distribution
     */
    public function show($id)
    {
        try {
            $distribution = BulkDistribution::with([
                'group.teachers', 
                'item', 
                'distributedBy', 
                'itemDistributions.teacher',
                'itemDistributions.item'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $distribution
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk distribution not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Process a bulk distribution (create individual distributions)
     */
    public function process($id)
    {
        try {
            DB::beginTransaction();

            $bulkDistribution = BulkDistribution::with(['group.teachers', 'item'])->findOrFail($id);

            if ($bulkDistribution->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending distributions can be processed'
                ], 422);
            }

            $bulkDistribution->update(['status' => 'processing']);

            $group = $bulkDistribution->group;
            $item = $bulkDistribution->item;

            if (!$group) {
                $bulkDistribution->update(['status' => 'pending']);
                return response()->json([
                    'success' => false,
                    'message' => 'Distribution group not found'
                ], 422);
            }

            if (!$item) {
                $bulkDistribution->update(['status' => 'pending']);
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found'
                ], 422);
            }

            if (!$group->relationLoaded('teachers')) {
                $group->load('teachers');
            }

            if ($group->teachers->isEmpty()) {
                $bulkDistribution->update(['status' => 'pending']);
                return response()->json([
                    'success' => false,
                    'message' => 'Distribution group has no members'
                ], 422);
            }

            // Double-check availability
            if ($item->quantity_available < $bulkDistribution->total_quantity) {
                $bulkDistribution->update(['status' => 'pending']);
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient quantity available. Available: ' . $item->quantity_available
                ], 422);
            }

            // Create individual distributions
            foreach ($group->teachers as $teacher) {
                ItemDistribution::create([
                    'item_id' => $bulkDistribution->item_id,
                    'teacher_id' => $teacher->id,
                    'distributed_by' => $bulkDistribution->distributed_by,
                    'quantity_distributed' => $bulkDistribution->quantity_per_member,
                    'status' => 'active',
                    'distribution_date' => $bulkDistribution->distribution_date,
                    'expected_return_date' => $bulkDistribution->expected_return_date,
                    'purpose' => $bulkDistribution->purpose,
                    'notes' => $bulkDistribution->notes,
                    'condition_on_distribution' => 'good',
                    'bulk_distribution_id' => $bulkDistribution->id,
                ]);
            }

            // Update item quantity
            $item->decrement('quantity_available', $bulkDistribution->total_quantity);

            $bulkDistribution->update(['status' => 'completed']);

            // Send notifications to teachers
            $this->notificationService->notifyBulkDistributionProcessed($bulkDistribution, auth()->id());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulk distribution processed successfully',
                'data' => $bulkDistribution->load(['group', 'item', 'distributedBy', 'itemDistributions.teacher'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Failed to process bulk distribution', [
                'bulk_distribution_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a bulk distribution
     */
    public function cancel($id)
    {
        try {
            DB::beginTransaction();

            $bulkDistribution = BulkDistribution::findOrFail($id);

            if ($bulkDistribution->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel completed bulk distribution'
                ], 422);
            }

            if ($bulkDistribution->status === 'processing') {
                // Return quantities from individual distributions
                foreach ($bulkDistribution->itemDistributions as $distribution) {
                    if ($distribution->status === 'active') {
                        $bulkDistribution->item->increment('quantity_available', $distribution->quantity_distributed);
                        $distribution->update(['status' => 'cancelled']);
                    }
                }
            }

            $bulkDistribution->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulk distribution cancelled successfully',
                'data' => $bulkDistribution->load(['group', 'item', 'distributedBy'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel bulk distribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bulk distribution statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_distributions' => BulkDistribution::count(),
                'pending_distributions' => BulkDistribution::pending()->count(),
                'processing_distributions' => BulkDistribution::processing()->count(),
                'completed_distributions' => BulkDistribution::completed()->count(),
                'cancelled_distributions' => BulkDistribution::cancelled()->count(),
                'total_items_distributed' => BulkDistribution::completed()->sum('total_quantity'),
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
}
