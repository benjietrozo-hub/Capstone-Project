<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ToolEquipment;
use App\Models\Supplier;
use App\Models\BorrowRequest;
use App\Models\PurchaseOrder;
use App\Models\DistributionGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrashController extends Controller
{
    /**
     * Get all trashed items across all tables
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type', 'all');
            $search = $request->query('search', '');
            
            $trashedItems = [];

            if ($type === 'all' || $type === 'inventory') {
                $inventory = ToolEquipment::onlyTrashed()
                    ->when($search, function($query) use ($search) {
                        $query->where('item_name', 'like', "%{$search}%")
                              ->orWhere('item_code', 'like', "%{$search}%");
                    })
                    ->with(['deletedByAdmin'])
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'type' => 'inventory',
                            'name' => $item->item_name,
                            'code' => $item->item_code,
                            'category' => $item->category,
                            'deleted_at' => $item->deleted_at,
                            'deleted_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details' => [
                                'quantity' => $item->quantity_total,
                                'condition' => $item->condition_status,
                                'location' => $item->location,
                            ]
                        ];
                    });
                $trashedItems = array_merge($trashedItems, $inventory->toArray());
            }

            if ($type === 'all' || $type === 'suppliers') {
                $suppliers = Supplier::onlyTrashed()
                    ->when($search, function($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%")
                              ->orWhere('supplier_code', 'like', "%{$search}%");
                    })
                    ->with(['deletedByAdmin'])
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'type' => 'supplier',
                            'name' => $item->name,
                            'code' => $item->supplier_code,
                            'deleted_at' => $item->deleted_at,
                            'deleted_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details' => [
                                'contact_person' => $item->contact_person,
                                'email' => $item->email,
                                'phone' => $item->phone,
                            ]
                        ];
                    });
                $trashedItems = array_merge($trashedItems, $suppliers->toArray());
            }

            if ($type === 'all' || $type === 'purchase_orders') {
                $purchaseOrders = PurchaseOrder::onlyTrashed()
                    ->when($search, function($query) use ($search) {
                        $query->where('po_number', 'like', "%{$search}%")
                              ->orWhere('supplier_name', 'like', "%{$search}%");
                    })
                    ->with(['deletedByAdmin'])
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'type' => 'purchase_order',
                            'name' => "PO: {$item->po_number}",
                            'code' => $item->po_number,
                            'deleted_at' => $item->deleted_at,
                            'deleted_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details' => [
                                'supplier' => $item->supplier_name,
                                'total_amount' => $item->total_amount,
                                'status' => $item->status,
                            ]
                        ];
                    });
                $trashedItems = array_merge($trashedItems, $purchaseOrders->toArray());
            }

            if ($type === 'all' || $type === 'borrow_requests') {
                $borrowRequests = BorrowRequest::onlyTrashed()
                    ->with(['teacher', 'item', 'deletedByAdmin'])
                    ->when($search, function($query) use ($search) {
                        $query->whereHas('teacher', function($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%");
                        })->orWhereHas('item', function($q) use ($search) {
                            $q->where('item_name', 'like', "%{$search}%");
                        });
                    })
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'type' => 'borrow_request',
                            'name' => $item->item ? $item->item->item_name : 'Unknown Item',
                            'code' => "BR-{$item->id}",
                            'deleted_at' => $item->deleted_at,
                            'deleted_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details' => [
                                'teacher' => $item->teacher ? $item->teacher->full_name : 'Unknown',
                                'quantity' => $item->quantity_requested,
                                'status' => $item->status,
                            ]
                        ];
                    });
                $trashedItems = array_merge($trashedItems, $borrowRequests->toArray());
            }

            if ($type === 'all' || $type === 'distribution_groups') {
                $distributionGroups = DistributionGroup::onlyTrashed()
                    ->when($search, function($query) use ($search) {
                        $query->where('group_name', 'like', "%{$search}%");
                    })
                    ->with(['deletedBy'])
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'type' => 'distribution_group',
                            'name' => $item->group_name,
                            'code' => "DG-{$item->id}",
                            'deleted_at' => $item->deleted_at,
                            'deleted_by' => $item->deletedBy ? $item->deletedBy->full_name : 'Unknown',
                            'details' => [
                                'group_type' => $item->group_type,
                                'department' => $item->department,
                                'visibility' => $item->visibility,
                            ]
                        ];
                    });
                $trashedItems = array_merge($trashedItems, $distributionGroups->toArray());
            }

            // Sort by deleted_at descending
            usort($trashedItems, function($a, $b) {
                return strtotime($b['deleted_at']) - strtotime($a['deleted_at']);
            });

            return response()->json([
                'success' => true,
                'data' => $trashedItems,
                'total' => count($trashedItems)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trashed items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a trashed item
     */
    public function restore(Request $request, $type, $id)
    {
        try {
            $model = $this->getModel($type);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid item type'
                ], 400);
            }

            $item = $model::onlyTrashed()->findOrFail($id);
            $item->deleted_by = null;
            $item->restore();

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' restored successfully',
                'data' => $item
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a trashed item
     */
    public function forceDelete(Request $request, $type, $id)
    {
        try {
            $model = $this->getModel($type);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid item type'
                ], 400);
            }

            $item = $model::onlyTrashed()->findOrFail($id);
            $item->forceDelete();

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' permanently deleted'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Empty entire trash or specific type
     */
    public function emptyTrash(Request $request)
    {
        try {
            $type = $request->query('type', 'all');
            $deleted = 0;

            DB::beginTransaction();

            if ($type === 'all' || $type === 'inventory') {
                $deleted += ToolEquipment::onlyTrashed()->forceDelete();
            }

            if ($type === 'all' || $type === 'suppliers') {
                $deleted += Supplier::onlyTrashed()->forceDelete();
            }

            if ($type === 'all' || $type === 'purchase_orders') {
                $deleted += PurchaseOrder::onlyTrashed()->forceDelete();
            }

            if ($type === 'all' || $type === 'borrow_requests') {
                $deleted += BorrowRequest::onlyTrashed()->forceDelete();
            }

            if ($type === 'all' || $type === 'distribution_groups') {
                $deleted += DistributionGroup::onlyTrashed()->forceDelete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Trash emptied successfully. {$deleted} items permanently deleted."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to empty trash',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get trash statistics
     */
    public function stats()
    {
        try {
            $stats = [
                'inventory' => ToolEquipment::onlyTrashed()->count(),
                'suppliers' => Supplier::onlyTrashed()->count(),
                'purchase_orders' => PurchaseOrder::onlyTrashed()->count(),
                'borrow_requests' => BorrowRequest::onlyTrashed()->count(),
                'distribution_groups' => DistributionGroup::onlyTrashed()->count(),
            ];

            $stats['total'] = array_sum($stats);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trash statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to get model class
     */
    private function getModel($type)
    {
        $models = [
            'inventory' => ToolEquipment::class,
            'supplier' => Supplier::class,
            'purchase_order' => PurchaseOrder::class,
            'borrow_request' => BorrowRequest::class,
            'distribution_group' => DistributionGroup::class,
        ];

        return $models[$type] ?? null;
    }
}
