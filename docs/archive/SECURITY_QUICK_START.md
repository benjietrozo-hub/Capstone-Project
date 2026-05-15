# 🔒 Security Quick Reference - Critical Actions

**Last Updated:** May 10, 2026

---

## ⚠️ Critical Security Issues (Fix IMMEDIATELY)

### **1. No HTTPS/SSL - Data Transmitted Unencrypted**
**Risk Level:** 🔴 CRITICAL
- Credentials sent in plain text over network
- Man-in-the-middle attacks possible
- Not suitable for production use

**Quick Fix (1-2 hours):**
```bash
# 1. Generate self-signed certificate
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# 2. Enable SSL in XAMPP
# Edit c:\xampp\apache\conf\httpd.conf
# Uncomment: LoadModule ssl_module modules/mod_ssl.so

# 3. Configure virtual host with SSL
# Update c:\xampp\apache\conf\extra\httpd-vhosts.conf

# 4. Restart Apache
```

---

### **2. No Rate Limiting - Vulnerable to Brute Force**
**Risk Level:** 🔴 CRITICAL
- 1 attempt per millisecond possible
- Password cracking easy
- DoS attacks possible

**Quick Fix (1-2 hours):**
```bash
# Install throttle middleware
composer require laravel-rate-limiting

# Add to routes/api.php
Route::middleware('throttle:login-limit')->group(function () {
    Route::post('/auth/login', [UnifiedAuthController::class, 'login']);
});

# Configure limits in config/app.php
'login-limit' => '5,1', // 5 attempts per 1 minute
```

---

### **3. Weak Password Policy**
**Risk Level:** 🔴 CRITICAL
- Current passwords: `Test@1234` (only 8 chars)
- Easily cracked
- No complexity requirements

**Quick Fix (30 minutes):**
```php
// In UnifiedAuthController.php
'password' => 'required|string|min:12|regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/'
```

---

### **4. No Security Headers**
**Risk Level:** 🔴 CRITICAL
- No XSS protection
- Vulnerable to clickjacking
- MIME sniffing possible

**Quick Fix (30 minutes):**
```php
// Create middleware/SecurityHeaders.php
$response->header('X-Frame-Options', 'DENY');
$response->header('X-Content-Type-Options', 'nosniff');
$response->header('X-XSS-Protection', '1; mode=block');
$response->header('Content-Security-Policy', "default-src 'self'");
```

---

### **5. No Input Validation**
**Risk Level:** 🔴 CRITICAL
- SQL injection possible
- XSS attacks possible
- Data corruption likely

**Quick Fix (1-2 hours):**
```php
// Add validation rules to all endpoints
$validated = $request->validate([
    'name' => 'required|string|max:255|regex:/^[a-zA-Z0-9\s]+$/',
    'quantity' => 'required|integer|min:0|max:10000',
]);

// Sanitize input
$validated['name'] = strip_tags($validated['name']);
```

---

## 📊 Security Priorities by Impact

| Priority | Issue | Impact | Fix Time | Risk |
|----------|-------|--------|----------|------|
| 🔴 1 | No HTTPS | Data exposed in transit | 1-2h | CRITICAL |
| 🔴 2 | No rate limiting | Brute force attacks | 1-2h | CRITICAL |
| 🔴 3 | Weak passwords | Easy credential cracking | 30m | CRITICAL |
| 🔴 4 | No security headers | XSS, clickjacking | 30m | CRITICAL |
| 🔴 5 | No input validation | SQL injection, XSS | 1-2h | CRITICAL |
| 🟠 6 | No audit logging | No breach detection | 2-3h | HIGH |
| 🟠 7 | No 2FA | Account takeover risk | 3-4h | HIGH |
| 🟡 8 | No IP whitelisting | Unauthorized network access | 2-3h | MEDIUM |

---

## 🚀 48-Hour Security Hardening Sprint

### **Day 1 (Monday)**

**Morning (4 hours):**
- [ ] Generate and install SSL certificate
- [ ] Enable HTTPS in XAMPP
- [ ] Update frontend .env for HTTPS
- [ ] Test HTTPS access
- [ ] Deploy security headers middleware
- [ ] Test no XSS vulnerabilities

**Afternoon (4 hours):**
- [ ] Install rate limiting package
- [ ] Configure throttle middleware
- [ ] Set login rate limit to 5/minute
- [ ] Test brute force protection
- [ ] Add password policy validation
- [ ] Test password strength enforcement

### **Day 2 (Tuesday)**

**Morning (4 hours):**
- [ ] Add input validation to all API endpoints
- [ ] Install HTML purifier
- [ ] Sanitize all text inputs
- [ ] Test SQL injection attempts
- [ ] Test XSS attack prevention
- [ ] Document validation rules

**Afternoon (4 hours):**
- [ ] Create audit logging system
- [ ] Log all login attempts
- [ ] Log all data modifications
- [ ] Create audit dashboard for admins
- [ ] Test audit log functionality
- [ ] Document for admin users

**End of Day 2:**
- ✅ System is 90% hardened
- ✅ HTTPS enabled
- ✅ Rate limiting active
- ✅ Password policy enforced
- ✅ Input validation working
- ✅ Audit logging enabled

---

## 🔧 Phase 1 Implementation Checklist

### **Week 1 - CRITICAL (Must Do)**

- [ ] **HTTPS/SSL**
  - [ ] Generate certificate
  - [ ] Configure Apache
  - [ ] Update .env files
  - [ ] Test HTTPS connection

- [ ] **Rate Limiting**
  - [ ] Install package
  - [ ] Create middleware
  - [ ] Configure routes
  - [ ] Test rate limiting

- [ ] **Security Headers**
  - [ ] Create middleware
  - [ ] Register in kernel
  - [ ] Add meta tags to frontend
  - [ ] Test headers present

