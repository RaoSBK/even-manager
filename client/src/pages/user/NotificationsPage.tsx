import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Notifications</h3>
        <p className="text-xs text-neutral-400 mt-1">Get real-time updates regarding payments and planning stages</p>
      </div>

      <DashboardCard title="Alert History" subtitle="List of notices sent by the administration staff">
        <p className="text-sm text-neutral-500">Your wedding ceremony coordination checklist is currently active. Please review details.</p>
      </DashboardCard>
    </div>
  );
};

export default NotificationsPage;
