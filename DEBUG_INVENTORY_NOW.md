# Debug Admin Inventory - Step by Step

## Current Status
- ✅ Database has 8 items (verified)
- ✅ Backend API returns 8 items (verified)
- ❌ Frontend shows no items

## Step 1: Test the API Directly

Open this file in your browser:
```
http://localhost:5173/test-api.html
```

1. Click "Test Login" - should show ✅ Login successful
2. Click "Test Inventory" - should show 8 items

**Expected Result:** You should see all 8 items listed

## Step 2: Check the Actual Inventory Page

1. Go to: `http://localhost:5173/login`
2. Login with: `benjie.trozo` / `p@ssw0rd`
3. Click "Inventory" in sidebar

### What You Should See Now:

**Debug Panel at the top showing:**
- Loading: Yes/No
- Items Count: (number)
- Error: (any error message)
- Search: (search term if any)
- Category: (selected category)

### Possible Scenarios:

#### Scenario A: Debug shows "Items Count: 8"
- Items are loaded but not displaying
- Check if you're scrolled down
- Check if view mode is correct
- Try toggling between Card and List view

#### Scenario B: Debug shows "Items Count: 0" and Error message
- API call failed
- Check the error message
- Open browser console (F12) for details

#### Scenario C: Debug shows "Loading: Yes" forever
- API call is hanging
- Check if backend is running
- Check network tab in browser

## Step 3: Check Browser Console

1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for these logs:
   - "Fetching inventory with params..."
   - "Inventory API response..."
   - "Items array..."
   - "Items count: 8"

### What to Look For:

**If you see:**
```
Fetching inventory with params: {search: "", category: "", per_page: 50}
Inventory API response: {data: {...}, status: 200}
Items count: 8
Setting items to: Array(8)
```
✅ API is working, items are being set

**If you see errors:**
- Network error → Backend not running or wrong URL
- 401 Unauthorized → Not logged in or token expired
- 404 Not Found → Wrong API endpoint
- 500 Server Error → Backend error

## Step 4: Check Network Tab

1. In DevTools, go to "Network" tab
2. Refresh the inventory page
3. Look for request to `/api/admin/inventory`

### Check:
- **Status:** Should be 200
- **Response:** Click on it, go to "Response" tab
- **Should see:** JSON with `data` array containing 8 items

## Step 5: Verify Login

In browser console, type:
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

**Should show:**
- Token: A long string
- User: JSON object with username "benjie.trozo"

**If null:** You're not logged in, login again

## Step 6: Check API URL

In browser console, type:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**Should be:**
`http://localhost/OlineIMS/backend/public/api`

**If different:** Check `frontend/.env` file

## Common Issues & Solutions

### Issue 1: "Failed to load inventory" error
**Solution:**
- Check if backend is running
- Verify API URL in `.env`
- Check if you're logged in

### Issue 2: Items count shows 0 but no error
**Solution:**
- API returned empty array
- Check if search/filter is active
- Clear search and category filter

### Issue 3: Loading forever
**Solution:**
- Backend not responding
- Check if `php artisan serve` is running
- Check if XAMPP MySQL is running

### Issue 4: 401 Unauthorized
**Solution:**
- Token expired or invalid
- Logout and login again
- Clear localStorage and login

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop everything (Ctrl+C in each terminal)

# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Browser
# Clear cache (Ctrl+Shift+Delete)
# Go to http://localhost:5173/login
# Login again
```

### Fix 2: Clear Browser Data
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Click "Clear data"
5. Refresh page and login again

### Fix 3: Check Database
```bash
cd backend
php debug-inventory-detailed.php
```
Should show 8 items

## What to Report

If still not working, please provide:

1. **Debug Panel Info:**
   - Loading: ?
   - Items Count: ?
   - Error: ?

2. **Console Logs:**
   - Copy all logs starting with "Fetching inventory..."
   - Copy any error messages

3. **Network Tab:**
   - Status code of `/api/admin/inventory` request
   - Response body (first few lines)

4. **Screenshots:**
   - The inventory page
   - The debug panel
   - Browser console
   - Network tab

---

**Next Step:** Follow Step 1 above and report what you see!
