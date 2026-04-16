<?php
/**
 * Simple WebSocket Connection Test
 * Tests if the WebSocket server is responding
 */

require_once __DIR__ . '/vendor/autoload.php';

echo "Testing WebSocket server...\n";

// Test if WebSocket server is running on port 8080
$socket = @fsockopen('localhost', 8080, $errno, $errstr, 2);

if ($socket) {
    echo "WebSocket server is responding on port 8080\n";
    fclose($socket);
    
    // Test WebSocket handshake
    $key = base64_encode(random_bytes(16));
    $headers = "GET / HTTP/1.1\r\n";
    $headers .= "Host: localhost:8080\r\n";
    $headers .= "Upgrade: websocket\r\n";
    $headers .= "Connection: Upgrade\r\n";
    $headers .= "Sec-WebSocket-Key: $key\r\n";
    $headers .= "Sec-WebSocket-Version: 13\r\n";
    $headers .= "\r\n";
    
    $socket = @fsockopen('localhost', 8080, $errno, $errstr, 2);
    if ($socket) {
        fwrite($socket, $headers);
        $response = fread($socket, 1024);
        
        if (strpos($response, '101 Switching Protocols') !== false) {
            echo "WebSocket handshake successful\n";
        } else {
            echo "WebSocket handshake failed\n";
            echo "Response: " . substr($response, 0, 200) . "...\n";
        }
        fclose($socket);
    }
} else {
    echo "WebSocket server is not responding on port 8080\n";
    echo "Error: $errstr ($errno)\n";
    echo "\nMake sure the WebSocket server is running:\n";
    echo "php websocket_server.php\n";
}

echo "\nTest completed.\n";
