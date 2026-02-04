@echo off
REM Check WebSocket Server Status

echo.
echo ========================================
echo WebSocket Server Status Check
echo ========================================
echo.

netstat -ano | findstr :8080

echo.
if errorlevel 1 (
    echo WebSocket server is NOT running on port 8080
) else (
    echo WebSocket server is running on port 8080
)

echo.
echo To start the server, run: start-websocket.bat
echo.

pause
