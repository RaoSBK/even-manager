import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';

// Layouts
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const UserLayout = lazy(() => import('../layouts/UserLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

// Public Pages
const HomePage = lazy(() => import('../pages/events/EventListingPage')); // Using event listing as home page

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const OTPPage = lazy(() => import('../pages/auth/OTPPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));

// Event Pages
const EventListingPage = lazy(() => import('../pages/events/EventListingPage'));
const EventBookingPage = lazy(() => import('../pages/events/EventBookingPage'));

// Hall Pages
const HallListingPage = lazy(() => import('../pages/halls/HallListingPage'));
const HallDetailPage = lazy(() => import('../pages/halls/HallDetailPage'));
const HallBookingPage = lazy(() => import('../pages/halls/HallBookingPage'));

// Travel Pages
const TravelListingPage = lazy(() => import('../pages/travel/TravelListingPage'));
const PackageDetailPage = lazy(() => import('../pages/travel/PackageDetailPage'));
const TravelBookingPage = lazy(() => import('../pages/travel/TravelBookingPage'));

// Dashboard Pages (Customer)
const MyBookingsPage = lazy(() => import('../pages/dashboard/MyBookingsPage'));
const BookingHistoryPage = lazy(() => import('../pages/dashboard/BookingHistoryPage'));
const UserProfilePage = lazy(() => import('../pages/dashboard/UserProfilePage'));
const NotificationsPage = lazy(() => import('../pages/dashboard/NotificationsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AdminEventsPage = lazy(() => import('../pages/admin/EventsPage'));
const AdminHallsPage = lazy(() => import('../pages/admin/HallsPage'));
const AdminPackagesPage = lazy(() => import('../pages/admin/PackagesPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/BookingsPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/ReportsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/SettingsPage'));

// Error Pages
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  // Public Routes (with Main Layout)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventListingPage /> },
      { path: 'halls', element: <HallListingPage /> },
      { path: 'halls/:id', element: <HallDetailPage /> },
      { path: 'travel', element: <TravelListingPage /> },
      { path: 'travel/:id', element: <PackageDetailPage /> },
    ],
  },

  // Auth Routes (Public Only - redirect authenticated users)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
          { path: 'otp', element: <OTPPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // Protected Booking Routes (Authenticated Users only)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: 'events/book/:type', element: <EventBookingPage /> },
          { path: 'halls/:id/book', element: <HallBookingPage /> },
          { path: 'travel/:id/book', element: <TravelBookingPage /> },
        ],
      },
    ],
  },

  // Protected Customer Dashboard Routes
  {
    path: 'dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <Navigate to="bookings" replace /> },
          { path: 'bookings', element: <MyBookingsPage /> },
          { path: 'history', element: <BookingHistoryPage /> },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },

  // Protected Admin/Super Admin Panel Routes
  {
    path: 'admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['Admin', 'Super Admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'events', element: <AdminEventsPage /> },
              { path: 'halls', element: <AdminHallsPage /> },
              { path: 'packages', element: <AdminPackagesPage /> },
              { path: 'bookings', element: <AdminBookingsPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Error Pages
  {
    path: '403',
    element: (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Forbidden - Access Denied</p>
      </div>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
