import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const EmployeesPage: React.FC = () => {
  const employees = [
    { id: 'EMP001', name: 'GK Employee', role: 'Staff Coordinator', email: 'employee@gkevent.com', phone: '8888888888', status: 'Active' },
    { id: 'EMP002', name: 'Ramesh Patel', role: 'Event Manager', email: 'ramesh@gkevent.com', phone: '9988776655', status: 'Active' },
    { id: 'EMP003', name: 'Seema Sharma', role: 'Catering Lead', email: 'seema@gkevent.com', phone: '8877665544', status: 'On Leave' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Staff & Employees</h3>
        <p className="text-xs text-neutral-400 mt-1">Manage event planners, coordinators, catering crews, and field staff</p>
      </div>

      <DashboardCard title="Employee Directory" subtitle="List of all registered staff members">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 text-gold-600 font-bold">{emp.id}</td>
                  <td className="px-4 py-3 font-semibold">{emp.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{emp.role}</td>
                  <td className="px-4 py-3 text-xs">{emp.email}</td>
                  <td className="px-4 py-3 text-xs">{emp.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-250' : 'bg-yellow-50 text-yellow-700 border border-yellow-250'
                    }`}>
                      {emp.status}
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

export default EmployeesPage;
