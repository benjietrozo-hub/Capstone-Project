# 🚀 How to Run the Online Inventory Management System

This guide will help you get the system up and running on your computer.

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

### Required Software
1. **PHP 8.2 or higher** - [Download PHP](https://www.php.net/downloads)
2. **Composer** - [Download Composer](https://getcomposer.org/download/)
3. **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
4. **MySQL 5.7 or higher** - [Download MySQL](https://dev.mysql.com/downloads/)

### Check if installed
Open Command Prompt (cmd) and run:
```bash
php -v
composer -V
node -v
npm -v
mysql --version
```

---

## ⚡ Quick Start (Easiest Way)

### Option 1: Use the Automated Script (Recommended)

1. **Open the project folder** in File Explorer
2. **Double-click** `start-all-services.bat`
3. **Wait** for all services to start (about 10-15 seconds)
4. **Open your browser** and go to:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`

That's it! The system should now be running.

### To Stop All Services
- Press any key in the batch file window

---

## 🔧 Manual Setup (First Time Only)

If this is your first time running the system, follow these steps:

### Step 1: Setup Database

1. **Open MySQL** (via phpMyAdmin, MySQL Workbench, or command line)

2. **Create a database**:
```sql
CREATE DATABASE inventory_system;
```

3. **Import the database** (if you have a SQL file):
```sql
USE inventory_system;
SOURCE backend/database/inventory_system.sql;
```

### Step 2: Configure Backend

1. **Navigate to backend folder**:
```bash
cd backend
```

2. **Copy environment file**:
```bash
copy .env.example .env
```

3. **Edit `.env` file** with your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory_system
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

4. **Install dependencies**:
```bash
composer install
```

5. **Generate application key**:
```bash
php artisan key:generate
```

6. **Run migrations** (creates database tables):
```bash
php artisan migrate
```

7. **Create root admin account**:
```bash
php create-root-admin.php
```
Or double-click `create-root-admin.bat`

### Step 3: Configure Frontend

1. **Navigate to frontend folder**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Check `.env` file** (should already exist):
```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8080
```

### Step 4: Setup WebSocket (Optional but Recommended)

WebSocket enables real-time notifications.

1. **Navigate to websocket folder**:
```bash
cd websocket
```

2. **Install dependencies**:
```bash
composer install
```

---

## 🎯 Running the System

### Method 1: Automated (Recommended)

**Double-click** `start-all-services.bat`

This will start:
- ✅ Laravel Backend (Port 8000)
- ✅ WebSocket Server (Port 8080)
- ✅ Task Scheduler (Background)
- ✅ Frontend Dev Server (Port 5173)

### Method 2: Manual (Individual Services)

Open **4 separate Command Prompt windows**:

#### Terminal 1 - Backend
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

#### Terminal 2 - WebSocket
```bash
cd websocket
php websocket_server.php
```

#### Terminal 3 - Task Scheduler
```bash
cd backend
php artisan schedule:work
```

#### Terminal 4 - Frontend
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

---

## 🌐 Accessing the System

### On Your Computer
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:8080

### On Your Phone/Tablet (Same Network)

1. **Find your computer's IP address**:
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Access from phone**:
- Frontend: `http://YOUR_IP:5173`
- Example: `http://192.168.1.100:5173`

**Note**: Make sure your phone and computer are on the same WiFi network.

---

## 🔐 Default Login Credentials

### Admin Account
```
Email: admin@olineims.com
Password: Admin@123456
```

### Teacher Account (if created)
```
Email: teacher@example.com
Password: Teacher@123
```

**⚠️ IMPORTANT**: Change these passwords after first login!

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Port already in use"

**Problem**: Another application is using the port.

**Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue 2: "Database connection failed"

**Problem**: MySQL is not running or wrong credentials.

**Solution**:
1. Start MySQL service
2. Check `.env` file in backend folder
3. Verify database exists: `SHOW DATABASES;`

### Issue 3: "npm ERR! code ELIFECYCLE"

**Problem**: Node modules not installed properly.

**Solution**:
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue 4: "Class not found"

**Problem**: Composer dependencies not installed.

**Solution**:
```bash
cd backend
composer install
composer dump-autoload
```

### Issue 5: "CORS error" in browser

**Problem**: Frontend can't connect to backend.

**Solution**:
1. Check backend is running on port 8000
2. Check `frontend/.env` has correct API URL
3. Clear browser cache

### Issue 6: WebSocket not connecting

**Problem**: WebSocket server not running.

**Solution**:
1. Check if port 8080 is available
2. Start WebSocket server manually:
```bash
cd websocket
php websocket_server.php
```

---

## 📱 Mobile Access Setup

To access from your phone:

1. **Get your computer's IP**:
```bash
ipconfig
```

2. **Configure firewall** (Windows):
   - Run `setup-firewall-rules.bat` as Administrator
   - Or manually allow ports 8000, 8080, 5173

3. **Update frontend config**:
   - Edit `frontend/.env`
   - Change `localhost` to your IP address

4. **Access from phone**:
   - Open browser on phone
   - Go to `http://YOUR_IP:5173`

See `NETWORK_ACCESS_INSTRUCTIONS.md` for detailed mobile setup.

---

## 🔄 Daily Usage

### Starting the System
1. Double-click `start-all-services.bat`
2. Wait for all services to start
3. Open browser to `http://localhost:5173`

### Stopping the System
- Press any key in the batch file window
- Or close all terminal windows

### Restarting a Single Service

**Backend only**:
```bash
cd backend
php artisan serve
```

**Frontend only**:
```bash
cd frontend
npm run dev
```

---

## 📊 Checking System Status

### Backend Status
Visit: `http://localhost:8000/api/health` (if health check endpoint exists)

### Frontend Status
Visit: `http://localhost:5173` - Should show login page

### WebSocket Status
Check terminal window - should show "WebSocket server started"

### Database Status
```bash
cd backend
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## 🧪 Testing the System

### Test Backend API
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@olineims.com\",\"password\":\"Admin@123456\"}"
```

### Test Frontend
1. Open `http://localhost:5173`
2. Login with admin credentials
3. Check if dashboard loads

### Test WebSocket
1. Login to the system
2. Open browser console (F12)
3. Look for "WebSocket connected" message

---

## 📁 Important Files & Folders

```
Project Root/
├── start-all-services.bat       ← Start everything
├── backend/
│   ├── .env                     ← Backend configuration
│   ├── artisan                  ← Laravel CLI
│   └── create-root-admin.bat    ← Create admin account
├── frontend/
│   ├── .env                     ← Frontend configuration
│   └── package.json             ← Dependencies
├── websocket/
│   └── websocket_server.php     ← WebSocket server
└── HOW_TO_RUN.md               ← This file
```

---

## 🎓 Learning Resources

### For Beginners
1. Start with automated script
2. Learn basic navigation
3. Try creating items and requests

### For Developers
1. Read `README.md` for architecture
2. Check `REACT_SETUP_GUIDE.md` for frontend
3. Review `COMPLETION_SUMMARY.md` for API docs

---

## 💡 Tips & Best Practices

### Performance
- Close unused applications to free up ports
- Use Chrome or Edge for best compatibility
- Clear browser cache if pages don't update

### Development
- Keep terminal windows open to see errors
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

### Security
- Change default passwords immediately
- Don't expose ports to public internet
- Use HTTPS in production

---

## 🆘 Getting Help

### Check Logs
- **Backend**: `backend/storage/logs/laravel.log`
- **Frontend**: Browser console (F12)
- **WebSocket**: Terminal window output

### Debug Mode
Enable in `backend/.env`:
```
APP_DEBUG=true
```

### Common Commands

**Clear cache**:
```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

**Reset database**:
```bash
cd backend
php artisan migrate:fresh
```

**Reinstall dependencies**:
```bash
# Backend
cd backend
composer install

# Frontend
cd frontend
npm install
```

---

## ✅ Checklist

Before running the system, make sure:

- [ ] PHP 8.2+ installed
- [ ] Composer installed
- [ ] Node.js 16+ installed
- [ ] MySQL running
- [ ] Database created
- [ ] Backend `.env` configured
- [ ] Backend dependencies installed (`composer install`)
- [ ] Migrations run (`php artisan migrate`)
- [ ] Admin account created
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend `.env` configured

---

## 🎉 Success!

If everything is working, you should see:
- ✅ Login page at `http://localhost:5173`
- ✅ Can login with admin credentials
- ✅ Dashboard loads with statistics
- ✅ No errors in browser console
- ✅ WebSocket connected (check console)

**Congratulations! Your system is running!** 🚀

---

## 📞 Support

For issues not covered here:
1. Check `TROUBLESHOOTING.md`
2. Review `README.md`
3. Check terminal/console for error messages
4. Search error messages online

---

**Last Updated**: February 26, 2026
**System Version**: 1.0.0
