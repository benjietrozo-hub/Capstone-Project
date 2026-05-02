# Database Configuration - FIXED

## Problem
Laravel was connecting to the wrong database (`role_based_oims`) instead of the correct database (`inventory_system`).

## Root Cause
The `.env` file had `DB_DATABASE=role_based_oims` but it should have been `DB_DATABASE=inventory_system`.

There was confusion because:
1. The file reading tool showed `inventory_system` (possibly cached)
2. PowerShell showed the actual content: `role_based_oims`
3. Laravel was reading the actual file content and connecting to `role_based_oims`

## Solution
Updated `.env` file to use the correct database name:
```
DB_DATABASE=inventory_system
```

## Verification

### Check Database Connection
```bash
cd backend
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"
```

Should output: `inventory_system`

### Check Admin Account
```bash
cd backend
php artisan tinker --execute="App\Models\Admin::where('email', 'loren.torres@gmail.com')->first();"
```

Should return the admin account details.

## Current Status

✅ Laravel is now connected to: `inventory_system`
✅ Admin account exists in `inventory_system`
✅ Password has been reset to: `password123`

## Login Credentials

```
Email:    loren.torres@gmail.com
Username: loren.torres
Password: password123
```

## Important Notes

### Always Use inventory_system Database
The correct database for this project is `inventory_system`, NOT `role_based_oims`.

### After Changing .env
Always clear the config cache:
```bash
php artisan config:clear
```

### Check Which Database Laravel is Using
```bash
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"
```

### Database Locations
- **Correct Database**: `inventory_system` (on localhost MySQL)
- **Wrong Database**: `role_based_oims` (was being used by mistake)

## Files Updated
- `backend/.env` - Changed `DB_DATABASE` from `role_based_oims` to `inventory_system`

## Date Fixed
April 17, 2026
