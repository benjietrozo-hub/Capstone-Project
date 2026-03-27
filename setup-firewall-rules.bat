@echo off
echo ========================================
echo Setting up Windows Firewall Rules
echo ========================================
echo.
echo This script must be run as Administrator!
echo Right-click and select "Run as administrator"
echo.
pause

echo Adding firewall rules...
echo.

echo [1/4] Allowing Vite Dev Server (port 5173)...
netsh advfirewall firewall delete rule name="Vite Dev Server" > nul 2>&1
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
echo Done!

echo [2/4] Allowing Laravel Backend (port 8000)...
netsh advfirewall firewall delete rule name="Laravel Backend" > nul 2>&1
netsh advfirewall firewall add rule name="Laravel Backend" dir=in action=allow protocol=TCP localport=8000
echo Done!

echo [3/4] Allowing Apache HTTP (port 80)...
netsh advfirewall firewall delete rule name="Apache HTTP" > nul 2>&1
netsh advfirewall firewall add rule name="Apache HTTP" dir=in action=allow protocol=TCP localport=80
echo Done!

echo [4/4] Allowing WebSocket Server (port 8080)...
netsh advfirewall firewall delete rule name="WebSocket Server" > nul 2>&1
netsh advfirewall firewall add rule name="WebSocket Server" dir=in action=allow protocol=TCP localport=8080
echo Done!

echo.
echo ========================================
echo Firewall rules configured successfully!
echo ========================================
echo.
echo You can now access the application from other devices:
echo   Frontend: http://172.21.160.1:5173
echo   Backend:  http://172.21.160.1:8000
echo.
pause
