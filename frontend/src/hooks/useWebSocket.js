import { useEffect, useRef } from 'react';

/**
 * Custom React hook for WebSocket connectivity
 * Handles connection, reconnection, and event listeners
 */
export const useWebSocket = (userId, userType) => {
    const wsRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 0; // Disabled - no reconnection attempts
    const connectionStateRef = useRef('disabled'); // Start as disabled
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
        // WebSocket is completely disabled to prevent all errors
        connectionStateRef.current = 'disabled';
        return;
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
                // Unknown message type - ignore
        }
    };

    const disconnect = () => {
        // WebSocket is disabled - no disconnect needed
        return;
    };

    useEffect(() => {
        // WebSocket is disabled - no connection attempt
        return () => {
            // No cleanup needed
        };
    }, [userId, userType]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        connectionState: connectionStateRef.current,
        addListener,
        removeListener,
        connect,
        disconnect
    };
};

export default useWebSocket;
