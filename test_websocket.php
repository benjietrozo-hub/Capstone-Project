<?php
/**
 * Test WebSocket Connection
 */

echo "Testing WebSocket Server...\n";

// Test if WebSocket server is running
$host = '192.168.100.106';
$port = 8080;

$socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if ($socket === false) {
    echo "Failed to create socket\n";
    exit(1);
}

$result = @socket_connect($socket, $host, $port);
if ($result === false) {
    echo "WebSocket server is NOT running on ws://{$host}:{$port}\n";
    echo "Please start the WebSocket server first:\n";
    echo "cd websocket && php simple_websocket_server.php\n";
    socket_close($socket);
    exit(1);
}

echo "WebSocket server is RUNNING on ws://{$host}:{$port}\n";
socket_close($socket);

// Test WebSocket queue directory
$queueDir = __DIR__ . '/websocket/queue';
if (!is_dir($queueDir)) {
    echo "Creating queue directory...\n";
    mkdir($queueDir, 0755, true);
}

echo "Queue directory exists: " . (is_dir($queueDir) ? "YES" : "NO") . "\n";

// Test WebSocketBroadcaster
require_once __DIR__ . '/backend/vendor/autoload.php';

try {
    \App\WebSocket\WebSocketBroadcaster::init();
    echo "WebSocketBroadcaster initialized successfully\n";
    
    // Test broadcasting a message
    $result = \App\WebSocket\WebSocketBroadcaster::broadcastToUserType('admin', [
        'type' => 'test',
        'title' => 'Test Notification',
        'message' => 'WebSocket is working!',
        'timestamp' => time()
    ]);
    
    echo "Test message queued: " . ($result ? "YES" : "NO") . "\n";
} catch (Exception $e) {
    echo "WebSocketBroadcaster error: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";
?>
