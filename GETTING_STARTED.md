# Getting Started - Role-Based Login System

## 🎯 Overview

This guide will help you get the role-based login system up and running.

## ✅ Prerequisites

- XAMPP installed with Apache and MySQL
- Node.js (v16+) and npm
- Git (optional)

## 🚀 Startup Steps

### Step 1: Start XAMPP Services

1. **Open XAMPP Control Panel**
   - Navigate to `C:\xampp\xampp-control.exe`

2. **Start Apache**
   - Click "Start" next to "Apache"
   - Should show "Running" with a green checkmark

3. **Start MySQL**
   - Click "Start" next to "MySQL"
   - Should show "Running" with a green checkmark

4. **Verify Services**
   ```bash
   curl http://localhost/OlineIMS/backend/public/api/test
   # Should return: {"message":"API is working"}
   ```

### Step 2: Start Frontend Development Server

1. **Open Command Prompt/PowerShell**
   ```bash
   cd C:\xampp\htdocs\OlineIMS\frontend
   ```

2. **Install Dependencies (first time only)**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   **Expected Output:**
   ```
   ➜  Local:   http://localhost:5174/
   ➜  press h to show help
   ```

### Step 3: Access the Application

1. **Open Browser**
   - Navigate to: `http://localhost:5174/`

2. **You should see:**
   - Login page with two tabs: "Admin" and "Teacher"
   - Email input field
   - Password input field
   - Sign In button

## 🔐 Testing the Login System

### Test Admin Login

1. **On the Login Page:**
   - Make sure "Admin" tab is selected
   - Username: `admin`
   - Password: `password123`

2. **Click "Sign In"**

3. **Expected Results:**
   - ✅ Login succeeds
   - ✅ Shows toast notification: "Admin login successful"
   - ✅ Redirects to `/admin/dashboard`
   - ✅ Admin dashboard displays with:
     - Welcome message with admin name
     - Admin-specific sidebar menu (5 items)
     - Admin dashboard content

### Test Teacher Login

1. **Logout (if logged in as admin)**
   - Click user avatar in top-right
   - Select "Logout"

2. **Back on Login Page:**
   - Click "Teacher" tab
   - Username: `teacher1`
   - Password: `teacher123`

3. **Click "Sign In"**

4. **Expected Results:**
   - ✅ Login succeeds
   - ✅ Shows toast notification: "Login successful"
   - ✅ Redirects to `/teacher/dashboard`
   - ✅ Teacher dashboard displays with:
     - Welcome message with teacher name
     - Teacher-specific sidebar menu (3 items)
     - Teacher dashboard content

## 📱 Browser DevTools Verification

### Check localStorage

1. **Open Developer Tools** (Press `F12`)

2. **Go to Application → Local Storage**

3. **Select:** `http://localhost:5174`

4. **You should see three keys:**
   - `token` - Contains JWT token
   - `user` - Contains user JSON object
   - `role` - Contains "admin" or "teacher"

### Check Network Requests

1. **Open Developer Tools** (Press `F12`)

2. **Go to Network tab**

3. **Perform login**

4. **Find POST request to:** `/api/auth/admin/login` or `/api/auth/teacher/login`

5. **Check Response:**
   ```json
   {
     "user": { ... },
     "token": "eyJ0eXAi...",
     "role": "admin" | "teacher"
   }
   ```

## 🐛 Troubleshooting

### Issue: "Cannot GET /admin/dashboard"

**Cause:** Frontend not running or not properly serving routes

**Solution:**
1. Stop frontend: Press `Ctrl+C` in terminal
2. Clear node_modules: `rm -r node_modules` (or delete folder)
3. Reinstall: `npm install`
4. Start again: `npm run dev`

### Issue: "API is not responding"

**Cause:** Backend not running or Apache not started

**Solution:**
1. Check Apache is running in XAMPP Control Panel
2. Verify: `curl http://localhost/OlineIMS/backend/public/api/test`
3. If it fails, restart Apache and MySQL

### Issue: Login button does nothing

**Cause:** JavaScript error or network issue

**Solution:**
1. Open browser console: `F12 → Console`
2. Check for red error messages
3. Check Network tab for failed requests
4. Verify credentials are correct

### Issue: Token not stored in localStorage

**Cause:** Browser blocking localStorage or login failed

**Solution:**
1. Check if running in incognito/private mode (disable it)
2. Check Network tab for login response
3. Look for error message in response body

### Issue: Wrong dashboard after login

**Cause:** Role mismatch or redirect issue

