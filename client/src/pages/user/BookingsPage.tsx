import React, { useState, useEffect } from 'react';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Eye,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { addToast } = useNotifications();
  
  // Bookings list state
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Load bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to fetch bookings list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Cancel handler
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action is irreversible.')) {
      return;
    }
    try {
      const res = await bookingApi.cancel(bookingId);
      addToast(res.message || 'Booking cancelled successfully.', 'success');
      setSelectedBooking(null); // Close modal if open
      loadBookings(); // Reload
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to cancel booking. Cancellations must be requested at least 15 days in advance.', 'error');
    }
  };

  // Filter bookings list
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    
    const eventDateObj = new Date(b.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (statusFilter === 'CANCELLED') {
      return b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    if (statusFilter === 'UPCOMING') {
      return (b.status === 'CONFIRMED' || b.status === 'PENDING') && eventDateObj >= today;
    }
    if (statusFilter === 'COMPLETED') {
      return b.status === 'COMPLETED' || (b.status !== 'CANCELLED' && b.status !== 'REJECTED' && eventDateObj < today);
    }
    return true;
  });

  const getStatusBadge = (status: BookingDetails['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
      case 'PENDING':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Pending Approval</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      case 'REJECTED':
        return <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
      case 'COMPLETED':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Completed</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Bookings</h3>
        <p className="text-xs text-neutral-400 mt-1">Check status, dates, invoice totals, or request cancellation of your events.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-cream-200 pb-3">
        {[
          { id: 'ALL', label: 'All Bookings' },
          { id: 'UPCOMING', label: 'Upcoming' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled / Rejected' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-luxury text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-primary-800 text-white shadow-sm'
                : 'text-neutral-500 hover:bg-cream-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-cream-200 p-20 rounded-luxury text-center flex flex-col items-center justify-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-cream-200 p-12 rounded-luxury text-center">
          <AlertCircle className="mx-auto text-gold-500 mb-2" size={24} />
          <p className="text-sm font-semibold text-primary-800">No event bookings found matching this filter.</p>
          <p className="text-xs text-neutral-400 mt-1">Ready to plan? Create a new booking reservation today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const dateStr = new Date(b.eventDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={b.id}
                className="bg-white border border-cream-200 p-5 rounded-luxury shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-cream-100">
                  <div>
                    <h4 className="font-bold text-sm text-primary-800 font-serif">
                      {b.eventType || 'General Event'}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Booking Number:{' '}
                      <span className="font-mono font-bold text-gold-600">#{b.bookingNumber}</span>
                    </p>
                  </div>
                  <span className="bg-primary-50 text-primary-800 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                    📅 {dateStr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Hall Venue</p>
                    <p className="font-semibold text-primary-800 truncate">{b.hall?.name || 'Selected Hall'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Total Contract</p>
                    <p className="font-bold text-gold-600 font-mono">₹{Number(b.totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Guests Pax</p>
                    <p className="font-semibold text-primary-800">{b.guestCount || 100} Guests</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Timings Slot</p>
                    <p className="font-semibold text-primary-800">{b.startTime || '09:00'} - {b.endTime || '18:00'}</p>
                  </div>
                </div>

                {b.addressLine1 && (
                  <div className="bg-cream-50/60 border border-cream-150 p-2.5 rounded-luxury text-xs space-y-0.5">
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Event Address</p>
                    <p className="font-medium text-primary-800 leading-snug text-[11px]">
                      {[b.addressLine1, b.addressLine2, b.city, b.district, b.state, b.pincode ? `PIN: ${b.pincode}` : ''].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-cream-100">
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(b.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="border border-cream-200 hover:bg-cream-50 p-1.5 rounded-luxury text-neutral-600 transition-all flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                    
                    {b.status !== 'CANCELLED' && b.status !== 'REJECTED' && b.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-luxury transition-all flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <XCircle size={12} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL OVERLAY MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-luxury animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-cream-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base text-primary-800 font-serif">Booking Details</h4>
                <p className="text-[10px] text-neutral-400 font-mono">Ref: #{selectedBooking.bookingNumber}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-neutral-400 hover:text-primary-800 p-1 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-cream-100 pb-4">
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Occasion Type</p>
                  <p className="font-bold text-sm text-primary-800">{selectedBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Event Date</p>
                  <p className="font-bold text-primary-800">
                    {new Date(selectedBooking.eventDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Total Paid / Contract</p>
                  <p className="font-bold text-sm text-gold-600 font-mono">₹{Number(selectedBooking.totalAmount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-1">Function Venue</p>
                <div className="bg-cream-50/40 border border-cream-200 p-3 rounded-luxury space-y-1">
                  <p className="font-bold text-primary-800">{selectedBooking.hall?.name}</p>
                  <p className="text-[11px] text-neutral-500">📍 {selectedBooking.hall?.location || 'Main Venue block'}</p>
                  <p className="text-[11px] text-neutral-500">🏢 Base Price: ₹{Number(selectedBooking.hall?.basePrice).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-1">Booking Timings & Guests</p>
                <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                  <p>🕒 Session: {selectedBooking.startTime} to {selectedBooking.endTime}</p>
                  <p>🧑 Guests Count: {selectedBooking.guestCount} pax</p>
                </div>
              </div>

              {selectedBooking.addressLine1 && (
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-1">Event Location & Address</p>
                  <div className="bg-cream-50 border border-cream-200 p-3 rounded-luxury text-neutral-700 leading-relaxed font-sans space-y-1">
                    <p className="font-bold text-primary-800 text-xs">{selectedBooking.addressLine1}</p>
                    {selectedBooking.addressLine2 && <p className="text-[11px] text-neutral-600">{selectedBooking.addressLine2}</p>}
                    <p className="text-[11px] text-neutral-600">
                      {[selectedBooking.city, selectedBooking.district, selectedBooking.state, selectedBooking.pincode ? `PIN Code: ${selectedBooking.pincode}` : ''].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-1">Billing & Additional Info</p>
                  <p className="bg-neutral-50 border border-neutral-200 p-3 rounded-luxury text-neutral-600 leading-relaxed font-sans">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-cream-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="border border-cream-200 hover:bg-cream-50 px-4 py-2 rounded-luxury text-xs font-bold uppercase tracking-wider text-neutral-600 transition-all"
              >
                Close
              </button>
              
              {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'REJECTED' && selectedBooking.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-luxury text-xs font-bold uppercase tracking-wider transition-all shadow"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
