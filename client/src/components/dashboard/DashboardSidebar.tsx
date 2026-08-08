import React from 'react';
import { NavLink, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Contact,
  Sparkles,
  ShoppingBag,
  Box,
  FileText,
  CreditCard,
  Receipt,
  Landmark,
  Plane,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  User,
  X
} from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

interface SidebarLink {
  path: string;
  name: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const adminLinks: SidebarLink[] = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/users', name: 'Users', icon: <Users size={18} /> },
    { path: '/admin/employees', name: 'Employees', icon: <Contact size={18} /> },
    { path: '/admin/events', name: 'Events', icon: <Sparkles size={18} /> },
    { path: '/admin/vendors', name: 'Vendors', icon: <ShoppingBag size={18} /> },
    { path: '/admin/inventory', name: 'Inventory', icon: <Box size={18} /> },
    { path: '/admin/customers', name: 'Customers', icon: <Users size={18} /> },
    { path: '/admin/quotations', name: 'Quotations', icon: <FileText size={18} /> },
    { path: '/admin/payments', name: 'Payments', icon: <CreditCard size={18} /> },
    { path: '/admin/invoices', name: 'Invoices', icon: <Receipt size={18} /> },
    { path: '/admin/halls', name: 'Function Halls', icon: <Landmark size={18} /> },
    { path: '/admin/travel', name: 'Travel Packages', icon: <Plane size={18} /> },
    { path: '/admin/tasks', name: 'Tasks', icon: <CheckSquare size={18} /> },
    { path: '/admin/calendar', name: 'Calendar', icon: <Calendar size={18} /> },
    { path: '/admin/reports', name: 'Reports', icon: <BarChart3 size={18} /> },
    { path: '/admin/settings', name: 'Settings', icon: <Settings size={18} /> }
  ];

  const employeeLinks: SidebarLink[] = [
    { path: '/employee/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/employee/events', name: 'My Events', icon: <Sparkles size={18} /> },
    { path: '/employee/tasks', name: 'My Tasks', icon: <CheckSquare size={18} /> },
    { path: '/employee/calendar', name: 'Calendar', icon: <Calendar size={18} /> },
    { path: '/employee/attendance', name: 'Attendance', icon: <CheckSquare size={18} /> },
    { path: '/employee/notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { path: '/employee/profile', name: 'Profile', icon: <User size={18} /> }
  ];

  const userLinks: SidebarLink[] = [
    { path: '/user/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/user/events', name: 'Book Event', icon: <Sparkles size={18} /> },
    { path: '/user/halls', name: 'Function Halls', icon: <Landmark size={18} /> },
    { path: '/user/travel', name: 'Travel Packages', icon: <Plane size={18} /> },
    { path: '/user/bookings', name: 'My Bookings', icon: <Calendar size={18} /> },
    { path: '/user/payments', name: 'Payments', icon: <CreditCard size={18} /> },
    { path: '/user/invoices', name: 'Invoices', icon: <Receipt size={18} /> },
    { path: '/user/profile', name: 'Profile', icon: <User size={18} /> },
    { path: '/user/notifications', name: 'Notifications', icon: <Bell size={18} /> }
  ];

  const getLinks = () => {
    if (user.role === 'ADMIN') return adminLinks;
    if (user.role === 'EMPLOYEE') return employeeLinks;
    return userLinks;
  };

  const getTitle = () => {
    if (user.role === 'ADMIN') return 'Admin Portal';
    if (user.role === 'EMPLOYEE') return 'Staff Portal';
    return 'Customer Hub';
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-primary-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-cream-200 bg-primary-900 text-white flex flex-col justify-between transition-transform duration-300 font-sans lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header/Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-primary-950/20">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="GK Events Logo" className="w-9 h-9 object-contain" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider leading-none uppercase font-serif">GK EVENTS</span>
                <span className="text-[8px] text-gold-400 font-mono tracking-widest leading-none mt-0.5">{getTitle()}</span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-luxury text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info inside sidebar */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-gray-400 bg-primary-950/10">
          <p className="font-semibold text-gold-500">GK Event Management</p>
          <p className="mt-0.5">&copy; {new Date().getFullYear()} v1.0.0 (Demo Mode)</p>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
