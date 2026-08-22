import React, { useState, useEffect } from 'react';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { useNotifications } from '../../contexts/NotificationContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import {
  Search,
  Eye,
  Check,
  XCircle,
  X,
  History
} from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { addToast } = useNotifications();

  // Booking states
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filters state
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedHall, setSelectedHall] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Load all bookings
  const loadAllBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getAll();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to fetch bookings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBookings();
  }, []);

  // Load history when a booking is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedBooking) {
        setBookingHistory([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const history = await bookingApi.getHistory(selectedBooking.id);
        setBookingHistory(history);
      } catch (err) {
        console.error('Error fetching booking history logs:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedBooking]);

  // Update status handler
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    const message = `Are you sure you want to update the booking status to ${status}?`;
    if (!window.confirm(message)) {
      return;
    }
    try {
      const res = await bookingApi.updateStatus(bookingId, status);
      addToast(res.message || `Booking status updated to ${status}.`, 'success');
      
      // Update locally selected booking if open
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(res.booking);
      }
      loadAllBookings(); // Reload tables
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: BookingDetails['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-250 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-250 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      case 'REJECTED':
        return <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
      case 'COMPLETED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-250 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Completed</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  // Extract unique halls for filtering dropdown
  const uniqueHalls = Array.from(
    new Map(
      bookings
        .filter((b) => b.hall)
        .map((b) => [b.hall?.id, b.hall?.name])
    ).entries()
  );

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Search filter
    const searchLower = searchText.toLowerCase().trim();
    const customerMatches =
      b.user?.name?.toLowerCase().includes(searchLower) ||
      b.user?.email?.toLowerCase().includes(searchLower) ||
      b.user?.mobile?.includes(searchLower) ||
      b.bookingNumber?.toLowerCase().includes(searchLower);

    if (searchLower && !customerMatches) return false;

    // Status filter
    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;

    // Hall filter
    if (selectedHall !== 'ALL' && b.hallId !== selectedHall) return false;

    // Date filter
    if (filterDate) {
      const bDateStr = b.eventDate.split('T')[0];
      if (bDateStr !== filterDate) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Manage Bookings</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Global view of all function hall reservation requests, customer logs, and booking statuses.
          </p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-cream-200 rounded-luxury p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search text input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by ID, name, email..."
              className="w-full pl-10 pr-4 py-2 border border-cream-200 rounded-luxury text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* Status filter select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-cream-200 p-2 rounded-luxury text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Hall filter select */}
          <div>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="w-full border border-cream-200 p-2 rounded-luxury text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="ALL">All Halls</option>
              {uniqueHalls.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter picker */}
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-cream-200 p-2 rounded-luxury text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Reset Filters Option */}
        {(searchText || selectedStatus !== 'ALL' || selectedHall !== 'ALL' || filterDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchText('');
                setSelectedStatus('ALL');
                setSelectedHall('ALL');
                setFilterDate('');
              }}
              className="text-xs text-gold-600 hover:underline font-bold uppercase tracking-wider"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <div className="bg-white border border-cream-200 p-20 rounded-luxury text-center flex flex-col items-center justify-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading system reservations...</p>
        </div>
      ) : (
        <DashboardCard title={`Reservations Log (${filteredBookings.length})`} subtitle="Real-time system booking details log">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-150 text-primary-800 font-bold uppercase tracking-wider bg-cream-50/50">
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Venue Hall</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Invoice Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-neutral-600">
                {filteredBookings.map((b) => {
                  const eventDateStr = new Date(b.eventDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={b.id} className="hover:bg-cream-50/20 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold-600">
                        #{b.bookingNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-primary-800">{b.user?.name || 'Walk-in Customer'}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{b.user?.mobile || 'No Mobile'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-primary-800">
                        {b.hall?.name || 'Function Hall'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-neutral-700">{eventDateStr}</span>
                        <span className="block text-[10px] text-neutral-400 mt-0.5">{b.startTime || '09:00'} - {b.endTime || '18:00'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-neutral-800">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 border border-cream-200 hover:bg-cream-50 rounded text-neutral-500 transition-all flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400 italic">
                      No records found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* DETAIL VIEW MODAL WITH ACTION TRIGGERS & AUDIT TRAIL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-luxury animate-in fade-in zoom-in-95 duration-250">
            {/* Header */}
            <div className="p-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/20">
              <div>
                <h4 className="font-bold text-base text-primary-800 font-serif">Manage Reservation</h4>
                <p className="text-[10px] text-neutral-400 font-mono">Reference Invoice ID: #{selectedBooking.bookingNumber}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-neutral-400 hover:text-primary-800 p-1 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 text-xs text-neutral-700">
              {/* Parameters Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cream-50/10 border border-cream-150 p-4 rounded-luxury">
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Occasion Occasion</p>
                  <p className="font-bold text-primary-800">{selectedBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Event Date</p>
                  <p className="font-bold text-primary-800">
                    {new Date(selectedBooking.eventDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Reservation Status</p>
                  <div className="mt-0.5">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Session Slot</p>
                  <p className="font-bold text-primary-800">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Guests Pax</p>
                  <p className="font-bold text-primary-800">{selectedBooking.guestCount || 100} Pax</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider mb-0.5">Invoice Contract</p>
                  <p className="font-bold text-gold-600 font-mono">₹{Number(selectedBooking.totalAmount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Grid: Hall Details vs Customer Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h5 className="font-bold text-primary-800 font-serif border-b border-cream-100 pb-1.5 mb-2">
                    Venue Details
                  </h5>
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-800">{selectedBooking.hall?.name}</p>
                    <p className="text-[11px] text-neutral-500">📍 Location: {selectedBooking.hall?.location}</p>
                    <p className="text-[11px] text-neutral-500">🏢 Capacity: {selectedBooking.hall?.capacity} guests</p>
                    <p className="text-[11px] text-neutral-500">💰 Rent per day: ₹{Number(selectedBooking.hall?.basePrice).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-primary-800 font-serif border-b border-cream-100 pb-1.5 mb-2">
                    Coordinator details
                  </h5>
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-800">🧑 {selectedBooking.user?.name || 'Walk-in Client'}</p>
                    <p className="text-[11px] text-neutral-500">📞 Phone: {selectedBooking.user?.mobile}</p>
                    <p className="text-[11px] text-neutral-500">✉️ Email: {selectedBooking.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Billing Info Notes */}
              {selectedBooking.notes && (
                <div>
                  <h5 className="font-bold text-primary-800 font-serif border-b border-cream-100 pb-1.5 mb-2">
                    Billing Notes & Add-on Services details
                  </h5>
                  <p className="bg-neutral-50 border border-neutral-200 p-3 rounded-luxury text-neutral-600 leading-relaxed font-sans font-medium">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Change History Audit Log */}
              <div>
                <h5 className="font-bold text-primary-800 font-serif border-b border-cream-100 pb-1.5 mb-2 flex items-center gap-1.5">
                  <History size={14} className="text-gold-500" />
                  <span>Audit Trail (Change History Log)</span>
                </h5>
                {loadingHistory ? (
                  <p className="text-[10px] text-neutral-400 animate-pulse">Loading audit trail...</p>
                ) : bookingHistory.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 italic">No modifications have been recorded for this booking.</p>
                ) : (
                  <div className="border border-cream-100 rounded-luxury max-h-36 overflow-y-auto divide-y divide-cream-100 bg-cream-50/5 p-2 font-sans">
                    {bookingHistory.map((hist) => (
                      <div key={hist.id} className="py-2 text-[10px] text-neutral-600 flex justify-between gap-4">
                        <div>
                          <span className="font-bold text-primary-800 uppercase tracking-wide mr-1.5">[{hist.fieldName}]</span>
                          <span>Changed: </span>
                          <span className="line-through text-red-500 font-medium">{hist.oldValue || 'none'}</span>
                          <span className="mx-1">→</span>
                          <span className="text-green-600 font-bold">{hist.newValue}</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 flex-shrink-0 text-right">
                          <p className="font-bold">{hist.changedBy}</p>
                          <p>{new Date(hist.changedAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer triggers */}
            <div className="p-5 border-t border-cream-100 flex flex-wrap gap-2 justify-between items-center bg-cream-50/10">
              
              {/* Left hand action options: Status modifications */}
              <div className="flex gap-2">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'CONFIRMED')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-2 rounded-luxury text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
                    >
                      <Check size={12} />
                      <span>Confirm booking</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'REJECTED')}
                      className="bg-neutral-600 hover:bg-neutral-700 text-white font-bold px-3 py-2 rounded-luxury text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
                    >
                      <XCircle size={12} />
                      <span>Reject request</span>
                    </button>
                  </>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-luxury text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
                    >
                      <Check size={12} />
                      <span>Mark Completed</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-luxury text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
                    >
                      <XCircle size={12} />
                      <span>Cancel Booking</span>
                    </button>
                  </>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="border border-cream-200 hover:bg-cream-50 text-neutral-600 font-bold px-4 py-2 rounded-luxury text-[10px] uppercase tracking-wider transition-all"
              >
                Close View
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
