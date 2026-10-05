import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { generateHallBookingPDF } from '../../services/pdfService';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { CheckCircle2, Download, Eye, Home, Calendar, Users, Landmark, AlertCircle } from 'lucide-react';

interface Props {
  bookingData?: BookingDetails;
}

export const BookingConfirmationPage: React.FC<Props> = ({ bookingData }) => {
  const { bookingId } = useParams<{ bookingId?: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetails | null>(bookingData || null);
  const [loading, setLoading] = useState<boolean>(!bookingData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingData) {
      setBooking(bookingData);
      setLoading(false);
      return;
    }

    if (bookingId) {
      setLoading(true);
      bookingApi.getById(bookingId)
        .then((data) => {
          setBooking(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || 'Failed to fetch booking confirmation details.');
        })
        .finally(() => setLoading(false));
    }
  }, [bookingId, bookingData]);

  const handleDownloadInvoice = () => {
    if (!booking) return;

    let foodItems: Array<{ id: string; name: string; price: number }> = [];
    if (booking.selectedServices) {
      try {
        const parsed = JSON.parse(booking.selectedServices);
        if (Array.isArray(parsed)) {
          foodItems = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    generateHallBookingPDF({
      bookingId: booking.bookingNumber || booking.id,
      customerName: booking.user?.name || 'Customer',
      email: booking.user?.email || 'customer@gkevent.com',
      mobile: booking.user?.mobile || '',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Central',
      hallName: booking.hall?.name || 'Function Hall',
      hallAddress: booking.hall?.location || 'GK Event Complex',
      eventDate: new Date(booking.eventDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      bookingDate: new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-IN'),
      costPerDay: Number(booking.hallAmount || booking.totalAmount),
      totalAmount: Number(booking.totalAmount),
      status: booking.status,
      eventType: booking.eventType || 'General Event',
      guestsCount: booking.guestCount || 100,
      eventSession: `${booking.startTime || '09:00'} - ${booking.endTime || '18:00'}`,
      foodItems
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-cream-200 p-12 rounded-luxury flex flex-col items-center justify-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading Booking Confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-cream-200 p-8 rounded-luxury shadow-sm">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <h3 className="text-lg font-bold text-primary-800">Booking Record Not Found</h3>
          <p className="text-xs text-neutral-500 mt-1">{error || 'Unable to retrieve booking confirmation.'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 bg-primary-800 text-white font-bold py-2.5 px-6 rounded-luxury text-xs uppercase tracking-wider hover:bg-primary-900 transition-all inline-flex items-center gap-2"
          >
            <Home size={14} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const hallAmt = Number(booking.hallAmount || booking.totalAmount);
  const servAmt = Number(booking.servicesAmount || 0);
  const gstAmt = Number(booking.gstAmount || Math.round((hallAmt + servAmt) * 0.18));
  const totalAmt = Number(booking.totalAmount);

  const formattedEventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <DashboardCard title="Booking Confirmation" subtitle="Your venue booking has been successfully secured and paid.">
        <div className="space-y-8">
          
          {/* Confirmed Banner */}
          <div className="bg-green-50 border border-green-200 rounded-luxury p-6 text-center space-y-2">
            <div className="inline-flex h-14 w-14 bg-green-600 text-white rounded-full items-center justify-center shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold font-serif text-green-900">BOOKING CONFIRMED</h3>
            <p className="text-xs text-green-700 max-w-md mx-auto">
              Thank you! Your payment has been verified and your function hall reservation is confirmed.
            </p>
          </div>

          {/* Details Grid */}
          <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white shadow-sm divide-y divide-cream-100 text-xs">
            <div className="bg-primary-800 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Booking Reference</span>
                <p className="text-lg font-bold font-mono text-gold-400">#{booking.bookingNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Status</span>
                <div className="mt-0.5">
                  <span className="bg-green-500 text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Event Date</span>
                  <p className="font-bold text-sm text-primary-800 mt-0.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gold-500" />
                    {formattedEventDate}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Function Hall</span>
                  <p className="font-bold text-sm text-primary-800 font-serif mt-0.5 flex items-center gap-1.5">
                    <Landmark size={14} className="text-gold-500" />
                    {booking.hall?.name || 'Function Hall'}
                  </p>
                  <p className="text-[11px] text-neutral-500">📍 {booking.hall?.location || 'GK Event Venue Block'}</p>
                </div>

                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Customer</span>
                  <p className="font-bold text-primary-800 mt-0.5">
                    {booking.user?.name || 'Customer Name'}
                  </p>
                  <p className="text-[11px] text-neutral-500">{booking.user?.email} • {booking.user?.mobile}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Expected Guests</span>
                  <p className="font-bold text-primary-800 mt-0.5 flex items-center gap-1.5">
                    <Users size={14} className="text-gold-500" />
                    {booking.guestCount || 100} Guests
                  </p>
                </div>

                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Timings Slot</span>
                  <p className="font-bold text-primary-800 mt-0.5">
                    {booking.startTime || '09:00'} - {booking.endTime || '18:00'}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Razorpay Payment ID</span>
                  <p className="font-mono font-bold text-gold-600 mt-0.5 text-xs truncate">
                    {booking.razorpayPaymentId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-5 bg-cream-50/20 space-y-2.5">
              <h5 className="font-bold text-primary-800 uppercase text-[10px] tracking-wider border-b border-cream-200 pb-1.5">
                Financial Invoice Breakdown
              </h5>

              <div className="flex justify-between text-neutral-600 py-1">
                <span>Hall Base Rent:</span>
                <span className="font-mono font-semibold text-primary-800">₹{hallAmt.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-neutral-600 py-1">
                <span>Add-on Services:</span>
                <span className="font-mono font-semibold text-primary-800">₹{servAmt.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-neutral-600 py-1">
                <span>GST (18%):</span>
                <span className="font-mono font-semibold text-primary-800">₹{gstAmt.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-cream-200 pt-2 flex justify-between items-center text-sm font-bold text-primary-800">
                <span>Grand Total Paid:</span>
                <span className="font-mono text-base text-gold-600">₹{totalAmt.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px]">
                <span className="text-neutral-400 font-bold uppercase">Payment Status:</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                  {booking.paymentStatus || 'PAID'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/user/bookings')}
              className="bg-primary-800 text-white font-bold py-3 px-5 rounded-luxury text-xs uppercase tracking-wider hover:bg-primary-900 shadow transition-all flex items-center gap-2"
            >
              <Eye size={14} />
              <span>View Booking</span>
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-5 rounded-luxury text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2"
            >
              <Download size={14} />
              <span>Download Invoice</span>
            </button>

            <button
              onClick={() => navigate('/user/bookings')}
              className="border border-primary-800 text-primary-800 font-bold py-3 px-5 rounded-luxury text-xs uppercase tracking-wider hover:bg-primary-50 transition-all flex items-center gap-2"
            >
              <span>My Bookings</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="border border-cream-300 text-neutral-600 font-bold py-3 px-5 rounded-luxury text-xs uppercase tracking-wider hover:bg-cream-50 transition-all flex items-center gap-2"
            >
              <Home size={14} />
              <span>Back to Home</span>
            </button>
          </div>

        </div>
      </DashboardCard>
    </div>
  );
};

export default BookingConfirmationPage;
