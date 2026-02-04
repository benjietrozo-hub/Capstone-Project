/**
 * WebSocket Client for Online Inventory Management System
 * Falls back to polling if WebSocket is unavailable
 */

class WebSocketClient {
    constructor(userId, userType) {
        this.userId = userId;
        this.userType = userType;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3 seconds
        this.pingInterval = null;
        this.isConnected = false;
        this.usePolling = false;
        this.pollingInterval = null;
        this.callbacks = {
            notification: [],
            stats_update: [],
            inventory_update: [],
            request_update: [],
            connected: [],
            disconnected: []
        };
    }

    connect() {
        if (!window.WEBSOCKET_ENABLED) {
            console.log('WebSocket disabled, using polling fallback');
            this.startPolling();
            return;
        }

        try {
            const wsUrl = window.WEBSOCKET_URL || 'ws://localhost:8080';
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.register();
                this.startPing();
                this.triggerCallbacks('connected');
            };

            this.ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    console.error('WebSocket message parse error:', e);
                    return;
                }
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.stopPing();
                this.triggerCallbacks('disconnected');

                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                    setTimeout(() => this.connect(), this.reconnectDelay);
                } else {
                    console.log('Max reconnection attempts reached, falling back to polling');
                    this.usePolling = false; // Reset flag to allow polling to start
                    this.startPolling();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Fallback to polling on error
                if (!this.usePolling && this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.usePolling = false; // Reset flag to allow polling to start
                    this.startPolling();
                }
            };

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.startPolling();
        }
    }

    register() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'register',
                user_id: this.userId,
                user_type: this.userType
            }));
        }
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Ping every 30 seconds
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    handleMessage(data) {
        console.log('WebSocket message received:', data);

        switch (data.type) {
            case 'registered':
                console.log('Successfully registered with WebSocket server');
                break;

            case 'pong':
                // Heartbeat response
                break;

            case 'notification':
                const notifPayload = data.notification || data.data || null;
                if (notifPayload) {
                    console.log('Notification received via WebSocket:', notifPayload);
                    this.triggerCallbacks('notification', notifPayload);
                } else {
                    console.warn('Received notification message but payload is missing');
                }
                break;

            case 'stats_update':
                if (data.stats) {
                    this.triggerCallbacks('stats_update', data.stats);
                }
                break;

            case 'inventory_update':
                if (data.inventory) {
                    this.triggerCallbacks('inventory_update', data.inventory);
                }
                break;

            case 'request_update':
                if (data.request) {
                    this.triggerCallbacks('request_update', data.request);
                }
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    startPolling() {
        if (this.usePolling) {
            return; // Already polling
        }

        console.log('Starting polling fallback');
        this.usePolling = true;
        this.stopPolling(); // Clear any existing polling

        // Poll for notifications
        const pollInterval = window.NOTIFICATION_POLL_INTERVAL || 5000;
        this.pollingInterval = setInterval(() => {
            this.pollNotifications();
        }, pollInterval);

        // Initial poll
        this.pollNotifications();
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    pollNotifications() {
        // This will be implemented by the dashboard scripts
        // They can call updateNotificationBadge() directly
    }

    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }

    triggerCallbacks(event, data = null) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in callback:', error);
                }
            });
        }
    }

    disconnect() {
        this.stopPing();
        this.stopPolling();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

// Export for ES6 modules
export default WebSocketClient;
