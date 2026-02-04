# Test Teacher Creation

## Check These Things:

### 1. Check Browser Console
Open browser DevTools (F12) and look for:
- Network tab: Check the request to `/api/admin/teachers`
- Console tab: Look for any error messages
- What is the HTTP status code? (200, 422, 500, etc.)

### 2. Check Request Payload
In the Network tab, click on the failed request and check:
- **Headers tab**: Is the Authorization token present?
- **Payload tab**: What data is being sent?

### 3. Check Response
In the Network tab, check the Response:
- What error message is returned?
- Is it a validation error (422)?
- Is it a server error (500)?

### 4. Common Issues

#### Issue: 422 Validation Error
**Cause**: Missing required fields or validation failure
**Solution**: Check that all required fields are filled:
- employee_id
- username
- email
- password (min 8 characters)

#### Issue: 401 Unauthorized
**Cause**: Not logged in or token expired
**Solution**: 
- Logout and login again
- Check if you're logged in as admin

#### Issue: 500 Server Error
**Cause**: Backend error
**Solution**: Check Laravel logs:
```bash
Get-Content backend/storage/logs/laravel.log -Tail 100
```

### 5. Test with Sample Data

Try creating a teacher with this data:
```
Employee ID: TEST001
Username: testteacher
Email: test@example.com
First Name: Test
Middle Initial: T
Last Name: Teacher
Password: Test@12345
Department: Computer Science
Phone: 1234567890
```

### 6. Check Backend is Running

Make sure Laravel backend is running:
```bash
cd backend
php artisan serve
```

Should be running on: http://localhost:8000

### 7. Check Database Connection

Test if database is accessible:
```bash
cd backend
php artisan tinker
>>> Teacher::count()
```

Should return a number (not an error).

## Quick Debug Steps

1. Open browser console (F12)
2. Try to create a teacher
3. Check Network tab for the POST request
4. Copy the error message
5. Check what HTTP status code it returns

Then tell me:
- What error message do you see?
- What HTTP status code?
- What does the response say?

This will help me fix the exact issue!
