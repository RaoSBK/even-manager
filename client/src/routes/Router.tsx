import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';

// Layouts
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('../components/dashboard/DashboardLayout'));

// Public Pages
const HomePage = lazy(() => import('../pages/events/EventListingPage'));
const ContactPage = lazy(() => import('../pages/contact/ContactPage'));
const HelpPage = lazy(() => import('../pages/help/HelpPage'));



// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const OTPPage = lazy(() => import('../pages/auth/OTPPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));

// Public Details pages (from original Router)
const EventListingPage = lazy(() => import('../pages/events/EventListingPage'));
const EventBookingPage = lazy(() => import('../pages/events/EventBookingPage'));
const HallListingPage = lazy(() => import('../pages/halls/HallListingPage'));
const HallDetailPage = lazy(() => import('../pages/halls/HallDetailPage'));
const HallBookingPage = lazy(() => import('../pages/halls/HallBookingPage'));
const BookingConfirmationPage = lazy(() => import('../pages/halls/BookingConfirmationPage'));
const TravelBookingPage = lazy(() => import('../pages/travel/TravelBookingPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AdminEmployeesPage = lazy(() => import('../pages/admin/EmployeesPage'));
const AdminEventsPage = lazy(() => import('../pages/admin/EventsPage'));
const AdminVendorsPage = lazy(() => import('../pages/admin/VendorsPage'));
const AdminInventoryPage = lazy(() => import('../pages/admin/InventoryPage'));
const AdminCustomersPage = lazy(() => import('../pages/admin/CustomersPage'));
const AdminQuotationsPage = lazy(() => import('../pages/admin/QuotationsPage'));
const AdminPaymentsPage = lazy(() => import('../pages/admin/PaymentsPage'));
const AdminInvoicesPage = lazy(() => import('../pages/admin/InvoicesPage'));
const AdminHallsPage = lazy(() => import('../pages/admin/HallsPage'));
const AdminTasksPage = lazy(() => import('../pages/admin/TasksPage'));
const AdminCalendarPage = lazy(() => import('../pages/admin/CalendarPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/ReportsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/SettingsPage'));
const AdminFoodMenuPage = lazy(() => import('../pages/admin/FoodMenuPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/BookingsPage'));

// Employee Pages
const EmployeeDashboardPage = lazy(() => import('../pages/employee/DashboardPage'));
const EmployeeEventsPage = lazy(() => import('../pages/employee/EventsPage'));
const EmployeeTasksPage = lazy(() => import('../pages/employee/TasksPage'));
const EmployeeCalendarPage = lazy(() => import('../pages/employee/CalendarPage'));
const EmployeeAttendancePage = lazy(() => import('../pages/employee/AttendancePage'));
const EmployeeProfilePage = lazy(() => import('../pages/employee/ProfilePage'));
const EmployeeNotificationsPage = lazy(() => import('../pages/employee/NotificationsPage'));

// User/Customer Pages
const UserDashboardPage = lazy(() => import('../pages/user/DashboardPage'));
const UserEventsPage = lazy(() => import('../pages/user/EventsPage'));
const UserBookingsPage = lazy(() => import('../pages/user/BookingsPage'));
const UserPaymentsPage = lazy(() => import('../pages/user/PaymentsPage'));
const UserInvoicesPage = lazy(() => import('../pages/user/InvoicesPage'));
const UserProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const UserNotificationsPage = lazy(() => import('../pages/user/NotificationsPage'));

// Error Pages
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Helper component to redirect deprecated '/dashboard' index path
import { useAuth } from '../hooks/useAuth';
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

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
      { path: 'travel', element: <TravelBookingPage /> },
      { path: 'travel-booking', element: <TravelBookingPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'help', element: <HelpPage /> },
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
          { path: 'events/book', element: <EventBookingPage /> },
          { path: 'events/book/:type', element: <EventBookingPage /> },
          { path: 'halls/book', element: <HallBookingPage /> },
          { path: 'halls/:id/book', element: <HallBookingPage /> },
          { path: 'booking-confirmation/:bookingId', element: <BookingConfirmationPage /> },
        ],
      },
    ],
  },

  // Backward compatible /dashboard path
  {
    path: 'dashboard',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <DashboardRedirect /> }
    ]
  },

  // Protected Admin Portal Routes
  {
    path: 'admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <DashboardLayout role="ADMIN" />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'employees', element: <AdminEmployeesPage /> },
              { path: 'events', element: <AdminEventsPage /> },
              { path: 'vendors', element: <AdminVendorsPage /> },
              { path: 'inventory', element: <AdminInventoryPage /> },
              { path: 'customers', element: <AdminCustomersPage /> },
              { path: 'quotations', element: <AdminQuotationsPage /> },
              { path: 'payments', element: <AdminPaymentsPage /> },
              { path: 'invoices', element: <AdminInvoicesPage /> },
              { path: 'halls', element: <AdminHallsPage /> },
              { path: 'tasks', element: <AdminTasksPage /> },
              { path: 'calendar', element: <AdminCalendarPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'food-items', element: <AdminFoodMenuPage /> },
              { path: 'bookings', element: <AdminBookingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Protected Employee Portal Routes
  {
    path: 'employee',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['EMPLOYEE']} />,
        children: [
          {
            element: <DashboardLayout role="EMPLOYEE" />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <EmployeeDashboardPage /> },
              { path: 'events', element: <EmployeeEventsPage /> },
              { path: 'tasks', element: <EmployeeTasksPage /> },
              { path: 'calendar', element: <EmployeeCalendarPage /> },
              { path: 'attendance', element: <EmployeeAttendancePage /> },
              { path: 'profile', element: <EmployeeProfilePage /> },
              { path: 'notifications', element: <EmployeeNotificationsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Protected User/Customer Hub Routes
  {
    path: 'user',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['USER']} />,
        children: [
          {
            element: <DashboardLayout role="USER" />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <UserDashboardPage /> },
              { path: 'events', element: <UserEventsPage /> },
              { path: 'halls', element: <HallListingPage /> },
              { path: 'bookings', element: <UserBookingsPage /> },
              { path: 'payments', element: <UserPaymentsPage /> },
              { path: 'invoices', element: <UserInvoicesPage /> },
              { path: 'profile', element: <UserProfilePage /> },
              { path: 'notifications', element: <UserNotificationsPage /> },
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
        <h1 className="text-4xl font-bold text-red-600 font-serif">403</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Forbidden - Access Denied</p>
      </div>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
