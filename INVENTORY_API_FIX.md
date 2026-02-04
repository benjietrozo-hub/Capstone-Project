# Inventory API Fix ✅

## Issue

Admin couldn't fetch inventory lists from the API.

## Root Cause

The `condition` column doesn't exist in the database - it's actually named `condition_status`. The model had an accessor to map it, but it wasn't being included in JSON responses.

## Solution

### 1. Updated Model Accessor
Fixed the `getConditionAttribute()` method to properly return the `condition_status` value:

```php
public function getConditionAttribute()
{
    return $this->attributes['condition_status'] ?? null;
}
```

### 2. Added to JSON Output
Added `condition` to the `$appends` array so it's included in API responses:

```php
protected $appends = ['condition'];
```

### 3. Updated Fillable Array
Ensured `condition_status` is in the fillable array:

```php
protected $fillable = [
    // ... other fields
    'condition_status', // Actual column name
    // ...
];
```

## Testing Results

### API Endpoint Test
```
✓ Response status: 200
✓ Total items: 8
✓ Per page: 50
✓ Items in response: 8

Sample item:
- ID: 9
- Code: ITEM0009
- Name: cp
- Category: Equipment
- Available: 2/2
- Condition: Good  ← Now showing!
- Status: active
```

### Direct Model Test
```
✓ Found 8 items
✓ Paginated query works
✓ All required columns exist
✓ Condition accessor works
```

## What Was Fixed

1. ✅ Model accessor for `condition` attribute
2. ✅ Added `condition` to JSON output via `$appends`
3. ✅ Proper column mapping (`condition_status` → `condition`)
4. ✅ API endpoint returns complete data

## Current Status

- **Total Items**: 8
- **API Status**: Working ✅
- **Condition Field**: Showing correctly ✅
- **All Fields**: Present in response ✅

## Files Modified

1. **backend/app/Models/ToolEquipment.php**
   - Fixed `getConditionAttribute()` method
   - Added `protected $appends = ['condition']`
   - Updated fillable array

## Verification

Run these commands to verify:

```bash
cd backend

# Test model
php test-inventory-model.php

# Test API endpoint
php test-inventory-endpoint.php

# Check system status
php fix-all-issues.php
```

## API Response Example

```json
{
  "data": [
    {
      "id": 1,
      "item_code": "ITEM0001",
      "item_name": "Electric Drill",
      "category": "Tool",
      "quantity_total": 5,
      "quantity_available": 5,
      "quantity_borrowed": 0,
      "condition": "Good",
      "status": "active",
      "location": "Lab 1",
      "unit_price": "50.00"
    }
  ],
  "total": 8,
  "per_page": 50,
  "current_page": 1
}
```

## Status: ✅ FIXED

Admin can now fetch inventory lists successfully!

---

**Fixed:** February 3, 2026
**Issue:** Condition field not in JSON response
**Solution:** Added to $appends array
**Status:** Working
