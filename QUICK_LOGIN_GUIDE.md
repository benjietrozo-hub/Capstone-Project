# Quick Login System Guide

## What Changed?

The login system now **automatically detects** whether you're an admin or teacher - no need to select your role!

## How to Use

### For End Users

1. Go to the login page
2. Enter your username or email
3. Enter your password
4. Click "Login"
5. You'll be automatically redirected to your dashboard:
   - **Admins** → Admin Dashboard
   - **Teachers** → Teacher Dashboard

### For Admins

**Login with:**
- Username: `your_admin_username`
- Email: `your_admin_email`
- Password: `your_password`

**Auto-redirect to:** `/admin/dashboard`

### For Teachers

**Login with:**
- Username: `your_teacher_username`
- Email: `your_teacher_email`
- Employee ID: `your_employee_id`
- Password: `your_password`

**Auto-redirect to:** `/teacher/dashboard`

### New Teachers

Click "Register here" on the login page to create a new teacher account.

## Technical Details

### New Endpoint
```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "your_username_or_email",
  "password": "your_password"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "authentication_token",
  "role": "admin" // or "teacher"
}
```

### Files Modified

**Backend:**
- ✅ `backend/app/Http/Controllers/API/Auth/UnifiedAuthController.php` (NEW)
- ✅ `backend/routes/api.php`

**Frontend:**
- ✅ `frontend/src/api/index.js`
- ✅ `frontend/src/context/AuthContext.jsx`
- ✅ `frontend/src/pages/LoginPage.jsx`

### Key Features

✓ Single login form for all users
✓ Automatic role detection
✓ Secure authentication
✓ Auto-redirect to correct dashboard
✓ Backward compatible with old endpoints
✓ Registration link always visible

## Testing

### Test the System

1. **Start Backend:**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Login:**
   - Open browser to `http://localhost:5173`
   - Try logging in with admin credentials
   - Try logging in with teacher credentials
   - Verify auto-redirect works correctly

### Verify API

```bash
# Test unified login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## Troubleshooting

### Issue: "The provided credentials are incorrect"
- Check username/email is correct
- Verify password is correct
- Ensure account exists in database

### Issue: "Your account is inactive"
- Contact system administrator
- Account status needs to be set to 'active'

### Issue: Not redirecting after login
- Check browser console for errors
- Verify role is returned in API response
- Clear browser cache and try again

## Need Help?

Refer to:
- `ROLE_BASED_LOGIN_UPDATE.md` - Detailed technical documentation
- `LOGIN_COMPARISON.md` - Before/after comparison
