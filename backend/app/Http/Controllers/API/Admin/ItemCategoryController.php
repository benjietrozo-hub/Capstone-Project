<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemCategory;
use App\Models\CustomField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ItemCategoryController extends Controller
{
    public function index()
    {
        // Load categories along with custom fields and total counts
        $categories = ItemCategory::with('customFields')
            ->withCount('inventoryItems as total_items')
            ->withCount(['inventoryItems as available_items' => function ($query) {
                $query->where('status', 'available');
            }])
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|unique:item_categories,category_name',
            'description' => 'nullable|string',
            'category_image' => 'nullable|image|max:2048',
            'custom_fields' => 'nullable|array',
            'custom_fields.*.field_name' => 'required|string',
            'custom_fields.*.field_type' => 'required|string|in:text,number,date,boolean',
            'custom_fields.*.is_required' => 'boolean',
        ]);

        if ($request->hasFile('category_image')) {
            $validated['category_image'] = $request->file('category_image')->store('categories', 'public');
        }

        $category = ItemCategory::create([
            'category_name' => $validated['category_name'],
            'description' => $validated['description'] ?? null,
            'category_image' => $validated['category_image'] ?? null,
        ]);

        // Create initial custom fields if provided
        if (!empty($validated['custom_fields'])) {
            foreach ($validated['custom_fields'] as $field) {
                $category->customFields()->create($field);
            }
        }

        return response()->json($category->load('customFields'), 201);
    }

    public function show($id)
    {
        $category = ItemCategory::with('customFields')
            ->withCount('inventoryItems as total_items')
            ->withCount(['inventoryItems as available_items' => function ($query) {
                $query->where('status', 'available');
            }])
            ->findOrFail($id);

        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = ItemCategory::findOrFail($id);

        $validated = $request->validate([
            'category_name' => 'sometimes|string|unique:item_categories,category_name,' . $category->id,
            'description' => 'nullable|string',
            'category_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('category_image')) {
            if ($category->category_image) {
                Storage::disk('public')->delete($category->category_image);
            }
            $validated['category_image'] = $request->file('category_image')->store('categories', 'public');
        }

        $category->update($validated);

        return response()->json($category->load('customFields'));
    }

    public function destroy($id)
    {
        $category = ItemCategory::findOrFail($id);

        // Check if there are active inventory items
        $hasItems = $category->inventoryItems()->exists();
        if ($hasItems) {
            return response()->json(['message' => 'Cannot delete category containing inventory items. Delete items first.'], 400);
        }

        $category->deleted_by = auth()->id();
        $category->save();
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    // --- Custom Fields Management ---
    
    public function addCustomField(Request $request, $categoryId)
    {
        $category = ItemCategory::findOrFail($categoryId);

        $validated = $request->validate([
            'field_name' => 'required|string',
            'field_type' => 'required|string|in:text,number,date,boolean',
            'is_required' => 'boolean',
        ]);

        // Check if field name already exists in this category
        $exists = $category->customFields()->where('field_name', $validated['field_name'])->exists();
        if ($exists) {
            return response()->json(['message' => 'A field with this name already exists in this category'], 422);
        }

        $field = $category->customFields()->create($validated);

        return response()->json($field, 201);
    }

    public function deleteCustomField($categoryId, $fieldId)
    {
        $category = ItemCategory::findOrFail($categoryId);
        $field = $category->customFields()->findOrFail($fieldId);
        
        $field->delete();

        return response()->json(['message' => 'Custom field deleted']);
    }
}
