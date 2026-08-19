import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Attendance Tracker</h3>
        <p className="text-xs text-neutral-400 mt-1">Clock in, clock out, and review monthly attendance logs and leave requests</p>
      </div>

      <DashboardCard title="Daily Attendance Status" subtitle="Submit clock-in and trace work hours">
        <p className="text-sm text-neutral-500">Current status: Checked In. Check-in time: 09:00 AM. Shift: General Day Shift.</p>
      </DashboardCard>
    </div>
  );
};

export default AttendancePage;
