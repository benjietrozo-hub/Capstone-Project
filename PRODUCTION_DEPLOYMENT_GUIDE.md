# 🚀 PIMS - Production Deployment Guide

**Date:** May 17, 2026  
**Status:** ⚠️ Ready for Staging Environment  
**Version:** 1.0

---

## 📋 Deployment Readiness Summary

### ✅ Security Fixes Implemented

- [x] Debug mode disabled (`APP_DEBUG=false`)
- [x] Logging level set to production (`LOG_LEVEL=warning`)
- [x] Database password configured (strong password set)
- [x] Session encryption enabled
- [x] Rate limiting added to authentication endpoints
- [x] Security headers middleware added (X-Frame-Options, CSP, HSTS, etc.)
- [x] HTTPS redirect middleware added
- [x] CORS configuration updated (environment-aware)
- [x] Email configured (Gmail SMTP)

### ⚠️ Still Required Before Public Launch

- [ ] SSL/TLS certificate installation
- [ ] Hosting provider setup (AWS, Azure, DigitalOcean, etc.)
- [ ] Production database setup with backups
- [ ] CloudFlare or CDN configuration (optional)
- [ ] Email deliverability testing
- [ ] Performance load testing
- [ ] Security penetration testing
- [ ] Database backup automation
- [ ] Monitoring and alerting setup
- [ ] Incident response plan

---

## 🔒 Critical Security Settings

### Backend Environment Variables

```env
# Application
APP_NAME=PIMS
APP_ENV=production
APP_DEBUG=false
APP_KEY=[GENERATE NEW - see below]
APP_URL=https://pims.example.com
FRONTEND_URL=https://pims.example.com

# Database - CHANGE THESE!
DB_HOST=your-production-db-host
DB_USERNAME=pims_user
DB_PASSWORD=STRONG_PASSWORD_HERE_12_CHARS_MIN

# Logging
LOG_LEVEL=warning
LOG_CHANNEL=stack

# Session
SESSION_ENCRYPT=true
SESSION_LIFETIME=120

# Authentication - Sanctum
SANCTUM_STATEFUL_DOMAINS=pims.example.com,www.pims.example.com

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@pims.example.com
MAIL_FROM_NAME="PIMS"
```

---

## 🔑 Generate New Production APP_KEY

```bash
# SSH into production server
cd /path/to/pims/backend

# Generate new production key
php artisan key:generate

# This generates a unique, secure APP_KEY for your production instance
```

---

## 🛠️ Step-by-Step Production Deployment

### Step 1: Prepare Your Hosting Infrastructure

**Choose a Hosting Provider:**
- **AWS** - EC2 + RDS (scalable, complex)
- **DigitalOcean** - Droplets + Managed Databases (simple, cost-effective)
- **Azure** - App Service + SQL Database (enterprise-grade)
- **Render** - Managed platform (simple deployment)
- **Railway** - Simple deployment with automatic HTTPS

**Minimum Requirements:**
- PHP 8.2+
- MySQL 8.0+
- 2GB RAM minimum
- 10GB storage
- SSL/TLS certificate

### Step 2: Database Setup

```bash
# 1. Create production database
CREATE DATABASE pims_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. Create database user with strong password
CREATE USER 'pims_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!@#';

# 3. Grant permissions
GRANT ALL PRIVILEGES ON pims_production.* TO 'pims_user'@'localhost';
FLUSH PRIVILEGES;

# 4. Update backend/.env with credentials
# DB_HOST=localhost
# DB_DATABASE=pims_production
# DB_USERNAME=pims_user
# DB_PASSWORD=YourStrongPassword123!@#
```

### Step 3: Backend Deployment

```bash
# 1. Clone repository
git clone <your-repo-url> /var/www/pims
cd /var/www/pims/backend

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Set permissions
chmod -R 775 storage bootstrap/cache

# 4. Copy production .env file
cp .env.production .env

# 5. Generate application key (new for production)
php artisan key:generate

# 6. Cache configurations (IMPORTANT for production)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Run database migrations
php artisan migrate --force

# 8. Create storage link (if using file storage)
php artisan storage:link

# 9. Verify installation
php artisan about
```

### Step 4: Frontend Deployment

```bash
# 1. Navigate to frontend
cd /var/www/pims/frontend

# 2. Install dependencies
npm install

# 3. Set production environment
# .env should have:
# VITE_APP_NAME=PIMS
# VITE_API_URL=https://api.pims.example.com/api

# 4. Build for production
npm run build

# 5. Output goes to 'dist/' folder
# Deploy 'dist/' to your web server or CDN
```

### Step 5: SSL/TLS Certificate

```bash
# Using Let's Encrypt with Certbot (Free)
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d pims.example.com -d www.pims.example.com

# Configure auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Web Server Configuration (Nginx Example)

```nginx
# /etc/nginx/sites-available/pims

