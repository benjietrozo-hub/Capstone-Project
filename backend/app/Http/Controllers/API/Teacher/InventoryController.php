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
            $query->where('status', 'available');
        }])->findOrFail($id);
        
        return response()->json($category);
    }

    public function categories()
    {
        return response()->json(ItemCategory::pluck('category_name')->filter()->values());
    }
}
