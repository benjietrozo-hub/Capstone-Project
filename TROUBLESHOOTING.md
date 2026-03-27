# Mobile Access Troubleshooting Guide

## Issue: Phone can't access http://172.21.160.1:5173

### Quick Checklist

1. **Both devices on same WiFi?**
   - PC and phone must be on the SAME WiFi network
   - Not PC on WiFi and phone on mobile data
   - Not PC on Ethernet and phone on WiFi (unless same network)

2. **Correct URL format?**
   - ✅ Correct: `http://172.21.160.1:5173`
   - ❌ Wrong: `localhost:172.21.160.1:5173`
   - ❌ Wrong: `172.21.160.1:5173` (missing http://)

3. **Services running?**
   - Run: `start-all-services.bat`
   - Check if "Frontend Dev Server" window is open

4. **Can you access from PC browser?**
   - Try: `http://172.21.160.1:5173` on your PC
   - If this doesn't work, the issue is with the server, not the phone

---

## Step-by-Step Troubleshooting

### Test 1: Verify IP Address
```cmd
ipconfig
```
Look for "Wireless LAN adapter Wi-Fi" → "IPv4 Address"
Make sure it's `172.21.160.1`

### Test 2: Check if Vite is listening
```cmd
netstat -ano | findstr :5173
```
You should see:
```
TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING       [PID]
```

If you see `127.0.0.1:5173` instead of `0.0.0.0:5173`, Vite is NOT configured for network access.

### Test 3: Test from PC first
Open browser on your PC and go to:
```
http://172.21.160.1:5173
```

- ✅ Works? → Issue is with phone/network
- ❌ Doesn't work? → Issue is with Vite configuration

### Test 4: Windows Firewall
Run as Administrator:
```cmd
setup-firewall-rules.bat
```

Or manually:
```cmd
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
```

### Test 5: Temporarily disable firewall (for testing only)
```cmd
netsh advfirewall set allprofiles state off
```

Try accessing from phone. If it works, the issue is firewall.

Turn firewall back on:
```cmd
netsh advfirewall set allprofiles state on
```

### Test 6: Check WiFi Router Settings
Some routers have "AP Isolation" or "Client Isolation" enabled:
- Log into your router (usually 192.168.1.1 or 192.168.0.1)
- Look for "AP Isolation", "Client Isolation", or "Guest Network"
- Disable it if enabled
- Make sure phone is NOT on guest WiFi

### Test 7: Ping test from phone
Install a network tool app on your phone (like "Network Analyzer" or "Fing")
Try to ping `172.21.160.1`
- ✅ Ping works? → Network is fine, issue is with firewall/port
- ❌ Ping fails? → Network connectivity issue

---

## Solutions

### Solution 1: Restart everything properly
1. Stop all services (close all terminal windows)
2. Run: `setup-firewall-rules.bat` (as Administrator)
3. Run: `start-all-services.bat`
4. Wait 10 seconds
5. Try accessing from phone: `http://172.21.160.1:5173`

### Solution 2: Manual Vite start with explicit host
```cmd
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Look for this output:
```
➜  Local:   http://localhost:5173/
➜  Network: http://172.21.160.1:5173/
```

If you see "Network" line, it's working correctly.

### Solution 3: Check antivirus software
Some antivirus software blocks network access:
- Temporarily disable antivirus
- Try accessing from phone
- If it works, add exception for Vite/Node.js

### Solution 4: Use different port
If port 5173 is blocked, try a different port:

Edit `frontend/vite.config.ts`:
```typescript
server: {
  host: '0.0.0.0',
  port: 3000,  // Changed from 5173
  // ...
}
```

Add firewall rule:
```cmd
netsh advfirewall firewall add rule name="Vite Port 3000" dir=in action=allow protocol=TCP localport=3000
```

Access: `http://172.21.160.1:3000`

---

## Still Not Working?

### Check if it's a network issue:
1. Can you access other services on your PC from phone?
2. Try accessing: `http://172.21.160.1:8000` (Laravel backend)
3. If nothing works, it's a network/router issue

### Check if it's a Vite issue:
1. Can you access `http://localhost:5173` on PC? ✅
2. Can you access `http://172.21.160.1:5173` on PC? ❌
3. If yes to 1 but no to 2, Vite isn't listening on network interface

### Nuclear option (temporary test):
```cmd
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

And completely disable Windows Firewall temporarily:
```cmd
netsh advfirewall set allprofiles state off
```

If this works, you know it's a firewall configuration issue.

---

## Common Mistakes

1. ❌ Phone on mobile data, PC on WiFi
2. ❌ Phone on guest WiFi, PC on main WiFi
3. ❌ Typing wrong URL format
4. ❌ Firewall rules not added as Administrator
5. ❌ Services not restarted after config changes
6. ❌ Using VPN on PC or phone
7. ❌ Router has AP isolation enabled
