# Forgot Password Setup Guide

The forgot password functionality has been successfully implemented! Here's what you need to know:

## Features Added

### Backend
- Password reset token management with database table
- Email notification system for password reset
- Secure token generation and validation (60-minute expiration)
- Support for both Admin and Teacher accounts
- System logging for all password reset activities

### Frontend
- Forgot Password page (`/forgot-password`)
- Reset Password page (`/reset-password`)
- "Forgot password?" link on login page
- User-friendly UI with validation

## How It Works

1. User clicks "Forgot password?" on login page
2. User enters their email address
3. System sends a password reset email with a secure link
4. User clicks the link in email (valid for 60 minutes)
5. User enters and confirms new password
6. Password is updated and user can login

## Email Configuration

To enable email sending, update your `backend/.env` file:

### Option 1: Gmail (Recommended for Testing)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Online Inventory Management System"
FRONTEND_URL=http://localhost:5173
```

**Note:** For Gmail, you need to create an App Password:
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords → Generate new app password
4. Use the generated password in MAIL_PASSWORD

### Option 2: Mailtrap (Recommended for Development)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="Online Inventory Management System"
FRONTEND_URL=http://localhost:5173
```

### Option 3: Log (Testing Without Email Server)
```env
MAIL_MAILER=log
FRONTEND_URL=http://localhost:5173
```

With `log` mailer, emails are saved to `backend/storage/logs/laravel.log` instead of being sent.

## Testing the Feature

1. Make sure your backend is running: `php artisan serve`
2. Make sure your frontend is running: `npm run dev`
3. Update your `.env` file with email configuration
4. Go to http://localhost:5173/login
5. Click "Forgot password?"
6. Enter a registered user's email
7. Check your email (or log file if using log mailer)
8. Click the reset link and set a new password

## API Endpoints

- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Security Features

- Tokens expire after 60 minutes
- Tokens are hashed in database
- Old tokens are automatically deleted when new ones are created
- System doesn't reveal if email exists (security best practice)
- All activities are logged in system logs

## Troubleshooting

### Email not sending?
1. Check your `.env` configuration
2. Verify SMTP credentials are correct
3. Check `backend/storage/logs/laravel.log` for errors
4. Try using `MAIL_MAILER=log` to test without email server

### Reset link not working?
1. Verify FRONTEND_URL in `.env` matches your frontend URL
2. Check if token has expired (60 minutes)
3. Make sure the email and token parameters are in the URL

### Database errors?
Run migrations: `php artisan migrate`

## Files Created/Modified

### Backend
- `app/Http/Controllers/API/Auth/UnifiedAuthController.php` - Added forgot/reset methods
- `app/Mail/PasswordResetMail.php` - Email template class
- `resources/views/emails/password-reset.blade.php` - Email HTML template
- `database/migrations/2026_02_11_000002_add_user_type_to_password_reset_tokens.php` - Database migration
- `routes/api.php` - Added password reset routes

### Frontend
- `pages/ForgotPasswordPage.tsx` - Forgot password form
- `pages/ResetPasswordPage.tsx` - Reset password form
- `pages/LoginPage.tsx` - Added forgot password link
- `App.tsx` - Added new routes

## Next Steps

1. Update your `backend/.env` file with email configuration
2. Test the feature with a real email account
3. Customize the email template if needed (`resources/views/emails/password-reset.blade.php`)
4. Consider adding rate limiting to prevent abuse

Enjoy your new password reset functionality! 🎉
