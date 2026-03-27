@echo off
echo ========================================
echo Quick System Test
echo ========================================
echo.

echo 1. Testing WebSocket server connection...
php -r "
$socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
$result = @socket_connect($socket, 'localhost', 8080);
if ($result) {
    echo '✅ WebSocket server is RUNNING on port 8080\n';
    socket_close($socket);
} else {
    echo '❌ WebSocket server is NOT running\n';
    echo '   Run: cd websocket && php simple_websocket_server.php\n';
}
"

echo.
echo 2. Testing Laravel backend...
php -r "
$context = stream_context_create(['http' => ['timeout' => 1]]);
$response = @file_get_contents('http://localhost:8000', false, $context);
if ($response) {
    echo '✅ Laravel backend is RUNNING on port 8000\n';
} else {
    echo '❌ Laravel backend is NOT running\n';
    echo '   Run: cd backend && php artisan serve --port=8000\n';
}
"

echo.
echo 3. Testing Vite frontend...
netstat -ano | findstr :5173 >nul
if %errorlevel% == 0 (
    echo '✅ Vite frontend is RUNNING on port 5173'
) else (
    echo '❌ Vite frontend is NOT running'
    echo '   Run: cd frontend && npm run dev'
)

echo.
echo ========================================
pause
