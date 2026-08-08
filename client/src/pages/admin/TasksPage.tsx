import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const TasksPage: React.FC = () => {
  const tasks = [
    { id: 'TSK01', title: 'Verify flower supply', assignedTo: 'GK Employee', deadline: 'Aug 10, 2026', priority: 'High', status: 'In Progress' },
    { id: 'TSK02', title: 'Confirm catering menu items', assignedTo: 'Seema Sharma', deadline: 'Aug 12, 2026', priority: 'Medium', status: 'Completed' },
    { id: 'TSK03', title: 'Finalize DJ playlist', assignedTo: 'Ramesh Patel', deadline: 'Aug 15, 2026', priority: 'Low', status: 'Pending' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">System Tasks Management</h3>
        <p className="text-xs text-neutral-400 mt-1">Assign, track, and manage checklists and duties for employee crews</p>
      </div>

      <DashboardCard title="Assigned Checklist Tasks" subtitle="Overview of staff operations and deadlines">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Task Title</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 text-gold-600 font-bold">{t.id}</td>
                  <td className="px-4 py-3 font-semibold">{t.title}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.assignedTo}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.deadline}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      t.priority === 'High' ? 'bg-red-50 text-red-700' : t.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-250' : t.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-250' : 'bg-neutral-50 text-neutral-700 border border-neutral-250'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default TasksPage;
