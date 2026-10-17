import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { hallApi, Hall } from '../../api/hallApi';
import {
  Search,
  Calendar,
  Clock,
  Landmark,
  User,
  Eye,
  X,
  Check
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const BookingsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDetails[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [hallFilter, setHallFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bList = await bookingApi.getAll();
      setBookings(bList);
      setFilteredBookings(bList);

      const hList = await hallApi.getAll();
      setHalls(hList);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters in frontend locally
  useEffect(() => {
    let result = [...bookings];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        b =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.user?.name.toLowerCase().includes(q) ||
          b.user?.email.toLowerCase().includes(q) ||
          b.user?.mobile.includes(q)
      );
    }

    if (hallFilter) {
      result = result.filter(b => b.hallId === hallFilter);
    }

    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter(b => b.eventType?.toLowerCase() === typeFilter.toLowerCase());
    }

    if (dateFilter) {
      result = result.filter(b => b.eventDate.startsWith(dateFilter));
    }

    setFilteredBookings(result);
  }, [search, hallFilter, statusFilter, dateFilter, typeFilter, bookings]);

  const handleOpenDetails = async (booking: BookingDetails) => {
    setLoading(true);
    try {
      const details = await bookingApi.getById(booking.id);
      setSelectedBooking(details);
      setIsDetailsOpen(true);
    } catch (err) {
      addToast('Failed to load booking specifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change this booking status to ${newStatus}?`)) {
      return;
    }

    try {
      await bookingApi.updateStatus(id, newStatus);
      addToast(`Booking marked as ${newStatus} successfully.`, 'success');
      setIsDetailsOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  const handleCancelBooking = async (id: string) => {
    const reason = window.prompt('Please enter the reason for cancellation (required):');
    if (reason === null) return;
    if (!reason.trim()) {
      addToast('Cancellation reason is required.', 'warning');
      return;
    }

    try {
      await bookingApi.cancel(id, reason.trim());
      addToast('Booking cancelled successfully.', 'success');
      setIsDetailsOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border border-blue-150';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border border-red-150';
      default:
        return 'bg-neutral-50 text-neutral-700';
    }
  };

  const columns = [
    { key: 'bookingNumber', header: 'Booking ID', render: (b: BookingDetails) => <span className="font-bold text-gold-600">{b.bookingNumber}</span> },
    { key: 'client', header: 'Client', render: (b: BookingDetails) => <span className="font-semibold text-primary-800">{b.user?.name || 'Client'}</span> },
    { key: 'hall', header: 'Function Hall', render: (b: BookingDetails) => b.hall?.name || 'N/A' },
    { key: 'eventType', header: 'Event Type' },
    {
      key: 'eventDate',
      header: 'Event Date',
      render: (b: BookingDetails) => (
        <span className="text-xs text-neutral-500">
          {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {b.startTime && ` (${b.startTime} - ${b.endTime})`}
        </span>
      )
    },
    { key: 'totalAmount', header: 'Total Value', render: (b: BookingDetails) => <span className="font-semibold">₹{Number(b.totalAmount).toLocaleString('en-IN')}</span> },
    { key: 'status', header: 'Status', render: (b: BookingDetails) => <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(b.status)}`}>{b.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (b: BookingDetails) => (
        <Button variant="secondary" className="!p-1.5 !px-2.5 rounded" onClick={() => handleOpenDetails(b)}>
          <Eye size={14} /> Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Booking Directory</h3>
        <p className="text-xs text-neutral-400 mt-1">Review customer bookings, dates reservation overlap, and approve/reject bookings</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Input
          placeholder="Search client/booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
        />
        
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Hall</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={hallFilter}
            onChange={(e) => setHallFilter(e.target.value)}
          >
            <option value="">All Halls</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Status</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Event Date</label>
          <input
            type="date"
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Event Type</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Wedding">Wedding</option>
            <option value="Reception">Reception</option>
            <option value="Birthday">Birthday</option>
            <option value="Conference">Conference</option>
            <option value="Other">Other Gatherings</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Client Booking Log" subtitle="List of hall booking records">
          <Table
            columns={columns}
            data={filteredBookings}
            loading={loading}
            emptyMessage="No bookings found."
            onRowClick={handleOpenDetails}
          />
        </DashboardCard>
      )}

      {/* BOOKING DETAILS MODAL */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Booking Specification Details" size="lg">
        {selectedBooking && (
          <div className="space-y-6">
            <div className="border-b border-cream-150 pb-4 flex justify-between items-start">
              <div>
                <h4 className="text-md font-bold text-primary-800 font-serif">
                  Booking Reference: {selectedBooking.bookingNumber}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Registered on {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(selectedBooking.status)}`}>
                {selectedBooking.status}
              </span>
            </div>

            {/* Client and Hall */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-cream-150 pb-4">
              <div>
                <span className="text-neutral-400 block font-bold uppercase mb-1">Customer Info</span>
                <p className="font-semibold text-primary-800 flex items-center gap-1"><User size={12} /> {selectedBooking.user?.name}</p>
                <p className="text-neutral-500">Email: {selectedBooking.user?.email}</p>
                <p className="text-neutral-500">Phone: {selectedBooking.user?.mobile}</p>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold uppercase mb-1">Hall Info</span>
                <p className="font-semibold text-primary-800 flex items-center gap-1"><Landmark size={12} /> {selectedBooking.hall?.name}</p>
                <p className="text-neutral-500">Code: {selectedBooking.hall?.hallCode}</p>
                <p className="text-neutral-500">Address: {selectedBooking.hall?.location}</p>
              </div>
            </div>

            {/* Event Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs border-b border-cream-150 pb-4">
              <div>
                <span className="text-neutral-400 block font-bold uppercase">Event Date</span>
                <p className="font-semibold text-primary-800 flex items-center gap-1">
                  <Calendar size={12} /> {new Date(selectedBooking.eventDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold uppercase">Timings</span>
                <p className="font-semibold text-primary-800 flex items-center gap-1">
                  <Clock size={12} /> {selectedBooking.startTime || '09:00'} - {selectedBooking.endTime || '18:00'}
                </p>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold uppercase">Event Type</span>
                <p className="font-semibold text-primary-800">{selectedBooking.eventType || 'General'}</p>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold uppercase">Guests Count</span>
                <p className="font-semibold text-primary-800">{selectedBooking.guestCount || 'N/A'} Guests</p>
              </div>
            </div>

            {/* Event Address Details for Admin */}
            {selectedBooking.addressLine1 && (
              <div className="p-4 bg-cream-50/70 border border-cream-200 rounded-luxury text-xs space-y-1">
                <span className="text-neutral-400 font-bold block uppercase mb-1">Customer Event Address</span>
                <p className="font-bold text-primary-800 text-sm">{selectedBooking.addressLine1}</p>
                {selectedBooking.addressLine2 && <p className="text-neutral-600">{selectedBooking.addressLine2}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-neutral-600 border-t border-cream-150 font-medium">
                  <p><span className="font-bold text-primary-800">City:</span> {selectedBooking.city || 'N/A'}</p>
                  <p><span className="font-bold text-primary-800">District:</span> {selectedBooking.district || 'N/A'}</p>
                  <p><span className="font-bold text-primary-800">State:</span> {selectedBooking.state || 'N/A'}</p>
                  <p><span className="font-bold text-primary-800">PIN Code:</span> {selectedBooking.pincode || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Billing breakdown */}
            <div className="p-4 bg-cream-50/50 border border-cream-150 rounded text-xs space-y-1.5">
              <span className="text-neutral-400 font-bold block uppercase mb-2">Cost Breakdowns</span>
              <div className="flex justify-between">
                <span>Hall Base Cost:</span>
                <span className="font-semibold">₹{Number(selectedBooking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              {selectedBooking.notes && (
                <div className="pt-2 mt-2 border-t border-cream-100 italic text-neutral-500">
                  Notes: {selectedBooking.notes}
                </div>
              )}
            </div>

            {/* Cancellation Details */}
            {selectedBooking.status === 'CANCELLED' && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-luxury text-xs space-y-1">
                <span className="text-red-700 font-bold block uppercase text-[10px] tracking-wider">Cancellation Record</span>
                {selectedBooking.cancellationReason && (
                  <p className="text-red-950 font-medium">
                    <span className="font-bold text-red-800">Reason:</span> {selectedBooking.cancellationReason}
                  </p>
                )}
                {selectedBooking.cancelledAt && (
                  <p className="text-[10px] text-red-600">
                    Cancelled on: {new Date(selectedBooking.cancelledAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Action controls */}
            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-cream-100">
              {selectedBooking.status === 'PENDING' && (
                <>
                  <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(selectedBooking.id, 'REJECTED')}>
                    <X size={14} /> Reject Booking
                  </Button>
                  <Button variant="gold" onClick={() => handleUpdateStatus(selectedBooking.id, 'CONFIRMED')}>
                    <Check size={14} /> Confirm Booking
                  </Button>
                </>
              )}
              {selectedBooking.status === 'CONFIRMED' && (
                <>
                  <Button variant="secondary" onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}>
                    Mark Completed
                  </Button>
                  <Button variant="danger" onClick={() => handleCancelBooking(selectedBooking.id)}>
                    Cancel Booking
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsPage;
