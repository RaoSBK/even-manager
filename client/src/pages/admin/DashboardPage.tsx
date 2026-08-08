import React from 'react';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import RecentActivity, { ActivityItem } from '../../components/dashboard/RecentActivity';
import {
  Users,
  Contact,
  Sparkles,
  Calendar,
  IndianRupee,
  CreditCard,
  Box,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Mock recent activity log
  const recentActivities: ActivityItem[] = [
    {
      id: 'act1',
      title: 'New Booking Registered',
      description: 'Marriage Ceremony booked at Grand Palace Hall by Rahul Kumar.',
      timestamp: '15m ago',
      type: 'booking'
    },
    {
      id: 'act2',
      title: 'Payment Received',
      description: 'Received partial payment of ₹80,000 from client Priya Sen.',
      timestamp: '1h ago',
      type: 'payment'
    },
    {
      id: 'act3',
      title: 'New Employee Registered',
      description: 'Added Suresh Raina as Senior Decor Coordinator.',
      timestamp: '3h ago',
      type: 'user'
    },
    {
      id: 'act4',
      title: 'Inventory Updated',
      description: 'Imported 200 LED stage light fixtures from Vendor LightHouse.',
      timestamp: '1d ago',
      type: 'vendor'
    },
    {
      id: 'act5',
      title: 'Task Completed',
      description: 'Catering menu finalized for birthday party event #BK4823.',
      timestamp: '2d ago',
      type: 'task'
    }
  ];

  const recentBookings = [
    { id: 'BK0102', client: 'Rohit Sharma', event: 'Birthday Bash', date: 'Aug 18, 2026', amount: '₹75,000', status: 'Confirmed' },
    { id: 'BK0103', client: 'Ananya Roy', event: 'Saree Function', date: 'Aug 22, 2026', amount: '₹1,20,000', status: 'Pending' },
    { id: 'BK0104', client: 'Vikram Seth', event: 'Corporate Meeting', date: 'Aug 30, 2026', amount: '₹2,50,000', status: 'Confirmed' },
    { id: 'BK0105', client: 'Manish Malhotra', event: 'Fashion Show', date: 'Sep 05, 2026', amount: '₹5,00,000', status: 'Pending' }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Executive Overview</h3>
        <p className="text-xs text-neutral-400 mt-1">Real-time statistics across all branches and event departments</p>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="1,540"
          icon={<Users className="text-blue-600" size={20} />}
          trend={{ value: '+12% this month', type: 'up' }}
          color="blue"
        />
        <StatCard
          title="Total Employees"
          value="48"
          icon={<Contact className="text-primary-800" size={20} />}
          trend={{ value: 'Full capacity', type: 'up' }}
          color="primary"
        />
        <StatCard
          title="Total Events Managed"
          value="320"
          icon={<Sparkles className="text-gold-600" size={20} />}
          trend={{ value: '+24 new bookings', type: 'up' }}
          color="gold"
        />
        <StatCard
          title="Total Revenue"
          value="₹24,50,000"
          icon={<IndianRupee className="text-green-800" size={20} />}
          trend={{ value: '+18.5% YoY growth', type: 'up' }}
          color="green"
        />
        <StatCard
          title="Upcoming Events"
          value="15"
          icon={<Calendar className="text-gold-600" size={20} />}
          description="In the next 30 days"
          color="gold"
        />
        <StatCard
          title="Pending Bookings"
          value="12"
          icon={<Clock className="text-blue-800" size={20} />}
          description="Awaiting coordination"
          color="blue"
        />
        <StatCard
          title="Pending Payments"
          value="₹3,20,000"
          icon={<CreditCard className="text-red-800" size={20} />}
          description="Outstanding balances"
          color="red"
        />
        <StatCard
          title="Inventory Status"
          value="92% Avail"
          icon={<Box className="text-primary-800" size={20} />}
          description="8% reserved for current setup"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2">
          <DashboardCard title="Recent Bookings" subtitle="Latest client bookings and allocation status">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-100 text-sm">
                <thead>
                  <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-cream-50/20 transition-all">
                      <td className="px-4 py-3 text-gold-600 font-bold">{b.id}</td>
                      <td className="px-4 py-3">{b.client}</td>
                      <td className="px-4 py-3">{b.event}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{b.date}</td>
                      <td className="px-4 py-3 font-semibold">{b.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* Recent Activities Log */}
        <div className="lg:col-span-1">
          <DashboardCard title="Recent Activities" subtitle="Log of latest actions across departments">
            <RecentActivity activities={recentActivities} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
