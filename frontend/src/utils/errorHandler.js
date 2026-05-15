/**
 * Global Error Handler for OlineIMS Frontend
 * Catches and handles common console errors gracefully
 */

// Suppress specific expected errors
const suppressExpectedErrors = () => {
  // Suppress WebSocket connection errors when server is not running
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress all WebSocket-related errors
    if (typeof message === 'string' && (
      message.includes('WebSocket connection failed') ||
      message.includes('WebSocket error:') ||
      message.includes('WebSocket connection timeout') ||
      message.includes('WebSocket is closed before the connection is established') ||
      message.includes('Failed to load resource') && args[0] && args[0].includes && args[0].includes('ws://localhost:8080') ||
      message.includes('net::ERR_CONNECTION_REFUSED') && args[0] && args[0].includes && args[0].includes('ws://') ||
      (args[0] && args[0].stack && args[0].stack.includes('useWebSocket.js')) ||
      (args[0] && args[0].stack && args[0].stack.includes('disconnect'))
    )) {
      return; // Suppress these expected errors
    }
    
    // Suppress debug console.log messages
    if (typeof message === 'string' && (
      message.includes('Debug Info:') ||
      message.includes('=== DEBUG') ||
      message.includes('=== FETCH') ||
      message.includes('Testing WebSocket') ||
      message.includes('WebSocket Status:') ||
      message.includes('Received notification via WebSocket') ||
      message.includes('[NotificationContext]') ||
      message.includes('Unknown message type:')
    )) {
      return; // Suppress debug messages
    }
    
    // Suppress React development warnings in production
    if (process.env.NODE_ENV === 'production' && 
        typeof message === 'string' && 
        message.includes('Warning:')) {
      return;
    }
    
    // Suppress React Router future flag warnings
    if (typeof message === 'string' && 
        message.includes('React Router Future Flag Warning')) {
      return;
    }
    
    // Suppress specific axios network errors
    if (typeof message === 'string' && (
      message.includes('Network Error') ||
      message.includes('ERR_CONNECTION_REFUSED')
    )) {
      console.warn('Network connectivity issue detected');
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress React Router future flag warnings
    if (typeof message === 'string' && 
        message.includes('React Router Future Flag Warning')) {
      return;
    }
    
    // Suppress all WebSocket warnings
    if (typeof message === 'string' && (
      message.includes('WebSocket connection failed') ||
      message.includes('server may not be running') ||
      message.includes('Real-time features will be disabled') ||
      message.includes('WebSocket is closed before the connection is established') ||
      message.includes('WebSocket test: Connection failed') ||
      message.includes('Debug Info:') ||
      message.includes('=== DEBUG') ||
      message.includes('=== FETCH')
    )) {
      return;
    }
    
    // Call original console.warn for other warnings
    originalConsoleWarn.apply(console, args);
  };
  
  // Suppress unhandled promise rejections for WebSocket
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && 
        event.reason.includes('WebSocket')) {
      event.preventDefault();
      return;
    }
  });
  
  // Suppress all WebSocket-related errors globally
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error' && listener.toString().includes('useWebSocket')) {
      return; // Don't add WebSocket error listeners
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// Handle missing assets gracefully
const handleMissingAssets = () => {
  window.addEventListener('error', (event) => {
    // Suppress 404 errors for missing assets
    if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT')) {
      event.preventDefault();
      console.warn('Missing asset:', event.target.src || event.target.href);
    }
  });
};

// Initialize error handling
export const initializeErrorHandling = () => {
  suppressExpectedErrors();
  handleMissingAssets();
  
  // Add global error boundary for React errors
  window.addEventListener('error', (event) => {
    if (event.error) {
      console.error('Global error:', event.error);
    }
  });
};

// Export utility functions
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error ${context ? `in ${context}: ` : ''}`, error);
  }
};

export const logWarning = (warning, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Warning ${context ? `in ${context}: ` : ''}`, warning);
  }
};

export default {
  initializeErrorHandling,
  logError,
  logWarning
};
