<?php
namespace App\WebSocket;

/**
 * WebSocket Broadcaster Helper Class
 *
 * This class provides a simple way to broadcast messages to WebSocket clients
 * from PHP code without directly accessing the WebSocket server.
 *
 * It uses a simple file-based message queue that the WebSocket server reads.
 */

class WebSocketBroadcaster {
    private static $queueFile;

    public static function init() {
        $queueDir = __DIR__ . '/queue';
        if (!is_dir($queueDir)) {
            mkdir($queueDir, 0755, true);
        }
        self::$queueFile = $queueDir . '/messages.json';
    }

    /**
     * Send notification to a specific user
     */
    public static function sendToUser($userId, $userType, $notification) {
        self::init();

        $message = [
            'type' => 'notification',
            'target' => [
                'user_id' => $userId,
                'user_type' => $userType
            ],
            'data' => $notification,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Broadcast notification to all users of a specific type
     */
    public static function broadcastToUserType($userType, $notification) {
        self::init();

        $message = [
            'type' => 'notification',
            'target' => [
                'user_type' => $userType
            ],
            'data' => $notification,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Broadcast dashboard stats update
     */
    public static function broadcastStats($userType, $stats) {
        self::init();

        $message = [
            'type' => 'stats_update',
            'target' => [
                'user_type' => $userType
            ],
            'data' => $stats,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Broadcast inventory update
     */
    public static function broadcastInventoryUpdate($userType, $inventory) {
        self::init();

        $message = [
            'type' => 'inventory_update',
            'target' => [
                'user_type' => $userType
            ],
            'data' => $inventory,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Broadcast borrow request update
     */
    public static function broadcastRequestUpdate($userId, $userType, $request) {
        self::init();

        $message = [
            'type' => 'request_update',
            'target' => [
                'user_id' => $userId,
                'user_type' => $userType
            ],
            'data' => $request,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Broadcast request update to all admins
     */
    public static function broadcastRequestToAdmins($request) {
        self::init();

        $message = [
            'type' => 'request_update',
            'target' => [
                'user_type' => 'admin'
            ],
            'data' => $request,
            'timestamp' => time()
        ];

        return self::queueMessage($message);
    }

    /**
     * Generic broadcast method for custom message types
     * 
     * @param array $message Message with 'type', 'target', and 'data' keys
     * @return bool Success status
     */
    public static function broadcast($message) {
        self::init();

        // Ensure timestamp is set
        if (!isset($message['timestamp'])) {
            $message['timestamp'] = time();
        }

        return self::queueMessage($message);
    }

    /**
     * Queue a message for the WebSocket server to process
     */
    private static function queueMessage($message) {
        self::init();

        // Create a unique filename for this message
        // msg_timestamp_microtime_random.json
        $timestamp = time();
        $microtime = str_replace('.', '', microtime(true));
        $random = bin2hex(random_bytes(4));
        $filename = "msg_{$timestamp}_{$microtime}_{$random}.json";
        
        $path = dirname(self::$queueFile) . '/' . $filename;

        // Write the message to its own file
        $written = file_put_contents($path, json_encode($message));
        
        if ($written === false) {
            error_log('[WebSocketBroadcaster] Failed to write message file: ' . $path);
            return false;
        }

        return true;
    }

    /**
     * Get and clear queued messages (called by WebSocket server)
     */
    public static function getQueuedMessages() {
        self::init();
        $queueDir = dirname(self::$queueFile);

        if (!is_dir($queueDir)) {
            return [];
        }

        // Get all message files, sorted by name (which includes timestamp)
        $files = glob($queueDir . '/msg_*.json');
        if (empty($files)) {
            return [];
        }

        sort($files);

        $messages = [];
        foreach ($files as $file) {
            $content = file_get_contents($file);
            if ($content) {
                $decoded = json_decode($content, true);
                if ($decoded) {
                    $messages[] = $decoded;
                }
            }
            // Delete the file after reading
            @unlink($file);
        }

        return $messages;
    }
}
