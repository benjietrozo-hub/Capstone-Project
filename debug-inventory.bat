@echo off
echo ========================================
echo   DEBUGGING INVENTORY ISSUE
echo ========================================
echo.

echo Step 1: Checking database...
cd backend
php debug-inventory-detailed.php
echo.

echo ========================================
echo.
echo Next steps:
echo.
echo 1. Make sure backend is running:
echo    cd backend
echo    php artisan serve
echo.
echo 2. Make sure frontend is running:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser and go to:
echo    http://localhost:5173/login
echo.
echo 4. Login with:
echo    Username: benjie.trozo
echo    Password: p@ssw0rd
echo.
echo 5. Go to Inventory page and check the DEBUG PANEL
echo.
echo 6. Press F12 and check Console tab for logs
echo.
echo 7. Read DEBUG_INVENTORY_NOW.md for detailed steps
echo.
echo ========================================
pause
