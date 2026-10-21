import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hallApi, Hall, HallBookingCalendarEvent } from '../../api/hallApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  Landmark,
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Users,
  Wrench,
  Ban
} from 'lucide-react';

export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Hall Data
  const [hall, setHall] = useState<Hall | null>(null);
  const [loadingHall, setLoadingHall] = useState(true);

  // Bookings Data
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // UI State: Default to 'calendar' (Availability Calendar)
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'hall'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Selected Booking Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<HallBookingCalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Date Availability Management State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<HallBookingCalendarEvent | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [blockReasonInput, setBlockReasonInput] = useState('Hall Maintenance');
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [togglingHallStatus, setTogglingHallStatus] = useState(false);

  // Fetch Assigned Hall Info
  const fetchMyHall = async () => {
    setLoadingHall(true);
    try {
      const data = await hallApi.getMyHall();
      setHall(data);
    } catch (err: any) {
      console.error('Failed to fetch assigned hall:', err);
    } finally {
      setLoadingHall(false);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await bookingApi.getOwnerHallBookings({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        limit: 100
      });
      setBookings(response.bookings || []);
      if (!hall && response.hall) {
        setHall(response.hall);
      }
    } catch (err: any) {
      console.error('Failed to fetch owner bookings:', err);
      addToast(err.message || 'Failed to load bookings.', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Calendar
  const fetchCalendar = async (hallId: string, date: Date) => {
    setLoadingCalendar(true);
    try {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = lastDay.toISOString().split('T')[0];
      const data = await hallApi.getBookingsCalendar(hallId, startStr, endStr);
      setCalendarEvents(data);
    } catch (err: any) {
      console.error('Failed to load hall calendar:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchMyHall();
    fetchBookings();
  }, [statusFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    if (hall?.id) {
      fetchCalendar(hall.id, currentDate);
    }
  }, [hall?.id, currentDate]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING' || b.status === 'PENDING_PAYMENT').length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length;
    return { total, confirmed, pending, completed, cancelled };
  }, [bookings]);

  // Client-side search filtering
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter(b => {
      const bookingNo = (b.bookingNumber || '').toLowerCase();
      const clientName = (b.user?.name || '').toLowerCase();
      const clientEmail = (b.user?.email || '').toLowerCase();
      const clientPhone = (b.user?.mobile || '');
      const eventType = (b.eventType || '').toLowerCase();
      return (
        bookingNo.includes(q) ||
        clientName.includes(q) ||
        clientEmail.includes(q) ||
        clientPhone.includes(q) ||
        eventType.includes(q)
      );
    });
  }, [bookings, searchQuery]);

  // Booking Status Actions
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    const actionLabel =
      newStatus === 'CONFIRMED'
        ? 'Confirm'
        : newStatus === 'COMPLETED'
        ? 'Mark as Completed'
        : 'Cancel';

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} booking ${bookingId}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await bookingApi.updateStatus(bookingId, newStatus);
      addToast(`Booking ${actionLabel.toLowerCase()}ed successfully.`, 'success');
      setIsDetailModalOpen(false);
      fetchBookings();
      if (hall?.id) {
        fetchCalendar(hall.id, currentDate);
      }
    } catch (err: any) {
      addToast(err.message || `Failed to ${actionLabel.toLowerCase()} booking.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar Helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Operating Status (Hall-level availability)
  const handleToggleHallStatus = async (newStatus: 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE') => {
    if (!hall) return;
    const confirmMessage = newStatus === 'MAINTENANCE'
      ? 'Setting venue to MAINTENANCE will temporarily mark all dates as unavailable for public bookings. Proceed?'
      : 'Setting venue to AVAILABLE will open bookings for all unblocked dates. Proceed?';

    if (!window.confirm(confirmMessage)) return;

    setTogglingHallStatus(true);
    try {
      const res = await hallApi.updateMyHallStatus(newStatus);
      setHall(res.hall);
      addToast(`Venue operating status updated to ${newStatus}.`, 'success');
      fetchCalendar(hall.id, currentDate);
    } catch (err: any) {
      addToast(err.message || 'Failed to update venue status.', 'error');
    } finally {
      setTogglingHallStatus(false);
    }
  };

  // Date-level Availability Click Handler
  const handleDateClick = (dayStr: string, activeBookings: HallBookingCalendarEvent[]) => {
    // Check if there is an active customer booking
    const customerBooking = activeBookings.find(b => !b.isBlocked && b.status !== 'CANCELLED' && b.status !== 'REJECTED');
    if (customerBooking) {
      const fullBooking = bookings.find(b => b.id === customerBooking.id);
      if (fullBooking) {
        setSelectedBooking(fullBooking);
        setIsDetailModalOpen(true);
      } else {
        setSelectedBooking({
          id: customerBooking.id,
          bookingNumber: customerBooking.id,
          eventDate: customerBooking.start,
          startTime: customerBooking.startTime,
          endTime: customerBooking.endTime,
          eventType: customerBooking.title,
          totalAmount: 0,
          status: customerBooking.status as any,
          user: { name: customerBooking.clientName } as any
        } as any);
        setIsDetailModalOpen(true);
      }
      return;
    }

    // It is either a manager block or an unbooked available date (default)
    const blockEvent = activeBookings.find(b => b.isBlocked);
    setSelectedCalendarDate(dayStr);
    setSelectedCalendarEvent(blockEvent || null);
    setBlockReasonInput(blockEvent?.notes || 'Hall Maintenance');
    setIsAvailabilityModalOpen(true);
  };

  // Toggle Date Availability in Modal
  const handleToggleDateAvailability = async (makeAvailable: boolean) => {
    if (!selectedCalendarDate || !hall) return;
    setTogglingAvailability(true);
    try {
      if (makeAvailable) {
        await hallApi.toggleDateAvailability({
          date: selectedCalendarDate,
          available: true,
          bookingId: selectedCalendarEvent?.id
        });
        addToast(`Date ${selectedCalendarDate} is now marked as AVAILABLE (Default).`, 'success');
      } else {
        await hallApi.toggleDateAvailability({
          date: selectedCalendarDate,
          available: false,
          reason: blockReasonInput.trim() || 'Hall Maintenance'
        });
        addToast(`Date ${selectedCalendarDate} is now marked as UNAVAILABLE / BLOCKED.`, 'success');
      }
      setIsAvailabilityModalOpen(false);
      fetchCalendar(hall.id, currentDate);
      fetchBookings();
    } catch (err: any) {
      addToast(err.message || 'Failed to update date availability.', 'error');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const daysGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800">CONFIRMED</span>;
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-100 text-yellow-800">PENDING</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">COMPLETED</span>;
      case 'CANCELLED':
      case 'REJECTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-100 text-neutral-700">{status}</span>;
    }
  };

  if (loadingHall && !hall) {
    return (
      <div className="flex h-96 items-center justify-center font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="bg-white rounded-luxury border border-cream-200 p-8 text-center space-y-4 max-w-xl mx-auto my-12 font-sans">
        <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-gold-600">
          <Landmark size={32} />
        </div>
        <h3 className="text-xl font-bold font-serif text-primary-800">No Hall Assigned Yet</h3>
        <p className="text-sm text-neutral-500">
          Your manager account is active, but no function hall has been linked to your profile yet.
          Please contact the GK Booking Administrator to assign your venue.
        </p>
        <div className="text-xs text-neutral-400 font-mono">
          Logged in as: {user?.loginId || user?.email}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. ASSIGNED HALL HEADER BANNER */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-luxury p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gold-500 text-primary-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">
                {hall.hallCode}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hall.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {hall.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-cream-50">{hall.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-cream-200/80">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-gold-400" />
                {[hall.mandal, hall.district, hall.state].filter(Boolean).join(', ') || hall.location || 'Location Not Set'}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} className="text-gold-400" />
                Up to {hall.capacity || 'N/A'} Guests
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={13} className="text-gold-400" />
                ₹{Number(hall.basePrice).toLocaleString('en-IN')} / Day
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
            {hall.status === 'AVAILABLE' ? (
              <Button
                variant="secondary"
                className="!py-2 !px-3 text-xs gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border-yellow-400/40"
                onClick={() => handleToggleHallStatus('MAINTENANCE')}
                disabled={togglingHallStatus}
              >
                <Wrench size={13} />
                <span>{togglingHallStatus ? 'Updating...' : 'Set to Maintenance'}</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="!py-2 !px-3 text-xs gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                onClick={() => handleToggleHallStatus('AVAILABLE')}
                disabled={togglingHallStatus}
              >
                <CheckCircle2 size={13} />
                <span>{togglingHallStatus ? 'Updating...' : 'Open Venue (Available)'}</span>
              </Button>
            )}

            <Button
              variant="secondary"
              className="!py-2 !px-3 text-xs gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => {
                fetchBookings();
                if (hall.id) fetchCalendar(hall.id, currentDate);
              }}
            >
              <RefreshCw size={13} className={loadingBookings ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-cream-200 rounded-luxury p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Bookings</span>
            <span className="text-2xl font-bold font-serif text-primary-800">{stats.total}</span>
          </div>
          <div className="p-2.5 bg-gold-50 text-gold-600 rounded-full">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-white border border-cream-200 rounded-luxury p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Confirmed</span>
            <span className="text-2xl font-bold font-serif text-green-700">{stats.confirmed}</span>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-full">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-cream-200 rounded-luxury p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Pending Approval</span>
            <span className="text-2xl font-bold font-serif text-yellow-600">{stats.pending}</span>
          </div>
          <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-full">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-cream-200 rounded-luxury p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Completed Events</span>
            <span className="text-2xl font-bold font-serif text-blue-700">{stats.completed}</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-cream-200 bg-white px-4 rounded-t-luxury">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-gold-500 text-primary-800'
              : 'border-transparent text-neutral-400 hover:text-primary-800'
          }`}
        >
          <Calendar size={15} />
          <span>Hall Bookings ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-gold-500 text-primary-800'
              : 'border-transparent text-neutral-400 hover:text-primary-800'
          }`}
        >
          <Clock size={15} />
          <span>Availability Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hall')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hall'
              ? 'border-gold-500 text-primary-800'
              : 'border-transparent text-neutral-400 hover:text-primary-800'
          }`}
        >
          <Landmark size={15} />
          <span>Venue Specifications</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-luxury border border-cream-150 shadow-sm flex flex-col md:flex-row justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, booking ID, phone, or event..."
                className="w-full pl-9 pr-4 py-2 border border-cream-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-primary-800 text-white shadow-sm'
                      : 'bg-cream-50 text-neutral-600 hover:bg-cream-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date Range Filters */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="py-1.5 px-2 border border-cream-200 rounded text-xs text-neutral-700 focus:outline-none"
                placeholder="From Date"
              />
              <span className="text-neutral-400 text-xs">-</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="py-1.5 px-2 border border-cream-200 rounded text-xs text-neutral-700 focus:outline-none"
                placeholder="To Date"
              />
              {(startDateFilter || endDateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-luxury border border-cream-150 shadow-sm overflow-hidden">
            {loadingBookings ? (
              <div className="p-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent mx-auto"></div>
                <p className="text-xs text-neutral-400 mt-2">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-sm">
                No bookings match your current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-50 border-b border-cream-150 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Event Date & Time</th>
                      <th className="py-3 px-4">Client Details</th>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-cream-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary-800">
                          {b.bookingNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-800">
                            {new Date(b.eventDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {b.startTime || '09:00'} - {b.endTime || '18:00'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-primary-800">
                            {b.user?.name || 'Customer'}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Phone size={10} /> {b.user?.mobile || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-700">
                          {b.eventType || 'Event'}
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-700">
                          {b.guestCount || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gold-600">
                          ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(b.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              className="!p-1.5 !px-2 rounded text-[11px] gap-1"
                              onClick={() => {
                                setSelectedBooking(b);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <Eye size={12} /> View
                            </Button>

                            {/* Operational Status Actions */}
                            {(b.status === 'PENDING' || b.status === 'PENDING_PAYMENT') && (
                              <Button
                                variant="gold"
                                className="!p-1.5 !px-2.5 rounded text-[11px] gap-1"
                                onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 size={12} /> Confirm
                              </Button>
                            )}

                            {b.status === 'CONFIRMED' && (
                              <Button
                                variant="secondary"
                                className="!p-1.5 !px-2.5 rounded text-[11px] text-blue-700 hover:bg-blue-50 border-blue-200 gap-1"
                                onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 size={12} /> Complete
                              </Button>
                            )}

                            {b.status !== 'CANCELLED' && b.status !== 'REJECTED' && b.status !== 'COMPLETED' && (
                              <Button
                                variant="secondary"
                                className="!p-1.5 !px-2 rounded text-[11px] text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                                disabled={actionLoading}
                              >
                                <XCircle size={12} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-luxury border border-cream-150 shadow-sm space-y-4">
          {/* Availability & Venue Operating Status Bar */}
          {hall.status === 'AVAILABLE' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-cream-50/80 border border-cream-200 rounded-luxury">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <span className="text-xs font-bold text-primary-800">
                    Venue Operating Status: AVAILABLE
                  </span>
                  <span className="text-[11px] text-neutral-500 ml-2 hidden sm:inline">
                    (Accepting public customer reservations on open dates)
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="!py-1.5 !px-3 text-xs text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 gap-1.5 self-start sm:self-auto font-medium"
                onClick={() => handleToggleHallStatus('MAINTENANCE')}
                disabled={togglingHallStatus}
              >
                <Wrench size={13} />
                <span>{togglingHallStatus ? 'Updating...' : 'Set Hall to Maintenance'}</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-luxury">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-900">
                    Maintenance Mode Active: The entire venue is currently closed for bookings.
                  </span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Customers cannot book any dates online until the venue is switched back to Available.
                  </p>
                </div>
              </div>
              <Button
                variant="gold"
                className="!py-1.5 !px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 self-start sm:self-auto font-bold"
                onClick={() => handleToggleHallStatus('AVAILABLE')}
                disabled={togglingHallStatus}
              >
                <CheckCircle2 size={13} />
                <span>{togglingHallStatus ? 'Updating...' : 'Open Venue (Mark Available)'}</span>
              </Button>
            </div>
          )}

          {/* Calendar Header & Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h4 className="text-lg font-bold font-serif text-primary-800 flex items-center gap-2">
                <Calendar size={18} className="text-gold-500" />
                Monthly Availability & Schedule
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                All dates default to <strong>Available</strong>. Click on any date to block for maintenance, offline events, or mark available.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button variant="secondary" className="!p-1.5 rounded" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-xs font-bold text-primary-800 uppercase w-36 text-center font-mono">
                {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="secondary" className="!p-1.5 rounded" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-y border-cream-150 py-2.5 bg-cream-50/40 px-3 rounded">
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span className="text-neutral-700">AVAILABLE (Default)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
                <span className="text-neutral-700">CONFIRMED BOOKING</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span>
                <span className="text-neutral-700">PENDING APPROVAL</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span className="text-neutral-700">BLOCKED / MAINTENANCE</span>
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 italic">
              💡 Click any date tile to change its availability
            </span>
          </div>

          {loadingCalendar ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5 border border-cream-150 rounded bg-cream-50/30 p-2">
              {weekDays.map(d => (
                <div key={d} className="text-center py-2 text-xs font-bold uppercase text-neutral-400">
                  {d}
                </div>
              ))}

              {daysGrid.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="bg-transparent aspect-square" />;
                }

                const yearStr = day.getFullYear();
                const monthStr = String(day.getMonth() + 1).padStart(2, '0');
                const dateStr = String(day.getDate()).padStart(2, '0');
                const dayStr = `${yearStr}-${monthStr}-${dateStr}`;

                const bookingsOnDate = calendarEvents.filter(b => {
                  if (!b.start) return false;
                  const bDateStr = typeof b.start === 'string' ? b.start.split('T')[0] : new Date(b.start).toISOString().split('T')[0];
                  return bDateStr === dayStr;
                });

                const activeBookings = bookingsOnDate.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED');
                const blockEvent = activeBookings.find(b => b.isBlocked || b.title?.toLowerCase().includes('blocked') || b.title?.toLowerCase().includes('maintenance'));
                const confirmedBooking = activeBookings.find(b => !b.isBlocked && (b.status === 'CONFIRMED' || b.status === 'COMPLETED'));
                const pendingBooking = activeBookings.find(b => !b.isBlocked && (b.status === 'PENDING' || b.status === 'PENDING_PAYMENT'));

                const isBlocked = Boolean(blockEvent);
                const isConfirmed = Boolean(confirmedBooking);
                const isPending = Boolean(pendingBooking);
                const isAvailable = !isBlocked && !isConfirmed && !isPending;

                return (
                  <div
                    key={dayStr}
                    onClick={() => handleDateClick(dayStr, activeBookings)}
                    className={`aspect-square p-2 border rounded bg-white flex flex-col justify-between relative group cursor-pointer transition-all hover:shadow-sm ${
                      isConfirmed
                        ? 'border-red-300 bg-red-50/20 hover:border-red-400'
                        : isPending
                        ? 'border-yellow-300 bg-yellow-50/20 hover:border-yellow-400'
                        : isBlocked
                        ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                        : 'border-cream-150 hover:border-emerald-400 hover:bg-emerald-50/15'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-neutral-700">{day.getDate()}</span>
                      {isBlocked && (
                        <Ban size={12} className="text-amber-600" />
                      )}
                      {isAvailable && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-60"></span>
                      )}
                    </div>

                    {isConfirmed ? (
                      <span className="text-[9px] bg-red-600 text-white rounded font-bold px-1 py-0.5 text-center block truncate">
                        CONFIRMED
                      </span>
                    ) : isPending ? (
                      <span className="text-[9px] bg-yellow-500 text-white rounded font-bold px-1 py-0.5 text-center block truncate">
                        PENDING
                      </span>
                    ) : isBlocked ? (
                      <span className="text-[9px] bg-amber-500 text-white rounded font-bold px-1 py-0.5 text-center block truncate">
                        BLOCKED
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200/50 rounded font-bold px-1 py-0.5 text-center block">
                        AVAILABLE
                      </span>
                    )}

                    {/* Hover tooltip */}
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-primary-950 text-white text-[11px] p-2.5 rounded shadow-lg w-48 pointer-events-none text-left space-y-1">
                      <p className="font-bold text-gold-400">
                        {isConfirmed
                          ? (confirmedBooking?.title || 'Confirmed Booking')
                          : isPending
                          ? (pendingBooking?.title || 'Pending Request')
                          : isBlocked
                          ? (blockEvent?.notes || blockEvent?.title || 'Blocked / Maintenance')
                          : 'Available (Default)'}
                      </p>
                      {isConfirmed && <p>Client: {confirmedBooking?.clientName}</p>}
                      {isPending && <p>Client: {pendingBooking?.clientName}</p>}
                      {isBlocked && <p className="text-amber-300">Status: Maintenance / Blocked</p>}
                      {isAvailable && <p className="text-emerald-300">Status: Open for Booking</p>}
                      <p className="text-[9px] text-neutral-400 pt-0.5 border-t border-white/10">
                        {isConfirmed || isPending ? 'Click to view booking' : 'Click to change availability'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VENUE PROFILE & SPECS */}
      {activeTab === 'hall' && (
        <div className="bg-white p-6 rounded-luxury border border-cream-150 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-150 pb-4">
            <Landmark size={20} className="text-gold-500" />
            <h4 className="text-lg font-bold font-serif text-primary-800">Venue Specifications & Overview</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Hall Name</span>
              <p className="text-sm font-bold text-primary-800">{hall.name}</p>
            </div>
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Hall Code</span>
              <p className="text-sm font-bold font-mono text-gold-600">{hall.hallCode}</p>
            </div>
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Operating Status</span>
              <p className="text-sm font-bold text-green-700">{hall.status}</p>
            </div>
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Max Capacity</span>
              <p className="text-sm font-bold text-primary-800">{hall.capacity} Guests</p>
            </div>
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Daily Base Price</span>
              <p className="text-sm font-bold text-gold-600">₹{Number(hall.basePrice).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Location Hierarchy</span>
              <p className="text-sm font-bold text-primary-800">
                {[hall.mandal, hall.district, hall.state].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold">Street Address / Landmark</span>
            <p className="text-xs text-neutral-700">{hall.location || 'No street address specified.'}</p>
          </div>

          <div className="p-4 bg-cream-50 rounded border border-cream-200 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold">Venue Description</span>
            <p className="text-xs text-neutral-700 leading-relaxed">{hall.description || 'No description provided.'}</p>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Booking #${selectedBooking?.bookingNumber || ''}`}
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-5 font-sans text-xs">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-cream-150 pb-3">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Event Type</span>
                <span className="text-base font-bold font-serif text-primary-800">{selectedBooking.eventType || 'Event'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Status</span>
                {renderStatusBadge(selectedBooking.status)}
              </div>
            </div>

            {/* Grid specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-cream-50 p-3.5 rounded border border-cream-200">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-bold">Event Date</span>
                <span className="font-semibold text-neutral-800">
                  {new Date(selectedBooking.eventDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-bold">Times</span>
                <span className="font-semibold text-neutral-800">
                  {selectedBooking.startTime || '09:00'} - {selectedBooking.endTime || '18:00'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-bold">Guest Count</span>
                <span className="font-semibold text-neutral-800">{selectedBooking.guestCount || 'N/A'} Guests</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block font-bold">Total Amount</span>
                <span className="font-bold text-gold-600 text-sm">
                  ₹{Number(selectedBooking.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Client info */}
            <div className="p-3.5 border border-cream-200 rounded space-y-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Client Contact Details</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Name</span>
                  <span className="font-semibold text-primary-800">{selectedBooking.user?.name || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Phone</span>
                  <span className="font-semibold text-primary-800">{selectedBooking.user?.mobile || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Email</span>
                  <span className="font-semibold text-primary-800">{selectedBooking.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            {(selectedBooking.addressLine1 || selectedBooking.city) && (
              <div className="p-3.5 border border-cream-200 rounded space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Billing / Client Address</span>
                <p className="text-neutral-700">
                  {[selectedBooking.addressLine1, selectedBooking.addressLine2, selectedBooking.city, selectedBooking.district, selectedBooking.state, selectedBooking.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="p-3.5 border border-cream-200 rounded space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Special Requirements / Notes</span>
                <p className="text-neutral-700 italic">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Operational Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-cream-150">
              <div className="flex items-center gap-2">
                {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'PENDING_PAYMENT') && (
                  <Button
                    variant="gold"
                    className="!py-1.5 !px-3 text-xs gap-1"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'CONFIRMED')}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 size={13} /> Confirm Booking
                  </Button>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 text-xs text-blue-700 hover:bg-blue-50 border-blue-200 gap-1"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 size={13} /> Mark Completed
                  </Button>
                )}

                {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'REJECTED' && selectedBooking.status !== 'COMPLETED' && (
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 text-xs text-red-600 hover:bg-red-50 border-red-200 gap-1"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                    disabled={actionLoading}
                  >
                    <XCircle size={13} /> Cancel Booking
                  </Button>
                )}
              </div>

              <Button type="button" variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MANAGE DATE AVAILABILITY MODAL */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Manage Date Availability"
        size="md"
      >
        {selectedCalendarDate && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-cream-50 rounded-luxury border border-cream-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Selected Date</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  selectedCalendarEvent?.isBlocked
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedCalendarEvent?.isBlocked ? 'BLOCKED / UNAVAILABLE' : 'AVAILABLE (DEFAULT)'}
                </span>
              </div>
              <p className="text-base font-bold font-serif text-primary-800">
                {new Date(selectedCalendarDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-neutral-500">
                Venue: <strong className="text-primary-800">{hall?.name}</strong> ({hall?.hallCode})
              </p>
            </div>

            {selectedCalendarEvent?.isBlocked ? (
              // Date is currently blocked -> allow making it available
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Ban size={14} className="text-amber-600" />
                    <span>Current Block Reason: {selectedCalendarEvent.notes || selectedCalendarEvent.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    This date is currently blocked from online bookings. Customers cannot book this hall on this date.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="gold"
                    className="w-full gap-2 !py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white justify-center text-xs font-bold"
                    onClick={() => handleToggleDateAvailability(true)}
                    disabled={togglingAvailability}
                  >
                    <CheckCircle2 size={16} />
                    {togglingAvailability ? 'Updating...' : 'Unblock & Mark Date as AVAILABLE'}
                  </Button>
                </div>
              </div>
            ) : (
              // Date is currently available (default) -> allow blocking it
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Currently Available (Accepting Bookings)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    By default, dates are available for customer bookings. You can block this date for maintenance, offline reservations, or private functions.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-primary-800 block">
                    Reason for Blocking / Maintenance
                  </label>
                  <input
                    type="text"
                    value={blockReasonInput}
                    onChange={(e) => setBlockReasonInput(e.target.value)}
                    placeholder="e.g. Hall Maintenance, Offline Booking, Renovation"
                    className="w-full px-3 py-2 border border-cream-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />

                  {/* Quick Reason Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Hall Maintenance',
                      'Private Booking',
                      'Offline Reservation',
                      'Renovations',
                      'Holiday / Closed'
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setBlockReasonInput(reason)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          blockReasonInput === reason
                            ? 'bg-primary-800 text-white border-primary-800 font-bold'
                            : 'bg-white text-neutral-600 border-cream-200 hover:bg-cream-100'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    className="w-full gap-2 !py-2.5 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 justify-center text-xs font-bold"
                    onClick={() => handleToggleDateAvailability(false)}
                    disabled={togglingAvailability}
                  >
                    <XCircle size={16} />
                    {togglingAvailability ? 'Updating...' : 'Confirm: Block this Date / Mark Unavailable'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-cream-150">
              <Button type="button" variant="secondary" onClick={() => setIsAvailabilityModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboardPage;