- [ ] **Input Validation**
  - [ ] Create validation rules
  - [ ] Install purifier
  - [ ] Add to controllers
  - [ ] Test injection attempts

- [ ] **CORS Hardening**
  - [ ] Update allowed origins
  - [ ] Remove wildcard origins
  - [ ] Add IP validation
  - [ ] Test CORS errors

---

## 🧪 Security Testing Procedures

### **Test 1: HTTPS Works**
```bash
# Should work (no error)
curl -k https://Benz:8000/api/test

# Should fail (connection refused on http)
curl http://Benz:8000/api/test
```

### **Test 2: Rate Limiting Works**
```bash
# Make 6 login requests rapidly
for i in {1..6}; do
  curl -X POST https://Benz:8000/api/auth/login -d '{"username":"admin","password":"test"}'
  sleep 0.1
done

# 6th request should get 429 (Too Many Requests)
```

### **Test 3: Security Headers Present**
```bash
curl -i https://Benz:8000/api/test

# Look for:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...
```

### **Test 4: SQL Injection Blocked**
```bash
# Try injection
curl -X POST https://Benz:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test\"; DROP TABLE items; --"}'

# Should get validation error (not execute SQL)
```

### **Test 5: XSS Attack Blocked**
```bash
# Try XSS
curl -X POST https://Benz:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"xss\")</script>"}'

# Should get validation error (not execute script)
```

---

## 📋 Before Production Deployment

### **Security Audit Checklist**

- [ ] All services using HTTPS
- [ ] Rate limiting enforced (5 login attempts/minute)
- [ ] Strong password policy (12+ chars, upper, lower, number, special)
- [ ] Security headers present (X-Frame-Options, CSP, etc.)
- [ ] Input validation on all endpoints
- [ ] No debug mode enabled
- [ ] Environment variables not exposed
- [ ] Error messages don't leak info
- [ ] Audit logging enabled
- [ ] Backups automated

### **Testing Checklist**

- [ ] Test HTTPS connection from all devices
- [ ] Test rate limiting with rapid requests
- [ ] Test password policy on registration
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test CORS enforcement
- [ ] Test audit logs capture all actions
- [ ] Test error handling (no stack traces)
- [ ] Test performance (no slowdown)

---

## 🎓 Security Configuration Files

### **Location of Key Files:**

```
c:\xampp\htdocs\role-based-OIMS\
├── backend\
│   ├── .env (environment variables)
│   ├── config\
│   │   ├── cors.php (CORS settings)
│   │   ├── sanctum.php (token settings)
│   │   └── app.php (app configuration)
│   ├── app\Http\
│   │   ├── Middleware\ (create SecurityHeaders.php)
│   │   ├── Controllers\ (add validation)
│   │   └── Kernel.php (register middleware)
│   └── routes\api.php (add rate limiting)
├── frontend\
│   └── .env (HTTPS URLs)
```

---

## 💾 Database Encryption

### **Sensitive Fields to Encrypt:**

```php
// File: backend/database/migrations/XXXX_encrypt_sensitive_data.php

Schema::table('teachers', function (Blueprint $table) {
    // Encrypt existing fields
    $table->string('email')->change(); // Apply encryption in model
    $table->string('phone')->change();
});

// File: backend/app/Models/Teacher.php

use Illuminate\Database\Eloquent\Casts\Encrypted;

protected $casts = [
    'email' => Encrypted::class,
    'phone' => Encrypted::class,
];
```

---

## 🔐 Password Reset Security

### **Implement Secure Password Reset:**

```php
// Features:
// 1. Email verification required
// 2. Reset token expires after 1 hour
// 3. One token per user at a time
// 4. Rate limited (5 reset attempts/hour)
// 5. Audit log all reset attempts

// Steps:
// 1. User requests reset via email
// 2. Receives email with unique token
// 3. Token expires after 1 hour
// 4. Must verify email to proceed
// 5. New password must be strong (12+ chars)
// 6. Old password invalidated
// 7. All active sessions logged out
```

---

## 🚨 Incident Response Quick Guide

### **If HTTPS Certificate Expires:**
```bash
# Generate new certificate
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 730

# Update Apache configuration
# Restart Apache
```

### **If Account Hacked:**
```bash
# 1. Reset password immediately
php artisan tinker
> Admin::find(1)->update(['password' => bcrypt('NewPassword123!@#')]);

# 2. Log out all sessions
# Clear all tokens from database
DB::table('personal_access_tokens')->where('user_id', 1)->delete();

# 3. Review audit logs
# Check for unauthorized actions
```

### **If DoS Attack Detected:**
```bash
# 1. Check rate limiting is working
# 2. Review access logs for pattern
# 3. Block attacker IP if known
# 4. Increase rate limiting temporarily
```

---

## 📚 Next Steps

1. **Week 1:** Implement Phase 1 (HTTPS, Rate Limiting, Security Headers, Input Validation)
2. **Week 2:** Implement Phase 2 (Audit Logging, Password Policy, API Keys)
3. **Week 3+:** Implement Phase 3 (2FA, IP Whitelisting, Penetration Testing)

**Estimated Time to Production-Ready:** 3-4 weeks

**Current Status:** ⚠️ NOT PRODUCTION READY  
**After Phase 1:** ✅ Production Ready (Basic Security)  
**After Phase 2:** ✅ Production Ready (Intermediate Security)  
**After Phase 3:** ✅ Enterprise Ready (Advanced Security)

---

## 📞 Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Laravel Security: https://laravel.com/docs/security
- NIST Cybersecurity: https://www.nist.gov/cyberframework

---

**Document Priority:** 🔴 CRITICAL - START IMMEDIATELY  
**Last Review:** May 10, 2026
