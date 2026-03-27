import { useEffect, useRef } from 'react';

/**
 * Custom React hook for WebSocket connectivity
 * Handles connection, reconnection, and event listeners
 */
export const useWebSocket = (userId, userType) => {
    const wsRef = useRef(null);
    const callbacksRef = useRef({
        notification: [],
        stats_update: [],
        inventory_update: [],
        request_update: [],
        log_update: [],
        connected: [],
        disconnected: []
    });

    const addListener = (event, callback) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event].push(callback);
        }
    };

    const removeListener = (event, callback) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event] = callbacksRef.current[event].filter(
                cb => cb !== callback
            );
        }
    };

    const triggerCallbacks = (event, data = null) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in WebSocket callback:', error);
                }
            });
        }
    };

    const connect = () => {
        if (!window.WEBSOCKET_ENABLED) {
            console.log('WebSocket disabled, using polling fallback');
            return;
        }

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        try {
            const wsUrl = window.WEBSOCKET_URL || 'ws://localhost:8080';
            console.log('Connecting to WebSocket:', wsUrl);
            
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected successfully');
                if (userId && userType) {
                    wsRef.current.send(JSON.stringify({
                        type: 'register',
                        user_id: userId,
                        user_type: userType
                    }));
                }
                triggerCallbacks('connected');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    handleMessage(data);
                } catch (e) {
                    console.error('WebSocket message parse error:', e);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
                triggerCallbacks('disconnected');
                
                // Auto-reconnect after 3 seconds if not a normal closure
                if (event.code !== 1000) {
                    setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    };

    const handleMessage = (data) => {
        switch (data.type) {
            case 'notification':
                triggerCallbacks('notification', data.notification || data.data);
                break;
            case 'stats_update':
                triggerCallbacks('stats_update', data.stats);
                break;
            case 'inventory_update':
                triggerCallbacks('inventory_update', data.inventory);
                break;
            case 'request_update':
                triggerCallbacks('request_update', data.request);
                break;
            case 'log_update':
                triggerCallbacks('log_update', data.log);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    };

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [userId, userType]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        addListener,
        removeListener,
        connect,
        disconnect
    };
};

export default useWebSocket;
