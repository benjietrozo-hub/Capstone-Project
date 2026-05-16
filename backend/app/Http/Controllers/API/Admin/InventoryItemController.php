<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\SystemLog;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class InventoryItemController extends Controller
{
    use LogsActivity;

    public function index(Request $request)
    {
        $query = InventoryItem::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', "%{$search}%")
                  ->orWhere('property_number', 'like', "%{$search}%")
                  ->orWhere('item_name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('custom_attributes', 'like', "%{$search}%");
            });
        }

        // Default Sorting: Chronological (Oldest First) then Alphabetical (A-Z)
        $query->orderBy('date_acquired', 'asc')
              ->orderBy('item_name', 'asc');

        $items = $query->paginate($request->get('per_page', 50));
        return response()->json($items);

    }

    public function masterList(Request $request)
    {
        $query = InventoryItem::query()
            ->join('item_categories', 'inventory_items.category_id', '=', 'item_categories.id')
            ->select([
                'inventory_items.category_id',
                'item_categories.parent_category',
                'item_categories.category_name',
                'inventory_items.item_name',
                'inventory_items.unit',
                'inventory_items.description',
                'inventory_items.date_acquired',
                'inventory_items.unit_price',
                'inventory_items.source_of_fund',
                'inventory_items.remarks',
                DB::raw('COUNT(inventory_items.id) as quantity'),
                DB::raw('MIN(inventory_items.id) as first_item_id'),
            ])
            ->whereNull('inventory_items.deleted_at');

        if ($request->filled('category_id')) {
            $query->where('inventory_items.category_id', $request->category_id);
        }

        if ($request->filled('parent_category')) {
            $query->where('item_categories.parent_category', $request->parent_category);
        }

        if ($request->filled('source_of_fund')) {
            $query->where('inventory_items.source_of_fund', $request->source_of_fund);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('inventory_items.date_acquired', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('inventory_items.date_acquired', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('inventory_items.item_name', 'like', "%{$search}%")
                    ->orWhere('inventory_items.description', 'like', "%{$search}%")
                    ->orWhere('inventory_items.source_of_fund', 'like', "%{$search}%")
                    ->orWhere('inventory_items.remarks', 'like', "%{$search}%")
                    ->orWhere('item_categories.category_name', 'like', "%{$search}%")
                    ->orWhere('item_categories.parent_category', 'like', "%{$search}%");
            });
        }

        $query->groupBy([
            'inventory_items.category_id',
            'item_categories.parent_category',
            'item_categories.category_name',
            'inventory_items.item_name',
            'inventory_items.unit',
            'inventory_items.description',
            'inventory_items.date_acquired',
            'inventory_items.unit_price',
            'inventory_items.source_of_fund',
            'inventory_items.remarks',
        ])
            ->orderBy('item_categories.parent_category')
            ->orderBy('item_categories.category_name')
            ->orderBy('inventory_items.item_name')
            ->orderBy('inventory_items.date_acquired');

        return response()->json($query->paginate($request->get('per_page', 25)));
    }

    public function updateMasterListGroup(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'item_name' => 'required|string|max:255',
            'current_unit' => 'nullable|string|max:50',
            'current_description' => 'nullable|string',
            'current_date_acquired' => 'nullable|date',
            'current_unit_price' => 'nullable|numeric|min:0',
            'current_source_of_fund' => 'nullable|string|max:255',
            'current_remarks' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'date_acquired' => 'nullable|date',
            'unit_price' => 'nullable|numeric|min:0',
            'source_of_fund' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        $query = InventoryItem::where('category_id', $validated['category_id'])
            ->where('item_name', $validated['item_name'])
            ->whereNull('deleted_at');

        $nullableFields = [
            'unit' => 'current_unit',
            'description' => 'current_description',
            'date_acquired' => 'current_date_acquired',
            'unit_price' => 'current_unit_price',
            'source_of_fund' => 'current_source_of_fund',
            'remarks' => 'current_remarks',
        ];

        foreach ($nullableFields as $column => $requestKey) {
            if (array_key_exists($requestKey, $validated) && $validated[$requestKey] !== null && $validated[$requestKey] !== '') {
                $query->where($column, $validated[$requestKey]);
            } else {
                $query->whereNull($column);
            }
        }

        $updatedCount = $query->update([
            'unit' => $validated['unit'] ?? null,
            'description' => $validated['description'] ?? null,
            'date_acquired' => $validated['date_acquired'] ?? null,
            'unit_price' => $validated['unit_price'] ?? null,
            'source_of_fund' => $validated['source_of_fund'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $this->logActivity(
            'master_inventory_update',
            "Updated master inventory metadata for {$validated['item_name']} ({$updatedCount} serialized unit(s))",
            'info'
        );

        return response()->json([
            'message' => 'Master inventory row updated successfully',
            'updated_count' => $updatedCount,
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('InventoryItem@store request:', $request->all());
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'item_name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:inventory_items,serial_number',
            'property_number' => 'nullable|string|unique:inventory_items,property_number',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'item_image' => 'nullable|image|max:2048',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'status' => 'required|in:available,borrowed,distributed,maintenance,damaged,archived,disposed,lost,ready_for_disposal',
            'date_acquired' => 'nullable|date',
            'unit_price' => 'nullable|numeric|min:0',
            'source_of_fund' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'lifespan_years' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'custom_attributes' => 'nullable|array',

        ]);

        if ($request->hasFile('item_image')) {
            $validated['item_image'] = $request->file('item_image')->store('serialized_items', 'public');
        }

        $item = InventoryItem::create($validated);

        // Auto-generate Property Number if not provided
        if (empty($item->property_number)) {
            $item->property_number = 'AST-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
            $item->save();
        }

        $this->logActivity(
            'serialized_inventory_create',
            "Created serialized item: {$item->serial_number}",
            'info'
        );

        return response()->json($item->load('category'), 201);
    }

    public function bulkStore(Request $request)
    {
        \Log::info('InventoryItem@bulkStore request:', $request->all());
        
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'item_name' => 'required|string|max:255',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'status' => 'required|in:available,borrowed,distributed,maintenance,damaged,archived,disposed,lost,ready_for_disposal',
            'property_number' => 'nullable|string|unique:inventory_items,property_number',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'date_acquired' => 'nullable|date',
            'unit_price' => 'nullable|numeric|min:0',
            'source_of_fund' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'lifespan_years' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'custom_attributes' => 'nullable|array',

            'item_image' => 'nullable|image|max:2048',
            'serial_numbers' => 'required|array|min:1',
            'serial_numbers.*' => 'required|string|unique:inventory_items,serial_number',
        ]);

        $imagePath = null;
        if ($request->hasFile('item_image')) {
            $imagePath = $request->file('item_image')->store('serialized_items', 'public');
        }

        $createdItems = [];

        DB::beginTransaction();
        try {
            foreach ($validated['serial_numbers'] as $serial) {
                $itemData = $validated;
                unset($itemData['serial_numbers']);
                $itemData['serial_number'] = $serial;
                $itemData['item_image'] = $imagePath;

                $item = InventoryItem::create($itemData);

                // Auto-generate Property Number if not provided
                if (empty($item->property_number)) {
                    $item->property_number = 'AST-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
                    $item->save();
                }
                
                $createdItems[] = $item;
            }

            $count = count($createdItems);
            $this->logActivity(
                'serialized_inventory_bulk_create',
                "Bulk created {$count} items for category ID: {$validated['category_id']}",
                'info'
            );

            DB::commit();
            return response()->json([
                'message' => "Successfully created {$count} items",
                'items' => $createdItems
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            return response()->json(['message' => 'Error during bulk creation: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $item = InventoryItem::with('category')->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        \Log::info('InventoryItem@update request:', $request->all());
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:item_categories,id',
            'item_name' => 'sometimes|string|max:255',
            'serial_number' => 'sometimes|string|unique:inventory_items,serial_number,' . $item->id,
            'property_number' => 'nullable|string|unique:inventory_items,property_number,' . $item->id,
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'item_image' => 'nullable|image|max:2048',
            'condition' => 'sometimes|in:excellent,good,fair,poor,damaged',
            'status' => 'sometimes|in:available,borrowed,distributed,maintenance,damaged,archived,disposed,lost,ready_for_disposal',
            'date_acquired' => 'nullable|date',
            'unit_price' => 'nullable|numeric|min:0',
            'source_of_fund' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'lifespan_years' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'custom_attributes' => 'nullable|array',

        ]);

        if ($request->hasFile('item_image')) {
            if ($item->item_image) {
                Storage::disk('public')->delete($item->item_image);
            }
            $validated['item_image'] = $request->file('item_image')->store('serialized_items', 'public');
        }

        $item->update($validated);

        $this->logActivity(
            'serialized_inventory_update',
            "Updated serialized item: {$item->serial_number}",
            'info'
        );

        return response()->json($item->load('category'));
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);

        if ($item->status === 'borrowed') {
            return response()->json(['message' => 'Cannot delete a borrowed item.'], 400);
        }

        $item->deleted_by = auth()->id();
        $item->save();
        $item->delete();

        $this->logActivity(
            'serialized_inventory_delete',
            "Deleted serialized item: {$item->serial_number}",
            'warning'
        );

        return response()->json(['message' => 'Serialized Item deleted successfully']);
    }
}
