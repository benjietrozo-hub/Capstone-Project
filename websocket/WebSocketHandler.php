<?php
namespace App\WebSocket;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class WebSocketHandler implements MessageComponentInterface {
    protected $clients;
    protected $users; // Map of userId_userType => ConnectionInterface
    protected $loop;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->users = [];
    }

    public function setLoop($loop) {
        $this->loop = $loop;

        // Process queued messages every 100ms for near-instant relay
        $this->loop->addPeriodicTimer(0.1, function() {
            $this->processQueuedMessages();
        });
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection
        $this->clients->attach($conn);
        echo "[" . date('Y-m-d H:i:s') . "] New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        if (!$data || !isset($data['type'])) {
            return;
        }

        switch ($data['type']) {
            case 'register':
                // Register user connection
                $userId = $data['user_id'] ?? null;
                $userType = $data['user_type'] ?? null;

                if ($userId && $userType) {
                    $key = "{$userId}_{$userType}";
                    
                    // Initialize array for this user if not exists
                    if (!isset($this->users[$key])) {
                        $this->users[$key] = [];
                    }
                    
                    // Add this connection if not already in the array
                    if (!in_array($from, $this->users[$key], true)) {
                        $this->users[$key][] = $from;
                    }
                    
                    $from->userKey = $key;

                    echo "[" . date('Y-m-d H:i:s') . "] User registered: {$key} (Total connections for user: " . count($this->users[$key]) . ")\n";
                    
                    // Send confirmation
                    $from->send(json_encode([
                        'type' => 'registered',
                        'success' => true,
                        'timestamp' => time()
                    ]));
                }
                break;

            case 'ping':
                // Heartbeat to keep connection alive
                $from->send(json_encode([
                    'type' => 'pong',
                    'timestamp' => time()
                ]));
                break;

            default:
                echo "[" . date('Y-m-d H:i:s') . "] Unknown message type: {$data['type']}\n";
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // Remove user connection from users map
        if (isset($conn->userKey) && isset($this->users[$conn->userKey])) {
            $key = array_search($conn, $this->users[$conn->userKey], true);
            if ($key !== false) {
                unset($this->users[$conn->userKey][$key]);
                
                // If no more connections for this user, remove the key
                if (empty($this->users[$conn->userKey])) {
                    unset($this->users[$conn->userKey]);
                    echo "[" . date('Y-m-d H:i:s') . "] Last connection for user {$conn->userKey} disconnected\n";
                } else {
                    echo "[" . date('Y-m-d H:i:s') . "] One connection for user {$conn->userKey} disconnected (Remaining: " . count($this->users[$conn->userKey]) . ")\n";
                }
            }
        }

        // Remove connection from general list
        $this->clients->detach($conn);
        echo "[" . date('Y-m-d H:i:s') . "] Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "[" . date('Y-m-d H:i:s') . "] An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }

    /**
     * Broadcast notification to specific user
     */
    public function sendToUser($userId, $userType, $message) {
        $key = "{$userId}_{$userType}";
        if (isset($this->users[$key])) {
            $sent = 0;
            foreach ($this->users[$key] as $conn) {
                $conn->send(json_encode($message));
                $sent++;
            }
            return $sent > 0;
        }
        return false;
    }

    /**
     * Broadcast to all users of a specific type
     */
    public function broadcastToUserType($userType, $message) {
        $sent = 0;
        foreach ($this->users as $key => $connections) {
            if (strpos($key, "_{$userType}") !== false) {
                foreach ($connections as $conn) {
                    $conn->send(json_encode($message));
                    $sent++;
                }
            }
        }
        return $sent;
    }

    /**
     * Broadcast to all connected users
     */
    public function broadcastToAll($message) {
        $sent = 0;
        foreach ($this->clients as $client) {
            $client->send(json_encode($message));
            $sent++;
        }
        return $sent;
    }

    /**
     * Get all registered user keys
     */
    public function getUsers() {
        return array_keys($this->users);
    }

    /**
     * Process queued messages from file system
     */
    protected function processQueuedMessages() {
        try {
            $messages = WebSocketBroadcaster::getQueuedMessages();
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
                            $sent = $this->sendToUser($target['user_id'], $target['user_type'], [
                                'type' => 'notification',
                                'notification' => $data,
                                'timestamp' => time()
                            ]);
                            if ($sent) {
                                echo "[" . date('Y-m-d H:i:s') . "] Sent notification to user {$target['user_id']} ({$target['user_type']})\n";
                            } else {
                                echo "[" . date('Y-m-d H:i:s') . "] User {$target['user_id']} ({$target['user_type']}) not connected\n";
                            }
                        } elseif (isset($target['user_type'])) {
                            // Broadcast to all users of this type
                            $sentCount = $this->broadcastToUserType($target['user_type'], [
                                'type' => 'notification',
                                'notification' => $data,
                                'timestamp' => time()
                            ]);
                            echo "[" . date('Y-m-d H:i:s') . "] Broadcasted notification to {$sentCount} {$target['user_type']} connection(s)\n";
                        }
                        break;

                    case 'stats_update':
                        if (isset($target['user_type'])) {
                            $sentCount = $this->broadcastToUserType($target['user_type'], [
                                'type' => 'stats_update',
                                'stats' => $data,
                                'timestamp' => time()
                            ]);
                            echo "[" . date('Y-m-d H:i:s') . "] Broadcasted stats update to {$sentCount} {$target['user_type']} connection(s)\n";
                        }
                        break;

                    case 'inventory_update':
                        if (isset($target['user_type'])) {
                            $sentCount = $this->broadcastToUserType($target['user_type'], [
                                'type' => 'inventory_update',
                                'inventory' => $data,
                                'timestamp' => time()
                            ]);
                            echo "[" . date('Y-m-d H:i:s') . "] Broadcasted inventory update to {$sentCount} {$target['user_type']} connection(s)\n";
                        }
                        break;

                    case 'request_update':
                        if (isset($target['user_id']) && isset($target['user_type'])) {
                            $this->sendToUser($target['user_id'], $target['user_type'], [
                                'type' => 'request_update',
                                'request' => $data,
                                'timestamp' => time()
                            ]);
                        } elseif (isset($target['user_type'])) {
                            $this->broadcastToUserType($target['user_type'], [
                                'type' => 'request_update',
                                'request' => $data,
                                'timestamp' => time()
                            ]);
                        }
                        break;

                    case 'log_update':
                        // Broadcast log updates to all admin users
                        $sentCount = $this->broadcastToUserType('admin', [
                            'type' => 'log_update',
                            'log' => $data,
                            'timestamp' => time()
                        ]);
                        if ($sentCount > 0) {
                            echo "[" . date('Y-m-d H:i:s') . "] Broadcasted log update to {$sentCount} admin connection(s)\n";
                        }
                        break;
                }
            }
        } catch (\Exception $e) {
            echo "[" . date('Y-m-d H:i:s') . "] Error processing queued messages: " . $e->getMessage() . "\n";
        }
    }
}
