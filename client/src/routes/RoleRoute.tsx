import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../contexts/AuthContext';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role to their dashboard
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'EMPLOYEE') {
      return <Navigate to="/employee/dashboard" replace />;
    } else if (user.role === 'HALL_MANAGER') {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
