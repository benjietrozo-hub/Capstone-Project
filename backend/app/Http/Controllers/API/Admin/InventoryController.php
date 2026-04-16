<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ToolEquipment;
use App\Models\InventoryLog;
use App\Models\SystemLog;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        \Log::info('=== INVENTORY INDEX CALLED ===');
        \Log::info('User:', ['user' => $request->user()]);
        \Log::info('Request params:', $request->all());
        
        $query = ToolEquipment::query();
        
        // Log initial count
        $initialCount = ToolEquipment::count();
        \Log::info('Total items in database:', ['count' => $initialCount]);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            \Log::info('Applying search filter:', ['search' => $search]);
            $query->where(function($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                  ->orWhere('item_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && !empty($request->category)) {
            \Log::info('Applying category filter:', ['category' => $request->category]);
            $query->where('category', $request->category);
        }

        if ($request->has('status') && !empty($request->status)) {
            \Log::info('Applying status filter:', ['status' => $request->status]);
            $query->where('status', $request->status);
        }

        if ($request->has('available') && $request->available) {
            \Log::info('Applying available filter');
            $query->where('quantity_available', '>', 0);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        \Log::info('Sorting:', ['sort_by' => $sortBy, 'sort_order' => $sortOrder]);
        
        // Handle year-based sorting with alphabetical secondary sort
        if ($sortBy === 'acquisition_year') {
            $query->byYearAndName($sortOrder, 'asc');
        } elseif ($sortBy === 'name_year') {
            $query->orderBy('item_name', $sortOrder)
                  ->orderByRaw('YEAR(acquisition_date) desc');
        } elseif ($sortBy === 'year_name_combined') {
            $primarySort = $request->get('primary_sort', 'acquisition_year');
            $secondarySort = $request->get('secondary_sort', 'item_name');
            $primaryOrder = $request->get('primary_order', 'desc');
            $secondaryOrder = $request->get('secondary_order', 'asc');
            $query->combinedSort($primarySort, $secondarySort, $primaryOrder, $secondaryOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Log the SQL query
        $sql = $query->toSql();
        $bindings = $query->getBindings();
        \Log::info('SQL Query:', ['sql' => $sql, 'bindings' => $bindings]);
        
        // Get count before pagination
        $countBeforePagination = $query->count();
        \Log::info('Count before pagination:', ['count' => $countBeforePagination]);

        $perPage = $request->get('per_page', 15);
        $items = $query->paginate($perPage);
        
        \Log::info('Paginated result:', [
            'total' => $items->total(),
            'count' => $items->count(),
            'per_page' => $items->perPage(),
        ]);

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:tools_equipment',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:50',
            'quantity_total' => 'required|integer|min:0',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'location' => 'nullable|string|max:255',
            'unit_price' => 'nullable|numeric|min:0',
            'acquisition_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('inventory', 'public');
        }

        $validated['quantity_available'] = $validated['quantity_total'];
        $validated['quantity_borrowed'] = 0;

        $item = ToolEquipment::create($validated);

        InventoryLog::create([
            'item_id' => $item->id,
            'action' => 'created',
            'user_id' => $request->user()->id,
            'user_type' => 'admin',
            'details' => 'Item created',
            'table_name' => 'tools_equipment',
            'record_id' => $item->id,
        ]);

        // Log to system logs
        $this->logActivity(
            'inventory_create',
            "Created new inventory item: {$item->item_name} ({$item->item_code})",
            'info'
        );

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $item = ToolEquipment::with(['borrowRequests', 'inventoryLogs'])->findOrFail($id);
        return response()->json($item);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = ToolEquipment::findOrFail($id);

        $validated = $request->validate([
            'item_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|string',
            'quantity_total' => 'sometimes|integer|min:0',
            'condition' => 'sometimes|in:excellent,good,fair,poor,damaged',
            'location' => 'nullable|string|max:255',
            'unit_price' => 'nullable|numeric|min:0',
            'acquisition_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,maintenance',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $validated['image'] = $request->file('image')->store('inventory', 'public');
        }

        if (isset($validated['quantity_total'])) {
            $validated['quantity_available'] = $validated['quantity_total'] - $item->quantity_borrowed;
        }

        $item->update($validated);

        InventoryLog::create([
            'item_id' => $item->id,
            'action' => 'updated',
            'user_id' => $request->user()->id,
            'user_type' => 'admin',
            'details' => 'Item updated',
            'table_name' => 'tools_equipment',
            'record_id' => $item->id,
        ]);

        // Log to system logs
        $this->logActivity(
            'inventory_update',
            "Updated inventory item: {$item->item_name} ({$item->item_code})",
            'info'
        );

        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = ToolEquipment::findOrFail($id);

        $activeBorrows = $item->borrowRequests()
            ->whereIn('status', ['approved', 'borrowed'])
            ->count();

        if ($activeBorrows > 0) {
            return response()->json([
                'message' => 'Cannot delete item with active borrow requests'
            ], 422);
        }

        // Set deleted_by before soft deleting
        $item->deleted_by = auth()->id();
        $item->save();
        $item->delete();

        // Log to system logs
        $this->logActivity(
            'inventory_delete',
            "Moved inventory item to trash: {$item->item_name} ({$item->item_code})",
            'warning'
        );

        return response()->json([
            'message' => 'Item moved to trash successfully'
        ], 200);
    }

    public function categories()
    {
        $categories = ToolEquipment::distinct('category')
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json($categories);
    }
}
