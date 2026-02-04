@echo off
echo ========================================
echo   VERIFYING INVENTORY FIX
echo ========================================
echo.

echo Step 1: Checking database items...
cd backend
php check-inventory-items.php
echo.

echo Step 2: Testing API endpoint...
php test-xampp-inventory.php
echo.

echo ========================================
echo   VERIFICATION COMPLETE
echo ========================================
echo.
echo If you see 8 items above, the backend is working!
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& php artisan serve
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Login at: http://localhost:5173/login
echo 4. Username: benjie.trozo
echo 5. Password: p@ssw0rd
echo 6. Go to Inventory page
echo.
pause
