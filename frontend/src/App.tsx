import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage, UnauthorizedPage } from './pages/ErrorPages';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { InventoryPage } from './pages/admin/InventoryPage';
import { MasterInventoryListPage } from './pages/admin/MasterInventoryListPage';
import { BorrowRequestsPage } from './pages/admin/RequestsPage';
import { ReservationsPage } from './pages/admin/ReservationsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { AdminsPage } from './pages/admin/AdminsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { LogsPage } from './pages/admin/LogsPage';

import DistributionListPage from './pages/admin/DistributionListPage';
import BulkDistributionsPage from './pages/admin/BulkDistributionsPage';
import TrashPage from './pages/admin/TrashPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { BrowseInventoryPage } from './pages/teacher/BrowseInventoryPage';
// import { MyRequestsPage } from './pages/teacher/MyRequestsPage'; // Removed as redundant with MyReservationsPage
import { MyReservationsPage } from './pages/teacher/MyReservationsPage';
import { ActivityLogsPage } from './pages/teacher/ActivityLogsPage';
import DistributionGroupsPage from './pages/teacher/DistributionGroupsPage';
import DistributionRequestsPage from './pages/teacher/DistributionRequestsPage';
import TeacherReportsPage from './pages/teacher/ReportsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import HelpPage from './pages/common/HelpPage';
import ProfilePage from './pages/common/ProfilePage';
import MaintenancePage from './pages/common/MaintenancePage';

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
        <main className="flex-1 w-full overflow-x-hidden relative z-20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <AuthProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />

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
                      path="inventory-master-list"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <MasterInventoryListPage />
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
                      path="admins"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <AdminsPage />
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

                    <Route
                      path="distribution"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <DistributionListPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="bulk-distributions"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <BulkDistributionsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="trash"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <TrashPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <NotificationsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ProtectedLayout>
                            <ProfilePage />
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
                      path="distribution-groups"
                      element={
                        <ProtectedRoute requiredRole="teacher">
                          <ProtectedLayout>
                            <DistributionGroupsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="distribution-requests"
                      element={
                        <ProtectedRoute requiredRole="teacher">
                          <ProtectedLayout>
                            <DistributionRequestsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="reports"
                      element={
                        <ProtectedRoute requiredRole="teacher">
                          <ProtectedLayout>
                            <TeacherReportsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <ProtectedRoute requiredRole="teacher">
                          <ProtectedLayout>
                            <NotificationsPage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    {/* my-requests removed as redundant with reservations?tab=requests */}
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute requiredRole="teacher">
                          <ProtectedLayout>
                            <ProfilePage />
                          </ProtectedLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/teacher/dashboard" />} />
                  </Routes>
                }
              />

              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <HelpPage />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default Routes */}
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
