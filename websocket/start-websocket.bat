@echo off
REM Start WebSocket Server for Online Inventory Management System
REM This script will start the Ratchet WebSocket server on port 8080

echo.
echo ========================================
echo WebSocket Server Startup
echo ========================================
echo.

REM Check if vendor directory exists
if not exist "%~dp0vendor" (
    echo ERROR: WebSocket vendor directory not found!
    echo.
    echo Installing dependencies...
    cd "%~dp0"
    composer install --no-interaction
    echo.
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Check if vendor/autoload.php exists (verify installation)
if not exist "%~dp0vendor\autoload.php" (
    echo ERROR: Composer autoload file not found!
    echo.
    echo Reinstalling dependencies...
    cd "%~dp0"
    rmdir /s /q vendor 2>nul
    composer install --no-interaction
    echo.
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo Starting WebSocket server on ws://localhost:8080...
echo Press Ctrl+C to stop the server.
echo.
echo Server logs:
echo ----------------------------------------
echo.

php "%~dp0websocket_server.php"

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: WebSocket server failed to start
    echo ========================================
    echo.
    echo Possible issues:
    echo   1. Port 8080 is already in use
    echo   2. PHP is not in PATH
    echo   3. Missing dependencies (run: composer install in backend folder)
    echo.
    echo To check if port 8080 is in use:
    echo   netstat -ano ^| findstr :8080
    echo.
)

pause
