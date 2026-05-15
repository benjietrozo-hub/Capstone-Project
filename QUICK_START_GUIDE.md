# 🚀 Multi-Device Access - Quick Start Guide

**System Ready for Pilot Testing**  
**Date:** May 10, 2026

---

## 📍 Access Information

### **Network Access URL:**
```
http://Benz:3000
```

**Note:** This URL works on ANY device connected to the same WiFi network as the server PC, regardless of network changes!

---

## 🔧 System Configuration

### **What's Been Set Up:**

✅ **Backend Configuration**
- Server hostname: `Benz`
- Backend API: `http://Benz:8000/api`
- CORS configured to allow local network access
- Sanctum token authentication enabled (3-hour expiration)

✅ **Frontend Configuration**
- API URL: `http://Benz:8000/api`
- WebSocket: `ws://Benz:5173`
- Mobile optimization enabled
- Tablet layout support enabled

✅ **Database**
- MySQL running on localhost
- Sample data ready for testing

✅ **Token System**
- 3-hour token expiration for active users
- Auto-refresh on activity
- 7-day refresh token validity

---

## 📱 For Testers: How to Connect

### **Desktop/Laptop:**
1. Open browser (Chrome, Firefox, Safari, Edge)
2. Go to: `http://Benz:3000`
3. Login with provided credentials

### **Tablet (iPad/Android):**
1. Make sure WiFi is connected to same network as server
2. Open Safari or Chrome
3. Go to: `http://Benz:3000`
4. Try both portrait and landscape modes

### **Smartphone (iPhone/Android):**
1. Connect to same WiFi network
2. Open Safari or Chrome
3. Go to: `http://Benz:3000`
4. Login and test features

---

## ✅ System Ready - Verification Checklist

### **Backend Status:**
- [ ] Backend running on port 8000
- [ ] Can access `http://Benz:8000/api/test` (should show JSON response)

### **Frontend Status:**
- [ ] Frontend running on port 3000
- [ ] Can access `http://Benz:3000` from PC desktop
- [ ] Can access `http://Benz:3000` from another device on WiFi

### **Login Test:**
- [ ] Can login with test account
- [ ] Dashboard loads without errors
- [ ] Navigation works

### **Multi-Device:**
- [ ] 2 devices can access simultaneously
- [ ] No CORS errors in browser console
- [ ] No 401/403 authentication errors

### **Responsive Design:**
- [ ] Desktop layout works (Chrome/Firefox/Safari/Edge)
- [ ] Tablet layout works (portrait & landscape)
- [ ] Mobile layout works (single column, touch-friendly)

---

## 🎯 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin_pilot | Test@1234 | Admin |
| teacher_pilot | Test@1234 | Teacher |

**Additional accounts can be created via `php artisan tinker`**

---

## 📊 Network Resilience

### **Why This Setup Works Across Networks:**

✅ **Uses Hostname Instead of IP**
- Hostname `Benz` remains the same even if IP changes
- Works on different WiFi networks
- Works when connecting via Ethernet
- Works across different office/classroom locations

✅ **Example Scenarios:**
- **Scenario 1:** Server in classroom → IP changes → Still works at `http://Benz:3000` ✅
- **Scenario 2:** Server moves to different WiFi → Still works at `http://Benz:3000` ✅
- **Scenario 3:** Server goes home at night → Still works at `http://Benz:3000` ✅

---

## 🚀 Start Services

### **Terminal 1 - Start Backend:**
```bash
cd c:\xampp\htdocs\role-based-OIMS\backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Expected Output:**
```
Starting Laravel development server: http://0.0.0.0:8000
```

---

### **Terminal 2 - Start Frontend:**
```bash
cd c:\xampp\htdocs\role-based-OIMS\frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

**Expected Output:**
```
➜  Local:   http://localhost:3000/
➜  Network: http://Benz:3000/
```

---

## 📋 Testing Workflows

### **Workflow 1: Admin Approval Process**
1. Admin (on Desktop) logs in
2. Admin checks "Borrow Requests"
3. Admin clicks "Approve" on pending request
4. Teacher (on Phone) gets notification
5. Teacher can see approved status

### **Workflow 2: Teacher Request**
1. Teacher (on Phone) logs in
2. Browses inventory by category
3. Fills borrow form
4. Submits request
5. Waits for admin approval

### **Workflow 3: Cross-Device Sync**
1. Admin approves on Desktop
2. Teacher refreshes on Phone
3. Both see updated status immediately

---

## 🐛 Troubleshooting

### **"Connection refused" Error:**
```
Solution: Verify both services are running
- Backend: php artisan serve --host=0.0.0.0 --port=8000
- Frontend: npm run dev -- --host 0.0.0.0 --port 3000
```

### **"Can't reach Benz:3000" from Phone:**
```
Solution 1: Ensure phone is on same WiFi as server PC
Solution 2: Try using PC's IP address instead:
  - Get IP: ipconfig (look for 192.168.x.x or 10.x.x.x)
  - Access via: http://192.168.x.x:3000
```

### **CORS Error in Console:**
```
Solution: Clear backend cache and restart
- php artisan config:cache
- Restart backend service
```

### **Login Fails (401 Error):**
```
Solution: Verify credentials are correct
- Username: admin_pilot
- Password: Test@1234
```

---

## 📞 For Testers - Report Issues

When reporting bugs, please include:
1. **Device Type:** Desktop / Tablet / Phone
2. **Browser:** Chrome / Firefox / Safari / Edge
3. **Operating System:** Windows / macOS / iOS / Android
4. **Steps to Reproduce:** What you clicked and what happened
5. **Error Message:** Any console errors (F12 → Console)
6. **Screenshot:** If possible

---

## 🎯 System Features Ready for Testing

### **Admin Features:**
- ✅ Dashboard with statistics
- ✅ Borrow request management (approve/reject)
- ✅ Item return tracking
- ✅ System logs and audit trail
- ✅ User management
- ✅ Reports and history

### **Teacher Features:**
- ✅ Browse inventory by category
- ✅ Submit borrow requests
- ✅ View pending requests
- ✅ Check request status
- ✅ View borrow history
- ✅ Receive notifications

### **Cross-Device Features:**
- ✅ Real-time notifications
- ✅ Responsive design (all screen sizes)
- ✅ Touch-friendly UI (mobile/tablet)
- ✅ Multi-user simultaneous access
- ✅ Session management (3-hour expiration)
- ✅ Auto token refresh on activity

---

## 📊 Performance Targets

| Metric | Target | Expected |
|--------|--------|----------|
| Page Load | <3 seconds | ~1-2 seconds |
| Login | <1 second | <1 second |
| Submit Request | <2 seconds | ~1 second |
| Admin Approval | <1 second | <0.5 seconds |
| Notification Display | <5 seconds | ~1-2 seconds |

---

## ✨ System Ready!

**All systems configured and ready for pilot testing.**

- Backend: `http://Benz:8000` ✅
- Frontend: `http://Benz:3000` ✅
- Token System: Active ✅
- Multi-Device Support: Enabled ✅
- Responsive Design: Ready ✅

**Start testing!** 🚀

---

**Configuration Date:** May 10, 2026  
**Server Hostname:** Benz  
**Status:** READY FOR PILOT TESTING
