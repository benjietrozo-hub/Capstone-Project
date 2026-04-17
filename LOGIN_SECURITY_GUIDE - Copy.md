# Login Security System - Progressive Lockout

A comprehensive login security system with progressive lockout timers to protect against brute force attacks.

## Features

### Progressive Lockout System

The system implements a 3-batch progressive lockout mechanism:

#### Batch 1 (First 3 Attempts)
- Attempt 1: Wrong password → "2 attempts remaining"
- Attempt 2: Wrong password → "1 attempt remaining"  
- Attempt 3: Wrong password → **30-second lockout**

#### Batch 2 (Next 3 Attempts)
- Attempt 1: Wrong password → "2 attempts remaining"
- Attempt 2: Wrong password → "1 attempt remaining"
- Attempt 3: Wrong password → **1-minute lockout**

#### Batch 3 (Next 3 Attempts)
- Attempt 1: Wrong password → "2 attempts remaining"
- Attempt 2: Wrong password → "1 attempt remaining"
- Attempt 3: Wrong password → **2-minute lockout**

#### Final Lockout (After Batch 3)
- Any failed attempt → **15-minute lockout**
- Message: "Your account is temporarily locked for your account safety. Please contact administrator."

## Security Features

### During Lockout Period:
1. All input fields are disabled with `cursor-not-allowed`
2. Login button is disabled and shows "Locked" state
3. Hover effects are removed from all interactive elements
4. Real-time countdown timer displays remaining lockout time
5. "Forgot password?" link ONLY appears during lockout
6. Registration link is hidden during lockout
7. Visual indicators (clock icon, red alert box) show locked state

### Additional Security:
- Lockout is tracked by username/email AND IP address
- All failed attempts are logged in system logs
- Successful login resets all attempt counters
- Expired lockouts automatically reset to Batch 1
- Progressive difficulty discourages brute force attacks

## User Experience

### Normal State:
- Clean login form with username and password fields
- Blue gradient login button
- Registration link at bottom
- No "Forgot password?" link visible

### Locked State:
- Header changes to "Account Locked" with clock icon
- Red alert box shows lockout message
- Real-time countdown timer (MM:SS format)
- All fields disabled with reduced opacity
- "Forgot password?" link appears
- Registration link hidden

### Visual Feedback:
- Toast notifications for each failed attempt with remaining attempts
- Animated clock icon during lockout
- Color-coded alerts (red for lockout)
- Professional, non-alarming UI design

## Technical Implementation

### Backend (Laravel)

#### Database Table: `login_attempts`
```sql
- id
- identifier (username/email)
- ip_address
- batch (1-4)
- attempts_in_batch (0-3)
- locked_until (timestamp)
- timestamps
```

#### Model: `LoginAttempt`
Key methods:
- `getOrCreate()` - Get or create attempt record
- `isLocked()` - Check if account is locked
- `recordFailedAttempt()` - Record failed login
- `resetAttempts()` - Reset on successful login
- `getRemainingAttempts()` - Get attempts left in batch
- `getRemainingLockTime()` - Get seconds until unlock
- `getLockoutMessage()` - Get appropriate message

#### Controller: `UnifiedAuthController`
Enhanced login method:
1. Check if account is locked
2. Validate credentials
3. Record failed attempts
4. Apply progressive lockout
5. Return appropriate response

### Frontend (React/TypeScript)

#### State Management:
- `isLocked` - Boolean for locked state
- `remainingSeconds` - Countdown timer
- `lockMessage` - Display message
- `formData` - Username and password

#### Real-time Timer:
- Updates every second using `setInterval`
- Automatically unlocks when timer reaches 0
- Formats time as MM:SS or Xs

#### Conditional Rendering:
- Shows/hides elements based on lock state
- Disables inputs and buttons during lockout
- Displays countdown and alert messages

## API Response Format

### Locked Account (429 Status):
```json
{
  "message": "Too many failed attempts. Please wait...",
  "locked": true,
  "locked_until": "2026-02-11T10:30:00.000000Z",
  "remaining_seconds": 120,
  "batch": 3
}
```

### Failed Login (422 Status):
```json
{
  "message": "The provided credentials are incorrect. You have 2 attempt(s) remaining.",
  "errors": {
    "username": ["The provided credentials are incorrect. You have 2 attempt(s) remaining."]
  }
}
```

### Successful Login (200 Status):
```json
{
  "user": {...},
  "token": "...",
  "role": "admin"
}
```

## Testing the System

### Test Scenario 1: Progressive Lockout
1. Enter wrong password 3 times → 30-second lockout
2. Wait 30 seconds
3. Enter wrong password 3 times → 1-minute lockout
4. Wait 1 minute
5. Enter wrong password 3 times → 2-minute lockout
6. Wait 2 minutes
7. Enter wrong password once → 15-minute lockout

### Test Scenario 2: Successful Login Reset
1. Enter wrong password 2 times
2. Enter correct password → All counters reset
3. Can login normally again

### Test Scenario 3: Lockout Expiration
1. Get locked out (any batch)
2. Wait for timer to expire
3. Form automatically unlocks
4. Can attempt login again

## System Logs

All login activities are logged:
- Successful logins
- Failed login attempts (with batch and remaining attempts)
- Account lockouts
- Blocked login attempts during lockout

View logs in Admin Panel → System Logs

## Configuration

### Adjust Lockout Times
Edit `backend/app/Models/LoginAttempt.php`:

```php
private function applyLockout()
{
    switch ($this->batch) {
        case 1:
            $this->locked_until = Carbon::now()->addSeconds(30); // Change here
            break;
        case 2:
            $this->locked_until = Carbon::now()->addMinute(); // Change here
            break;
        case 3:
            $this->locked_until = Carbon::now()->addMinutes(2); // Change here
            break;
        case 4:
            $this->locked_until = Carbon::now()->addMinutes(15); // Change here
            break;
    }
}
```

### Adjust Attempts Per Batch
Change the `3` in `getRemainingAttempts()` and `recordFailedAttempt()` methods.

## Files Created/Modified

### Backend:
- `database/migrations/2026_02_11_000003_create_login_attempts_table.php`
- `app/Models/LoginAttempt.php`
- `app/Http/Controllers/API/Auth/UnifiedAuthController.php` (modified)

### Frontend:
- `pages/LoginPage.tsx` (completely rewritten)

## Security Best Practices

✅ IP-based tracking prevents account enumeration
✅ Progressive difficulty discourages automated attacks
✅ Comprehensive logging for security auditing
✅ User-friendly messages don't reveal account existence
✅ Automatic cleanup of expired lockouts
✅ Forgot password option during lockout
✅ Visual feedback prevents user confusion

## Troubleshooting

### Lockout not working?
1. Check database migration ran successfully
2. Verify `login_attempts` table exists
3. Check system logs for errors

### Timer not counting down?
1. Check browser console for JavaScript errors
2. Verify `useEffect` hook is running
3. Ensure `remainingSeconds` state is updating

### Can't unlock after timer expires?
1. Clear browser cache
2. Check server time matches client time
3. Verify `locked_until` timestamp in database

## Future Enhancements

Potential improvements:
- Email notification on lockout
- Admin panel to manually unlock accounts
- Configurable lockout times via settings
- CAPTCHA after first lockout
- Geographic location tracking
- Device fingerprinting

---

Your login system is now protected with enterprise-grade security! 🔒
