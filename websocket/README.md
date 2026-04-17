# WebSocket Server for Online Inventory Management System

This WebSocket server provides real-time notifications and updates for the OIMS application.

## Requirements

- PHP 8.0 or higher
- Composer
- Port 8080 available (or configure a different port)

## Installation

1. Install dependencies:
   ```bash
   composer install
   ```

## Starting the Server

### Windows
Double-click `start-websocket.bat` or run:
```bash
start-websocket.bat
```

### Linux/Mac
```bash
chmod +x start-websocket.sh
./start-websocket.sh
```

### Manual Start
```bash
php websocket_server.php
```

## Testing the Server

### Windows
```bash
test-websocket.bat
```

### Manual Test
```bash
php test_connection.php
```

## Configuration

The server runs on:
- **Host**: 0.0.0.0 (all interfaces)
- **Port**: 8080

To change these settings, set environment variables:
```bash
set WEBSOCKET_HOST=127.0.0.1
set WEBSOCKET_PORT=9000
```

## Troubleshooting

### Port Already in Use
Check what's using port 8080:
```bash
netstat -ano | findstr :8080
```

Kill the process or change the port.

### Dependencies Missing
If you get errors about missing files, reinstall dependencies:
```bash
rmdir /s /q vendor
composer install
```

### PHP Not Found
Make sure PHP is in your system PATH. Test with:
```bash
php -v
```

## Client Connection

Connect from JavaScript:
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    console.log('Message received:', event.data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};
```

## Files

- `websocket_server.php` - Main server file
- `WebSocketHandler.php` - WebSocket message handler
- `WebSocketBroadcaster.php` - Broadcasting utility
- `start-websocket.bat` - Windows startup script
- `start-websocket.sh` - Linux/Mac startup script
- `test-websocket.bat` - Windows test script
- `test_connection.php` - Connection test script
- `simple_client.html` - Simple HTML test client

## Support

For issues or questions, check the main OIMS documentation.
