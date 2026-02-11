#!/bin/bash

echo "========================================"
echo "Starting Online IMS Services"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID $WEBSOCKET_PID $FRONTEND_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}

# Trap CTRL+C
trap cleanup INT TERM

echo "[1/3] Starting Laravel Backend..."
cd backend
php artisan serve > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2

echo "[2/3] Starting WebSocket Server..."
cd websocket
php websocket_server.php > ../logs/websocket.log 2>&1 &
WEBSOCKET_PID=$!
cd ..
sleep 2

echo "[3/3] Starting Frontend Development Server..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 2

echo ""
echo "========================================"
echo "All services started!"
echo "========================================"
echo ""
echo "Backend:    http://localhost:8000"
echo "Frontend:   http://localhost:5173"
echo "WebSocket:  ws://localhost:8080"
echo ""
echo "Logs are being written to:"
echo "  - logs/backend.log"
echo "  - logs/websocket.log"
echo "  - logs/frontend.log"
echo ""
echo "Press CTRL+C to stop all services..."
echo ""

# Wait for user interrupt
wait
