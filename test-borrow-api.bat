@echo off
echo ========================================
echo Testing Borrow Request API
echo ========================================
echo.

echo Checking if backend server is running...
curl -s http://localhost:8000/api/test
echo.
echo.

echo If you see "API is working" above, the backend is running!
echo.
echo Now try submitting a borrow request from the frontend.
echo.
pause
