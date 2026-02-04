// WebSocket Configuration for React
// Add this to your main.jsx or a config file that runs before your app starts

// Enable WebSocket and set connection details
window.WEBSOCKET_ENABLED = true;
window.WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080';
window.NOTIFICATION_POLL_INTERVAL = 5000; // Fallback polling interval in ms

// Example usage in a React component:
/*
import useWebSocket from '@/hooks/useWebSocket';

function Dashboard() {
    const { isConnected, addListener, removeListener } = useWebSocket(userId, userType);
    
    useEffect(() => {
        const handleNotification = (notification) => {
            // Handle incoming notification
            console.log('New notification:', notification);
        };
        
        addListener('notification', handleNotification);
        
        return () => {
            removeListener('notification', handleNotification);
        };
    }, [addListener, removeListener]);
    
    return (
        <div>
            WebSocket Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}
        </div>
    );
}
*/
