<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherInventoryController extends Controller
{
    public function index(Request $request)
    {
        $teacherId = Auth::id();
        
        $query = TeacherInventory::where('teacher_id', $teacherId);
        
        if ($request->search) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('item_name', 'like', "%{$s}%")
                  ->orWhere('item_code', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }
        
        if ($request->category) {
            $query->where('category', $request->category);
        }
        
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $teacherId = Auth::id();
        
        $validated = $request->validate([
            'item_code' => 'required|unique:teacher_inventory,item_code,NULL,id,deleted_at,NULL',
            'item_name' => 'required',
            'description' => 'nullable',
            'category' => 'required',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'location' => 'nullable',
            'unit_price' => 'nullable|numeric|min:0',
            'acquisition_date' => 'nullable|date',
            'notes' => 'nullable',
            'status' => 'nullable|in:active,inactive,maintenance',
        ]);
        
        $validated['teacher_id'] = $teacherId;
        $validated['status'] = $validated['status'] ?? 'active';
        
        $item = TeacherInventory::create($validated);
        
        return response()->json($item, 201);
    }

    public function show(string $id)
    {
        $teacherId = Auth::id();
        
        $item = TeacherInventory::where('teacher_id', $teacherId)
                                ->findOrFail($id);
        
        return response()->json($item);
    }

    public function update(Request $request, string $id)
    {
        $teacherId = Auth::id();
        
        $item = TeacherInventory::where('teacher_id', $teacherId)
                                ->findOrFail($id);
        
        $validated = $request->validate([
            'item_code' => 'sometimes|unique:teacher_inventory,item_code,' . $id . ',id,deleted_at,NULL',
            'item_name' => 'sometimes',
            'description' => 'nullable',
            'category' => 'sometimes',
            'quantity' => 'sometimes|integer|min:1',
            'condition' => 'sometimes|in:excellent,good,fair,poor,damaged',
            'location' => 'nullable',
            'unit_price' => 'nullable|numeric|min:0',
            'acquisition_date' => 'nullable|date',
            'notes' => 'nullable',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);
        
        $item->update($validated);
        
        return response()->json($item);
    }

    public function destroy(string $id)
    {
        $teacherId = Auth::id();
        
        $item = TeacherInventory::where('teacher_id', $teacherId)
                                ->findOrFail($id);
        
        $item->delete();
        
        return response()->json(null, 204);
    }

    public function categories()
    {
        $teacherId = Auth::id();
        
        $categories = TeacherInventory::where('teacher_id', $teacherId)
                                      ->whereNotNull('category')
                                      ->where('category', '!=', '')
                                      ->distinct()
                                      ->pluck('category');
        
        return response()->json($categories);
    }

    public function statistics()
    {
        $teacherId = Auth::id();
        
        $stats = [
            'total_items' => TeacherInventory::where('teacher_id', $teacherId)->count(),
            'total_quantity' => TeacherInventory::where('teacher_id', $teacherId)->sum('quantity'),
            'by_status' => TeacherInventory::where('teacher_id', $teacherId)
                                          ->selectRaw('status, count(*) as count')
                                          ->groupBy('status')
                                          ->pluck('count', 'status'),
            'by_condition' => TeacherInventory::where('teacher_id', $teacherId)
                                             ->selectRaw('condition, count(*) as count')
                                             ->groupBy('condition')
                                             ->pluck('count', 'condition'),
        ];
        
        return response()->json($stats);
    }
}
