import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import UserProfileMenu from './UserProfileMenu';
import NotificationPanel, { NotificationItem } from './NotificationPanel';
import { notificationApi } from '../../api/notificationApi';

interface DashboardHeaderProps {
  title: string;
  onSidebarToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, onSidebarToggle }) => {
  const { clearNotifications, addToast } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchAlerts = async () => {
    try {
      const data = await notificationApi.getAll();
      // Map backend schema to notification panel schema
      const mapped = data.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: n.type,
        read: n.read
      }));
      setNotifications(mapped);
    } catch {
      console.warn('Failed to load real-time alerts.');
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      addToast('Failed to mark alert as read.', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      clearNotifications();
    } catch {
      addToast('Failed to clear alerts.', 'error');
    }
  };

  const displayUnread = notifications.filter(n => !n.read).length;

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
                notifications={notifications}
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
