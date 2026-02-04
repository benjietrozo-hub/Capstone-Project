#!/bin/bash

# Start WebSocket Server for Online Inventory Management System
# This script will start the Ratchet WebSocket server on port 8080

echo ""
echo "========================================"
echo "WebSocket Server Startup"
echo "========================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../online-ims-backend"

echo "Starting WebSocket server on ws://localhost:8080..."
echo "Press Ctrl+C to stop the server."
echo ""

php "$SCRIPT_DIR/websocket_server.php"
