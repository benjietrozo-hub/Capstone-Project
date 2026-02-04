# ✅ Approve Request 500 Error Fixed

## Problem
When admin tried to approve a borrow request, the system returned a 500 Internal Server Error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'quantity_approved' in 'field list'
```

## Root Cause
The `ToolEquipment` model's `updateQuantities()` method was trying to sum a non-existent column `quantity_approved`. 

**Database Reality:**
- ✅ Has: `quantity_requested`
- ❌ Does NOT have: `quantity_approved`

The database table `borrow_requests` only stores `quantity_requested` - there is no separate approval quantity since admins approve the full requested amount.

## Fix Applied

### Backend Fix (`backend/app/Models/ToolEquipment.php`)
Changed the `updateQuantities()` method to use the correct column:

**Before:**
```php
public function updateQuantities()
{
    $this->quantity_borrowed = $this->borrowRequests()
        ->whereIn('status', ['approved', 'borrowed'])
        ->sum('quantity_approved'); // ❌ Column doesn't exist
    
    $this->quantity_available = $this->quantity_total - $this->quantity_borrowed;
    $this->save();
}
```

**After:**
```php
public function updateQuantities()
{
    $this->quantity_borrowed = $this->borrowRequests()
        ->whereIn('status', ['approved', 'borrowed'])
        ->sum('quantity_requested'); // ✅ Correct column
    
    $this->quantity_available = $this->quantity_total - $this->quantity_borrowed;
    $this->save();
}
```

### Frontend Fix (`frontend/src/pages/admin/ReservationsPage.tsx`)
Updated the borrowed items display to use `quantity_requested` instead of the non-existent `quantity_approved`:

**Before:**
```tsx
{item.quantity_approved || item.quantity_requested}
```

**After:**
```tsx
{item.quantity_requested}
```

## How It Works Now

### Approval Flow:
1. Teacher submits request with `quantity_requested`
2. Admin approves the request (no quantity input needed)
3. System updates status to "approved"
4. `updateQuantities()` calculates borrowed quantity using `quantity_requested`
5. Item's `quantity_available` is updated correctly

### Quantity Calculation:
```
quantity_borrowed = SUM(quantity_requested WHERE status IN ['approved', 'borrowed'])
quantity_available = quantity_total - quantity_borrowed
```

## Testing
To verify the fix:
1. Login as teacher
2. Submit a borrow request for any item
3. Login as admin (benjie.trozo@csucc.edu.ph)
4. Go to Reservations → Borrow Requests tab
5. Click "Approve" on the pending request
6. Add optional notes and click "Approve Request"
7. ✅ Request should be approved successfully without errors
8. Check Borrowed List tab - item should appear with correct quantity
9. Check inventory - available quantity should be reduced correctly

## Status
✅ **FIXED** - Approve functionality now works correctly
