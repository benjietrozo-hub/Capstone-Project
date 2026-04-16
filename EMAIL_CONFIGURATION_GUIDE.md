# 📧 Email Notification Configuration Guide

This guide will help you configure email notifications for the Online Inventory Management System.

---

## 🔧 Email Setup

### Step 1: Configure Email Settings

Edit your `.env` file in the backend folder:

```env
# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@olineims.com"
MAIL_FROM_NAME="OlineIMS"
```

### Step 2: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `MAIL_PASSWORD`

### Step 3: Alternative Email Providers

#### Outlook/Hotmail
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
```

#### Yahoo Mail
```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
```

#### SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
```

---

## 🎯 Email Notification Types

The system automatically sends emails for these events:

### For Teachers:
- ✅ **Borrow Request Approved** - When their request is approved
- ✅ **Borrow Request Rejected** - When their request is rejected
- ✅ **Item Return Confirmed** - When returned items are confirmed
- ✅ **Distribution Approved** - When distribution request is approved
- ✅ **Distribution Rejected** - When distribution request is rejected
- ✅ **Items Distributed** - When items are distributed to them
- ✅ **Distribution Return Confirmed** - When distributed items are returned
- ✅ **Item Due Today** - Reminder when items are due today
- ✅ **Item Overdue** - Urgent notice when items are overdue

### For Admins:
- ✅ **New Borrow Request** - When teachers submit borrow requests
- ✅ **New Distribution Request** - When teachers submit distribution requests
- ✅ **Low Stock Alert** - When inventory items run low
- ✅ **Overdue Item Alert** - When items are overdue by teachers
- ✅ **New Purchase Order** - When purchase orders are created
- ✅ **Purchase Order Received** - When purchase orders are received

---

## 🧪 Testing Email Configuration

### Test Email Service
```bash
cd backend
php artisan tinker

# Test email sending
Mail::raw('Test email from OlineIMS', function($message) {
    $message->to('your-test-email@example.com')->subject('OlineIMS Email Test');
});
```

### Test Notification with Email
```bash
cd backend
php artisan tinker

# Test notification with email
App\Services\NotificationService::send(
    1, // user ID
    'teacher', // user type
    'test_notification',
    'Test Email',
    'This is a test email notification from OlineIMS'
);
```

---

## 🔍 Troubleshooting

### Issue 1: "Connection could not be established"
**Solution**: Check email credentials and network connectivity
- Verify email and password are correct
- Check if firewall blocks SMTP ports
- Ensure internet connection is stable

### Issue 2: "Authentication failed"
**Solution**: Verify email authentication
- For Gmail: Use App Password, not regular password
- Check if 2FA is enabled and app password is generated
- Verify email address and username match

### Issue 3: "Email not sending but no error"
**Solution**: Check email queue and logs
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Clear email queue (if using queue)
php artisan queue:flush
```

### Issue 4: "Email going to spam"
**Solution**: Improve email deliverability
- Use proper domain email (not Gmail for production)
- Set up SPF/DKIM records for your domain
- Avoid spam trigger words in subject/content

---

## 📋 Email Template Customization

### Modify Email Templates
Email templates are located in: `backend/resources/views/emails/system-notification.blade.php`

### Customize Colors and Styles
Edit the CSS in the email template to match your organization's branding:

```css
.header {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Add Custom Notification Types
1. Update `EmailNotificationService::$emailEnabledTypes`
2. Add new method in `EmailNotificationService`
3. Update email template if needed

---

## 🚀 Production Email Setup

### Use Transactional Email Service (Recommended)
For production, consider using:
- **SendGrid** - Reliable with good deliverability
- **Mailgun** - Advanced email features
- **Amazon SES** - Cost-effective for high volume
- **Postmark** - Fast delivery with detailed tracking

### Example SendGrid Configuration
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.your-api-key-here
MAIL_ENCRYPTION=tls
```

---

## 📊 Email Monitoring

### Check Email Logs
```bash
# View recent email logs
tail -n 50 storage/logs/laravel.log | grep -i mail

# Monitor email sending in real-time
tail -f storage/logs/laravel.log | grep -i mail
```

### Email Statistics
The system logs all email attempts. Check logs for:
- ✅ Successfully sent emails
- ❌ Failed email attempts
- 📧 Email delivery status

---

## 🔐 Security Best Practices

1. **Never commit email credentials to version control**
2. **Use environment variables for all email settings**
3. **Use app passwords for Gmail, not main password**
4. **Consider using transactional email services for production**
5. **Monitor email logs for unusual activity**
6. **Implement rate limiting to prevent spam**

---

## 📞 Support

For email configuration issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify SMTP connection with online tools
3. Test with different email providers
4. Consult your email provider's documentation

---

**Last Updated**: April 13, 2026
**System Version**: 1.0.0
