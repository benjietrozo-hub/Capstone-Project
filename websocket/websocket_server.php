<?php
/**
 * WebSocket Server for Online Inventory Management System
 *
 * Run this server using: php websocket_server.php
 * Or use: composer run-script websocket-server
 *
 * Make sure to install dependencies first: composer install
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/../online-ims-backend/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\WebSocket\WebSocketHandler;

// WebSocket server configuration
$port = getenv('WEBSOCKET_PORT') ?: 8080;
$host = getenv('WEBSOCKET_HOST') ?: '0.0.0.0';

echo "Starting WebSocket server on {$host}:{$port}...\n";
echo "Press Ctrl+C to stop the server.\n\n";

// Create WebSocket handler instance
$handler = new WebSocketHandler();

// Create the server
$server = IoServer::factory(
    new HttpServer(
        new WsServer($handler)
    ),
    $port,
    $host
);

// Set event loop for periodic tasks
$handler->setLoop($server->loop);

// Store handler instance globally for broadcasting
$GLOBALS['websocket_handler'] = $handler;

// Run the server
$server->run();
