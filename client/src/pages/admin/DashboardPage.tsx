import React, { useEffect, useState } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import RecentActivity, { ActivityItem } from '../../components/dashboard/RecentActivity';
import { reportApi, DashboardStats } from '../../api/reportApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import {
  Users,
  Contact,
  Sparkles,
  Calendar,
  IndianRupee,
  CreditCard,
  Clock,
  Landmark
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock recent activity log
  const recentActivities: ActivityItem[] = [
    {
      id: 'act1',
      title: 'New Booking Registered',
      description: 'Marriage Ceremony booked at Taj Mahal Ballroom.',
      timestamp: '15m ago',
      type: 'booking'
    },
    {
      id: 'act2',
      title: 'Payment Confirmed',
      description: 'Received deposit for Grand Banquet event.',
      timestamp: '1h ago',
      type: 'payment'
    },
    {
      id: 'act3',
      title: 'New Employee Registered',
      description: 'Added Senior Decor Coordinator.',
      timestamp: '3h ago',
      type: 'user'
    },
    {
      id: 'act4',
      title: 'Hall Checked',
      description: 'Taj Mahal Grand Ballroom marked available.',
      timestamp: '1d ago',
      type: 'vendor'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let hasData = false;
        try {
          const statsData = await reportApi.getOverview();
          setStats(statsData);
          hasData = true;
        } catch (err) {
          console.warn('Failed to load report overview statistics:', err);
        }

        try {
          const bookingsData = await bookingApi.getAll();
          if (Array.isArray(bookingsData)) {
            setRecentBookings(bookingsData.slice(0, 5));
            hasData = true;
          }
        } catch (err) {
          console.warn('Failed to load recent bookings:', err);
        }

        if (hasData) {
          setError(null);
        } else {
          setError('Failed to fetch dashboard data. Please verify backend server and credentials.');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-neutral-500 font-sans">Loading Executive Overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white rounded-luxury border border-red-200 shadow-lg">
          <h4 className="text-lg font-bold text-red-600 font-serif">Error Loading Overview</h4>
          <p className="mt-2 text-sm text-neutral-600 font-sans">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-800 text-white rounded-full text-xs font-semibold hover:bg-primary-900"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Executive Overview</h3>
        <p className="text-xs text-neutral-400 mt-1">Real-time statistics across all branches and event departments</p>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={String(stats?.totalEvents || 0)}
          icon={<Sparkles className="text-gold-600" size={20} />}
          trend={{ value: `${stats?.upcomingEvents || 0} upcoming`, type: 'up' }}
          color="gold"
        />
        <StatCard
          title="Total Bookings"
          value={String(stats?.totalBookings || 0)}
          icon={<Calendar className="text-blue-600" size={20} />}
          trend={{ value: `${stats?.pendingBookings || 0} pending`, type: 'up' }}
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={String(stats?.totalCustomers || 0)}
          icon={<Users className="text-primary-800" size={20} />}
          color="primary"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={<IndianRupee className="text-green-800" size={20} />}
          color="green"
        />
        <StatCard
          title="Upcoming Events"
          value={String(stats?.upcomingEvents || 0)}
          icon={<Calendar className="text-gold-600" size={20} />}
          description="In the next 30 days"
          color="gold"
        />
        <StatCard
          title="Pending Bookings"
          value={String(stats?.pendingBookings || 0)}
          icon={<Clock className="text-blue-800" size={20} />}
          description="Awaiting confirmation"
          color="blue"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(stats?.pendingPayments || 0).toLocaleString('en-IN')}`}
          icon={<CreditCard className="text-red-800" size={20} />}
          description="Outstanding balances"
          color="red"
        />
        <StatCard
          title="Total Employees"
          value={String(stats?.totalEmployees || 0)}
          icon={<Contact className="text-primary-800" size={20} />}
          description={`And ${stats?.totalVendors || 0} vendors`}
          color="primary"
        />
        <StatCard
          title="Available Halls"
          value={String(stats?.availableHalls || 0)}
          icon={<Landmark className="text-green-800" size={20} />}
          description={`${stats?.occupiedHalls || 0} occupied today`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2">
          <DashboardCard title="Recent Bookings" subtitle="Latest client bookings and allocation status">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-400 font-sans">
                No bookings found.
              </div>
            ) : (
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
                        <td className="px-4 py-3 text-gold-600 font-bold">{b.bookingNumber}</td>
                        <td className="px-4 py-3">{b.user?.name || 'Client'}</td>
                        <td className="px-4 py-3">{b.eventType || 'General'}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'CONFIRMED'
                              ? 'bg-green-50 text-green-700 border border-green-150'
                              : b.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                              : 'bg-red-50 text-red-700 border border-red-150'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
