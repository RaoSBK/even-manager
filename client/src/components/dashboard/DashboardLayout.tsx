import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  role?: UserRole;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect if they have a role mismatch
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
    if (user?.role === 'HALL_MANAGER') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  const getPageTitle = () => {
    if (user?.role === 'ADMIN') return 'Administrator Dashboard';
    if (user?.role === 'EMPLOYEE') return 'Employee Workstation';
    if (user?.role === 'HALL_MANAGER') return 'Hall Manager Operations';
    return 'Customer Hub';
  };

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <DashboardHeader
          title={getPageTitle()}
          onSidebarToggle={() => setSidebarOpen(true)}
        />

        {/* Dynamic Outlet rendering children pages */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
