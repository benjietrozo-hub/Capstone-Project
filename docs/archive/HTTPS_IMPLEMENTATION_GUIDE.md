# 🔐 HTTPS/SSL Implementation Guide (Phase 1, Step 1)

**Status:** CRITICAL - Must implement before pilot testing  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium

---

## 📋 Overview

This guide walks through enabling HTTPS/SSL on your Windows XAMPP system so all traffic is encrypted and credentials are protected.

**Why Important:**
- Credentials sent in clear text over current HTTP setup
- Man-in-the-middle attacks possible
- Not suitable for any multi-device network access
- School networks require encryption

**What You'll Do:**
1. Generate SSL certificate (self-signed for testing)
2. Enable SSL module in Apache
3. Configure virtual hosts with SSL
4. Update Laravel and React to use HTTPS
5. Force HTTP → HTTPS redirect
6. Test from all devices

---

## 🔑 Step 1: Generate Self-Signed SSL Certificate

### **On Windows (PowerShell):**

```powershell
# Navigate to XAMPP SSL directory
cd c:\xampp\apache\conf\ssl

# If directory doesn't exist, create it
mkdir c:\xampp\apache\conf\ssl

# Generate certificate valid for 365 days
openssl req -x509 -newkey rsa:2048 -keyout private.key -out certificate.crt -days 365 -nodes -subj "/CN=Benz/O=OlineIMS/L=School/C=US"

# Verify files created
ls -la

# You should see:
# - certificate.crt
# - private.key
```

**Expected Output:**
```
Generating a RSA private key
....................+++
....................+++
writing new private key to 'private.key'
```

---

## 🔧 Step 2: Enable SSL in Apache

### **File:** `c:\xampp\apache\conf\httpd.conf`

