# Network Access Configuration Guide

## Prerequisites
- All devices must be on the same WiFi network
- Windows Firewall must allow incoming connections

## Configuration Steps

### 1. Find Your IP Address
Run in Command Prompt:
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### 2. Replace YOUR_IP_ADDRESS in Config Files
Replace `YOUR_IP_ADDRESS` with your actual IP in:
- `frontend/.env`
- `backend/.env`

Example: If your IP is 192.168.1.100:
```
VITE_API_URL=http://192.168.1.100/OlineIMS/backend/public/api
```

### 3. Configure Apache (XAMPP)

#### Option A: Edit httpd.conf
1. Open `C:\xampp\apache\conf\httpd.conf`
2. Find the line: `Listen 80`
3. Change to: `Listen 0.0.0.0:80`
4. Find: `Require local`
5. Change to: `Require all granted`

#### Option B: Create Virtual Host
1. Open `C:\xampp\apache\conf\extra\httpd-vhost.conf`
2. Add:
```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs"
    ServerName YOUR_IP_ADDRESS
    <Directory "C:/xampp/htdocs">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. Configure Windows Firewall

#### Allow Apache:
```cmd
netsh advfirewall firewall add rule name="Apache HTTP" dir=in action=allow protocol=TCP localport=80
```

#### Allow WebSocket:
```cmd
netsh advfirewall firewall add rule name="WebSocket Server" dir=in action=allow protocol=TCP localport=8080
```

#### Allow Vite Dev Server:
```cmd
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
```

### 5. Configure Vite for Network Access

Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
  },
  // ... rest of config
})
```

### 6. Restart Services
1. Restart Apache in XAMPP Control Panel
2. Stop and restart WebSocket server
3. Stop and restart Vite dev server with: `npm run dev -- --host`

### 7. Access from Other Devices

On your smartphone or other device:
- Frontend: `http://YOUR_IP_ADDRESS:5173`
- Backend API: `http://YOUR_IP_ADDRESS/OlineIMS/backend/public/api`

Example with IP 192.168.1.100:
- `http://192.168.1.100:5173`

## Troubleshooting

### Can't Connect from Phone
1. Verify both devices are on same WiFi
2. Ping your PC from phone (use network tools app)
3. Check Windows Firewall rules
4. Temporarily disable firewall to test

### CORS Errors
- Already configured to allow all origins
- Clear browser cache on phone

### WebSocket Connection Failed
- Ensure WebSocket server is running
- Check firewall allows port 8080
- Verify VITE_WS_URL in frontend/.env

### Session/Authentication Issues
- Check SANCTUM_STATEFUL_DOMAINS includes your IP
- Clear cookies on phone browser
- Try incognito/private mode

## Security Notes
⚠️ This configuration allows access from any device on your network
⚠️ For production, use proper domain names and SSL certificates
⚠️ Don't expose this setup to the public internet without proper security
