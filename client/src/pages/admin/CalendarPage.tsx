import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const CalendarPage: React.FC = () => {
  const schedule = [
    { title: 'Rohit Sharma Birthday Party', date: 'Aug 18, 2026', time: '18:00', hall: 'Royal Garden Hall A' },
    { title: 'Ananya Roy Engagement Ceremony', date: 'Aug 22, 2026', time: '11:00', hall: 'Grand Palace Hall C' },
    { title: 'Vikram Corporate Seminar', date: 'Aug 30, 2026', time: '09:00', hall: 'Orchid Banquet Plaza' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Events Calendar</h3>
        <p className="text-xs text-neutral-400 mt-1">Global schedule of bookings, vendor setups, and employee duties</p>
      </div>

      <DashboardCard title="Upcoming Events Schedule" subtitle="Time slots and hall reservations log">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schedule.map((item, idx) => (
            <div key={idx} className="border border-cream-200 bg-cream-50/20 hover:border-gold-300 p-5 rounded-luxury transition-all">
              <span className="inline-block bg-gold-100 text-gold-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-3">
                {item.date}
              </span>
              <h4 className="font-bold text-sm text-primary-800 font-serif mb-1">{item.title}</h4>
              <p className="text-xs text-neutral-500 mt-2">🕒 <span className="font-semibold">{item.time}</span></p>
              <p className="text-xs text-neutral-500 mt-1">📍 <span className="font-semibold">{item.hall}</span></p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default CalendarPage;
