import { useWebSocketContext } from '../context/WebSocketContext';

/**
 * Custom React hook for WebSocket connectivity
 * Refactored to use the centralized WebSocketContext
 */
export const useWebSocket = () => {
    const context = useWebSocketContext();
    
    return {
        isConnected: context.isConnected,
        connectionState: context.connectionState,
        addListener: context.addListener,
        removeListener: context.removeListener,
        sendMessage: context.sendMessage
    };
};

export default useWebSocket;
