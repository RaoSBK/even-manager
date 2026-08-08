import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Notifications</h3>
        <p className="text-xs text-neutral-400 mt-1">Stay updated with latest task assignments and schedule alterations</p>
      </div>

      <DashboardCard title="All Employee Alerts" subtitle="Official announcements and system updates log">
        <p className="text-sm text-neutral-500">You are fully caught up! All current tasks and shifts schedules are active.</p>
      </DashboardCard>
    </div>
  );
};

export default NotificationsPage;