upstream backend {
    server 127.0.0.1:8000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name pims.example.com www.pims.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name pims.example.com www.pims.example.com;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/pims.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pims.example.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend SPA
    location / {
        root /var/www/pims/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 7: Process Management

```bash
# Using Supervisor to keep Laravel running
sudo apt-get install supervisor

# Create supervisor config: /etc/supervisor/conf.d/pims-api.conf
[program:pims-api]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/pims/backend/artisan serve --host=127.0.0.1 --port=8000
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/pims/backend/storage/logs/supervisor.log

# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pims-api:*
```

### Step 8: Scheduled Tasks (Cron)

```bash
# Add to crontab for automated task scheduling
* * * * * cd /var/www/pims/backend && php artisan schedule:run >> /dev/null 2>&1

# This runs the scheduler every minute, which executes scheduled tasks:
# - Reminder emails (1 day before return, 3 days before, overdue notifications)
# - Any other scheduled commands
```

### Step 9: Database Backups

```bash
# Setup automated daily backups
# Create /usr/local/bin/backup-pims-db.sh

#!/bin/bash
BACKUP_DIR="/var/backups/pims"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="pims_production"
DB_USER="pims_user"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/pims_db_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Setup cron job
0 2 * * * /usr/local/bin/backup-pims-db.sh
```

---

## 📊 Monitoring & Alerting

### Application Monitoring

```bash
# 1. Set up error tracking (Sentry)
# https://sentry.io

# Add to .env:
SENTRY_LARAVEL_DSN=https://your-key@sentry.io/your-project

# 2. Uptime monitoring
# Use: UptimeRobot.com (free)
# Monitor: https://api.pims.example.com/api/test

# 3. Performance monitoring
# Consider: New Relic, Datadog, or Scout
```

### Log Monitoring

```bash
# Check application logs
tail -f /var/www/pims/backend/storage/logs/laravel.log

# Monitor error rate
grep -c "ERROR" /var/www/pims/backend/storage/logs/laravel.log

# Archive old logs
find /var/www/pims/backend/storage/logs -name "*.log" -mtime +30 -delete
```

---

## 🧪 Pre-Launch Testing Checklist

### Security Testing
- [ ] Test HTTPS connection works
- [ ] Test HTTP redirects to HTTPS
- [ ] Test security headers present (use https://securityheaders.com)
- [ ] Test rate limiting on login (5 attempts/minute)
- [ ] Test CORS only allows your domain
- [ ] Test no debug info in error messages
- [ ] Test environment variables not exposed

### Functionality Testing
- [ ] Test admin login works
- [ ] Test teacher login works
- [ ] Test forgot password flow
- [ ] Test inventory management features
- [ ] Test borrow request workflow
- [ ] Test email notifications send
- [ ] Test API endpoints with Postman
- [ ] Test from different devices/browsers

### Performance Testing
- [ ] Load test with 100+ concurrent users
- [ ] Measure response times (should be <2s)
- [ ] Test database query performance
- [ ] Check server CPU/memory usage
- [ ] Verify caching is working

### Database Testing
- [ ] Backup and restore process works
- [ ] Data integrity after migration
- [ ] Indexes are properly created
- [ ] Foreign keys are working

---

## 🚨 Troubleshooting

### Common Issues

**Issue: 500 Internal Server Error**
```bash
# Check application log
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear

# Run migrations
php artisan migrate
```

**Issue: Database Connection Failed**
```bash
# Verify credentials in .env
# Check database server is running
# Test connection:
php artisan tinker
DB::connection()->getPdo()
```

**Issue: CORS Error**
```bash
# Verify CORS config in config/cors.php
# Check allowed origins match your domain
# Test from browser console:
fetch('https://api.pims.example.com/api/test')
```

**Issue: Email Not Sending**
```bash
# Check email configuration in .env
# Test email:
php artisan tinker
Mail::to('test@example.com')->send(new App\Mail\TestMail());

# Check logs for error details
tail -f storage/logs/laravel.log | grep -i mail
```

---

## 📞 Incident Response

### If system goes down:

1. **Check status** - SSH into server, check if running
2. **Check logs** - View application logs for errors
3. **Restart services** - Supervisor will auto-restart
4. **Check database** - Verify MySQL is running
5. **Review backups** - Check latest backup is recent
6. **Communicate** - Notify users of status
7. **Document** - Log what happened and how it was fixed

---

## 🔄 Maintenance Schedule

**Weekly:**
- Check application logs for errors
- Verify backups completed successfully
- Monitor performance metrics

**Monthly:**
- Review security updates for dependencies
- Update packages: `composer update`, `npm update`
- Test backup restoration

**Quarterly:**
- Security audit and penetration testing
- Performance optimization review
- Database optimization and defragmentation

**Annually:**
- SSL certificate renewal check
- Major version upgrades planning
- Disaster recovery drill

---

## 📞 Support & Documentation

- **API Documentation:** `docs/COMPLETION_SUMMARY.md`
- **Architecture:** `docs/DATABASE_ERD.md`
- **Troubleshooting:** `docs/archive/`
- **Security:** `docs/archive/SECURITY_IMPLEMENTATION_PLAN.md`

---

## ✅ Deployment Completed!

**Current Status:**
- Backend: ✅ Production-ready
- Frontend: ✅ Production-ready
- Database: ✅ Configured
- Security: ✅ Hardened
- Monitoring: ⏳ To be configured

**Next Steps:**
1. Set up hosting infrastructure
2. Deploy backend to production
3. Deploy frontend to production
4. Set up SSL certificate
5. Configure monitoring and alerting
6. Run security audit
7. Load test the system
8. User acceptance testing
9. Launch! 🎉

---

**For questions or issues, refer to:**
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Full docs: `docs/` directory
