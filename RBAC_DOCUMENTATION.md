# Role-Based Access Control (RBAC) System

## Overview

The OlineIMS application implements a comprehensive role-based access control system with two primary roles:
- **Admin** - System administrator with full access
- **Teacher** - Regular user with limited access to inventory and request features

## Authentication Flow

### Login Process

1. User selects their role (Admin or Teacher) on the login page
2. User enters credentials (username and password)
3. API validates credentials and returns:
   - `user` - User object with profile information
   - `token` - JWT token for API authentication (Sanctum)
   - `role` - User's role ('admin' or 'teacher')

### Storage

After successful login, the following is stored in localStorage:
```javascript
{
  'token': 'JWT_TOKEN_HERE',
  'user': { /* user object */ },
  'role': 'admin' | 'teacher'
}
```

## Architecture

### AuthContext (`src/context/AuthContext.jsx`)

Manages authentication state including:
- `user` - Current user data
- `token` - Authentication token
- `role` - User's role (sourced from localStorage)
- `isAuthenticated` - Boolean indicating login status
- `isAdmin` - Boolean, true if role === 'admin'
- `isTeacher` - Boolean, true if role === 'teacher'

### ProtectedRoute Component (`src/components/common/ProtectedRoute.jsx`)

Wraps components that require authentication and specific roles:

```jsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

If user is not authenticated or lacks the required role, they are redirected to `/login` or `/unauthorized`.

### RoleBasedRedirect Component (`src/components/common/RoleBasedRedirect.jsx`)

Automatically redirects authenticated users to their appropriate dashboard based on role:
- Admin → `/admin/dashboard`
- Teacher → `/teacher/dashboard`

## Hooks

### useAuth Hook

```javascript
const { 
  user,           // Current user object
  token,          // Auth token
  role,           // User's role
  isAuthenticated,// Login status
  isAdmin,        // Is admin role
  isTeacher,      // Is teacher role
  adminLogin,     // Admin login function
  teacherLogin,   // Teacher login function
  logout          // Logout function
} = useAuth();
```

### useRole Hook

```javascript
const {
  role,              // Current role
  isAdmin,           // Is admin
  isTeacher,         // Is teacher
  hasRole,           // Check if has specific role
  getDashboardPath,  // Get dashboard path for role
  getMenuItems,      // Get menu items for role
  hasPermission      // Check if has permission
} = useRole();
```

## Role-Based Routes

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/inventory` - Manage inventory
- `/admin/requests` - View and manage borrow requests
- `/admin/teachers` - Manage teacher accounts
- `/admin/reports` - View reports

### Teacher Routes
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/browse` - Browse available inventory
- `/teacher/my-requests` - View and manage own requests

### Public Routes
- `/login` - Login page with role selection
- `/register` - Registration page (for teachers)
- `/unauthorized` - Access denied page

## API Endpoints

### Authentication Endpoints

**Admin Login**
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response (200):
{
  "user": { /* admin user object */ },
  "token": "JWT_TOKEN",
  "role": "admin"
}
```

**Teacher Login**
```
POST /api/auth/teacher/login
Content-Type: application/json

{
  "username": "teacher1",
  "password": "password123"
}

Response (200):
{
  "user": { /* teacher user object */ },
  "token": "JWT_TOKEN",
  "role": "teacher"
}
```

**Teacher Registration**
```
POST /api/auth/teacher/register
Content-Type: application/json

{
  "username": "newteacher",
  "email": "teacher@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "full_name": "New Teacher"
}

Response (200):
{
  "user": { /* teacher user object */ },
  "token": "JWT_TOKEN",
  "role": "teacher"
}
```

## Permissions

### Admin Permissions
- `view_dashboard` - Access admin dashboard
- `manage_inventory` - Create, update, delete inventory items
- `view_requests` - View all borrow requests
- `approve_requests` - Approve/reject requests
- `manage_teachers` - Create, update, delete teacher accounts
- `view_reports` - View system reports
- `manage_users` - Manage user accounts

### Teacher Permissions
- `view_dashboard` - Access teacher dashboard
- `view_inventory` - Browse available inventory
- `create_requests` - Create new borrow requests
- `view_own_requests` - View their own requests
- `cancel_own_requests` - Cancel their own requests

## Utilities

### Role Utilities (`src/utils/roleUtils.js`)

```javascript
import { 
  hasRole, 
  getDashboardPath, 
  getMenuItems, 
  hasPermission,
  getRoleDisplayName,
  ROLE_PERMISSIONS
} from '../utils/roleUtils';
```

## Implementation Examples

### Checking User Role

```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { role, isAdmin, isTeacher } = useAuth();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isTeacher && <TeacherPanel />}
    </div>
  );
}
```

### Using ProtectedRoute

```jsx
<Routes>
  <Route path="/admin/dashboard" element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } />
</Routes>
```

### Conditional Navigation

```jsx
import { useRole } from '../hooks/useRole';

function Dashboard() {
  const { getDashboardPath } = useRole();
  
  // Navigate to appropriate dashboard on login
  navigate(getDashboardPath());
}
```

## Testing

### Test Admin Login
- Username: `admin`
- Password: `password123`
- Expected redirect: `/admin/dashboard`

### Test Teacher Login
- Username: `teacher1`
- Password: `teacher123`
- Expected redirect: `/teacher/dashboard`

## Best Practices

1. **Always use ProtectedRoute** for components requiring authentication
2. **Specify requiredRole** for role-specific pages
3. **Use useAuth** hook instead of direct localStorage access
4. **Use useRole** hook for additional role utilities
5. **Check permissions** before showing sensitive features
6. **Redirect to login** if tokens are expired
7. **Clear localStorage** on logout to prevent stale data

## Security Considerations

1. **Token Storage** - JWTs are stored in localStorage (consider using httpOnly cookies for production)
2. **API Validation** - Backend must validate role-based requests
3. **Token Expiration** - Implement token refresh mechanism
4. **HTTPS Only** - Use HTTPS in production to protect tokens in transit
5. **CORS Configuration** - Properly configure CORS on backend

## Future Enhancements

1. **Token Refresh** - Implement automatic token refresh
2. **Session Timeout** - Add session timeout and warning
3. **Remember Me** - Add "remember me" functionality
4. **Two-Factor Authentication** - Add 2FA for admins
5. **Audit Logging** - Log all admin actions
6. **Fine-grained Permissions** - Implement more granular permissions
