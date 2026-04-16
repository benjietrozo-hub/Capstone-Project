/**
 * WebSocket Connection Test Utility
 * Tests WebSocket connectivity and provides helpful feedback
 */

export const testWebSocketConnection = () => {
  return new Promise((resolve) => {
    if (!window.WEBSOCKET_ENABLED) {
      resolve({ success: false, message: 'WebSocket is disabled' });
      return;
    }

    const wsUrl = window.WEBSOCKET_URL || 'ws://localhost:8080';
    
    const ws = new WebSocket(wsUrl);
    let timeoutId;
    
    // Set timeout
    timeoutId = setTimeout(() => {
      ws.close();
      resolve({ 
        success: false, 
        message: 'Connection timeout - WebSocket server may not be running' 
      });
    }, 3000);
    
    ws.onopen = () => {
      clearTimeout(timeoutId);
      ws.close();
      resolve({ 
        success: true, 
        message: 'WebSocket connection successful' 
      });
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeoutId);
      resolve({ 
        success: false, 
        message: 'WebSocket connection failed - server may not be running' 
      });
    };
    
    ws.onclose = (event) => {
      clearTimeout(timeoutId);
      if (event.code !== 1000) {
        resolve({ 
          success: false, 
          message: 'WebSocket closed unexpectedly' 
        });
      }
    };
  });
};

export const checkWebSocketStatus = () => {
  const status = {
    enabled: window.WEBSOCKET_ENABLED || false,
    url: window.WEBSOCKET_URL || 'ws://localhost:8080',
    connected: false
  };
  
  // Check if there's an active WebSocket connection
  if (window.wsRef && window.wsRef.current) {
    status.connected = window.wsRef.current.readyState === WebSocket.OPEN;
  }
  
  return status;
};

export default {
  testWebSocketConnection,
  checkWebSocketStatus
};
