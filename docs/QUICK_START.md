# Online IMS - Quick Start Guide

## 🚀 Start Everything (Recommended)

```bash
start-all-services.bat
```

This starts all 4 services in separate windows:
- ✅ Laravel Backend (Port 8000)
- ✅ Task Scheduler (Background)
- ✅ WebSocket Server (Port 8080)
- ✅ Frontend Dev Server (Port 5173)

## 🔍 Check Service Status

```bash
check-services.bat
```

Shows which services are running.

## 🛑 Stop All Services

Press any key in the `start-all-services.bat` window.

## 📱 Access the Application

### From Your Computer
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### From Your Phone (Same Network)
1. Get your IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.100.106)

2. Access from phone:
   - Frontend: http://YOUR_IP:5173
   - Backend API: http://YOUR_IP:8000

## 🔧 Individual Service Commands

### Backend Only
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend Only
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### WebSocket Only
```bash
cd websocket
start-websocket.bat
```

### Task Scheduler Only
```bash
cd backend
php artisan schedule:work
```

## 🐛 Troubleshooting

### Port Already in Use
Check what's using the port:
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :5173
netstat -ano | findstr :8080
```

Kill the process:
```bash
taskkill /PID <process_id> /F
```

### WebSocket Dependencies Missing
```bash
cd websocket
composer install
```

### Frontend Dependencies Missing
```bash
cd frontend
npm install
```

### Backend Dependencies Missing
```bash
cd backend
composer install
```

### Database Not Set Up
```bash
cd backend
php artisan migrate:fresh
```

## 📋 First Time Setup Checklist

- [ ] Install PHP 8.0+
- [ ] Install Composer
- [ ] Install Node.js and npm
- [ ] Install MySQL/MariaDB
- [ ] Configure `.env` file in backend folder
- [ ] Run `composer install` in backend folder
- [ ] Run `composer install` in websocket folder
- [ ] Run `npm install` in frontend folder
- [ ] Run `php artisan migrate:fresh` in backend folder
- [ ] Create admin user (optional)

## 🎯 Common Tasks

### Create Admin User
```bash
cd backend
php artisan tinker
```
Then run:
```php
$admin = new App\Models\Admin();
$admin->first_name = 'Admin';
$admin->last_name = 'User';
$admin->email = 'admin@example.com';
$admin->password = bcrypt('password');
$admin->save();
```

### Clear Cache
```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### View Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

## 📞 Need Help?

Check the detailed documentation:
- `websocket/README.md` - WebSocket server details
- `WEBSOCKET_FIX_SUMMARY.md` - WebSocket troubleshooting
- `START_ALL_SERVICES_UPDATE.md` - Service startup details
