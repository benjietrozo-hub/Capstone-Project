import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage, UnauthorizedPage } from './pages/ErrorPages';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { InventoryPage } from './pages/admin/InventoryPage';
import { BorrowRequestsPage } from './pages/admin/RequestsPage';
import { ReservationsPage } from './pages/admin/ReservationsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { LogsPage } from './pages/admin/LogsPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { BrowseInventoryPage } from './pages/teacher/BrowseInventoryPage';
import { MyRequestsPage } from './pages/teacher/MyRequestsPage';
import { MyReservationsPage } from './pages/teacher/MyReservationsPage';
import { ActivityLogsPage } from './pages/teacher/ActivityLogsPage';

// Common Components
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleBasedRedirect } from './components/common/RoleBasedRedirect';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <Routes>
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <AdminDashboard />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <InventoryPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="requests"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <BorrowRequestsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reservations"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <ReservationsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teachers"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <TeachersPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="logs"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <LogsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ProtectedLayout>
                        <ReportsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <Routes>
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ProtectedLayout>
                        <TeacherDashboard />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ProtectedLayout>
                        <BrowseInventoryPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reservations"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ProtectedLayout>
                        <MyReservationsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="activity-logs"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ProtectedLayout>
                        <ActivityLogsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-requests"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <ProtectedLayout>
                        <MyRequestsPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/teacher/dashboard" />} />
              </Routes>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
