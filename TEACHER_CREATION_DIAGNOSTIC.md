# Teacher Creation Diagnostic Guide

## What to Check

### Step 1: Open Browser DevTools
Press `F12` to open DevTools

### Step 2: Go to Network Tab
Click on the "Network" tab

### Step 3: Try to Create a Teacher
Fill in the form and click "Save Teacher"

### Step 4: Check the Request
Look for a POST request to `/api/admin/teachers`

Click on it and check:

#### Request Details
- **Status Code**: What number? (200, 401, 422, 500?)
- **Request URL**: Should be `http://localhost:8000/api/admin/teachers`
- **Request Method**: Should be POST

#### Request Headers
- **Authorization**: Should have `Bearer <token>`
- **Content-Type**: Should be `application/json`

#### Request Payload
Check what data is being sent. Should include:
```json
{
  "employee_id": "...",
  "username": "...",
  "email": "...",
  "password": "...",
  "first_name": "...",
  "middle_initial": "...",
  "last_name": "...",
  "department": "...",
  "phone": "...",
  "status": "active"
}
```

#### Response
What does the server return?

### Common Error Scenarios

#### Scenario 1: 422 Unprocessable Entity
**Response might say**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "employee_id": ["The employee id has already been taken."],
    "email": ["The email has already been taken."]
  }
}
```
**Solution**: Use a different employee_id or email

#### Scenario 2: 401 Unauthorized
**Response might say**:
```json
{
  "message": "Unauthenticated."
}
```
**Solution**: 
- Logout and login again
- Your session might have expired

#### Scenario 3: 500 Internal Server Error
**Response might say**:
```json
{
  "message": "Server Error"
}
```
**Solution**: Check Laravel logs:
```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 100
```

#### Scenario 4: Network Error
**Console shows**: `net::ERR_CONNECTION_REFUSED`
**Solution**: Backend server is not running
```bash
cd backend
php artisan serve
```

#### Scenario 5: CORS Error
**Console shows**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
**Solution**: Check backend CORS configuration

### Quick Test

Try this exact data:
```
Employee ID: DIAG001
Username: diagnostic
Email: diagnostic@test.com
Password: Diagnostic123
First Name: Diagnostic
Middle Initial: D
Last Name: Test
Department: Testing
Phone: 9999999999
```

### What to Tell Me

After checking, please tell me:
1. **What HTTP status code** do you see? (e.g., 422, 500, 401)
2. **What error message** appears in the response?
3. **What does the console** show?
4. **Does the request** even reach the backend?

With this information, I can pinpoint the exact issue and fix it!

### Backend Check

Also verify backend is running:
```bash
# Check if backend is accessible
curl http://localhost:8000/api/test

# Should return: {"message":"API is working"}
```

If that doesn't work, backend isn't running properly.