**Find and uncomment these lines (remove the # at start):**

```apache
# Around line 149
LoadModule ssl_module modules/mod_ssl.so

# Around line 189
LoadModule socache_shmcb_module modules/mod_socache_shmcb.so

# Around line 513
Include conf/extra/httpd-ssl.conf
```

**How to edit:**
```powershell
# Open in Notepad++
notepad++ c:\xampp\apache\conf\httpd.conf

# Search for: LoadModule ssl_module
# Remove the # at the beginning
# Save the file
```

---

## 🌐 Step 3: Configure Virtual Hosts for HTTPS

### **File:** `c:\xampp\apache\conf\extra\httpd-vhosts.conf`

**Replace the content with:**

```apache
# HTTPS Virtual Host (Port 443)
<VirtualHost *:443>
    ServerName Benz
    ServerAlias Benz
    DocumentRoot "c:\xampp\htdocs\role-based-OIMS\public"
    
    # Enable SSL
    SSLEngine on
    SSLCertificateFile "c:\xampp\apache\conf\ssl\certificate.crt"
    SSLCertificateKeyFile "c:\xampp\apache\conf\ssl\private.key"
    
    # SSL Protocol Settings
    SSLProtocol TLSv1.2 TLSv1.3
    SSLCipherSuite HIGH:!aNULL:!MD5
    SSLHonorCipherOrder on
    
    # Security Headers
    <IfModule mod_headers.c>
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "DENY"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>
    
    # Laravel Public Directory
    <Directory "c:\xampp\htdocs\role-based-OIMS\public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Disable directory listing
    <IfModule mod_autoindex.c>
        Options -Indexes
    </IfModule>
    
    ErrorLog logs/error.log
    CustomLog logs/access.log combined
</VirtualHost>

# HTTP Virtual Host (Port 80) - Redirect to HTTPS
<VirtualHost *:80>
    ServerName Benz
    ServerAlias Benz
    DocumentRoot "c:\xampp\htdocs\role-based-OIMS\public"
    
    # Redirect all HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    ErrorLog logs/error.log
    CustomLog logs/access.log combined
</VirtualHost>

# Localhost HTTP for local development (optional)
<VirtualHost *:80>
    ServerName localhost
    ServerAlias 127.0.0.1
    DocumentRoot "c:\xampp\htdocs"
    
    <Directory "c:\xampp\htdocs">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Key Settings:**
- `SSLEngine on` - Enables SSL/TLS
- `TLSv1.2 TLSv1.3` - Modern secure protocols
- `Strict-Transport-Security` - Force HTTPS for 1 year
- `RewriteRule` - Redirect HTTP to HTTPS

---

## 📝 Step 4: Update Laravel Backend Configuration

### **File:** `backend/.env`

**Update:**
```env
# Change from:
APP_URL=http://Benz:8000

# Change to:
APP_URL=https://Benz:8000

# Add these security settings:
SESSION_SECURE_COOKIES=true
SESSION_SAME_SITE=strict
SECURE_REDIRECT_HTTP_PROTOCOL=https
```

### **File:** `backend/config/app.php`

**Update:**
```php
'url' => env('APP_URL', 'https://Benz:8000'),
'force_https' => true,
```

### **File:** `backend/config/session.php`

**Update:**
```php
'secure' => env('SESSION_SECURE_COOKIES', true),
'same_site' => env('SESSION_SAME_SITE', 'strict'),
```

---

## ⚛️ Step 5: Update React Frontend Configuration

### **File:** `frontend/.env`

**Update:**
```env
# Change from:
VITE_API_URL=http://Benz:8000/api
VITE_WS_URL=ws://Benz:5173

# Change to:
VITE_API_URL=https://Benz:8000/api
VITE_WS_URL=wss://Benz:5173

# Other settings stay the same
VITE_APP_NAME=OlineIMS
VITE_ENABLE_MOBILE_OPTIMIZATION=true
VITE_ENABLE_TABLET_LAYOUT=true
VITE_DEVELOPMENT_MODE=true
```

### **File:** `frontend/src/api/axios.js`

**Ensure HTTPS errors are handled:**

```javascript
// Add this to handle SSL certificate warnings
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Note: In development with self-signed cert, browser will show warning
// This is normal - users will click "Advanced" → "Proceed anyway"
```

---

## 🚀 Step 6: Restart Services

### **Stop Current Services:**

```powershell
# Stop backend
# Press Ctrl+C in the terminal running: php artisan serve

# Stop frontend  
# Press Ctrl+C in the terminal running: npm run dev

# Restart XAMPP Apache
# Method 1: XAMPP Control Panel → Apache → Restart
# Method 2: PowerShell as Admin
net stop Apache2.4
net start Apache2.4

# Or use XAMPP Apache Monitor
# c:\xampp\apache\bin\ApacheMonitor.exe
```

### **Start Services with HTTPS:**

```powershell
# Terminal 1: Backend
cd c:\xampp\htdocs\role-based-OIMS\backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Frontend
cd c:\xampp\htdocs\role-based-OIMS\frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

---

## 🧪 Step 7: Test HTTPS Connection

### **Test 1: Access Frontend via HTTPS**

```
https://Benz:3000
```

**Expected:**
- Page loads (may show security warning)
- Click "Advanced" → "Proceed to Benz (unsafe)" (normal for self-signed cert)
- Login page appears
- No connection errors

### **Test 2: Check Certificate Info**

```
1. Click lock icon in browser address bar
2. Click "Connection is secure"
3. View certificate details
4. Should show:
   - Subject: CN=Benz
   - Issued to: Benz
   - Valid for: 365 days
```

### **Test 3: Check for HTTPS Redirect**

```
1. Try accessing: http://Benz:3000
2. Should redirect to: https://Benz:3000
```

### **Test 4: Test API Connection**

```powershell
# From PowerShell (ignore cert warning)
$response = Invoke-WebRequest -Uri "https://Benz:8000/api/test" -SkipCertificateCheck
$response.StatusCode  # Should be 200

# Or use curl (if installed)
curl -k https://Benz:8000/api/test
```

### **Test 5: Test from Another Device**

```
1. On phone/tablet on same WiFi
2. Open browser
3. Go to: https://Benz:3000
4. Accept certificate warning
5. Try login
6. Should work without errors
```

---

## 🔍 Troubleshooting

### **Issue: "ERR_CONNECTION_REFUSED"**

**Cause:** Apache not running or port not listening

**Solution:**
```powershell
# Check if Apache is running
netstat -ano | findstr :443

# Restart Apache
net stop Apache2.4
net start Apache2.4

# Check error log
type c:\xampp\apache\logs\error.log

# Look for SSL errors
```

---

### **Issue: "SSL_ERROR_BAD_CERT_DOMAIN"**

**Cause:** Certificate CN doesn't match hostname

**Solution:**
```powershell
# Regenerate certificate with correct hostname
cd c:\xampp\apache\conf\ssl
rm certificate.crt private.key
openssl req -x509 -newkey rsa:2048 -keyout private.key -out certificate.crt -days 365 -nodes -subj "/CN=Benz"

# Restart Apache
```

---

### **Issue: "Browser Shows Certificate Warning"**

**This is NORMAL for self-signed certificates!**

**Solution:**
1. Click "Advanced" button
2. Click "Proceed to Benz (unsafe)"
3. Certificate is still valid and encrypted
4. No security issue for testing

**For Production:**
- Purchase certificate from certificate authority (Let's Encrypt, Comodo, etc.)
- Warning will disappear
- Cost: $0-100/year

---

### **Issue: "Mixed Content Error" in Console**

**Cause:** Loading HTTP resources on HTTPS page

**Solution:**
```javascript
// Update all API calls to use HTTPS
// Update all external resources to use HTTPS
// Check: frontend/.env has HTTPS URLs

// Verify in browser DevTools:
// 1. Open F12
// 2. Check Console tab
// 3. Should see no mixed content warnings
```

---

### **Issue: "api.axios not sending requests"**

**Cause:** API interceptor not configured for HTTPS

**Solution:**
```javascript
// File: frontend/src/api/axios.js

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://Benz:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Verify in DevTools → Network tab
// All API calls should show https://Benz:8000/api/*
```

---

## 📊 Verification Checklist

After completing all steps, verify:

- [ ] Apache started without errors
- [ ] Certificate files exist at `c:\xampp\apache\conf\ssl\`
- [ ] Frontend loads at `https://Benz:3000`
- [ ] Can dismiss certificate warning
- [ ] Login page displays
- [ ] Can login successfully
- [ ] No console errors in DevTools (F12)
- [ ] No "Mixed content" warnings
- [ ] API calls are HTTPS (check Network tab)
- [ ] Access from another device works
- [ ] HTTP → HTTPS redirect works
- [ ] Certificate info shows correct domain

---

## 🔒 Security Headers Verification

**Check that security headers are present:**

```powershell
# Using PowerShell
$headers = (Invoke-WebRequest -Uri "https://Benz:8000/api/test" -SkipCertificateCheck).Headers

# Should see:
# Strict-Transport-Security: max-age=31536000
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

---

## 📱 Multi-Device Testing

### **Test from Desktop:**
```
https://Benz:3000
```

### **Test from Tablet:**
```
https://Benz:3000
(Accept certificate warning)
(Try both portrait and landscape)
```

### **Test from Mobile:**
```
https://Benz:3000
(Accept certificate warning)
(Verify mobile layout)
```

**All should work with same URL!**

---

## 🎯 Next Steps

After HTTPS is working:

1. ✅ HTTPS/SSL Complete
2. ⏭️ Implement Rate Limiting (SECURITY_QUICK_START.md)
3. ⏭️ Add Security Headers (already done in vhost!)
4. ⏭️ Input Validation Hardening
5. ⏭️ CORS Tightening

---

## 💾 Important Notes

### **Certificate Expiration:**
- Self-signed certificate valid for 365 days
- Set calendar reminder to regenerate before expiry
- In production, use Let's Encrypt (free, auto-renews)

### **Firefox Warning:**
- Firefox may show extra warning about self-signed cert
- This is normal and secure
- Click "Accept Risk and Continue"

### **Mobile Devices:**
- Same warning will appear on phones/tablets
- Users click "Advanced" or "Accept" as needed
- Connection is still encrypted

### **Port 443:**
- Standard HTTPS port
- Requires admin privileges on Windows
- If issues, try port 8443 instead

---

## 📖 References

- Apache SSL Documentation: https://httpd.apache.org/docs/2.4/ssl/
- Laravel HTTPS: https://laravel.com/docs/security#https-everywhere
- OpenSSL Commands: https://www.openssl.org/docs/

---

## ✨ Success Indicators

✅ **HTTPS is working when:**
1. No connection errors accessing `https://Benz:3000`
2. Certificate warning (normal for self-signed)
3. Can accept warning and proceed
4. Login works with HTTPS
5. No mixed content warnings
6. Works from all devices on WiFi
7. Security headers present
8. API calls are encrypted

---

**Implementation Date:** May 10, 2026  
**Estimated Completion:** 2-3 hours  
**Difficulty:** Medium  
**Risk Level:** Low

**Next: Proceed to Rate Limiting Implementation →**

See: [SECURITY_QUICK_START.md](SECURITY_QUICK_START.md)
