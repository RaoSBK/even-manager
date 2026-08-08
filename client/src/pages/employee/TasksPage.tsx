import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Tasks Checklist</h3>
        <p className="text-xs text-neutral-400 mt-1">Review, execute, and mark checklist items assigned to you by administrators</p>
      </div>

      <DashboardCard title="Daily Checklist Tasks" subtitle="Track tasks status and submit checklists">
        <p className="text-sm text-neutral-500">Please verify floral setups, catering counts, and sound systems timings before event commencement.</p>
      </DashboardCard>
    </div>
  );
};

export default TasksPage;
