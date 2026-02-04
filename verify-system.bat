@echo off
REM Role-Based Login System - Verification Script
REM This script checks if all components are properly configured

echo.
echo ========================================
echo Role-Based Login System Verification
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Color codes (using number instead for compatibility)
set "GREEN=[OK]"
set "RED=[FAIL]"
set "YELLOW=[WARN]"

REM Counter for results
set "total=0"
set "passed=0"
set "failed=0"

REM Check 1: Backend API
echo.
echo Checking Backend API...
echo.

for /f %%i in ('powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost/OlineIMS/backend/public/api/test' -TimeoutSec 3 -ErrorAction Stop).StatusCode } catch { Write-Output 'error' }"') do (
    set "status=%%i"
)

if "%status%"=="200" (
    echo %GREEN% Backend API is running
    set /a passed+=1
) else (
    echo %RED% Backend API is NOT responding
    echo      Try: Start Apache in XAMPP
    set /a failed+=1
)
set /a total+=1

REM Check 2: Frontend Files
echo.
echo Checking Frontend Files...
echo.

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\context\AuthContext.jsx" (
    echo %GREEN% AuthContext.jsx exists
    set /a passed+=1
) else (
    echo %RED% AuthContext.jsx NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\pages\LoginPage.jsx" (
    echo %GREEN% LoginPage.jsx exists
    set /a passed+=1
) else (
    echo %RED% LoginPage.jsx NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\components\common\ProtectedRoute.jsx" (
    echo %GREEN% ProtectedRoute.jsx exists
    set /a passed+=1
) else (
    echo %RED% ProtectedRoute.jsx NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\components\common\RoleBasedRedirect.jsx" (
    echo %GREEN% RoleBasedRedirect.jsx exists
    set /a passed+=1
) else (
    echo %RED% RoleBasedRedirect.jsx NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\utils\roleUtils.js" (
    echo %GREEN% roleUtils.js exists
    set /a passed+=1
) else (
    echo %RED% roleUtils.js NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\frontend\src\hooks\useRole.js" (
    echo %GREEN% useRole.js exists
    set /a passed+=1
) else (
    echo %RED% useRole.js NOT found
    set /a failed+=1
)
set /a total+=1

REM Check 3: Backend Files
echo.
echo Checking Backend Files...
echo.

if exist "c:\xampp\htdocs\OlineIMS\backend\app\Http\Controllers\API\Auth\AdminAuthController.php" (
    echo %GREEN% AdminAuthController.php exists
    set /a passed+=1
) else (
    echo %RED% AdminAuthController.php NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\backend\app\Http\Controllers\API\Auth\TeacherAuthController.php" (
    echo %GREEN% TeacherAuthController.php exists
    set /a passed+=1
) else (
    echo %RED% TeacherAuthController.php NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\backend\routes\api.php" (
    echo %GREEN% api.php exists
    set /a passed+=1
) else (
    echo %RED% api.php NOT found
    set /a failed+=1
)
set /a total+=1

REM Check 4: Documentation Files
echo.
echo Checking Documentation Files...
echo.

if exist "c:\xampp\htdocs\OlineIMS\RBAC_DOCUMENTATION.md" (
    echo %GREEN% RBAC_DOCUMENTATION.md exists
    set /a passed+=1
) else (
    echo %RED% RBAC_DOCUMENTATION.md NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\TESTING_GUIDE.md" (
    echo %GREEN% TESTING_GUIDE.md exists
    set /a passed+=1
) else (
    echo %RED% TESTING_GUIDE.md NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\IMPLEMENTATION_SUMMARY.md" (
    echo %GREEN% IMPLEMENTATION_SUMMARY.md exists
    set /a passed+=1
) else (
    echo %RED% IMPLEMENTATION_SUMMARY.md NOT found
    set /a failed+=1
)
set /a total+=1

if exist "c:\xampp\htdocs\OlineIMS\QUICK_REFERENCE.md" (
    echo %GREEN% QUICK_REFERENCE.md exists
    set /a passed+=1
) else (
    echo %RED% QUICK_REFERENCE.md NOT found
    set /a failed+=1
)
set /a total+=1

REM Summary
echo.
echo ========================================
echo Verification Summary
echo ========================================
echo.
echo Total Checks: %total%
echo Passed: %passed%
echo Failed: %failed%
echo.

if %failed% equ 0 (
    echo %GREEN% All checks passed! System is ready.
    echo.
    echo Next steps:
    echo   1. Start frontend: cd frontend ^&^& npm run dev
    echo   2. Open http://localhost:5174/
    echo   3. Test login with admin/password123 or teacher1/teacher123
    echo   4. See TESTING_GUIDE.md for detailed tests
) else (
    echo %RED% Some checks failed. Review the items marked above.
    echo.
    echo To fix:
    echo   1. Check backend API is running in XAMPP
    echo   2. Verify all files exist in their expected locations
    echo   3. Run npm install in frontend directory if needed
)

echo.
echo ========================================
pause
