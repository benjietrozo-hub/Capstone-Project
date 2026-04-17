@echo off
echo ========================================
echo Starting Online IMS Services
echo ========================================
echo.

echo [1/4] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd backend && php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak > nul

echo [2/4] Starting Task Scheduler...
start "Task Scheduler" cmd /k "cd backend && php artisan schedule:work"
timeout /t 2 /nobreak > nul

echo [3/4] Starting WebSocket Server...
start "WebSocket Server" cmd /k "cd websocket && php websocket_server.php"
timeout /t 2 /nobreak > nul

echo [4/5] Starting Laravel Queue Worker...
start "Queue Worker" cmd /k "cd backend && php artisan queue:work --queue=default --tries=3"
timeout /t 2 /nobreak > nul

echo [5/5] Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:    http://YOUR_IP_ADDRESS:8000 (also http://localhost:8000)
echo Frontend:   http://YOUR_IP_ADDRESS:5173 (also http://localhost:5173)
echo Scheduler:  Running (return reminders and overdue notifications)
echo WebSocket:  ws://YOUR_IP_ADDRESS:8080 (also ws://localhost:8080)
echo.
echo NOTE: Replace YOUR_IP_ADDRESS with your actual IP from 'ipconfig'
echo Access from phone: http://YOUR_IP_ADDRESS:5173
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq Laravel Backend*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Task Scheduler*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq WebSocket Server*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Queue Worker*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Frontend Dev Server*" /T /F > nul 2>&1

echo All services stopped.
pause
