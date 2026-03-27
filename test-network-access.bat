@echo off
echo ========================================
echo Network Access Troubleshooting
echo ========================================
echo.

echo [1] Your IP Addresses:
echo ----------------------------------------
ipconfig | findstr /i "IPv4"
echo.

echo [2] Checking if Vite server is running on port 5173:
echo ----------------------------------------
netstat -ano | findstr :5173
echo.

echo [3] Checking Windows Firewall rules:
echo ----------------------------------------
netsh advfirewall firewall show rule name="Vite Dev Server"
echo.

echo [4] Testing if port 5173 is accessible:
echo ----------------------------------------
echo Run this on your phone's browser: http://YOUR_IP:5173
echo.

echo [5] Current firewall status:
echo ----------------------------------------
netsh advfirewall show allprofiles state
echo.

echo ========================================
echo Troubleshooting Steps:
echo ========================================
echo.
echo If Vite is NOT running on 0.0.0.0:5173:
echo   - Stop services and restart with: start-all-services.bat
echo   - Or run manually: cd frontend && npm run dev -- --host 0.0.0.0
echo.
echo If firewall is blocking:
echo   - Run: setup-firewall-rules.bat (as Administrator)
echo   - Or temporarily disable Windows Firewall to test
echo.
echo If devices are on different networks:
echo   - Connect phone to same WiFi as PC
echo   - Check if WiFi has AP isolation enabled (disable it)
echo.
pause
