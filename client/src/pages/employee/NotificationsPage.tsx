import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Button from '../../components/common/Button';
import { employeeWorkstationApi } from '../../api/employeeWorkstationApi';
import { Notification } from '../../api/notificationApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { MailOpen, CheckSquare, Bell, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificationsData = async () => {
    try {
      const data = await employeeWorkstationApi.getNotifications();
      setNotifications(data);
    } catch {
      addToast('Failed to fetch inbox notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await employeeWorkstationApi.markNotificationRead(id);
      fetchNotificationsData();
    } catch {
      addToast('Failed to mark notification as read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await employeeWorkstationApi.markAllNotificationsRead();
      addToast('All notifications marked as read.', 'success');
      fetchNotificationsData();
    } catch {
      addToast('Failed to mark all notifications as read.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Inbox Notifications</h3>
          <p className="text-xs text-neutral-400 mt-1">Trace coordinator allocations, emergency requests and updates</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button onClick={handleMarkAllRead} variant="gold" className="gap-2 text-xs py-2">
            <CheckSquare size={14} /> Clear All Unread
          </Button>
        )}
      </div>

      <DashboardCard title="System Announcements & Activity alerts" subtitle="Inbox notifications status summary">
        {loading ? (
          <p className="text-xs text-neutral-400">Loading inbox updates...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs italic">
            No system announcements or activities alerts found.
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {notifications.map((n) => (
              <div key={n.id} className={`py-4 flex justify-between items-start gap-4 ${n.read ? 'opacity-60' : 'bg-gold-50/5 rounded p-2'}`}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full ${n.read ? 'bg-cream-100 text-neutral-400' : 'bg-gold-100 text-gold-700'}`}>
                    <Bell size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold ${n.read ? 'text-primary-700' : 'text-primary-800 font-serif'}`}>{n.title}</h4>
                    <p className="text-xs text-neutral-500">{n.message}</p>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock size={11} /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <Button variant="secondary" className="!p-1 text-[10px] gap-1" onClick={() => handleMarkAsRead(n.id)}>
                    <MailOpen size={12} /> Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default NotificationsPage;
