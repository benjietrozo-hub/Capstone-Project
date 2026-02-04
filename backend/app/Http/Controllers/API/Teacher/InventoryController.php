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
        $q->orderBy($request->sort_by ?? 'item_name', $request->sort_order ?? 'asc');
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
