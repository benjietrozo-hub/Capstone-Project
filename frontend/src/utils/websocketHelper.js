/**
 * WebSocket Helper Utility
 * Provides tools to test and diagnose WebSocket connectivity
 */

export const WebSocketHelper = {
  // Test WebSocket connection
  testConnection: async (url = 'ws://localhost:8080') => {
    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ 
          success: false, 
          message: 'Connection timeout' 
        });
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ 
          success: true, 
          message: 'Connection successful' 
        });
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        resolve({ 
          success: false, 
          message: 'Connection failed - server may not be running' 
        });
      };
      
      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          resolve({ 
            success: false, 
            message: `Connection closed with code: ${event.code}` 
          });
        }
      };
    });
  },

  // Check WebSocket support
  checkSupport: () => {
    const supported = !!window.WebSocket;
    return supported;
  },

  // Get current WebSocket status
  getStatus: () => {
    return {
      enabled: window.WEBSOCKET_ENABLED || false,
      url: window.WEBSOCKET_URL || 'ws://localhost:8080',
      supported: !!window.WebSocket
    };
  },

  // Enable/disable WebSocket
  setEnabled: (enabled) => {
    window.WEBSOCKET_ENABLED = enabled;
  },

  // Reset WebSocket connection attempts
  resetAttempts: () => {
    if (window.wsRef && window.wsRef.reconnectAttemptsRef) {
      window.wsRef.reconnectAttemptsRef.current = 0;
    }
  }
};

// Auto-test on page load
if (typeof window !== 'undefined') {
  window.WebSocketHelper = WebSocketHelper;
}

export default WebSocketHelper;
