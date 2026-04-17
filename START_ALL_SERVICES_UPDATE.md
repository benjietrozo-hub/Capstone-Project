# Start All Services - WebSocket Integration

## Changes Made

Updated `start-all-services.bat` to include the WebSocket server in the startup sequence.

### Before
- Only started 3 services: Backend, Scheduler, Frontend
- WebSocket was marked as "Disabled"

### After
- Now starts 4 services: Backend, Scheduler, **WebSocket**, Frontend
- WebSocket server automatically starts on port 8080

## Updated Service Startup Order

1. **Laravel Backend** - Port 8000
2. **Task Scheduler** - Background process
3. **WebSocket Server** - Port 8080 ✨ NEW
4. **Frontend Dev Server** - Port 5173

## How to Use

### Start All Services
```bash
cd role-based-OIMS
start-all-services.bat
```

This will open 4 separate command windows:
- Laravel Backend
- Task Scheduler
- WebSocket Server ✨ NEW
- Frontend Dev Server

### Check Service Status
```bash
cd role-based-OIMS
check-services.bat
```

This will show which services are running:
```
[1/4] Laravel Backend (Port 8000)...
   [OK] RUNNING

[2/4] Frontend Dev Server (Port 5173)...
   [OK] RUNNING

[3/4] WebSocket Server (Port 8080)...
   [OK] RUNNING

[4/4] Task Scheduler...
   [OK] RUNNING
```

### Stop All Services
Press any key in the main `start-all-services.bat` window to stop all services.

## Service URLs

After starting, access the services at:

- **Backend API**: http://localhost:8000 or http://YOUR_IP:8000
- **Frontend**: http://localhost:5173 or http://YOUR_IP:5173
- **WebSocket**: ws://localhost:8080 or ws://YOUR_IP:8080

## Troubleshooting

### WebSocket Not Starting
If the WebSocket server doesn't start:

1. Check if dependencies are installed:
   ```bash
   cd websocket
   composer install
   ```

2. Check if port 8080 is available:
   ```bash
   netstat -ano | findstr :8080
   ```

3. Manually start the WebSocket server:
   ```bash
   cd websocket
   start-websocket.bat
   ```

### Port Already in Use
If any port is already in use, you'll need to:
- Stop the conflicting service
- Or change the port in the configuration

## Files Created/Modified

1. ✅ `start-all-services.bat` - Updated to include WebSocket
2. ✅ `check-services.bat` - New service status checker
3. ✅ `websocket/start-websocket.bat` - Enhanced with dependency checks
4. ✅ `websocket/test-websocket.bat` - WebSocket connection tester
5. ✅ `websocket/README.md` - WebSocket documentation

## Date Updated
April 17, 2026
