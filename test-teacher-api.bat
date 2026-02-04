@echo off
echo Testing Teacher API Endpoints...
echo.

echo 1. Testing GET /api/admin/teacher-departments
curl -X GET "http://localhost:8000/api/admin/teacher-departments" ^
  -H "Accept: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

echo.
echo.
echo 2. Testing POST /api/admin/teachers (Create Teacher)
echo Note: Replace YOUR_TOKEN_HERE with actual admin token
echo.

pause
