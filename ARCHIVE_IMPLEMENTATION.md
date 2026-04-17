# Archive Implementation - Replacing Trash Functionality

## Overview
Replaced "Trash" terminology with "Archive" throughout the system to better reflect the soft-delete functionality where items are preserved and can be restored.

## Changes Made

### 1. Controller Renamed
- **Old**: `TrashController.php`
- **New**: `ArchiveController.php`
- **Location**: `backend/app/Http/Controllers/API/Admin/`

### 2. Class Name Updated
- **Old**: `class TrashController`
- **New**: `class ArchiveController`

### 3. Method Names Updated
- **Old**: `emptyTrash()`
- **New**: `emptyArchive()`

### 4. API Routes Updated
All routes changed from `/trash` to `/archive`:

| Old Route | New Route |
|-----------|-----------|
| `GET /api/admin/trash` | `GET /api/admin/archive` |
| `GET /api/admin/trash/stats` | `GET /api/admin/archive/stats` |
| `POST /api/admin/trash/{type}/{id}/restore` | `POST /api/admin/archive/{type}/{id}/restore` |
| `DELETE /api/admin/trash/{type}/{id}` | `DELETE /api/admin/archive/{type}/{id}` |
| `DELETE /api/admin/trash/empty` | `DELETE /api/admin/archive/empty` |

### 5. Response Messages Updated
- "moved to trash" → "archived"
- "trashed items" → "archived items"
- "Trash emptied" → "Archive emptied"
- "deleted_at" → "archived_at" (in API responses)
- "deleted_by" → "archived_by" (in API responses)

### 6. Variable Names Updated
- `$trashedItems` → `$archivedItems`
- Comments updated to reflect archive terminology

## API Endpoints

### Get Archived Items
```
GET /api/admin/archive?type={type}&search={search}
```

**Parameters:**
- `type` (optional): Filter by type (all, inventory, suppliers, purchase_orders, borrow_requests, distribution_groups)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "inventory",
      "name": "Item Name",
      "code": "ITEM-001",
      "archived_at": "2026-04-17 10:00:00",
      "archived_by": "Admin Name",
      "details": {...}
    }
  ],
  "total": 10
}
```

### Get Archive Statistics
```
GET /api/admin/archive/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inventory": 5,
    "suppliers": 2,
    "purchase_orders": 3,
    "borrow_requests": 1,
    "distribution_groups": 2,
    "total": 13
  }
}
```

### Restore Archived Item
```
POST /api/admin/archive/{type}/{id}/restore
```

**Parameters:**
- `type`: Item type (inventory, supplier, purchase_order, borrow_request, distribution_group)
- `id`: Item ID

**Response:**
```json
{
  "success": true,
  "message": "Inventory restored successfully",
  "data": {...}
}
```

### Permanently Delete Archived Item
```
DELETE /api/admin/archive/{type}/{id}
```

**Parameters:**
- `type`: Item type
- `id`: Item ID

**Response:**
```json
{
  "success": true,
  "message": "Inventory permanently deleted"
}
```

### Empty Archive
```
DELETE /api/admin/archive/empty?type={type}
```

**Parameters:**
- `type` (optional): Type to empty (all, inventory, suppliers, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Archive emptied successfully. 10 items permanently deleted."
}
```

## Supported Item Types

1. **inventory** - Tools and Equipment
2. **supplier** - Suppliers
3. **purchase_order** - Purchase Orders
4. **borrow_request** - Borrow Requests
5. **distribution_group** - Distribution Groups

## Database Schema

The archive functionality uses Laravel's soft delete feature. Items are not actually deleted but marked with a `deleted_at` timestamp.

**Columns used:**
- `deleted_at` - Timestamp when item was archived
- `deleted_by` - ID of admin who archived the item

## Frontend Integration Notes

### Update API Calls
All frontend API calls need to be updated:

```javascript
// Old
fetch('/api/admin/trash')

// New
fetch('/api/admin/archive')
```

### Update UI Text
- "Trash" → "Archive"
- "Move to Trash" → "Archive"
- "Empty Trash" → "Empty Archive"
- "Restore from Trash" → "Restore from Archive"
- "Deleted" → "Archived"

### Update Icons
Consider using archive icons instead of trash/delete icons:
- 📦 Archive icon
- ↩️ Restore icon
- 🗑️ Permanent delete icon (keep for final deletion)

## Benefits of Archive vs Trash

1. **Better Terminology**: "Archive" implies preservation and potential restoration
2. **Professional**: More appropriate for business/educational systems
3. **Clear Intent**: Distinguishes between soft delete (archive) and hard delete (permanent)
4. **User Confidence**: Users feel safer knowing items are archived, not deleted

## Backward Compatibility

⚠️ **Breaking Changes**: This update changes API endpoints. Frontend applications must be updated to use the new `/archive` endpoints instead of `/trash`.

## Testing Checklist

- [ ] Test archiving items of each type
- [ ] Test restoring archived items
- [ ] Test searching archived items
- [ ] Test filtering by type
- [ ] Test archive statistics
- [ ] Test emptying archive (all types)
- [ ] Test emptying archive (specific type)
- [ ] Test permanent deletion
- [ ] Verify `archived_by` is recorded correctly
- [ ] Verify `archived_at` timestamp is correct

## Files Modified

1. `backend/app/Http/Controllers/API/Admin/TrashController.php` → `ArchiveController.php`
2. `backend/routes/api.php`
3. `backend/app/Http/Controllers/API/DistributionGroupController.php`
4. `backend/app/Http/Controllers/API/Admin/DistributionListController.php`

## Date Implemented
April 17, 2026
