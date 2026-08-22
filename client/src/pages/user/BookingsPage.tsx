<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';
import { getHallBookings, cancelHallBooking, HallBookingResponse } from '../../api/bookingApi';
import { generateHallBookingPDF } from '../../services/pdfService';
import { useNotifications } from '../../contexts/NotificationContext';
import { Loader2, Download, AlertTriangle } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // States
  const [liveBookings, setLiveBookings] = useState<HallBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Convert static mock bookings to local state
  const [mockBookings, setMockBookings] = useState([
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
  ]);

  // Cancellation modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    eventDate: string;
    isMock: boolean;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

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

  const handleCancelInitiate = (id: string, eventDate: string, isMock: boolean) => {
    // 15 days check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    const diffTime = eventDateTime.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 15) {
      addToast('Cancellations must be requested at least 15 days before the event. Please contact customer care.', 'warning');
      return;
    }

    setSelectedBooking({ id, eventDate, isMock });
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);

    try {
      if (selectedBooking.isMock) {
        setMockBookings(prev =>
          prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'Cancelled' } : b)
        );
        addToast('Mock booking cancelled successfully!', 'success');
      } else {
        await cancelHallBooking(selectedBooking.id);
        if (user) {
          const bookings = await getHallBookings(user.id);
          setLiveBookings(bookings);
        }
        addToast('Booking cancelled successfully!', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel booking. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

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
        status: b.status,
        eventType: b.eventType,
        guestsCount: b.guestsCount,
        eventSession: b.eventSession
      });
      addToast('Download started successfully.', 'success');
    } catch (err) {
      addToast('Failed to generate PDF. Please try again.', 'error');
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Bookings</h3>
        <p className="text-xs text-neutral-400 mt-1">Check status, dates, invoice totals, or request cancellation of your events.</p>
      </div>

<<<<<<< HEAD
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
=======
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
                  
                  {/* Additional details */}
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Event Details</p>
                    <p className="font-bold text-primary-800 mt-1">{b.eventType || 'General Event'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Session & Guests</p>
                    <p className="font-bold text-primary-800 mt-1">
                      {b.eventSession || 'Full Day'}
                      {b.startTime && ` (${b.startTime} - ${b.endTime})`}
                      <span className="block text-[10px] text-neutral-500 font-medium">({b.guestsCount || 100} Guests)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Payment Status</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      b.paymentStatus === 'Refunded' || b.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-250'
                        : b.paymentStatus === 'Pending'
                        ? 'bg-yellow-50 text-yellow-750 border-yellow-250'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                    }`}>
                      {b.paymentStatus || (b.status === 'Cancelled' ? 'Refunded' : 'Paid')}
                    </span>
                  </div>

                  {b.foodItems && (() => {
                    try {
                      const foodList = typeof b.foodItems === 'string' ? JSON.parse(b.foodItems) : b.foodItems;
                      if (foodList && foodList.length > 0) {
                        return (
                          <div className="col-span-2 sm:col-span-4 mt-2 pt-3 border-t border-cream-100">
                            <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Catering Selection</p>
                            <div className="flex flex-wrap gap-2.5 mt-1.5">
                              {foodList.map((item: any, idx: number) => {
                                const isUnavailable = item.status === 'Unavailable';
                                const isReplaced = item.status === 'Unavailable' && item.replacedWith;
                                return (
                                  <div key={idx} className="bg-white border border-cream-200 p-2.5 rounded-luxury shadow-sm flex flex-col gap-1 text-[10px] min-w-[140px]">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className={isUnavailable ? "text-neutral-400 line-through" : "text-primary-800 font-bold"}>
                                        {item.name}
                                      </span>
                                      {isUnavailable ? (
                                        <span className="text-red-650 text-[8px] font-extrabold uppercase bg-red-50 px-1 py-0.5 rounded border border-red-100">
                                          Unavailable
                                        </span>
                                      ) : (
                                        <span className="text-neutral-500 font-bold">₹{item.price}</span>
                                      )}
                                    </div>
                                    {isReplaced && (
                                      <div className="mt-1 pt-1.5 border-t border-cream-100/50 flex items-center justify-between gap-2 text-[9px] text-gold-600 font-extrabold">
                                        <span>↳ {item.replacedWith.name} (Replacement)</span>
                                        <span>₹{item.replacedWith.price}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {}
                    return null;
                  })()}

                  {b.specialNotes && (
                    <div className="col-span-2 sm:col-span-4 mt-2 pt-3 border-t border-cream-100/60 text-xs">
                      <p className="text-neutral-450 font-bold uppercase text-[9px] tracking-wider">Special Requirements / Notes</p>
                      <p className="text-primary-850 font-medium mt-1 whitespace-pre-line">{b.specialNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-cream-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      b.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelInitiate(b.bookingId, b.eventDate, false)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(b)}
                      className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all shadow"
                    >
                      <Download size={12} />
                      Download Receipt PDF
                    </button>
                  </div>
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      b.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : b.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {b.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelInitiate(b.id, b.date, true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>
        )}
      </DashboardCard>

      {/* Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-sm w-full p-8 text-center shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold font-serif text-primary-800 mb-2">
              Cancel Booking?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Are you sure you want to cancel booking <span className="font-mono font-bold text-rose-600">#{selectedBooking.id}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={isCancelling}
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="w-1/2 bg-cream-100 hover:bg-cream-200 text-primary-800 font-bold text-xs py-2.5 rounded-lg transition-all"
              >
                No, Keep
              </button>
              <button
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow flex items-center justify-center gap-1.5"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
