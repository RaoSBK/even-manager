import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';
import { getHallBookings, HallBookingResponse } from '../../api/bookingApi';
import { generateHallBookingPDF } from '../../services/pdfService';
import { useNotifications } from '../../contexts/NotificationContext';
import { Loader2, Download } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // States
  const [liveBookings, setLiveBookings] = useState<HallBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Static sample mock bookings to combine/display alongside
  const mockBookings = [
    {
      id: 'BK8923',
      type: 'Marriage Function',
      date: 'Dec 12, 2026',
      hall: 'Grand Palace Hall C',
      total: '₹2,50,000',
      paid: '₹1,50,000',
      due: '₹1,00,000',
      status: 'Partially Paid'
    }
  ];

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      try {
        const bookings = await getHallBookings(user.id);
        setLiveBookings(bookings);
      } catch (err: any) {
        console.error('Failed to load bookings from database:', err);
        // Silently capture since static mock is still displayed as fallback
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, [user]);

  // Trigger PDF Generation for live SQLite bookings
  const handleDownloadPDF = (b: HallBookingResponse) => {
    try {
      generateHallBookingPDF({
        bookingId: b.bookingId,
        customerName: b.customerName,
        email: b.email,
        mobile: b.mobile,
        state: b.state,
        district: b.district,
        mandal: b.mandal,
        hallName: b.hallName,
        hallAddress: b.hallAddress,
        eventDate: b.eventDate,
        bookingDate: b.bookingDate,
        costPerDay: b.costPerDay,
        totalAmount: b.totalAmount,
        status: b.status
      });
      addToast('Download started successfully.', 'success');
    } catch (err) {
      addToast('Failed to generate PDF. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Bookings</h3>
        <p className="text-xs text-neutral-400 mt-1">Check the details, dates, and status of your requested bookings</p>
      </div>

      <DashboardCard title="Booking List" subtitle="Overview of your event reservations">
        
        {isLoading ? (
          /* Loading Indicator */
          <div className="flex flex-col items-center justify-center py-12 text-primary-800">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs text-neutral-400">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Live Database SQLite Bookings */}
            {liveBookings.map((b) => (
              <div key={b.bookingId} className="border border-gold-200 p-5 rounded-luxury bg-gold-50/5 hover:border-gold-300 transition-all space-y-4 relative">
                {/* Visual Label Indicator */}
                <div className="absolute top-0 right-0 transform translate-x-0 -translate-y-0 bg-gold-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wide">
                  Live SQLite DB
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                  <div>
                    <h4 className="font-bold text-base text-primary-800 font-serif">Function Hall Booking</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Booking ID: <span className="font-mono font-bold text-gold-600">#{b.bookingId}</span></p>
                  </div>
                  <span className="inline-block bg-primary-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    📅 Event: {b.eventDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Function Venue</p>
                    <p className="font-bold text-primary-800 mt-1 truncate">{b.hallName}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Total Contract</p>
                    <p className="font-bold text-primary-800 mt-1">₹{b.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Booking Date</p>
                    <p className="font-bold text-primary-800 mt-1">{b.bookingDate}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Location</p>
                    <p className="font-bold text-primary-800 mt-1 truncate">{b.mandal}, {b.district}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-cream-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Status:</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {b.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadPDF(b)}
                    className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all shadow"
                  >
                    <Download size={12} />
                    Download Receipt PDF
                  </button>
                </div>
              </div>
            ))}

            {/* Static Mock Bookings */}
            {mockBookings.map((b) => (
              <div key={b.id} className="border border-cream-200 p-5 rounded-luxury bg-cream-50/10 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                  <div>
                    <h4 className="font-bold text-base text-primary-800 font-serif">{b.type}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Booking ID: <span className="font-mono font-bold text-gold-600">#{b.id}</span></p>
                  </div>
                  <span className="inline-block bg-primary-850 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
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
        )}
      </DashboardCard>
    </div>
  );
};

export default BookingsPage;
