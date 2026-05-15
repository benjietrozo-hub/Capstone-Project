# Logout "Access Denied" Flash Fix

## Issue
When logging out, users briefly see a "403 Access Denied" page before being redirected to the login page.

## Root Cause
The logout process had a timing issue:
1. User clicks logout
2. localStorage is cleared (user becomes unauthenticated)
3. React re-renders the current protected route
4. ProtectedRoute detects no authentication
5. Tries to redirect to `/unauthorized` 
6. Shows "403 Access Denied" page briefly
7. Then `window.location.replace("/login")` executes
8. Finally redirects to login page

## Solution
Implemented a logout flag using `sessionStorage` to prevent the unauthorized page from showing during logout.

### How It Works

#### 1. NotificationProfile.tsx (Logout Handler)
```javascript
const handleLogout = () => {
  // Set logout flag to prevent "Access Denied" flash
  sessionStorage.setItem('isLoggingOut', 'true');
  
  // Clear auth data immediately
  localStorage.clear();
  
  // Redirect to login
  window.location.replace("/login");
};
```

#### 2. ProtectedRoute.tsx (Route Guard)
```javascript
export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, role } = useAuth();

  // Check if user is logging out to prevent "Access Denied" flash
  const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
  
  if (isLoggingOut) {
    // Clear the flag and show loader while redirecting
    sessionStorage.removeItem('isLoggingOut');
    return <Loader />;
  }

  // ... rest of the logic
}
```

## Flow After Fix

1. User clicks logout
2. `isLoggingOut` flag set in sessionStorage
3. localStorage cleared
4. React re-renders
5. ProtectedRoute detects `isLoggingOut` flag
6. Shows **Loader** instead of "Access Denied"
7. Clears the flag
8. `window.location.replace("/login")` executes
9. Redirects to login page smoothly

## Benefits

✅ **No "Access Denied" flash** - Shows loader instead  
✅ **Smooth user experience** - Clean transition to login  
✅ **Fast redirect** - Uses `window.location.replace()` for instant navigation  
✅ **Clean state** - Uses `localStorage.clear()` to remove all auth data  

## Files Modified

1. `frontend/src/components/NotificationProfile.tsx`
   - Updated logout handler to set flag and clear storage

2. `frontend/src/components/common/ProtectedRoute.tsx`
   - Added logout flag check to prevent unauthorized page

## Testing

### Before Fix
1. Login as any user
2. Click logout
3. ❌ Briefly see "403 Access Denied" page
4. Then redirect to login

### After Fix
1. Login as any user
2. Click logout
3. ✅ See loader (or instant redirect)
4. Smoothly redirect to login

## Technical Details

### Why sessionStorage?
- `sessionStorage` is cleared when the tab/window closes
- Persists during page navigation (unlike state)
- Doesn't persist across browser sessions (unlike localStorage)
- Perfect for temporary flags during navigation

### Why window.location.replace()?
- Doesn't add to browser history (can't go back)
- Faster than React Router navigation
- Forces full page reload (clears all React state)
- More reliable for logout scenarios

### Why localStorage.clear()?
- Removes ALL items at once (faster than individual removes)
- Ensures no leftover auth data
- Cleaner than removing items one by one
- Prevents any potential auth state leaks

## Summary

✅ **Issue:** "Access Denied" flash during logout  
✅ **Solution:** Logout flag + loader during transition  
✅ **Result:** Smooth, professional logout experience  

**Status:** FIXED ✅
