<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ToolEquipment;
use App\Models\BorrowRequest;
use App\Models\DistributionGroup;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArchiveController extends Controller
{
    /**
     * Get all archived items across all tables
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type', 'all');
            $search = $request->query('search', '');

            $archivedItems = [];

            if ($type === 'all' || $type === 'inventory') {
                $inventory = ToolEquipment::onlyTrashed()
                    ->when($search, function ($query) use ($search) {
                        $query->where('item_name', 'like', "%{$search}%")
                              ->orWhere('item_code', 'like', "%{$search}%");
                    })
                    ->with(['deletedByAdmin'])
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'          => $item->id,
                            'type'        => 'inventory',
                            'name'        => $item->item_name,
                            'code'        => $item->item_code,
                            'category'    => $item->category,
                            'archived_at' => $item->deleted_at,
                            'archived_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details'     => [
                                'quantity'  => $item->quantity_total,
                                'condition' => $item->condition_status,
                                'location'  => $item->location,
                            ],
                        ];
                    });
                $archivedItems = array_merge($archivedItems, $inventory->toArray());
            }

            if ($type === 'all' || $type === 'borrow_requests') {
                $borrowRequests = BorrowRequest::onlyTrashed()
                    ->with(['teacher', 'item', 'deletedByAdmin'])
                    ->when($search, function ($query) use ($search) {
                        $query->whereHas('teacher', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%");
                        })->orWhereHas('item', function ($q) use ($search) {
                            $q->where('item_name', 'like', "%{$search}%");
                        });
                    })
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'          => $item->id,
                            'type'        => 'borrow_request',
                            'name'        => $item->item ? $item->item->item_name : 'Unknown Item',
                            'code'        => "BR-{$item->id}",
                            'archived_at' => $item->deleted_at,
                            'archived_by' => $item->deletedByAdmin ? $item->deletedByAdmin->full_name : 'Unknown',
                            'details'     => [
                                'teacher'  => $item->teacher ? $item->teacher->full_name : 'Unknown',
                                'quantity' => $item->quantity_requested,
                                'status'   => $item->status,
                            ],
                        ];
                    });
                $archivedItems = array_merge($archivedItems, $borrowRequests->toArray());
            }

            if ($type === 'all' || $type === 'distribution_groups') {
                $distributionGroups = DistributionGroup::onlyTrashed()
                    ->when($search, function ($query) use ($search) {
                        $query->where('group_name', 'like', "%{$search}%");
                    })
                    ->with(['deletedBy'])
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'          => $item->id,
                            'type'        => 'distribution_group',
                            'name'        => $item->group_name,
                            'code'        => "DG-{$item->id}",
                            'archived_at' => $item->deleted_at,
                            'archived_by' => $item->deletedBy ? $item->deletedBy->full_name : 'Unknown',
                            'details'     => [
                                'group_type' => $item->group_type,
                                'department' => $item->department,
                                'visibility' => $item->visibility,
                            ],
                        ];
                    });
                $archivedItems = array_merge($archivedItems, $distributionGroups->toArray());
            }

            if ($type === 'all' || $type === 'teachers') {
                $teachers = Teacher::onlyTrashed()
                    ->when($search, function ($query) use ($search) {
                        $query->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%")
                              ->orWhere('teacher_id', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'          => $item->id,
                            'type'        => 'teacher',
                            'name'        => $item->full_name,
                            'code'        => $item->teacher_id,
                            'archived_at' => $item->deleted_at,
                            'archived_by' => 'Admin',
                            'details'     => [
                                'email'      => $item->email,
                                'department' => $item->department ?? 'N/A',
                                'status'     => $item->status,
                            ],
                        ];
                    });
                $archivedItems = array_merge($archivedItems, $teachers->toArray());
            }

            // Sort by archived_at descending
            usort($archivedItems, function ($a, $b) {
                return strtotime($b['archived_at']) - strtotime($a['archived_at']);
            });

            return response()->json([
                'success' => true,
                'data'    => $archivedItems,
                'total'   => count($archivedItems),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived items',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore an archived item
     */
    public function restore(Request $request, $type, $id)
    {
        try {
            $model = $this->getModel($type);

            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid item type',
                ], 400);
            }

            $item = $model::onlyTrashed()->findOrFail($id);

            // Clear deleted_by if supported
            if (\Illuminate\Support\Facades\Schema::hasColumn($item->getTable(), 'deleted_by')) {
                $item->deleted_by = null;
            }
            $item->restore();

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' restored successfully',
                'data'    => $item,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete an archived item
     */
    public function forceDelete(Request $request, $type, $id)
    {
        try {
            $model = $this->getModel($type);

            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid item type',
                ], 400);
            }

            $item = $model::onlyTrashed()->findOrFail($id);
            $item->forceDelete();

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' permanently deleted',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Empty entire archive or specific type
     */
    public function emptyArchive(Request $request)
    {
        try {
            $type    = $request->query('type', 'all');
            $deleted = 0;

            DB::beginTransaction();

            if ($type === 'all' || $type === 'inventory') {
                $deleted += ToolEquipment::onlyTrashed()->forceDelete();
            }

            if ($type === 'all' || $type === 'borrow_requests') {
                $deleted += BorrowRequest::onlyTrashed()->forceDelete();
            }
            if ($type === 'all' || $type === 'distribution_groups') {
                $deleted += DistributionGroup::onlyTrashed()->forceDelete();
            }
            if ($type === 'all' || $type === 'teachers') {
                $deleted += Teacher::onlyTrashed()->forceDelete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Archive emptied successfully. {$deleted} items permanently deleted.",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to empty archive',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get archive statistics
     */
    public function stats()
    {
        try {
            $stats = [
                'inventory'          => ToolEquipment::onlyTrashed()->count(),
                'borrow_requests'    => BorrowRequest::onlyTrashed()->count(),
                'distribution_groups'=> DistributionGroup::onlyTrashed()->count(),
                'teachers'           => Teacher::onlyTrashed()->count(),
            ];

            $stats['total'] = array_sum($stats);

            return response()->json([
                'success' => true,
                'data'    => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archive statistics',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper method to get model class
     */
    private function getModel($type)
    {
        $models = [
            'inventory'          => ToolEquipment::class,
            'borrow_request'     => BorrowRequest::class,
            'distribution_group' => DistributionGroup::class,
            'teacher'            => Teacher::class,
        ];

        return $models[$type] ?? null;
    }
}
