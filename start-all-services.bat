@echo off
echo ========================================
echo Starting Online IMS Services
echo ========================================
echo.

echo [1/4] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd backend && php artisan serve"
timeout /t 3 /nobreak > nul

echo [2/4] Starting WebSocket Server...
start "WebSocket Server" cmd /k "cd websocket && php websocket_server.php"
timeout /t 3 /nobreak > nul

echo [3/4] Starting Task Scheduler...
start "Task Scheduler" cmd /k "cd backend && php artisan schedule:work"
timeout /t 2 /nobreak > nul

echo [4/4] Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:    http://localhost:8000
echo Frontend:   http://localhost:5173
echo WebSocket:  ws://localhost:8080
echo Scheduler:  Running (return reminders & overdue notifications)
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq Laravel Backend*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq WebSocket Server*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Task Scheduler*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Frontend Dev Server*" /T /F > nul 2>&1

echo All services stopped.
pause
