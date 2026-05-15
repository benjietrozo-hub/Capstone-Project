# Network Setup Guide

## Dynamic IP Configuration

This project is configured to **automatically adapt to network changes** without requiring manual configuration updates.

## How It Works

### 🔄 Automatic API Detection
The frontend automatically detects the current hostname and connects to the backend on the same host:

- Access via `localhost:5173` → API at `localhost:8000`
- Access via `10.0.28.66:5173` → API at `10.0.28.66:8000`
- Access via `192.168.1.100:5173` → API at `192.168.1.100:8000`

**No configuration changes needed when your IP changes!**

### 🌐 WebSocket Connection
WebSocket also uses dynamic hostname detection and automatically connects to port 8080 on the current host.

## Development Workflow

### Starting the Servers

1. **Backend (Laravel)**
   ```bash
   cd backend
   php artisan serve --host=0.0.0.0 --port=8000
   ```

2. **Frontend (Vite)**
   ```bash
   cd frontend
   npm run dev
   ```

3. **WebSocket Server** (if applicable)
   ```bash
   cd websocket
   node server.js
   ```

### Access Points

#### On Your Laptop
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

#### From Android/Other Devices (Same Network)
1. Find your laptop's IP address:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Access from mobile device:
   - Frontend: `http://YOUR_IP:5173` (e.g., `http://10.0.28.66:5173`)
   - The API will automatically connect to `http://YOUR_IP:8000`

## Network Changes (Piso WiFi, etc.)

When your network IP changes:
1. ✅ **No frontend changes needed** - automatic detection
2. ✅ **No .env updates needed** - dynamic configuration
3. ✅ **Just restart the servers** - they'll bind to the new IP

## Production Deployment

For production, set the explicit API URL in `frontend/.env`:

```env
VITE_API_URL=https://your-production-domain.com/api
```

The dynamic detection only runs in development mode.

## Troubleshooting

### Backend Not Accessible from Network
Make sure Laravel is listening on all interfaces:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Firewall Blocking Connections
Allow ports 5173, 8000, and 8080 through Windows Firewall:
```bash
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Laravel API" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="WebSocket Server" dir=in action=allow protocol=TCP localport=8080
```

### Still Getting Old IP
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear browser cache
3. Check browser DevTools → Network tab to verify the request URL

## Technical Details

### Implementation Files
- **API Detection**: `frontend/src/api/axios.js` - `getApiUrl()` function
- **WebSocket Detection**: `frontend/src/context/WebSocketContext.tsx` - line 90-92
- **Vite Config**: `frontend/vite.config.ts` - server listens on `0.0.0.0`

### How Dynamic Detection Works
```javascript
// In development, automatically use current hostname
const hostname = window.location.hostname;
const apiUrl = `http://${hostname}:8000/api`;
```

This means:
- Same code works on any network
- No hardcoded IPs
- Adapts to network changes automatically
- Works for both localhost and network access
