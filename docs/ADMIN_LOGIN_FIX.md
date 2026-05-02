# Admin Login Issue - Fixed

## Problem
Unable to login with admin account `loren.torres@gmail.com` even with correct credentials.

## Root Cause
The database had two issues:
1. **Empty Database**: Running `php artisan migrate:fresh` dropped all tables and recreated them empty, removing all existing data including admin accounts.
2. **Database Mismatch**: The `.env` file specified `inventory_system` as the database, but Laravel was actually connecting to `role_based_oims` database (likely due to cached configuration).

## Solution Applied

### 1. Identified the Correct Database
- Laravel was connecting to: `role_based_oims`
- Admin data was in: `inventory_system`
- Solution: Inserted admin account into `role_based_oims`

### 2. Created Admin Account
Inserted the admin account from the SQL backup:
```sql
INSERT INTO admins (username, email, password, first_name, last_name, status, created_at, updated_at) 
VALUES ('loren.torres', 'loren.torres@gmail.com', '[hashed_password]', 'Lorean', 'Torres', 'active', NOW(), NOW());
```

### 3. Reset Password
Created and ran `reset-admin-password.php` to set a known password.

## Current Login Credentials

```
Email: loren.torres@gmail.com
Username: loren.torres
Password: password123
```

**IMPORTANT**: Change this password after first login!

## Files Created

1. **reset-admin-password.php** - Script to reset admin password
2. **create-admin.php** - Script to create default admin account
3. **create-loren-admin.php** - Script to create Loren's admin account

## How to Reset Password in Future

If you forget the password again, run:
```bash
cd backend
php reset-admin-password.php
```

This will reset the password to `password123`.

## How to Create New Admin

To create a new admin account:
```bash
cd backend
php artisan tinker
```

Then run:
```php
$admin = new App\Models\Admin();
$admin->username = 'newadmin';
$admin->email = 'newadmin@example.com';
$admin->password = bcrypt('password');
$admin->first_name = 'First';
$admin->last_name = 'Last';
$admin->status = 'active';
$admin->save();
```

## Important Notes

### Database Configuration
- Laravel is currently using database: `role_based_oims`
- The `.env` file says: `inventory_system`
- There may be a configuration cache issue

To check which database Laravel is using:
```bash
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"
```

### Avoid migrate:fresh
**DO NOT run `php artisan migrate:fresh`** unless you want to lose all data!

Instead use:
- `php artisan migrate` - Run new migrations only
- `php artisan migrate:rollback` - Undo last migration batch
- `php artisan migrate:refresh` - Rollback and re-run (still loses data)

### Backup Before Migrations
Always backup your database before running migrations:
```bash
cd C:\xampp\mysql\bin
mysqldump -u root role_based_oims > backup.sql
```

## Testing Login

1. Start the backend server:
   ```bash
   cd backend
   php artisan serve
   ```

2. Try logging in with:
   - Email: `loren.torres@gmail.com`
   - Password: `password123`

3. If login fails, check:
   - Backend server is running
   - Database connection is working
   - Admin account exists: `php artisan tinker --execute="App\Models\Admin::where('email', 'loren.torres@gmail.com')->first();"`

## Date Fixed
April 17, 2026
