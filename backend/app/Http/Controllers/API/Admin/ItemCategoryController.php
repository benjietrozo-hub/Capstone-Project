<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemCategory;
use App\Models\CustomField;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ItemCategoryController extends Controller
{
    public function index(Request $request)
    {
        // Load categories along with custom fields and total counts
        $categories = ItemCategory::with('customFields')
            ->withCount('inventoryItems as total_items')
            ->withCount(['inventoryItems as available_items' => function ($query) {
                $query->where('status', 'available');
            }])
            ->get();

        if ($request->has('parent_category')) {
            $parentCat = $request->query('parent_category');
            if ($parentCat === 'Uncategorized') {
                $categories = $categories->whereNull('parent_category')->values();
            } else {
                $categories = $categories->where('parent_category', $parentCat)->values();
            }
        }

        return response()->json($categories);
    }

    public function parentCategories()
    {
        $parents = ItemCategory::selectRaw('COALESCE(parent_category, "Uncategorized") as parent_category')
            ->selectRaw('COUNT(item_categories.id) as kind_count')
            ->selectRaw('SUM((SELECT COUNT(*) FROM inventory_items WHERE inventory_items.category_id = item_categories.id AND inventory_items.deleted_at IS NULL)) as item_count')
            ->leftJoin('master_categories', function($join) {
                $join->on(DB::raw('COALESCE(item_categories.parent_category, "Uncategorized")'), '=', 'master_categories.name');
            })
            ->addSelect('master_categories.description', 'master_categories.image')
            ->groupBy('parent_category', 'master_categories.description', 'master_categories.image')
            ->get();

        return response()->json($parents);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_category' => 'nullable|string',
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
            'parent_category' => $validated['parent_category'] ?? null,
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
            'parent_category' => 'nullable|string',
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

        // Update custom fields if provided
        if ($request->has('custom_fields')) {
            // For simplicity in the serialized array, we'll replace existing ones
            // In a production app, you might want to match by ID to preserve data
            $category->customFields()->delete();
            foreach ($request->custom_fields as $field) {
                $category->customFields()->create($field);
            }
        }

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

    public function renameParentCategory(Request $request)
    {
        $validated = $request->validate([
            'old_name' => 'required|string',
            'new_name' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $oldName = $validated['old_name'] === 'Uncategorized' ? null : $validated['old_name'];
        $newName = $validated['new_name'];

        // Update name in all ItemCategories
        ItemCategory::where('parent_category', $oldName)
            ->update(['parent_category' => $newName]);

        // Handle MasterCategory metadata
        $master = MasterCategory::where('name', $oldName)->first();
        if (!$master && $oldName !== null) {
            $master = new MasterCategory(['name' => $newName]);
        } elseif ($master) {
            $master->name = $newName;
        }

        if ($master) {
            $master->description = $validated['description'] ?? $master->description;
            
            if ($request->hasFile('image')) {
                if ($master->image) {
                    Storage::disk('public')->delete($master->image);
                }
                $master->image = $request->file('image')->store('master_categories', 'public');
            }
            
            $master->save();
        } else if ($oldName === null) {
            // Special case for Uncategorized if they want to give it a name/desc
            $master = MasterCategory::updateOrCreate(
                ['name' => $newName],
                [
                    'description' => $validated['description'] ?? null,
                    'image' => $request->hasFile('image') ? $request->file('image')->store('master_categories', 'public') : null
                ]
            );
        }

        return response()->json(['message' => 'Master category updated successfully']);
    }
}
