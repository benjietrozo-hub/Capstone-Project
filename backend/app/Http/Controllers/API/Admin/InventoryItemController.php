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

        $items = $query->latest()->paginate($request->get('per_page', 50));
        return response()->json($items);
    }

    public function store(Request $request)
    {
        \Log::info('InventoryItem@store request:', $request->all());
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'item_name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:inventory_items,serial_number',
            'property_number' => 'nullable|string|unique:inventory_items,property_number',
            'item_image' => 'nullable|image|max:2048',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'status' => 'required|in:available,borrowed,maintenance,damaged,archived',
            'date_acquired' => 'nullable|date',
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
            'status' => 'required|in:available,borrowed,maintenance,damaged,archived',
            'property_number' => 'nullable|string|unique:inventory_items,property_number',
            'date_acquired' => 'nullable|date',
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
            'item_image' => 'nullable|image|max:2048',
            'condition' => 'sometimes|in:excellent,good,fair,poor,damaged',
            'status' => 'sometimes|in:available,borrowed,maintenance,damaged,archived',
            'date_acquired' => 'nullable|date',
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
