<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\SystemLog;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
                  ->orWhere('custom_attributes', 'like', "%{$search}%");
            });
        }

        $items = $query->latest()->paginate($request->get('per_page', 50));
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'item_name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:inventory_items,serial_number',
            'property_number' => 'nullable|string|unique:inventory_items,property_number',
            'item_image' => 'nullable|image|max:2048',
            'condition' => 'required|in:excellent,good,fair,poor,damaged',
            'status' => 'required|in:available,borrowed,maintenance,damaged,archived',
            'date_acquired' => 'nullable|date',
            'custom_attributes' => 'nullable|array',
        ]);

        if ($request->hasFile('item_image')) {
            $validated['item_image'] = $request->file('item_image')->store('serialized_items', 'public');
        }

        $item = InventoryItem::create($validated);

        $this->logActivity(
            'serialized_inventory_create',
            "Created serialized item: {$item->serial_number}",
            'info'
        );

        return response()->json($item->load('category'), 201);
    }

    public function show($id)
    {
        $item = InventoryItem::with('category')->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
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
