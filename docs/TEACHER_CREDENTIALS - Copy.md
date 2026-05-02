# Teacher Account Credentials

## 🧑‍🏫 Test Teacher Account

### Login Credentials

| Field | Value |
|-------|-------|
| **Email** | teacher@test.com |
| **Username** | teacher.test |
| **Password** | teacher123 |
| **Status** | Active |
| **Role** | Teacher |
| **Department** | General |
| **Employee ID** | TEACH001 |

## How to Create/Reset Teacher Account

### Option 1: Using Batch File (Easiest)
1. Navigate to `backend` folder
2. Double-click `create-test-teacher.bat`
3. Account will be created or password reset

### Option 2: Using PHP Command
```bash
cd backend
php create-test-teacher.php
```

### Option 3: Using Admin Panel
1. Login as admin
2. Go to "Teacher Management"
3. Click "Add Teacher"
4. Fill in the form and submit

## How to Login

### Option 1: Using Email
1. Go to the login page: `http://localhost:5173`
2. Select "Teacher" role
3. Enter: `teacher@test.com`
4. Password: `teacher123`
5. Click Login
6. You'll be redirected to Teacher Dashboard

### Option 2: Using Username
1. Go to the login page: `http://localhost:5173`
2. Select "Teacher" role
3. Enter: `teacher.test`
4. Password: `teacher123`
5. Click Login
6. You'll be redirected to Teacher Dashboard

## Existing Teacher Accounts (From Database)

If you imported the database SQL file, these accounts may exist:

### Teacher 1: Neil
- **Username:** Neil
- **Email:** neil@mail.com
- **Password:** ⚠️ Unknown (hashed in database)
- **Department:** CEIT
- **Employee ID:** 12345

### Teacher 2: Benz
- **Username:** benz
- **Email:** benjie@csucc.edu.ph
- **Password:** ⚠️ Unknown (hashed in database)
- **Department:** CEIT
- **Employee ID:** 123456

**Note:** To use these accounts, you'll need to reset their passwords using the admin panel or database.

## Teacher Capabilities

As a teacher, you have access to:

✅ Teacher Dashboard with your statistics
✅ Browse Inventory (View available items)
✅ Submit Borrow Requests
✅ Track Request Status (Pending, Approved, Rejected)
✅ View Borrowed Items
✅ Submit Issue Reports
✅ View Activity History
✅ Manage Distribution Requests
✅ Create Distribution Groups
✅ View Notifications

## Register New Teacher Account

Teachers can also self-register:

1. Go to login page: `http://localhost:5173`
2. Click "Register" or "Create Account"
3. Fill in registration form:
   - First Name
   - Middle Initial
   - Last Name
   - Email
   - Username
   - Password
   - Department
   - Employee ID
4. Submit registration
5. Wait for admin approval (if required)
6. Login with your credentials

## Security Notes

⚠️ **IMPORTANT:**

1. **Change Default Password**
   - The test account password should be changed after first login
   - Use a strong, unique password

2. **Account Status**
   - Only "active" teachers can login
   - Admins can activate/deactivate accounts

3. **Keep Credentials Safe**
   - Don't share your credentials
   - Store them securely

## Troubleshooting

### Can't Login?

1. **Check credentials are correct**
   - Email: `teacher@test.com`
   - Password: `teacher123` (case-sensitive)

2. **Verify account exists and is active**
   ```bash
   cd backend
   php artisan tinker --execute="App\Models\Teacher::where('email', 'teacher@test.com')->first();"
   ```

3. **Reset password if needed**
   ```bash
   cd backend
   php artisan tinker --execute="
   \$teacher = App\Models\Teacher::where('email', 'teacher@test.com')->first();
   \$teacher->password = Hash::make('teacher123');
   \$teacher->status = 'active';
   \$teacher->save();
   echo 'Password reset!';
   "
   ```

4. **Create account if doesn't exist**
   ```bash
   cd backend
   php create-test-teacher.php
   ```

### Account Inactive?

Run this to activate:
```bash
cd backend
php artisan tinker --execute="
\$teacher = App\Models\Teacher::where('email', 'teacher@test.com')->first();
\$teacher->status = 'active';
\$teacher->save();
echo 'Account activated!';
"
```

## Quick Reference

| Action | Command |
|--------|---------|
| Create/Reset Account | `cd backend && php create-test-teacher.php` |
| Check Account | `cd backend && php artisan tinker --execute="App\Models\Teacher::where('email', 'teacher@test.com')->first();"` |
| Reset Password | See troubleshooting section above |
| Activate Account | See troubleshooting section above |

## Next Steps

1. ✅ Create test teacher account
2. ⏳ Login with credentials
3. ⏳ Browse inventory
4. ⏳ Submit a test borrow request
5. ⏳ Check notifications
6. ⏳ View dashboard statistics

---

**Created:** February 26, 2026
**Last Updated:** February 26, 2026
