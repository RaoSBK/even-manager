import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const services = [
    { name: 'Marriage Function', path: '/events/book/marriage', desc: 'Pre-wedding, wedding rituals & grand receptions' },
    { name: 'Birthday Party', path: '/events/book/birthday', desc: 'Custom theme setups, catering & fun zones' },
    { name: 'Saree Function', path: '/events/book/saree', desc: 'Traditional decor setups & stages' },
    { name: 'Dawath / Banquet', path: '/events/book/dawath', desc: 'Premium banquet dining & setups' },
    { name: 'Other Events', path: '/events/book/other', desc: 'Corporate, anniversaries & custom celebrations' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Book an Event</h3>
        <p className="text-xs text-neutral-400 mt-1">Select an event category to customize your booking details</p>
      </div>

      <DashboardCard title="Available Services" subtitle="Choose from our premium packages">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, idx) => (
            <div
              key={idx}
              onClick={() => navigate(s.path)}
              className="border border-cream-200 hover:border-gold-400 p-6 rounded-luxury cursor-pointer transition-all flex gap-4 bg-cream-50/10"
            >
              <div className="bg-gold-50 border border-gold-200 p-3 rounded-full text-gold-600 shrink-0 h-12 w-12 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-base text-primary-800 font-serif">{s.name}</h4>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{s.desc}</p>
                <span className="inline-block text-xs font-bold text-gold-600 hover:text-gold-700 mt-4">
                  Start Booking &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default EventsPage;
