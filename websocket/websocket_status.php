<?php
/**
 * WebSocket Server Status Check
 * Check if the WebSocket server is running
 */

$port = 8080;
$host = 'localhost';

// Try to connect to WebSocket server
$connection = @fsockopen($host, $port, $errno, $errstr, 2);

if ($connection) {
    fclose($connection);
    echo json_encode([
        'status' => 'running',
        'message' => "WebSocket server is running on ws://{$host}:{$port}",
        'port' => $port,
        'host' => $host
    ]);
} else {
    echo json_encode([
        'status' => 'offline',
        'message' => "WebSocket server is NOT running on ws://{$host}:{$port}",
        'error' => $errstr,
        'port' => $port,
        'host' => $host
    ]);
}
