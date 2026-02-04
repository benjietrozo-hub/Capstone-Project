# Quick Start Guide - OlineIMS React Frontend

Get the React frontend running in 5 minutes!

## Prerequisites
- Node.js 16+ installed
- Backend API running at `http://localhost:8000`

## Setup Steps

### 1. Install Dependencies
```bash
cd olineims-frontend
npm install
```

### 2. Configure Environment
The `.env` file is already configured. Verify it contains:
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=OlineIMS
```

### 3. Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 4. Login
- **Admin Login**: Use admin credentials
- **Teacher Login**: Use teacher credentials
- **New Teacher**: Click "Register" to create a teacher account

## File Structure Overview

```
src/
├── api/             - API calls to backend
├── components/      - Reusable React components
├── context/         - State management (auth)
├── hooks/           - Custom React hooks
├── pages/           - Page components
├── utils/           - Helper functions
├── App.jsx          - Main routing
└── main.jsx         - Entry point
```

## Common Tasks

### View Admin Dashboard
1. Login as admin
2. Click "Dashboard" in sidebar
3. View system statistics and quick actions

### Browse Inventory
1. Login as teacher
2. Click "Browse Inventory" in sidebar
3. Search and filter items
4. Click "Borrow" to submit a request

### Manage Inventory (Admin)
1. Login as admin
2. Click "Inventory" in sidebar
3. Click "+ Add New Item" to create items
4. Click "Edit" or "Delete" to modify items

### Approve Requests (Admin)
1. Login as admin
2. Click "Requests" in sidebar
3. Click "Approve" to approve pending requests
4. Enter quantity and return date

## Troubleshooting

### "Cannot connect to API"
- Start backend: `php artisan serve`
- Ensure backend runs on `http://localhost:8000`

### "Login failed"
- Verify credentials are correct
- Check backend is running
- Clear browser cache and localStorage

### Port already in use
- Backend: `php artisan serve --port=8000`
- Frontend: `npm run dev -- --port 5173`

## Next Steps

- Customize styling in `src/index.css`
- Add new pages in `src/pages/`
- Create components in `src/components/`
- Modify API endpoints in `src/api/index.js`

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

For more information, see [README.md](./README.md)
