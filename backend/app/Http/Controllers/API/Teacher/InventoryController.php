<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ToolEquipment;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $q = ToolEquipment::where('status', 'active');
        if ($request->search) {
            $s = $request->search;
            $q->where(fn($q) => $q->where('item_name', 'like', "%{$s}%")->orWhere('item_code', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%"));
        }
        if ($request->category) $q->where('category', $request->category);
        if ($request->available_only) $q->where('quantity_available', '>', 0);
        $sortBy = $request->sort_by ?? 'item_name';
        $sortOrder = $request->sort_order ?? 'asc';
        
        // Handle year-based sorting with alphabetical secondary sort
        if ($sortBy === 'acquisition_year') {
            $q->byYearAndName($sortOrder, 'asc');
        } elseif ($sortBy === 'name_year') {
            $q->orderBy('item_name', $sortOrder)
              ->orderByRaw('YEAR(acquisition_date) desc');
        } elseif ($sortBy === 'year_name_combined') {
            $primarySort = $request->primary_sort ?? 'acquisition_year';
            $secondarySort = $request->secondary_sort ?? 'item_name';
            $primaryOrder = $request->primary_order ?? 'desc';
            $secondaryOrder = $request->secondary_order ?? 'asc';
            $q->combinedSort($primarySort, $secondarySort, $primaryOrder, $secondaryOrder);
        } else {
            $q->orderBy($sortBy, $sortOrder);
        }
        
        return response()->json($q->paginate($request->per_page ?? 12));
    }

    public function show($id)
    {
        return response()->json(ToolEquipment::where('status', 'active')->findOrFail($id));
    }

    public function categories()
    {
        return response()->json(ToolEquipment::where('status', 'active')->distinct('category')->pluck('category')->filter()->values());
    }
}
