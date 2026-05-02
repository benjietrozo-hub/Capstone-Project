<?php
/**
 * Simple WebSocket Server (No Ratchet Required)
 * Compatible with Laravel 12 and PHP 8.2+
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load Laravel's autoloader for WebSocketBroadcaster
require __DIR__ . '/../backend/vendor/autoload.php';

$host = '0.0.0.0';
$port = 8080;

echo "========================================\n";
echo "Simple WebSocket Server\n";
echo "========================================\n";
echo "Starting server on ws://{$host}:{$port}\n";
echo "Press Ctrl+C to stop\n";
echo "========================================\n\n";

// Create socket
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);
socket_bind($socket, $host, $port);
socket_listen($socket);

$clients = [];
$users = []; // Map of userId_userType => socket

echo "[" . date('Y-m-d H:i:s') . "] Server started successfully\n\n";

while (true) {
    // Process queued messages
    processQueuedMessages($users);
    
    // Prepare read sockets
    $read = array_merge([$socket], $clients);
    $write = null;
    $except = null;
    
    // Select with short timeout (100ms) for responsiveness
    if (socket_select($read, $write, $except, 0, 100000) < 1) {
        // Still process queued messages even if no socket activity
        processQueuedMessages($users);
        continue;
    }
    
    // Handle new connections
    if (in_array($socket, $read)) {
        $newSocket = socket_accept($socket);
        $clients[] = $newSocket;
        
        $header = socket_read($newSocket, 1024);
        performHandshake($header, $newSocket, $host, $port);
        
        echo "[" . date('Y-m-d H:i:s') . "] New connection\n";
        
        $key = array_search($socket, $read);
        unset($read[$key]);
    }
    
    // Handle client messages
    foreach ($read as $client) {
        $data = @socket_read($client, 1024, PHP_BINARY_READ);
        
        if ($data === false || $data === '') {
            // Client disconnected
            $key = array_search($client, $clients);
            unset($clients[$key]);
            
            // Remove from users map
            foreach ($users as $userKey => $userSocket) {
                if ($userSocket === $client) {
                    unset($users[$userKey]);
                    echo "[" . date('Y-m-d H:i:s') . "] User disconnected: {$userKey}\n";
                    break;
                }
            }
            
            @socket_close($client);
            continue;
        }
        
        $message = unmask($data);
        if ($message) {
            handleMessage($message, $client, $users);
        }
    }
}

socket_close($socket);

/**
 * Perform WebSocket handshake
 */
