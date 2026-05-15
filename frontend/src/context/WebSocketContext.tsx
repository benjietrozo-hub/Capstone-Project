import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';

interface WebSocketContextType {
    isConnected: boolean;
    connectionState: string;
    addListener: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback: (data: any) => void) => void;
    sendMessage: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const role = auth?.role;

    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 10;
    
    const callbacksRef = useRef<{ [key: string]: ((data: any) => void)[] }>({
        notification: [],
        stats_update: [],
        inventory_update: [],
        request_update: [],
        log_update: [],
        connected: [],
        disconnected: []
    });

    const addListener = useCallback((event: string, callback: (data: any) => void) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event].push(callback);
        }
    }, []);

    const removeListener = useCallback((event: string, callback: (data: any) => void) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event] = callbacksRef.current[event].filter(
                cb => cb !== callback
            );
        }
    }, []);

    const triggerCallbacks = (event: string, data: any = null) => {
        if (callbacksRef.current[event]) {
            callbacksRef.current[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[WebSocket] Error in ${event} callback:`, error);
                }
            });
        }
    };

    const sendMessage = useCallback((data: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn('[WebSocket] Cannot send message, not connected');
        }
    }, []);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionState('connecting');
        
        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = window.location.hostname || 'localhost';
            const wsUrl = `${wsProtocol}//${wsHost}:8080`;
            
            console.log(`[WebSocket] Connecting to ${wsUrl}...`);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Connected');
                setIsConnected(true);
                setConnectionState('connected');
                reconnectAttemptsRef.current = 0;
                
                // Register user immediately upon connection
                if (user?.id && role) {
                    ws.send(JSON.stringify({
                        type: 'register',
                        user_id: user.id,
                        user_type: role
                    }));
                }
                
                triggerCallbacks('connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                } catch (error) {
                    console.error('[WebSocket] Error parsing message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log(`[WebSocket] Disconnected (Code: ${event.code})`);
                wsRef.current = null;
                setIsConnected(false);
                setConnectionState('disconnected');
                triggerCallbacks('disconnected');
                
                attemptReconnect();
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };
        } catch (error) {
            console.error('[WebSocket] Failed to initiate connection:', error);
            setConnectionState('error');
            attemptReconnect();
        }
    }, [user?.id, role]);

    const attemptReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            if (reconnectAttemptsRef.current === maxReconnectAttempts) {
                console.warn('[WebSocket] Maximum reconnection attempts reached. Real-time updates disabled.');
                reconnectAttemptsRef.current++; // Prevent further logging
            }
            return;
        }

        reconnectAttemptsRef.current++;
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 15000);
        
        // Only log every few attempts to reduce noise
        if (reconnectAttemptsRef.current <= 3 || reconnectAttemptsRef.current % 5 === 0) {
            console.log(`[WebSocket] Reconnecting in ${Math.round(delay/1000)}s... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        }
        
        setTimeout(() => {
            if (user?.id && role) {
                connect();
            }
        }, delay);
    }, [connect, user?.id, role, maxReconnectAttempts]);

    const handleMessage = (data: any) => {
        if (!data || !data.type) return;

        switch (data.type) {
            case 'notification':
                triggerCallbacks('notification', data.notification || data.data);
                break;
            case 'stats_update':
                triggerCallbacks('stats_update', data.stats || data.data);
                break;
            case 'inventory_update':
                triggerCallbacks('inventory_update', data.inventory || data.data);
                break;
            case 'request_update':
                triggerCallbacks('request_update', data.request || data.data);
                break;
            case 'log_update':
                triggerCallbacks('log_update', data.log || data.data);
                break;
            case 'registered':
                console.log('[WebSocket] Registration confirmed');
                break;
            case 'pong':
                // Heartbeat response
                break;
            default:
                console.log('[WebSocket] Received unknown message type:', data.type);
        }
    };

    // Heartbeat to keep connection alive
    useEffect(() => {
        const interval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user?.id && role) {
            connect();
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [user?.id, role, connect]);

    const value = {
        isConnected,
        connectionState,
        addListener,
        removeListener,
        sendMessage
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
