# Role-Based Login System - Testing Guide

## Quick Start

### Prerequisites
1. **Backend Running**: Verify Laravel API is running
   - Test: `curl http://localhost/OlineIMS/backend/public/api/test`
   - Should return: `{"message":"API is working"}`

2. **Frontend Running**: Verify React dev server is running
   - Test: Open `http://localhost:5174/` in browser
   - Should see login page

3. **Database Connection**: Verify MySQL is running with inventory_system database

## Test Credentials

### Admin Account
```
Username: admin
Password: password123
Role: admin
Expected Dashboard: http://localhost:5174/admin/dashboard
```

### Teacher Account
```
Username: teacher1
Password: teacher123
Role: teacher
Expected Dashboard: http://localhost:5174/teacher/dashboard
```

## Manual Testing Steps

### 1. Test Admin Login Flow

**Steps:**
1. Open http://localhost:5174/ in browser
2. Click on "Admin" login tab
3. Enter credentials:
   - Username: `admin`
   - Password: `password123`
4. Click "Sign In"

**Expected Results:**
- ✅ Login succeeds (HTTP 200)
- ✅ Redirects to `/admin/dashboard`
- ✅ Header shows "Welcome, Admin User"
- ✅ Sidebar displays Admin menu with items:
  - Dashboard
  - Inventory Management
  - Borrow Requests
  - Users Management
  - Reports

**Verification:**
```javascript
// Open browser console (F12) and run:
console.log(localStorage.getItem('role')); // Should output: "admin"
console.log(localStorage.getItem('token')); // Should output: JWT token
```

### 2. Test Teacher Login Flow

**Steps:**
1. Click Logout from admin dashboard
2. Go back to http://localhost:5174/
3. Click on "Teacher" login tab
4. Enter credentials:
   - Username: `teacher1`
   - Password: `teacher123`
5. Click "Sign In"

