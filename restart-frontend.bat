@echo off
echo Clearing Vite cache and restarting frontend...
echo.

cd frontend

echo Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist

echo.
echo Cache cleared!
echo.
echo Now restart your dev server with: npm run dev
echo.
pause
