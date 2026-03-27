<?php
echo "========================================\n";
echo "System Status Check\n";
echo "========================================\n\n";

// Test WebSocket server
echo "1. WebSocket Server (Port 8080):\n";
$socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
$result = @socket_connect($socket, 'localhost', 8080);
if ($result) {
    echo "   ✅ RUNNING\n";
    socket_close($socket);
} else {
    echo "   ❌ NOT RUNNING\n";
    echo "   Start with: cd websocket && php simple_websocket_server.php\n";
}

// Test Laravel backend
echo "\n2. Laravel Backend (Port 8000):\n";
$context = stream_context_create(['http' => ['timeout' => 1]]);
$response = @file_get_contents('http://localhost:8000', false, $context);
if ($response) {
    echo "   ✅ RUNNING\n";
} else {
    echo "   ❌ NOT RUNNING\n";
    echo "   Start with: cd backend && php artisan serve --port=8000\n";
}

// Test Vite frontend
echo "\n3. Vite Frontend (Port 5173):\n";
$socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
$result = @socket_connect($socket, 'localhost', 5173);
if ($result) {
    echo "   ✅ RUNNING\n";
    socket_close($socket);
} else {
    echo "   ❌ NOT RUNNING\n";
    echo "   Start with: cd frontend && npm run dev\n";
}

echo "\n========================================\n";
echo "Next Steps:\n";
echo "1. Start WebSocket server first\n";
echo "2. Start Laravel backend\n";
echo "3. Start Vite frontend\n";
echo "4. Clear browser cache and test\n";
echo "========================================\n";
?>
