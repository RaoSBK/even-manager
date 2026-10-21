import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { CreditCard, Sparkles, Bookmark, Compass } from 'lucide-react';
import { useNavigate } from 'react-router';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myBookings = [
    { id: 'BK8923', type: 'Marriage Function', date: 'Dec 12, 2026', hall: 'Grand Palace Hall C', total: '₹2,50,000', paid: '₹1,50,000', due: '₹1,00,000', status: 'Partially Paid' }
  ];

  const services = [
    { name: 'Marriage Function', path: '/events/book/marriage', desc: 'Pre-wedding, wedding rituals & grand receptions' },
    { name: 'Birthday Party', path: '/events/book/birthday', desc: 'Custom theme setups, catering & fun zones' },
    { name: 'Saree Function', path: '/events/book/saree', desc: 'Traditional decor setups & stages' },
    { name: 'Dawath / Banquet', path: '/events/book/dawath', desc: 'Premium banquet dining & setups' },
    { name: 'Other Events', path: '/events/book/other', desc: 'Corporate, anniversaries & custom celebrations' }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Welcome, {user?.name}!</h3>
        <p className="text-xs text-neutral-400 mt-1">Manage your event bookings, payments, and invoices all in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Bookings"
          value="1"
          icon={<Bookmark className="text-gold-600" size={20} />}
          description="Sharma Marriage Reception"
          color="gold"
        />
        <StatCard
          title="Pending Payments"
          value="₹1,00,000"
          icon={<CreditCard className="text-red-800" size={20} />}
          description="Due before Dec 01, 2026"
          color="red"
        />
        <StatCard
          title="Past Events"
          value="1"
          icon={<Sparkles className="text-green-800" size={20} />}
          description="Corporate Dinner (2025)"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="My Active Bookings" subtitle="Track live details of your planned events">
            {myBookings.map((b) => (
              <div key={b.id} className="border border-cream-200 p-5 rounded-luxury bg-cream-50/10 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                  <div>
                    <h4 className="font-bold text-base text-primary-800 font-serif">{b.type}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Booking ID: <span className="font-mono font-bold text-gold-600">#{b.id}</span></p>
                  </div>
                  <span className="inline-block bg-primary-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    📅 {b.date}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Function Venue</p>
                    <p className="font-bold text-primary-800 mt-1 truncate">{b.hall}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Total Contract</p>
                    <p className="font-bold text-primary-800 mt-1">{b.total}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Amount Paid</p>
                    <p className="font-bold text-green-700 mt-1">{b.paid}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Amount Due</p>
                    <p className="font-bold text-red-600 mt-1">{b.due}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-cream-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Status:</span>
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-250 px-2 py-0.5 rounded text-[10px] font-bold">
                      {b.status}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/user/payments')}
                    className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-4 py-1.5 rounded text-xs transition-all shadow-sm"
                  >
                    Pay Balance
                  </button>
                </div>
              </div>
            ))}
          </DashboardCard>
        </div>

        {/* Available Services */}
        <div className="lg:col-span-1">
          <DashboardCard title="Explore Services" subtitle="Book new services for upcoming dates">
            <div className="space-y-4">
              {services.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(s.path)}
                  className="border border-cream-100 hover:border-gold-300 p-4 rounded-luxury bg-cream-50/10 cursor-pointer transition-all flex gap-3"
                >
                  <Compass className="text-gold-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="font-bold text-xs text-primary-800">{s.name}</h4>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