**Expected Results:**
- ✅ Login succeeds (HTTP 200)
- ✅ Redirects to `/teacher/dashboard`
- ✅ Header shows "Welcome, teacher" (or user's actual name)
- ✅ Sidebar displays Teacher menu with items:
  - Dashboard
  - Browse Inventory
  - My Requests

**Verification:**
```javascript
// Open browser console (F12) and run:
console.log(localStorage.getItem('role')); // Should output: "teacher"
```

### 3. Test Role-Based Access Control

**Test Admin Cannot Access Teacher Routes:**
1. Login as admin
2. Manually navigate to: `http://localhost:5174/teacher/dashboard`
3. Should redirect to `/admin/dashboard` (RoleBasedRedirect)

**Test Teacher Cannot Access Admin Routes:**
1. Login as teacher
2. Manually navigate to: `http://localhost:5174/admin/dashboard`
3. Should redirect to `/unauthorized` (ProtectedRoute with requiredRole check)

**Test Unauthenticated Access:**
1. Logout from any account
2. Try to access protected route: `http://localhost:5174/admin/dashboard`
3. Should redirect to `/login`

### 4. Test Automatic Redirection

**Test Auto-Redirect to Admin Dashboard:**
1. Login with admin credentials
2. You should be redirected to `/admin/dashboard`
3. Refresh page - should stay on admin dashboard

**Test Auto-Redirect to Teacher Dashboard:**
1. Login with teacher credentials
2. You should be redirected to `/teacher/dashboard`
3. Refresh page - should stay on teacher dashboard

**Test Auto-Redirect from Root:**
1. Open http://localhost:5174/
2. If logged in as admin → goes to `/admin/dashboard`
3. If logged in as teacher → goes to `/teacher/dashboard`
4. If not logged in → goes to `/login`

### 5. Test Logout

**Steps:**
1. Click "Logout" in header or menu
2. Should be redirected to `/login`
3. localStorage should be cleared

**Verification:**
```javascript
// Open browser console and run:
console.log(localStorage.getItem('role')); // Should output: null
console.log(localStorage.getItem('token')); // Should output: null
```

### 6. Test Role Information Display

**For Admin:**
- [ ] Header shows admin username
- [ ] Sidebar shows admin-specific menu items (5 items)
- [ ] Avatar loads correctly

**For Teacher:**
- [ ] Header shows teacher username
- [ ] Sidebar shows teacher-specific menu items (3 items)
- [ ] Avatar loads correctly

## Browser Developer Tools Verification

### Check Network Tab
1. Open DevTools → Network tab
2. Perform login
3. Find POST request to `/api/auth/admin/login` or `/api/auth/teacher/login`
4. Check response contains:
   ```json
   {
     "user": { /* user object */ },
     "token": "eyJ0eXAiOiJKV1Q...",
     "role": "admin" | "teacher"
   }
   ```

### Check Local Storage
1. Open DevTools → Application → Local Storage
2. After login, should see:
   - Key: `token` - Value: JWT token
   - Key: `user` - Value: JSON user object
   - Key: `role` - Value: "admin" or "teacher"

### Check Console for Errors
1. Open DevTools → Console
2. Perform login
3. Should see no red error messages
4. May see informational logs about context updates

## API Testing with cURL

### Test Admin Login Endpoint
```bash
curl -X POST http://localhost/OlineIMS/backend/public/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@olineims.com",
    "full_name": "System Administrator"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "admin"
}
```

### Test Teacher Login Endpoint
```bash
curl -X POST http://localhost/OlineIMS/backend/public/api/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"teacher123"}'
```

**Expected Response:**
```json
{
  "user": {
    "id": 6,
    "employee_id": "T001",
    "username": "teacher1",
    "email": "teacher1@school.com",
    "full_name": "Teacher One"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "teacher"
}
```

## Common Issues & Solutions

### Issue: "Login failed" Error
**Possible Causes:**
1. Backend not running - Check Apache status
2. Wrong credentials - Verify against database
3. Database connection issue - Check MySQL status

**Solution:**
1. Verify backend API is accessible: `curl http://localhost/OlineIMS/backend/public/api/test`
2. Check database has test users created
3. Review console errors for specific message

### Issue: Token Not Stored in LocalStorage
**Possible Causes:**
1. Browser blocking localStorage (incognito mode)
2. Login request failed silently
3. API not returning token

**Solution:**
1. Check console for JavaScript errors
2. Check Network tab to see login response
3. Verify API returns token in response

### Issue: Role Not Recognized
**Possible Causes:**
1. API not returning role in response
2. localStorage role key misspelled
3. AuthContext not reading from localStorage

**Solution:**
1. Check Network tab response includes `"role"`
2. Verify localStorage key is exactly `'role'`
3. Force refresh (Ctrl+F5) to reload context

### Issue: Stuck on Login After Redirect
**Possible Causes:**
1. ProtectedRoute or RoleBasedRedirect logic issue
2. Token expired
3. Role not matching expected value

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh and try login again
3. Check console for redirect loop warnings

## Performance Checklist

- [ ] Login completes in < 2 seconds
- [ ] Dashboard loads in < 1 second
- [ ] Page refresh maintains login state
- [ ] No console errors or warnings
- [ ] No unused API calls
- [ ] No memory leaks during navigation

## Security Checklist

- [ ] Token not visible in network tab (HTTPS only in production)
- [ ] Password not logged anywhere
- [ ] Role-based access enforced on all protected routes
- [ ] Logout clears all session data
- [ ] No sensitive data in localStorage besides token
- [ ] CORS headers properly configured

## Next Steps After Testing

If all tests pass:
1. ✅ Role-based login system is working
2. ✅ Ready to implement API role-based middleware
3. ✅ Ready to complete remaining page styling
4. ✅ Ready to integrate WebSocket notifications

If tests fail:
1. Check error messages in console
2. Verify backend API responses
3. Check database for test users
4. Review RBAC_DOCUMENTATION.md for configuration
