# Root Admin Account

## Account Details

**Status:** ✅ Created Successfully

### Login Credentials

| Field | Value |
|-------|-------|
| **Email** | benjie.trozo@csucc.edu.ph |
| **Username** | benjie.trozo |
| **Password** | p@ssw0rd |
| **Status** | Active |
| **Role** | Admin |

## How to Login

### Option 1: Using Email
1. Go to the login page
2. Enter: `benjie.trozo@csucc.edu.ph`
3. Password: `p@ssw0rd`
4. Click Login
5. You'll be redirected to Admin Dashboard

### Option 2: Using Username
1. Go to the login page
2. Enter: `benjie.trozo`
3. Password: `p@ssw0rd`
4. Click Login
5. You'll be redirected to Admin Dashboard

## Security Notes

⚠️ **IMPORTANT SECURITY RECOMMENDATIONS:**

1. **Change Password Immediately**
   - This is a default password and should be changed after first login
   - Use a strong, unique password

2. **Keep Credentials Safe**
   - Don't share these credentials
   - Store them securely
   - Delete this file after noting the credentials

3. **Enable Additional Security**
   - Consider implementing 2FA in the future
   - Monitor login activity
   - Review admin access regularly

## Admin Capabilities

As a root admin, you have full access to:

✅ Dashboard with system statistics
✅ Inventory Management (Add, Edit, Delete items)
✅ Borrow Request Management (Approve, Reject, Issue, Return)
✅ Teacher Management (Add, Edit, Delete, View teachers)
✅ Reports Management
✅ System Configuration

## Database Information

- **Table:** `admins`
- **ID:** 2
- **Created:** 2026-02-02
- **Last Login:** Not yet logged in

## Scripts Available

### Create/Update Root Admin
```bash
# Windows
cd backend
create-root-admin.bat

# Or directly with PHP
cd backend
php create-root-admin.php
```

### Verify Admin Exists
```bash
cd backend
php artisan tinker --execute="App\Models\Admin::where('email', 'benjie.trozo@csucc.edu.ph')->first();"
```

### Reset Password (if needed)
```bash
cd backend
php artisan tinker --execute="
\$admin = App\Models\Admin::where('email', 'benjie.trozo@csucc.edu.ph')->first();
\$admin->password = Hash::make('new_password');
\$admin->save();
echo 'Password updated!';
"
```

## Troubleshooting

### Can't Login?

1. **Check credentials are correct**
   - Email: `benjie.trozo@csucc.edu.ph`
   - Password: `p@ssw0rd` (case-sensitive)

2. **Verify account is active**
   ```bash
   cd backend
   php artisan tinker --execute="App\Models\Admin::find(2);"
   ```

3. **Check backend is running**
   ```bash
   cd backend
   php artisan serve
   ```

4. **Check frontend is running**
   ```bash
   cd frontend
   npm run dev
   ```

### Account Locked or Inactive?

Run this to reactivate:
```bash
cd backend
php artisan tinker --execute="
\$admin = App\Models\Admin::find(2);
\$admin->status = 'active';
\$admin->save();
echo 'Account activated!';
"
```

## Next Steps

1. ✅ Root admin created
2. ⏳ Login with credentials
3. ⏳ Change password
4. ⏳ Configure system settings
5. ⏳ Add other admins if needed
6. ⏳ Start managing inventory

## Support

If you encounter any issues:
1. Check the backend logs: `backend/storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all migrations are run: `php artisan migrate`

---

**Created:** February 2, 2026
**Last Updated:** February 2, 2026
