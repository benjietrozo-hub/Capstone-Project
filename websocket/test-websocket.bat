@echo off
REM Test WebSocket Server Connection
echo.
echo ========================================
echo WebSocket Server Connection Test
echo ========================================
echo.

REM Check if server is running
echo Checking if WebSocket server is running on port 8080...
netstat -ano | findstr :8080 > nul
if errorlevel 1 (
    echo.
    echo [ERROR] WebSocket server is NOT running on port 8080
    echo.
    echo Please start the server first using: start-websocket.bat
    echo.
    pause
    exit /b 1
)

echo [OK] WebSocket server is running on port 8080
echo.

REM Test connection using PHP
echo Testing WebSocket connection...
echo.
php "%~dp0test_connection.php"

if errorlevel 1 (
    echo.
    echo [ERROR] Connection test failed
    echo.
) else (
    echo.
    echo [SUCCESS] WebSocket server is working correctly
    echo.
)

pause
