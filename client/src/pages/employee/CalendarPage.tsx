import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Duty Calendar</h3>
        <p className="text-xs text-neutral-400 mt-1">Check scheduled shifts, assigned venue details, and client meeting times</p>
      </div>

      <DashboardCard title="Shift Schedule Log" subtitle="Log of event shifts and hall assignments">
        <p className="text-sm text-neutral-500">Upcoming duty shift: Sharma Marriage Reception on Aug 18, 2026 at Royal Garden Hall A.</p>
      </DashboardCard>
    </div>
  );
};

export default CalendarPage;
