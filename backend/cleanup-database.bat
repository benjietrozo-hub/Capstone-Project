@echo off
echo ========================================
echo Database Cleanup Script
echo ========================================
echo.
echo This script will:
echo 1. Migrate data from old 'admin' table to 'admins'
echo 2. Drop duplicate 'admin' table
echo 3. Drop unused 'users' table
echo 4. Drop Telescope tables (development tool)
echo 5. Drop backup tables
echo 6. Drop unused 'yearly_reports' table
echo 7. Create new 'system_logs' table
echo.
echo ⚠️  WARNING: This will permanently delete unused tables!
echo.
echo Press Ctrl+C to cancel or
pause

echo.
echo Checking current database structure...
php check-actual-tables.php

echo.
echo ========================================
echo Running cleanup migrations...
echo ========================================
php artisan migrate

echo.
echo ========================================
echo Verifying cleanup...
echo ========================================
php check-actual-tables.php

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Tables removed:
echo - admin (old duplicate table)
echo - users (unused)
echo - telescope_entries (dev tool)
echo - telescope_entries_tags (dev tool)
echo - telescope_monitoring (dev tool)
echo - notifications_backup_20251111_153655 (backup)
echo - yearly_reports (unused)
echo.
echo Tables added:
echo - system_logs (new)
echo.
echo Active tables:
echo - admins (consolidated)
echo - teachers
echo - tools_equipment
echo - borrow_requests
echo - teacher_inventory
echo - inventory_logs
echo - system_logs
echo - notifications
echo - reports
echo - personal_access_tokens
echo - cache, sessions, jobs (Laravel system)
echo.
pause
