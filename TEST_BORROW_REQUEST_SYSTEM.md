# Test Borrow Request System - Quick Guide

## 🧪 Quick Test Steps

### Prerequisites
1. Backend server running: `php artisan serve` (in backend folder)
2. Frontend server running: `npm run dev` (in frontend folder)
3. Admin account: `benjie.trozo@csucc.edu.ph`
4. At least one teacher account registered
5. At least one inventory item with available quantity

---

## Test 1: Submit Borrow Request (Teacher)

### Steps:
1. **Login as Teacher**
   - Go to login page
   - Enter teacher credentials
   - Click Login

2. **Browse Inventory**
   - Click "Browse Inventory" in sidebar (or go to `/teacher/inventory`)
   - You should see available items in card or list view
   - Find an item with `quantity_available > 0`

3. **Submit Request**
   - Click "Borrow" button on an item
   - Modal should open with form
   - Fill in:
     - Quantity: `1` (or any number ≤ available quantity)
     - Purpose: `Testing borrow request system`
     - Expected Return Date: Select tomorrow's date
   - Click "Submit Request"
   - Should see success toast: "Borrow request submitted successfully"

4. **Verify Request**
   - Click "My Reservations" in sidebar (or go to `/teacher/reservations`)
   - Click "My Borrow Requests" tab
   - Should see your request with status "pending"
   - Note the Request Code (e.g., BR-20260203-0001)

---

## Test 2: Approve Request (Admin)

### Steps:
1. **Login as Admin**
   - Logout from teacher account
   - Login with: `benjie.trozo@csucc.edu.ph`

2. **View Pending Requests**
   - Click "Reservations" in sidebar (or go to `/admin/reservations`)
   - Click "Borrow Requests" tab
   - Should see the teacher's pending request

3. **Approve Request**
   - Click "✓ Approve" button
   - Modal should open with form
   - Fill in:
     - Quantity to Approve: `1` (or the requested quantity)
     - Expected Return Date: Select a future date
     - Admin Notes: `Approved for testing` (optional)
   - Click "Approve"
   - Should see success toast: "Request approved successfully"

4. **Verify Approval**
   - Request should disappear from "Borrow Requests" tab
   - Go to "Borrowed List" tab
   - Should see the approved request (status: approved, not yet borrowed)

---

## Test 3: Issue Item (Admin)

### Steps:
1. **Still logged in as Admin**
   - Stay on Reservations page
   - "Borrowed List" tab

2. **Issue the Item**
   - Find the approved request
   - Click "📥 Mark as Returned" button (this will be updated to "Issue" in future)
   - For now, the system auto-issues when approved

3. **Verify Inventory Update**
   - Go to "Inventory" in sidebar
   - Find the borrowed item
   - Check that `quantity_available` decreased by the approved quantity
   - Check that `quantity_borrowed` increased

---

## Test 4: View Borrowed Item (Teacher)

### Steps:
1. **Login as Teacher**
   - Logout from admin account
   - Login with teacher credentials

2. **Check Borrowed Items**
   - Go to "My Reservations"
   - Click "My Borrowed Items" tab
   - Should see the approved item with status "borrowed"
   - Note the Expected Return Date

3. **Check Request Details**
   - Click "My Borrow Requests" tab
   - Find the request
   - Click "View" button
   - Should see:
     - Request Code
     - Item name
     - Quantity Requested and Approved
     - Purpose
     - Status: "borrowed"
     - Admin Notes (if any)

---

## Test 5: Return Item (Admin)

### Steps:
1. **Login as Admin**
   - Go to Reservations → Borrowed List tab

2. **Mark as Returned**
   - Find the borrowed item
   - Click "📥 Mark as Returned"
   - Confirm the action
   - Should see success toast: "Item returned successfully"

3. **Verify Return**
   - Item should disappear from "Borrowed List"
   - Go to Inventory
   - Check that `quantity_available` increased back
   - Check that `quantity_borrowed` decreased

4. **Verify Teacher Side**
   - Login as teacher
   - Go to My Reservations → My Borrow Requests
   - Find the request
   - Status should be "returned"

