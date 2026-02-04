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
     * Queue a message for the WebSocket server to process
     */
    private static function queueMessage($message) {
        self::init();

        // Use file locking to prevent race conditions
        $fp = fopen(self::$queueFile, 'c+');
        if (!$fp) {
            error_log('[WebSocketBroadcaster] Failed to open queue file: ' . self::$queueFile);
            return false;
        }

        $result = false;
        if (flock($fp, LOCK_EX)) {
            $messages = [];

            // Read existing messages
            $content = stream_get_contents($fp);
            if ($content) {
                $messages = json_decode($content, true) ?: [];
            }

            // Add new message
            $messages[] = $message;

            // Write back to file
            ftruncate($fp, 0);
            rewind($fp);
            $written = fwrite($fp, json_encode($messages));
            fflush($fp);

            flock($fp, LOCK_UN);
            $result = $written !== false;
        } else {
            error_log('[WebSocketBroadcaster] Failed to acquire lock on queue file');
        }

        fclose($fp);
        return $result;
    }

    /**
     * Get and clear queued messages (called by WebSocket server)
     */
    public static function getQueuedMessages() {
        self::init();

        if (!file_exists(self::$queueFile)) {
            return [];
        }

        // Use file locking to prevent race conditions
        $fp = fopen(self::$queueFile, 'r+');
        if (!$fp) {
            return [];
        }

        if (flock($fp, LOCK_EX)) {
            $content = stream_get_contents($fp);
            $messages = json_decode($content, true) ?: [];

            // Clear the file
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode([]));
            fflush($fp);

            flock($fp, LOCK_UN);
        } else {
            $messages = [];
        }

        fclose($fp);
        return $messages;
    }
}
