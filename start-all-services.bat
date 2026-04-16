@echo off
echo ========================================
echo Starting Online IMS Services
echo ========================================
echo.

echo [1/3] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd backend && php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Task Scheduler...
start "Task Scheduler" cmd /k "cd backend && php artisan schedule:work"
timeout /t 2 /nobreak > nul

echo [3/3] Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:    http://YOUR_IP_ADDRESS:8000 (also http://localhost:8000)
echo Frontend:   http://YOUR_IP_ADDRESS:5173 (also http://localhost:5173)
echo Scheduler:  Running (return reminders & overdue notifications)
echo WebSocket:  Disabled (not needed - system works without it)
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
taskkill /FI "WindowTitle eq Frontend Dev Server*" /T /F > nul 2>&1

echo All services stopped.
pause
