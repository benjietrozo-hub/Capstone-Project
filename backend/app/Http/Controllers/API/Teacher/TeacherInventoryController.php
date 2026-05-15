<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherInventoryController extends Controller
{
    private function getOwnedItemsQuery($teacherId)
    {
        return InventoryItem::whereHas('distributions', function ($q) use ($teacherId) {
            $q->where('item_distributions.status', 'active')
              ->where(function($query) use ($teacherId) {
                  $query->where('item_distributions.teacher_id', $teacherId)
                        ->orWhere(function($sub) use ($teacherId) {
                            $sub->where('assignable_type', 'App\Models\Classroom')
                                ->whereIn('assignable_id', \App\Models\Classroom::where('assigned_teacher_id', $teacherId)->pluck('id'));
                        })
                        ->orWhere(function($sub) use ($teacherId) {
                            $sub->where('assignable_type', 'App\Models\Club')
                                ->whereIn('assignable_id', \App\Models\Club::where('advisor_teacher_id', $teacherId)->pluck('id'));
                        })
                        ->orWhere(function($sub) use ($teacherId) {
                            $sub->where('assignable_type', 'App\Models\Department')
                                ->whereIn('assignable_id', \App\Models\Department::where('head_teacher_id', $teacherId)->pluck('id'));
                        });
              });
        })->with('category');
    }

    public function index(Request $request)
    {
        $teacherId = Auth::id();
        $query = $this->getOwnedItemsQuery($teacherId);

        // Search across name, serial number
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('item_name', 'like', "%{$s}%")
                  ->orWhere('serial_number', 'like', "%{$s}%")
                  ->orWhere('property_number', 'like', "%{$s}%");
            });
        }

        // Level 1 filter: parent category (master category)
        if ($request->parent_category) {
            if ($request->parent_category === 'Uncategorized') {
                $query->whereHas('category', function($q) {
                    $q->whereNull('parent_category')->orWhere('parent_category', '');
                })->orWhereDoesntHave('category');
            } else {
                $query->whereHas('category', function($q) use ($request) {
                    $q->where('parent_category', $request->parent_category);
                });
            }
        }

        // Level 2 filter: kind/category (category_name)
        if ($request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('category_name', $request->category);
            });
        }

        // Level 3 filter: status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Sorting
        $allowedSort = ['item_name', 'serial_number', 'status', 'created_at', 'date_acquired'];

        if ($request->sort_by && in_array($request->sort_by, $allowedSort)) {
            $order = $request->sort_order === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_by, $order);
        } else {
            // Default Sorting: Chronological (Oldest First) then Alphabetical (A-Z)
            $query->orderBy('date_acquired', 'asc')
                  ->orderBy('item_name', 'asc');
        }

        $items = $query->paginate($request->per_page ?? 50);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Direct inventory management is disabled. Please request items via the Borrow Request system.'], 403);
    }

    public function show(string $id)
    {
        $teacherId = Auth::id();
        $item = $this->getOwnedItemsQuery($teacherId)->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Direct inventory management is disabled.'], 403);
    }

    public function destroy(string $id)
    {
        return response()->json(['message' => 'Direct inventory management is disabled.'], 403);
    }

    /**
     * Level 1: Distinct parent categories for the main inventory grid.
     */
    public function parentCategories()
    {
        $teacherId = Auth::id();
        $items = $this->getOwnedItemsQuery($teacherId)->get();

        $parents = $items->groupBy(function($item) {
            return $item->category && $item->category->parent_category ? $item->category->parent_category : 'Uncategorized';
        })->map(function($group, $parentName) {
            return [
                'parent_category' => $parentName,
                'kind_count'      => $group->pluck('category.category_name')->unique()->count(),
                'item_count'      => $group->count()
            ];
        })->values();

        return response()->json($parents);
    }

    /**
     * Level 2: Distinct kinds (categories) within a parent category.
     */
    public function categories(Request $request)
    {
        $teacherId = Auth::id();
        $query = $this->getOwnedItemsQuery($teacherId);

        if ($request->parent_category) {
            if ($request->parent_category === 'Uncategorized') {
                $query->whereHas('category', function($q) {
                    $q->whereNull('parent_category')->orWhere('parent_category', '');
                })->orWhereDoesntHave('category');
            } else {
                $query->whereHas('category', function($q) use ($request) {
                    $q->where('parent_category', $request->parent_category);
                });
            }
        }

        $items = $query->get();

        $kinds = $items->groupBy(function($item) {
            return $item->category ? $item->category->category_name : 'Uncategorized';
        })->map(function($group, $kindName) {
            return [
                'category'   => $kindName,
                'item_count' => $group->count()
            ];
        })->values();

        return response()->json($kinds);
    }

    /**
     * Statistics for dashboard widgets.
     */
    public function statistics()
    {
        $teacherId = Auth::id();
        $items = $this->getOwnedItemsQuery($teacherId)->get();

        $stats = [
            'total_items'    => $items->count(),
            'total_quantity' => $items->count(), // In serialized system, 1 item = quantity 1
            'by_status'      => $items->groupBy('status')->map->count(),
            'by_condition'   => $items->groupBy('condition')->map->count(),
            'by_parent'      => $items->groupBy(function($item) {
                return $item->category && $item->category->parent_category ? $item->category->parent_category : 'Uncategorized';
            })->map->count(),
        ];

        return response()->json($stats);
    }
}
