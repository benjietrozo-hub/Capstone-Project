# OlineIMS Frontend - React Application

A modern React application for the OlineIMS (Online Inventory Management System) built with React 18, Vite, and Tailwind CSS.

## Project Structure

```
olineims-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios instance with interceptors
│   │   └── index.js           # All API methods organized by endpoint
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   ├── admin/             # Admin-specific components
│   │   └── teacher/           # Teacher-specific components
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── hooks/
│   │   └── useAuth.js         # Custom auth hook
│   ├── pages/
│   │   ├── admin/             # Admin page components
│   │   ├── teacher/           # Teacher page components
│   │   ├── LoginPage.jsx      # Login page
│   │   ├── RegisterPage.jsx   # Registration page
│   │   └── ErrorPages.jsx     # 404 & 403 pages
│   ├── utils/
│   │   ├── formatters.js      # Date, currency, badge formatting
│   │   ├── validators.js      # Form validation functions
│   │   └── constants.js       # Constants and enums
│   ├── styles/
│   │   └── custom.css         # Custom stylesheets
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/
│   └── index.html             # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── .env                       # Environment variables
└── README.md                  # This file
```

## Features

### Admin Features
- **Dashboard**: System overview with statistics
- **Inventory Management**: Create, read, update, delete inventory items
- **Borrow Request Management**: Approve, reject, issue, and track item borrowings
- **Teacher Management**: Manage teacher accounts and information
- **Issue Reports**: View and resolve reported item issues

### Teacher Features
- **Dashboard**: Personal borrowing overview and statistics
- **Browse Inventory**: Search and filter available items
- **Submit Requests**: Create borrow requests for items
- **My Requests**: Track the status of borrow requests
- **Profile Management**: View and update personal information

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notification system
- **date-fns** - Date formatting
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running at `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   cd olineims-frontend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root with:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=OlineIMS
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Authentication

The application supports two types of users:
- **Admin**: Full system access and management capabilities
- **Teacher**: Limited access to inventory and request features

### Login
Users can select their role (Admin/Teacher) and log in with credentials.

### Session Management
- Authentication tokens are stored in localStorage
- Tokens are automatically included in all API requests
- Expired tokens automatically trigger logout and redirect to login page
- CSRF protection is handled by the Laravel backend

## API Integration

All API calls are managed through the `src/api/index.js` file, organized into:
- `authAPI` - Authentication endpoints
- `adminAPI` - Admin-only endpoints
- `teacherAPI` - Teacher-only endpoints

Example API call:
```javascript
const items = await adminAPI.getInventory({ search: 'pen', per_page: 10 });
```

## State Management

The application uses React Context API for state management:
- `AuthContext` - Manages authentication state, user info, and login/logout
- `useAuth()` hook - Provides easy access to auth state in components

## Component Architecture

### Common Components
Reusable components used across the application:
- `Header` - Navigation header with user menu
- `Sidebar` - Navigation menu
- `Layout` - Main page wrapper
- `Table` - Reusable data table
- `Card` - Card and stat card containers
- `Badge` - Status and priority badges
- `FormElements` - Forms, buttons, alerts
- `Modal` - Dialog/modal component
- `Loader` - Loading spinners
- `ProtectedRoute` - Route protection with role checking

### Page Components
Each page is a full-screen view with the Layout wrapper.

## Styling

The application uses Tailwind CSS utility classes for styling. Key color scheme:
- **Primary**: Blue (`#007bff`)
- **Success**: Green (`#28a745`)
- **Danger**: Red (`#dc3545`)
- **Warning**: Yellow (`#ffc107`)

## Error Handling

- HTTP errors are caught and displayed as toast notifications
- 401 Unauthorized errors trigger automatic logout
- Form validation errors are displayed inline
- API errors include helpful messages for users

## Development Tips

### Adding a New Page

1. Create the page component in `src/pages/{section}/`
2. Import it in `src/App.jsx`
3. Add a route for it
4. If admin-only, wrap with `<ProtectedRoute requiredRole="admin">`

### Adding a New API Endpoint

1. Add the method to the appropriate section in `src/api/index.js`
2. Use the axios instance with built-in interceptors
3. Return `response.data` from the API call

### Adding a New Component

1. Create it in `src/components/common/` or `src/components/{section}/`
2. Export from the component file
3. Import and use in page components

## Troubleshooting

### API Not Connecting
- Ensure backend is running on `http://localhost:8000`
- Check that `VITE_API_URL` in `.env` is correct
- Verify CORS is enabled on the backend

### Authentication Issues
- Clear browser localStorage (F12 → Application → LocalStorage)
- Check that login credentials are correct
- Verify backend is returning tokens correctly

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and reinstall if issues persist
- Check that Node.js version is 16+

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Guidelines for contributing to this project:
1. Follow the existing code structure and naming conventions
2. Use meaningful commit messages
3. Test changes thoroughly before submitting
4. Keep components small and focused
5. Write reusable code

## License

This project is proprietary software for OlineIMS.

## Support

For issues or questions, contact the development team.
