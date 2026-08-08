import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const CustomersPage: React.FC = () => {
  const customers = [
    { id: 'CST101', name: 'Rahul Kumar', email: 'user@gkevent.com', phone: '9876543210', events: 2, spent: '₹2,50,000' },
    { id: 'CST102', name: 'Ankita Verma', email: 'ankita@outlook.com', phone: '9988112233', events: 1, spent: '₹1,10,000' },
    { id: 'CST103', name: 'Manish Singh', email: 'manish.s@gmail.com', phone: '7766554433', events: 4, spent: '₹6,40,000' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Customer Base</h3>
        <p className="text-xs text-neutral-400 mt-1">Monitor user bookings history, engagement history, and total spending metrics</p>
      </div>

      <DashboardCard title="Client List" subtitle="List of registered clients and billing profiles">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Events Booked</th>
                <th className="px-4 py-3">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 text-gold-600 font-bold">{c.id}</td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 text-xs">{c.email}</td>
                  <td className="px-4 py-3 text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-center">{c.events}</td>
                  <td className="px-4 py-3 font-semibold text-gold-600">{c.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default CustomersPage;
