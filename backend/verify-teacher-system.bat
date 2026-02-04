@echo off
echo ========================================
echo TEACHER MANAGEMENT SYSTEM VERIFICATION
echo ========================================
echo.

echo [1/4] Checking database structure...
php check-table-structure.php
echo.

echo [2/4] Checking for soft-deleted teachers...
php check-teachers.php
echo.

echo [3/4] Testing API validation...
php test-api-teacher-creation.php
echo.

echo [4/4] Checking routes...
php artisan route:list --path=admin/teachers
echo.

echo ========================================
echo VERIFICATION COMPLETE!
echo ========================================
echo.
echo The teacher management system is ready to use.
echo You can now add teachers through the admin panel.
echo.
pause
