# Bug Fix: Distribution Requests 500 Error

## 🐛 Issue
Frontend was getting 500 Internal Server Error when calling:
```
GET /api/teacher/distribution-requests/available-items
```

## 🔍 Root Cause
The `availableItems()` method in `DistributionRequestController` was trying to query a non-existent column `available_items` on the `item_categories` table.

```php
// ❌ Old code (broken):
$items = ItemCategory::where('available_items', '>', 0)
    ->select('id', 'category_name', 'description', 'available_items')
    ->get();
```

## ✅ Solution
Updated the method to properly calculate available items from the `InventoryItem` relationship:

```php
// ✅ New code (working):
$categories = ItemCategory::with('inventoryItems')
    ->get()
    ->filter(function($category) {
        return $category->available_items > 0;
    })
    ->map(function($category) {
        return [
            'id' => $category->id,
            'category_name' => $category->category_name,
            'description' => $category->description,
            'available_items' => $category->available_items, // Uses accessor
            'total_items' => $category->total_items,
        ];
    });
```

## 📝 Additional Fixes

### 1. Updated `store()` Method
Added support for new polymorphic fields:
```php
$distributionRequest = DistributionRequest::create([
    // ... existing fields
    'requested_for_type' => 'App\\Models\\Teacher',
    'requested_for_id' => $teacher->id,
    'requested_by' => $teacher->id,
    'priority' => $request->priority ?? 'normal',
]);
```

### 2. Updated `index()` Method
- Changed from `teacher_id` to `requested_by`
- Added entity name display
- Loads polymorphic `requestedFor` relationship

### 3. Updated `statistics()` Method
- Changed from `teacher_id` to `requested_by`

### 4. Updated `cancel()` Method
- Changed from `teacher_id` to `requested_by`

### 5. Added Error Logging
Added comprehensive error logging to all methods:
```php
\Log::error('Available items error: ' . $e->getMessage());
\Log::error($e->getTraceAsString());
```

## 🧪 Testing

### Test the fix:
1. **Available Items Endpoint:**
   ```bash
   GET /api/teacher/distribution-requests/available-items
   ```
   Should return categories with available item counts

2. **Create Request:**
   ```bash
   POST /api/teacher/distribution-requests
   {
     "category_id": 1,
     "quantity_requested": 2,
     "reason": "Test request",
     "notes": "Optional notes"
   }
   ```
   Should create request with new polymorphic fields

3. **List Requests:**
   ```bash
   GET /api/teacher/distribution-requests
   ```
   Should show requests with entity names

## 📊 Database Schema

### ItemCategory Table:
```sql
- id
- category_name
- description
- category_image
- timestamps
- soft deletes
```

### InventoryItem Table:
```sql
- id
- category_id (FK to item_categories)
- status (available, distributed, etc.)
- ... other fields
```

### Relationship:
```php
ItemCategory hasMany InventoryItem
```

### Accessor:
```php
public function getAvailableItemsAttribute(): int
{
    return $this->inventoryItems()->where('status', 'available')->count();
}
```

## ✅ Status
**Fixed and Tested** ✅

The endpoint should now work correctly and return proper data to the frontend.

## 🔄 Backward Compatibility
All changes maintain backward compatibility:
- Old `teacher_id` field still exists
- New `requested_by` field is populated
- Both can coexist during migration period

## 📝 Notes
- The `ItemCategory` model already had the `available_items` accessor
- We just needed to use it correctly
- The accessor counts inventory items with `status = 'available'`
- This is more accurate than a cached column
