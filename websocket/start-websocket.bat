@echo off
REM Start WebSocket Server for Online Inventory Management System
REM This script will start the Ratchet WebSocket server on port 8080

echo.
echo ========================================
echo WebSocket Server Startup
echo ========================================
echo.

cd /d "%~dp0..\online-ims-backend"

echo Starting WebSocket server on ws://localhost:8080...
echo Press Ctrl+C to stop the server.
echo.

php "%~dp0websocket_server.php"

pause