**Solution:**
1. Clear localStorage: Open DevTools → Application → Clear all
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Try login again

## 📊 System Verification

### Quick Verification Script

Windows users can run:
```bash
# In Command Prompt, navigate to project root and run:
verify-system.bat
```

This will check:
- ✅ Backend API is running
- ✅ All required files exist
- ✅ Frontend build files present
- ✅ Documentation files created

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick lookup guide |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Comprehensive testing procedures |
| [RBAC_DOCUMENTATION.md](./RBAC_DOCUMENTATION.md) | Complete system documentation |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Technical implementation details |

## 🔑 Credential Reference

**Admin:**
- Username: `admin`
- Password: `password123`

**Teacher:**
- Username: `teacher1`
- Password: `teacher123`

## 📋 Typical Development Workflow

```
Morning Start:
  1. Open XAMPP Control Panel
  2. Start Apache and MySQL
  3. Open terminal in OlineIMS directory
  4. Run: cd frontend && npm run dev
  5. Open http://localhost:5174/
  6. Begin development

Before Stopping:
  1. Save all files
  2. Stop npm dev server (Ctrl+C)
  3. Stop Apache in XAMPP Control Panel
  4. Stop MySQL in XAMPP Control Panel

Resuming Later:
  1. Repeat "Morning Start" steps
  2. All data preserved (stored in MySQL)
```

## 🎓 Learning Resources

**Understanding the System:**

1. **Role-Based Authentication:**
   - Read: [RBAC_DOCUMENTATION.md](./RBAC_DOCUMENTATION.md)
   - Understand how roles are assigned and checked

2. **How Routes Work:**
   - Check: `frontend/src/App.jsx` for route definitions
   - See: `ProtectedRoute` component behavior

3. **State Management:**
   - Study: `frontend/src/context/AuthContext.jsx`
   - Understand: localStorage integration

4. **Utilities:**
   - Use: `useAuth()` hook in components
   - Use: `useRole()` hook for role operations

## 🔧 Common Development Tasks

### Add a New Admin-Only Page

1. **Create the page:**
   ```jsx
   // frontend/src/pages/admin/NewPage.jsx
   export function NewPage() {
     const { user } = useAuth();
     return <div>Admin content for {user.full_name}</div>;
   }
   ```

2. **Add route in App.jsx:**
   ```jsx
   <Route path="/admin/new-page" element={
     <ProtectedRoute requiredRole="admin">
       <NewPage />
     </ProtectedRoute>
   } />
   ```

3. **Add menu item in Sidebar:**
   ```jsx
   {isAdmin && (
     <Link to="/admin/new-page">New Page</Link>
   )}
   ```

### Check User Role in Component

```jsx
import { useAuth } from '../hooks/useAuth';

export function MyComponent() {
  const { role, isAdmin, isTeacher } = useAuth();

  return (
    <div>
      {isAdmin && <AdminFeature />}
      {isTeacher && <TeacherFeature />}
      {role === 'admin' && <SpecialAdmin />}
    </div>
  );
}
```

### Protect API Calls

```jsx
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export function MyComponent() {
  const { token, role } = useAuth();

  const fetchData = async () => {
    try {
      const response = await axios.get(
        'http://localhost/OlineIMS/backend/public/api/admin/data',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## ✨ Tips & Best Practices

1. **Always use ProtectedRoute** for sensitive pages
2. **Specify requiredRole** to enforce access control
3. **Use useAuth() hook** instead of direct localStorage access
4. **Clear cache** (Ctrl+Shift+Delete) if experiencing issues
5. **Check DevTools Network tab** for API response errors
6. **Keep console clean** - watch for red error messages
7. **Test with both roles** - admin AND teacher

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Browser console: `F12 → Console`
   - Network tab: `F12 → Network` (see API responses)
   - Terminal: Check npm dev server output

2. **Review documentation:**
   - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Common issues section
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Troubleshooting table

3. **Verify backend:**
   ```bash
   curl http://localhost/OlineIMS/backend/public/api/test
   ```

4. **Reset system:**
   ```bash
   # Clear frontend cache
   Ctrl+Shift+Delete in browser
   
   # Clear localStorage
   # Open DevTools → Application → Clear all
   
   # Reload page
   Ctrl+F5
   ```

## 📞 Support

For issues or questions:
1. Check documentation files first
2. Review error messages in browser console
3. Verify credentials and API responses
4. Check TESTING_GUIDE.md troubleshooting section

---

**Happy coding! 🚀**

If everything is working, you should see the role-based login system in action.
Start with a login to see automatic role-based redirection in effect!
