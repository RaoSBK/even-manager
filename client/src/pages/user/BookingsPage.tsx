import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const BookingsPage: React.FC = () => {
  const bookings = [
    { id: 'BK8923', type: 'Marriage Function', date: 'Dec 12, 2026', hall: 'Grand Palace Hall C', total: '₹2,50,000', paid: '₹1,50,000', due: '₹1,00,000', status: 'Partially Paid' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Bookings</h3>
        <p className="text-xs text-neutral-400 mt-1">Check the details, dates, and status of your requested bookings</p>
      </div>

      <DashboardCard title="Booking List" subtitle="Overview of your event reservations">
        <div className="space-y-4">
          {bookings.map((b) => (
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
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default BookingsPage;