---

## Test 6: Reject Request (Admin)

### Steps:
1. **Teacher**: Submit another borrow request (follow Test 1)

2. **Admin**: Login and go to Reservations → Borrow Requests

3. **Reject Request**
   - Click "✕ Reject" button
   - Modal opens
   - Enter reason: `Item not available for requested period`
   - Click "Reject"
   - Should see success toast

4. **Verify Rejection**
   - Request disappears from pending list
   - Login as teacher
   - Go to My Reservations → My Borrow Requests
   - Find the request
   - Status should be "rejected"
   - Click "View" to see admin's rejection reason

---

## Test 7: Cancel Request (Teacher)

### Steps:
1. **Teacher**: Submit a borrow request

2. **Cancel Before Approval**
   - Go to My Reservations → My Borrow Requests
   - Find the pending request
   - Click "Cancel" button
   - Confirm cancellation
   - Should see success toast

3. **Verify Cancellation**
   - Request status should change to "cancelled"
   - Admin should not see this request in pending list

---

## 🔍 What to Check

### After Each Test:

✅ **Success Messages**
- Toast notifications appear correctly
- Messages are clear and informative

✅ **Status Updates**
- Request status changes correctly
- Status badges display proper colors

✅ **Inventory Quantities**
- `quantity_available` updates when approved/returned
- `quantity_borrowed` reflects active borrows
- Total quantity remains constant

✅ **Data Display**
- Teacher names show correctly (first_name + middle_initial + last_name)
- Item names and codes display properly
- Dates format correctly
- Request codes generate properly (BR-YYYYMMDD-####)

✅ **Permissions**
- Teachers can only see their own requests
- Teachers cannot approve/reject/return
- Admins can see all requests
- Admins can perform all actions

---

## 🐛 Common Issues to Watch For

### Issue 1: "Failed to submit request"
**Possible Causes**:
- Item not available (quantity_available = 0)
- Item status is not "active"
- Expected return date is in the past
- Backend server not running

**Solution**: Check browser console and Laravel logs

### Issue 2: "Failed to approve request"
**Possible Causes**:
- Insufficient quantity available
- Expected return date is in the past
- Request already approved/rejected

**Solution**: Check the item's available quantity

### Issue 3: Teacher name shows as "N/A"
**Possible Causes**:
- Teacher model not appending full_name
- Teacher relationship not loaded

**Solution**: Verify `protected $appends = ['full_name'];` in Teacher model

### Issue 4: Inventory quantities not updating
**Possible Causes**:
- `updateQuantities()` method not called
- Database transaction failed

**Solution**: Check Laravel logs for errors

---

## 📊 Expected Results Summary

| Action | Teacher View | Admin View | Inventory |
|--------|-------------|------------|-----------|
| Submit Request | Status: pending | Shows in Borrow Requests | No change |
| Approve Request | Status: approved | Moves to Borrowed List | Available ↓, Borrowed ↑ |
| Issue Item | Status: borrowed | Shows in Borrowed List | No change |
| Return Item | Status: returned | Removed from Borrowed List | Available ↑, Borrowed ↓ |
| Reject Request | Status: rejected | Removed from requests | No change |
| Cancel Request | Status: cancelled | Not visible | No change |

---

## ✅ Success Criteria

The system is working correctly if:

1. ✅ Teachers can browse and request items
2. ✅ Admins receive and can approve/reject requests
3. ✅ Inventory quantities update automatically
4. ✅ Status transitions work correctly
5. ✅ Both teacher and admin see accurate data
6. ✅ All modals and forms work properly
7. ✅ Toast notifications appear for all actions
8. ✅ No console errors or backend errors

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ System is ready for production use
2. Consider adding email notifications
3. Consider adding overdue item tracking
4. Consider adding bulk operations
5. Consider adding export/reporting features

If tests fail:
1. Check browser console for errors
2. Check Laravel logs: `backend/storage/logs/laravel.log`
3. Verify database migrations ran successfully
4. Verify all models have proper relationships
5. Verify API routes are correct
