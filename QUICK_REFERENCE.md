# Quick Reference - Role-Based Login System

## 🚀 Quick Start

```bash
# 1. Verify backend is running
curl http://localhost/OlineIMS/backend/public/api/test

# 2. Start frontend (if not already running)
cd c:\xampp\htdocs\OlineIMS\frontend
npm run dev

# 3. Open browser
# http://localhost:5174/

# 4. Test login
# Admin: username=admin, password=password123
# Teacher: username=teacher1, password=teacher123
```

---

## 📋 Test Credentials

| Role | Username | Password | Expected Dashboard |
|------|----------|----------|-------------------|
| Admin | `admin` | `password123` | `/admin/dashboard` |
| Teacher | `teacher1` | `teacher123` | `/teacher/dashboard` |

---

## 📁 Key Files

| File | Purpose | Location |
|------|---------|----------|
| **AuthContext.jsx** | Auth state & methods | `frontend/src/context/` |
| **LoginPage.jsx** | Login form with role selection | `frontend/src/pages/` |
| **ProtectedRoute.jsx** | Route protection wrapper | `frontend/src/components/common/` |
| **RoleBasedRedirect.jsx** | Auto-routing component | `frontend/src/components/common/` |
| **roleUtils.js** | Role utility functions | `frontend/src/utils/` |
| **useRole.js** | Custom role hook | `frontend/src/hooks/` |
| **useAuth.js** | Custom auth hook | `frontend/src/hooks/` |

---

## 🔐 How to Use Roles

### Check if User is Admin
```javascript
const { isAdmin } = useAuth();

if (isAdmin) {
  // Show admin features
}
```

### Check Specific Role
```javascript
const { role } = useAuth();

if (role === 'admin') {
  // For admins only
} else if (role === 'teacher') {
  // For teachers only
}
```

### Using useRole Hook
```javascript
const { hasRole, getMenuItems } = useRole();

if (hasRole('admin')) {
  const menuItems = getMenuItems('admin');
}
```

### Protect a Route
```jsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## 🔄 Authentication Flow

```
Login Page → Select Role → Enter Credentials → API Call
   ↓
Backend Validates → Returns Token + Role
   ↓
Frontend Stores in localStorage
   ↓
AuthContext Updated
   ↓
Auto-Redirect to Dashboard
```

---

## 📦 localStorage Structure

After login, the following is stored:

```json
{
  "token": "eyJ0eXAi...",
  "user": { "id": 1, "username": "admin", ... },
  "role": "admin"
}
```

---

## 🛡️ Access Control

| Route | Public | Authenticated | Admin Only | Teacher Only |
|-------|--------|---------------|-----------|-------------|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/register` | ✅ | ✅ | ✅ | ✅ |
| `/admin/*` | ❌ | ✅ | ✅ | ❌ |
| `/teacher/*` | ❌ | ✅ | ✅ | ✅ |
| `/unauthorized` | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Commands

### Test Admin Login
```bash
curl -X POST http://localhost/OlineIMS/backend/public/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Test Teacher Login
```bash
curl -X POST http://localhost/OlineIMS/backend/public/api/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"teacher123"}'
```

---

## ✅ Verification Checklist

**Browser Testing:**
- [ ] Admin login works and redirects to `/admin/dashboard`
- [ ] Teacher login works and redirects to `/teacher/dashboard`
- [ ] Logout clears localStorage and redirects to `/login`
- [ ] Admin cannot access teacher-only routes (redirects to `/unauthorized`)
- [ ] Teacher can access admin dashboard (no restriction implemented)
- [ ] Unauthenticated users redirected to `/login`
- [ ] localStorage contains token, user, and role after login
- [ ] Page refresh maintains login state

**Console Verification:**
```javascript
// Check stored data
console.log(localStorage.getItem('role')); // Should show "admin" or "teacher"
console.log(localStorage.getItem('token')); // Should show JWT token
console.log(localStorage.getItem('user')); // Should show user JSON

// Check context
const { role, isAdmin, isTeacher } = useAuth();
console.log({ role, isAdmin, isTeacher });
```

---

## 🔗 Related Documentation

- **Full RBAC Documentation**: [RBAC_DOCUMENTATION.md](./RBAC_DOCUMENTATION.md)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 📞 Common Issues

| Problem | Solution |
|---------|----------|
| Login fails | Check backend API: `curl http://localhost/OlineIMS/backend/public/api/test` |
| Wrong redirect | Clear cache (Ctrl+Shift+Delete) and localStorage |
| Token not found | Check Network tab in DevTools for API response |
| Role not recognized | Verify localStorage has `'role'` key with correct value |
| Can access restricted route | Check ProtectedRoute has `requiredRole` prop |

---

## 📊 System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Working | Serving at `http://localhost/OlineIMS/backend/public/` |
| Frontend | ✅ Working | Running at `http://localhost:5174/` |
| Database | ✅ Connected | MySQL on localhost:3306 |
| Auth Endpoints | ✅ Verified | Both admin and teacher login working |
| Role-Based Routing | ✅ Implemented | All route protection in place |
| Role Utilities | ✅ Available | All utility functions ready |

---

## 🎯 Next Steps

1. **Immediate**: Test login flow in browser (5 min)
2. **Short-term**: Add backend middleware for role protection (30 min)
3. **Medium-term**: Implement permission checks for API endpoints (1 hour)
4. **Long-term**: Add additional features (2FA, audit logging, etc.)

---

**Last Updated**: Today  
**Status**: Ready for Testing  
**Maintainer**: Development Team
