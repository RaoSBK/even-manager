import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import UserProfileMenu from './UserProfileMenu';
import NotificationPanel, { NotificationItem } from './NotificationPanel';

interface DashboardHeaderProps {
  title: string;
  onSidebarToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, onSidebarToggle }) => {
  const { clearNotifications } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Mock static notifications
  const [mockNotifications, setMockNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New Booking Request',
      message: 'A new marriage function booking has been requested for Dec 12, 2026.',
      timestamp: '5m ago',
      type: 'info',
      read: false
    },
    {
      id: 'n2',
      title: 'Payment Confirmed',
      message: 'Payment of ₹1,50,000 confirmed for Booking ID #BK8923.',
      timestamp: '2h ago',
      type: 'success',
      read: false
    },
    {
      id: 'n3',
      title: 'Urgent Task Assigned',
      message: 'Staffing approval required for the upcoming Dawath ceremony.',
      timestamp: '1d ago',
      type: 'warning',
      read: false
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: string) => {
    setMockNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAll = () => {
    setMockNotifications([]);
    clearNotifications();
  };

  const displayUnread = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-cream-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 font-sans shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="lg:hidden text-primary-800 hover:text-gold-500 p-1.5 rounded-lg hover:bg-cream-50 transition-all border border-cream-100"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg sm:text-xl font-extrabold text-primary-800 font-serif tracking-wide uppercase">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-primary-800 hover:text-gold-500 p-2 rounded-full hover:bg-cream-50 transition-all relative border border-cream-100 shadow-sm"
          >
            <Bell size={18} />
            {displayUnread > 0 && (
              <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full bg-gold-500 text-white text-[9px] font-bold text-center leading-4">
                {displayUnread}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
              <NotificationPanel
                notifications={mockNotifications}
                onMarkRead={handleMarkRead}
                onClearAll={handleClearAll}
              />
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-cream-200"></div>

        {/* User profile dropdown */}
        <UserProfileMenu />
      </div>
    </header>
  );
};

export default DashboardHeader;
