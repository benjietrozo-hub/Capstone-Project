<?php
/**
 * Test Real-Time Notification
 */

require_once __DIR__ . '/backend/vendor/autoload.php';

// Initialize WebSocket broadcaster
App\WebSocket\WebSocketBroadcaster::init();

// Send a test notification to admin users
$result = App\WebSocket\WebSocketBroadcaster::broadcastToUserType('admin', [
    'type' => 'test',
    'title' => 'Test Notification',
    'message' => 'Real-time notifications are working!',
    'timestamp' => date('Y-m-d H:i:s')
]);

if ($result) {
    echo "✅ Test notification sent successfully!\n";
    echo "Check your browser console for WebSocket messages.\n";
    echo "Make sure WebSocket server is running on port 8080.\n";
} else {
    echo "❌ Failed to send test notification.\n";
    echo "Make sure the WebSocket queue directory is writable.\n";
}

echo "\nTo start WebSocket server:\n";
echo "cd websocket && php simple_websocket_server.php\n";
?>
