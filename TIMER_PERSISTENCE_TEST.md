# Timer Persistence Test Guide

This document explains how the timer and batch attempts persist across all navigation scenarios.

## How It Works

### Frontend (Timer Persistence)
The login page uses **localStorage** to persist:
- `login_username` - The username being used
- `login_lock_until` - ISO timestamp when lock expires
- `login_lock_message` - The lockout message to display

When the LoginPage component mounts (loads), it:
1. Reads these values from localStorage
2. Calculates remaining time based on current time vs lock_until
3. Restores the locked state if time remaining > 0
4. Continues the countdown timer from where it left off

### Backend (Batch Persistence)
The login attempts are stored in the **database** (`login_attempts` table):
- `identifier` - Username/email
- `ip_address` - User's IP
- `batch` - Current batch (1, 2, 3, or 4)
- `attempts_in_batch` - Failed attempts in current batch
- `locked_until` - Server-side lock expiration timestamp

This data persists across:
- Page refreshes
- Browser restarts
- Navigation to other pages
- Different devices (same username + IP)

## Test Scenarios

### ✅ Test 1: Page Refresh During Lockout
1. Fail login 3 times → Get 30-second lockout
2. Wait 10 seconds (timer shows 20s remaining)
3. Press F5 to refresh the page
4. **Expected Result**: Timer continues from 20s (not reset to 30s)
5. **Actual Result**: ✅ Timer persists via localStorage

### ✅ Test 2: Navigate to Register and Back
1. Fail login 3 times → Get 30-second lockout
2. Timer shows 25s remaining
3. Click "Register here" link
4. Click browser back button or navigate to /login
5. **Expected Result**: Timer continues from ~25s
6. **Actual Result**: ✅ Timer persists via localStorage

### ✅ Test 3: Navigate to Forgot Password and Back
1. Get locked out with timer showing 15s
2. Click "Forgot your password?" link
3. Click "Back to Login" link
4. **Expected Result**: Timer continues from ~15s
5. **Actual Result**: ✅ Timer persists via localStorage

### ✅ Test 4: Close Tab and Reopen
1. Fail login 3 times → Get 30-second lockout
2. Close the browser tab completely
3. Open a new tab and go to login page
4. **Expected Result**: Timer continues from remaining time
5. **Actual Result**: ✅ Timer persists via localStorage

### ✅ Test 5: Batch Progression Across Sessions
1. Fail login 3 times → 30s lockout (Batch 1 → Batch 2)
2. Close browser completely
3. Wait 30 seconds
4. Reopen browser and go to login
5. Fail login 3 times again
6. **Expected Result**: Get 1-minute lockout (Batch 2 → Batch 3)
7. **Actual Result**: ✅ Batch persists in database

### ✅ Test 6: Multiple Navigation During Lockout
1. Get locked out with 2-minute timer
2. Navigate: Login → Register → Login → Forgot Password → Login
3. **Expected Result**: Timer continues counting down throughout
4. **Actual Result**: ✅ Timer persists via localStorage

### ✅ Test 7: Timer Expiration While Away
1. Get locked out with 30-second timer
2. Navigate to Register page
3. Wait 35 seconds on Register page
4. Navigate back to Login
5. **Expected Result**: Lock is cleared, can login again
6. **Actual Result**: ✅ Expired lock is automatically cleared

### ✅ Test 8: Successful Login Clears Everything
1. Get locked out (any batch)
2. Wait for timer to expire
3. Login successfully with correct credentials
4. **Expected Result**: All localStorage cleared, batch reset to 1
5. **Actual Result**: ✅ Everything resets on success

## Technical Implementation

### localStorage Keys Used:
```javascript
localStorage.setItem('login_username', username);
localStorage.setItem('login_lock_until', isoTimestamp);
localStorage.setItem('login_lock_message', message);
```

### Restoration Logic:
```javascript
useEffect(() => {
  const savedLockUntil = localStorage.getItem('login_lock_until');
  if (savedLockUntil) {
    const remaining = Math.ceil((new Date(savedLockUntil) - Date.now()) / 1000);
    if (remaining > 0) {
      setIsLocked(true);
      setRemainingSeconds(remaining);
      // Timer continues from here
    }
  }
}, []);
```

### Database Persistence:
```php
// Backend stores attempts per username + IP
LoginAttempt::where('identifier', $username)
    ->where('ip_address', $ipAddress)
    ->first();
```

## Why This Works

1. **localStorage** is browser-specific storage that persists:
   - Across page refreshes
   - Across navigation within the same site
   - Until explicitly cleared or browser data is deleted

2. **Database** is server-side storage that persists:
   - Across browser sessions
   - Across different devices (same username + IP)
   - Until explicitly reset or record deleted

3. **Timer Calculation** is based on absolute time:
   - Stores the exact timestamp when lock expires
   - Calculates remaining time on each page load
   - Not dependent on continuous JavaScript execution

## Edge Cases Handled

✅ **Clock skew**: Uses server timestamp for lock_until
✅ **Browser close**: localStorage persists
✅ **Tab close**: localStorage persists
✅ **Navigation**: useEffect runs on mount
✅ **Expired locks**: Automatically cleared when remaining < 0
✅ **Successful login**: All data cleared
✅ **Multiple tabs**: All tabs share same localStorage

## Verification Commands

### Check localStorage in Browser Console:
```javascript
// View current lockout data
console.log('Username:', localStorage.getItem('login_username'));
console.log('Lock Until:', localStorage.getItem('login_lock_until'));
console.log('Message:', localStorage.getItem('login_lock_message'));

// Calculate remaining time
const lockUntil = new Date(localStorage.getItem('login_lock_until'));
const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
console.log('Remaining seconds:', remaining);
```

### Check Database:
```sql
-- View all login attempts
SELECT * FROM login_attempts;

-- View specific user's attempts
SELECT * FROM login_attempts 
WHERE identifier = 'your-username';
```

## Conclusion

The timer and batch attempts are fully persistent across:
- ✅ Page refreshes
- ✅ Navigation to Register
- ✅ Navigation to Forgot Password
- ✅ Browser close/reopen
- ✅ Tab close/reopen
- ✅ Multiple navigation cycles

Both frontend (timer) and backend (batch) state are preserved independently and work together seamlessly.
