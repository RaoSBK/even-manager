import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const EventsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Events</h3>
        <p className="text-xs text-neutral-400 mt-1">Review event orders, decor themes, and schedules assigned to you</p>
      </div>

      <DashboardCard title="Assigned Celebrations Portfolio" subtitle="Select an event to coordinate staging and execution details">
        <p className="text-sm text-neutral-500">You are currently assigned as coordinator for two events. Please coordinate with vendors for stage set up.</p>
      </DashboardCard>
    </div>
  );
};

export default EventsPage;
