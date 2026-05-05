<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ItemCategory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $q = ItemCategory::query();
        if ($request->search) {
            $s = $request->search;
            $q->where(fn($query) => 
                $query->where('category_name', 'like', "%{$s}%")
                      ->orWhere('description', 'like', "%{$s}%")
            );
        }
        
        if ($request->has('parent_category')) {
            $parentCat = $request->parent_category;
            if ($parentCat === 'Uncategorized') {
                $q->whereNull('parent_category');
            } else {
                $q->where('parent_category', $parentCat);
            }
        }

        
        $sortBy = $request->sort_by ?? 'category_name';
        $sortOrder = $request->sort_order ?? 'asc';
        
        // Handle sorting by virtual/appended columns
        if ($sortBy === 'available_items') {
            $q->withCount(['inventoryItems as available_items_count' => function($query) {
                $query->where('status', 'available');
            }])->orderBy('available_items_count', $sortOrder);
        } elseif ($sortBy === 'total_items') {
            $q->withCount('inventoryItems as total_items_count')
              ->orderBy('total_items_count', $sortOrder);
        } else {
            // Map legacy field names if any
            if ($sortBy === 'item_name') $sortBy = 'category_name';
            $q->orderBy($sortBy, $sortOrder);
        }
        
        return response()->json($q->paginate($request->per_page ?? 12));
    }

    public function show($id)
    {
        $category = ItemCategory::with(['inventoryItems' => function($query) {
            $query->whereIn('status', ['available', 'borrowed', 'maintenance']);
        }])->findOrFail($id);
        
        // Map the pending requests count manually to avoid complex nested withCount issues
        $category->inventoryItems->each(function($item) {
            $item->pending_requests_count = \DB::table('borrow_request_items')
                ->join('borrow_requests', 'borrow_request_items.borrow_request_id', '=', 'borrow_requests.id')
                ->where('borrow_request_items.inventory_item_id', $item->id)
                ->where('borrow_requests.status', 'pending')
                ->count();
        });
        
        return response()->json($category);
    }

    public function categories()
    {
        return response()->json(ItemCategory::pluck('category_name')->filter()->values());
    }

    public function parentCategories()
    {
        $parents = \DB::table('item_categories')
            ->selectRaw('COALESCE(parent_category, "Uncategorized") as parent_category')
            ->selectRaw('COUNT(id) as kind_count')
            ->selectRaw('SUM((SELECT COUNT(*) FROM inventory_items WHERE inventory_items.category_id = item_categories.id)) as item_count')
            ->groupBy('parent_category')
            ->get();
            
        return response()->json($parents);
    }
}
