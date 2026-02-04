#!/bin/bash

# Check WebSocket Server Status

echo ""
echo "========================================"
echo "WebSocket Server Status Check"
echo "========================================"
echo ""

if command -v lsof &> /dev/null; then
    lsof -i :8080
    if [ $? -eq 0 ]; then
        echo "WebSocket server is running on port 8080"
    else
        echo "WebSocket server is NOT running on port 8080"
    fi
elif command -v netstat &> /dev/null; then
    netstat -tuln | grep :8080
    if [ $? -eq 0 ]; then
        echo "WebSocket server is running on port 8080"
    else
        echo "WebSocket server is NOT running on port 8080"
    fi
else
    echo "Cannot determine server status. Please check manually."
fi

echo ""
echo "To start the server, run: ./start-websocket.sh"
echo ""