function performHandshake($headers, $socket, $host, $port) {
    $lines = preg_split("/\r\n/", $headers);
    $key = '';
    
    foreach ($lines as $line) {
        if (preg_match('/Sec-WebSocket-Key: (.*)$/i', $line, $match)) {
            $key = trim($match[1]);
            break;
        }
    }
    
    $acceptKey = base64_encode(pack('H*', sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
    
    $upgrade = "HTTP/1.1 101 Switching Protocols\r\n" .
               "Upgrade: websocket\r\n" .
               "Connection: Upgrade\r\n" .
               "Sec-WebSocket-Accept: {$acceptKey}\r\n\r\n";
    
    socket_write($socket, $upgrade, strlen($upgrade));
}

/**
 * Unmask WebSocket frame
 */
function unmask($payload) {
    $length = ord($payload[1]) & 127;
    
    if ($length == 126) {
        $masks = substr($payload, 4, 4);
        $data = substr($payload, 8);
    } elseif ($length == 127) {
        $masks = substr($payload, 10, 4);
        $data = substr($payload, 14);
    } else {
        $masks = substr($payload, 2, 4);
        $data = substr($payload, 6);
    }
    
    $text = '';
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    
    return $text;
}

/**
 * Mask data for sending
 */
function mask($text) {
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($text);
    
    if ($length <= 125) {
        $header = pack('CC', $b1, $length);
    } elseif ($length > 125 && $length < 65536) {
        $header = pack('CCn', $b1, 126, $length);
    } else {
        $header = pack('CCNN', $b1, 127, $length);
    }
    
    return $header . $text;
}

/**
 * Send message to client
 */
function sendMessage($client, $message) {
    $msg = mask(json_encode($message));
    @socket_write($client, $msg, strlen($msg));
}

/**
 * Handle incoming message
 */
function handleMessage($message, $client, &$users) {
    $data = json_decode($message, true);
    
    if (!$data || !isset($data['type'])) {
        return;
    }
    
    switch ($data['type']) {
        case 'register':
            $userId = $data['user_id'] ?? null;
            $userType = $data['user_type'] ?? null;
            
            if ($userId && $userType) {
                $key = "{$userId}_{$userType}";
                $users[$key] = $client;
                
                echo "[" . date('Y-m-d H:i:s') . "] User registered: {$key}\n";
                
                sendMessage($client, [
                    'type' => 'registered',
                    'success' => true,
                    'timestamp' => time()
                ]);
            }
            break;
            
        case 'ping':
            sendMessage($client, [
                'type' => 'pong',
                'timestamp' => time()
            ]);
            break;
    }
}

/**
 * Process queued messages from file system
 */
function processQueuedMessages(&$users) {
    static $lastCheck = 0;
    $now = microtime(true);
    
    // Check every 100ms
    if ($now - $lastCheck < 0.1) {
        return;
    }
    
    $lastCheck = $now;
    
    try {
        $messages = App\WebSocket\WebSocketBroadcaster::getQueuedMessages();
        
        if (empty($messages)) {
            return;
        }
        
        foreach ($messages as $message) {
            if (!isset($message['type']) || !isset($message['target'])) {
                continue;
            }
            
            $target = $message['target'];
            $data = $message['data'] ?? [];
            
            switch ($message['type']) {
                case 'notification':
                    if (isset($target['user_id']) && isset($target['user_type'])) {
                        // Send to specific user
                        $key = "{$target['user_id']}_{$target['user_type']}";
                        if (isset($users[$key])) {
                            sendMessage($users[$key], [
                                'type' => 'notification',
                                'notification' => $data,
                                'timestamp' => time()
                            ]);
                            echo "[" . date('Y-m-d H:i:s') . "] Sent notification to {$key}\n";
                        }
                    } elseif (isset($target['user_type'])) {
                        // Broadcast to all users of this type
                        $sent = 0;
                        foreach ($users as $key => $socket) {
                            if (strpos($key, "_{$target['user_type']}") !== false) {
                                sendMessage($socket, [
                                    'type' => 'notification',
                                    'notification' => $data,
                                    'timestamp' => time()
                                ]);
                                $sent++;
                            }
                        }
                        echo "[" . date('Y-m-d H:i:s') . "] Broadcasted notification to {$sent} {$target['user_type']} user(s)\n";
                    }
                    break;
                    
                case 'log_update':
                    // Broadcast to all admin users
                    $sent = 0;
                    foreach ($users as $key => $socket) {
                        if (strpos($key, "_admin") !== false) {
                            sendMessage($socket, [
                                'type' => 'log_update',
                                'log' => $data,
                                'timestamp' => time()
                            ]);
                            $sent++;
                        }
                    }
                    if ($sent > 0) {
                        echo "[" . date('Y-m-d H:i:s') . "] Broadcasted log update to {$sent} admin user(s)\n";
                    }
                    break;
                    
                case 'stats_update':
                case 'inventory_update':
                case 'request_update':
                    if (isset($target['user_type'])) {
                        $sent = 0;
                        foreach ($users as $key => $socket) {
                            if (strpos($key, "_{$target['user_type']}") !== false) {
                                sendMessage($socket, [
                                    'type' => $message['type'],
                                    'data' => $data,
                                    'timestamp' => time()
                                ]);
                                $sent++;
                            }
                        }
                        echo "[" . date('Y-m-d H:i:s') . "] Broadcasted {$message['type']} to {$sent} {$target['user_type']} user(s)\n";
                    }
                    break;
            }
        }
    } catch (Exception $e) {
        echo "[" . date('Y-m-d H:i:s') . "] Error processing queued messages: " . $e->getMessage() . "\n";
    }
}
