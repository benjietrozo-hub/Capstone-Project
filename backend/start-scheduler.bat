@echo off
REM Start Laravel Task Scheduler
REM This will run scheduled tasks like return reminders

echo.
echo ========================================
echo Laravel Task Scheduler
echo ========================================
echo.
echo Starting scheduler...
echo This will check for scheduled tasks every minute.
echo.
echo Scheduled tasks:
echo   - Return reminders (1 day before) - Daily at 9:00 AM
echo   - Return reminders (3 days before) - Daily at 9:00 AM
echo   - Overdue notifications - Daily at 10:00 AM
echo.
echo Press Ctrl+C to stop the scheduler.
echo ========================================
echo.

php artisan schedule:work

pause
