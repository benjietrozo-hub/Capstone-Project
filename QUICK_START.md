# ⚡ Quick Start Guide - OlineIMS

**Get the application running in 5 minutes!**

---

## 🚀 Step 1: Start Backend (60 seconds)

```bash
# Open PowerShell or Terminal
cd c:\xampp\htdocs\OlineIMS\online-ims-backend

# Clear cache
php artisan config:clear

# Start server
php artisan serve
```

✅ **Backend running on:** http://localhost:8000

---

## 🚀 Step 2: Start Frontend (60 seconds)

```bash
# Open another PowerShell/Terminal window
cd c:\xampp\htdocs\OlineIMS\olineims-frontend

# Install dependencies (only first time)
npm install

# Start dev server
npm run dev
```

✅ **Frontend running on:** http://localhost:5173

---

## 🚀 Step 3: Test Login (60 seconds)

1. Open browser: http://localhost:5173/login
2. Select "Admin" from role dropdown
3. Enter credentials (from your database - use test account)
4. Click "Login"
5. You should see the beautiful admin dashboard! 🎉

---

## 📱 What You'll See

### Admin Dashboard
- 📊 Stats cards showing totals, available, borrowed items
- ⚡ Quick action buttons
- 🎨 Professional gradient design
- 📱 Fully responsive

### Key Pages (Click navigation in sidebar)
- 📦 **Inventory** - View, add, edit, delete items
- 📋 **Requests** - Manage borrow requests
- 👥 **Teachers** - Manage teacher accounts
- 📊 **Reports** - View system reports

---

## 🎨 Design Highlights

Notice the beautiful design:
- 🌈 Gradient purple/blue theme
- ✨ Smooth animations and transitions
- 📱 Mobile-responsive layout
- ♿ Accessible (WCAG AA)
- 🎯 Professional appearance

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Clear everything
php artisan config:clear
php artisan cache:clear

# Check database connection
php artisan db:show

# Run migrations
php artisan migrate
```

### Frontend won't connect to API?
Check that:
1. Backend is running (http://localhost:8000)
2. Frontend .env has: `VITE_API_URL=http://localhost:8000/api`
3. Browser console has no CORS errors

### Design not showing?
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser DevTools (F12) for CSS errors

---

## 📚 Documentation

After you test, read these in order:

1. **NEXT_STEPS.md** - What to do next
2. **PROJECT_STATUS.md** - Current status overview  
3. **olineims-frontend/VISUAL_GUIDE.md** - Design reference
4. **olineims-frontend/DESIGN_SYSTEM.md** - Complete specs

---

## ✅ Success Checklist

- [ ] Backend started successfully
- [ ] Frontend started successfully
- [ ] Can access http://localhost:5173/login
- [ ] Can login as admin
- [ ] Dashboard displays with beautiful design
- [ ] Can navigate between pages
- [ ] Responsive on mobile view

---

## 🎯 Next Immediate Actions

After testing login works:

1. **Explore admin pages:**
   - View inventory items
   - See pending requests
   - Check request details

2. **Test adding data:**
   - Add a new inventory item
   - See it appear in list
   - Edit or delete it

3. **Review the design:**
   - Notice gradients on buttons
   - Check shadows on cards
   - Test hover effects
   - Try on mobile (press F12 → device toolbar)

4. **Read documentation:**
   - Review NEXT_STEPS.md
   - Understand the design system
   - Plan remaining work

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `php artisan serve` (in online-ims-backend) |
| Start Frontend | `npm run dev` (in olineims-frontend) |
| Build Frontend | `npm run build` (in olineims-frontend) |
| Clear Cache | `php artisan config:clear` |
| Run Migrations | `php artisan migrate` |
| View Logs | Check `storage/logs/laravel.log` |

---

## 🎉 That's It!

Your professional inventory management system is now running with:
- ✅ Beautiful design system
- ✅ Complete backend API  
- ✅ Responsive frontend
- ✅ Professional appearance

**Enjoy your OlineIMS application!** 🚀

---

**Questions?** Check the documentation files for detailed information.

**Something broken?** See Troubleshooting section above.

**Want to contribute?** Start with NEXT_STEPS.md to see what needs to be done.
