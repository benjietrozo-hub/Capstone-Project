@echo off
echo ========================================
echo Checking Online IMS Services Status
echo ========================================
echo.

echo [1/4] Laravel Backend (Port 8000)...
netstat -ano | findstr :8000 > nul
if errorlevel 1 (
    echo    [X] NOT RUNNING
) else (
    echo    [OK] RUNNING
)

echo.
echo [2/4] Frontend Dev Server (Port 5173)...
netstat -ano | findstr :5173 > nul
if errorlevel 1 (
    echo    [X] NOT RUNNING
) else (
    echo    [OK] RUNNING
)

echo.
echo [3/4] WebSocket Server (Port 8080)...
netstat -ano | findstr :8080 > nul
if errorlevel 1 (
    echo    [X] NOT RUNNING
) else (
    echo    [OK] RUNNING
)

echo.
echo [4/4] Task Scheduler...
tasklist /FI "WindowTitle eq Task Scheduler*" 2>nul | findstr cmd.exe > nul
if errorlevel 1 (
    echo    [X] NOT RUNNING
) else (
    echo    [OK] RUNNING
)

echo.
echo ========================================
echo Service URLs:
echo ========================================
echo Backend:   http://localhost:8000
echo Frontend:  http://localhost:5173
echo WebSocket: ws://localhost:8080
echo.

pause
