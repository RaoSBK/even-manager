import React, { useState, useEffect } from 'react';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { hallApi } from '../../api/hallApi';
import { useNotifications } from '../../contexts/NotificationContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Clock,
  User,
  Info,
  CheckCircle
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { addToast } = useNotifications();

  // State lists
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [halls, setHalls] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Selector filters
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Date selection detail panel state
  const [clickedDateStr, setClickedDateStr] = useState<string | null>(null);
  const [selectedBookingForDate, setSelectedBookingForDate] = useState<BookingDetails | null>(null);

  // Initialize
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load all reservations
      const bookingsData = await bookingApi.getAll();
      setBookings(bookingsData);

      // 2. Fetch all halls from database dynamically using today's availability
      const todayStr = new Date().toISOString().split('T')[0];
      const availRes = await hallApi.checkAvailability(todayStr);
      setHalls(availRes.halls);

      // Select first hall as default if present
      if (availRes.halls.length > 0) {
        setSelectedHallId(availRes.halls[0].id);
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load calendar reservation schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected booking details when clicked date or selected hall changes
  useEffect(() => {
    if (!clickedDateStr || !selectedHallId) {
      setSelectedBookingForDate(null);
      return;
    }

    const bookingOnDate = bookings.find((b) => {
      if (b.hallId !== selectedHallId) return false;
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      const bDateStr = b.eventDate.split('T')[0];
      return bDateStr === clickedDateStr;
    });

    setSelectedBookingForDate(bookingOnDate || null);
  }, [clickedDateStr, selectedHallId, bookings]);

  // Month navigation
  const handleMonthChange = (direction: 'next' | 'prev') => {
    const next = new Date(currentDate);
    if (direction === 'next') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
    setClickedDateStr(null); // Reset date details
    setSelectedBookingForDate(null);
  };

  // Generate monthly days grid helper
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Prev Month padding days
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({
        dateStr: '',
        dayNum: prevLastDay - i + 1,
        isCurrentMonth: false,
        status: 'NONE' as const,
        booking: null
      });
    }

    // Current Month days
    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // Find booking for this date and selected hall
      const dateBooking = bookings.find((b) => {
        if (b.hallId !== selectedHallId) return false;
        if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
        const bDateStr = b.eventDate.split('T')[0];
        return bDateStr === dateStr;
      });

      let status: 'AVAILABLE' | 'BOOKED' | 'PENDING' = 'AVAILABLE';
      if (dateBooking) {
        if (dateBooking.status === 'PENDING') {
          status = 'PENDING';
        } else {
          status = 'BOOKED'; // CONFIRMED, IN_PROGRESS, COMPLETED
        }
      }

      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        status,
        booking: dateBooking || null
      });
    }

    return days;
  };

  const calendarDays = generateDays();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Hall Schedule Calendar</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Select a function hall and calendar month to inspect bookings, availability, and pending reservations.
        </p>
      </div>

      {/* Selector Filters */}
      <div className="bg-white border border-cream-200 p-4 rounded-luxury shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Hall Selector */}
        <div className="w-full sm:w-72 flex items-center gap-2">
          <Filter size={16} className="text-gold-500 flex-shrink-0" />
          <select
            value={selectedHallId}
            onChange={(e) => {
              setSelectedHallId(e.target.value);
              setClickedDateStr(null);
              setSelectedBookingForDate(null);
            }}
            className="w-full border border-cream-200 p-2 rounded-luxury text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {halls.length === 0 && <option value="">No Active Halls</option>}
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                🏢 {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar Month Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-1.5 border border-cream-200 rounded-full hover:bg-cream-50 text-primary-800 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-primary-800 font-serif min-w-[140px] text-center uppercase tracking-wider">
            {monthName} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-1.5 border border-cream-200 rounded-full hover:bg-cream-50 text-primary-800 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-cream-200 p-20 rounded-luxury text-center flex flex-col items-center justify-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading Schedule Logs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Grid (2 Cols) */}
          <div className="lg:col-span-2">
            <DashboardCard title="Reservations Grid" subtitle={`Status of ${halls.find(h => h.id === selectedHallId)?.name || 'Selected Hall'}`}>
              <div className="space-y-4">
                
                <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white">
                  {/* Days row */}
                  <div className="grid grid-cols-7 text-center bg-primary-800 text-white font-bold text-[10px] py-2 uppercase tracking-wider border-b border-cream-200">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Dates block */}
                  <div className="grid grid-cols-7 text-center text-xs divide-x divide-y divide-cream-100">
                    {calendarDays.map((day, idx) => {
                      const isSelected = clickedDateStr === day.dateStr;
                      let cellClass = 'bg-white text-primary-800 hover:bg-cream-50 cursor-pointer';
                      let statusText = '';
                      let statusBadgeClass = '';

                      if (!day.isCurrentMonth) {
                        cellClass = 'bg-gray-50 text-gray-300 pointer-events-none';
                      } else {
                        if (day.status === 'BOOKED') {
                          cellClass = 'bg-red-50 hover:bg-red-100/70 text-red-700 cursor-pointer';
                          statusText = 'Booked';
                          statusBadgeClass = 'bg-red-200 text-red-800';
                        } else if (day.status === 'PENDING') {
                          cellClass = 'bg-yellow-50 hover:bg-yellow-100/70 text-yellow-700 cursor-pointer';
                          statusText = 'Pending';
                          statusBadgeClass = 'bg-yellow-200 text-yellow-800';
                        } else {
                          statusText = 'Available';
                          statusBadgeClass = 'bg-green-100 text-green-800';
                        }

                        if (isSelected) {
                          cellClass += ' ring-2 ring-primary-800 font-bold';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (day.dateStr) {
                              setClickedDateStr(day.dateStr);
                            }
                          }}
                          className={`min-h-[60px] p-2 flex flex-col items-center justify-between transition-all ${cellClass}`}
                        >
                          <span className="text-[10px] self-start font-mono font-semibold">{day.dayNum}</span>
                          {day.isCurrentMonth && (
                            <span className={`text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm ${statusBadgeClass}`}>
                              {statusText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend indicator */}
                <div className="flex flex-wrap gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span>Booked / Reserved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                    <span>Pending Approval</span>
                  </div>
                </div>

              </div>
            </DashboardCard>
          </div>

          {/* Booking Details Card (1 Col) */}
          <div className="lg:col-span-1">
            <div className="border border-cream-200 bg-cream-50/20 p-5 rounded-luxury space-y-5 h-full min-h-[300px]">
              <h4 className="font-bold text-sm text-primary-800 font-serif border-b border-cream-100 pb-2">
                Date Reservation Info
              </h4>

              {!clickedDateStr ? (
                <div className="text-center py-10 text-xs text-neutral-400 space-y-2">
                  <Info size={24} className="mx-auto text-neutral-300" />
                  <p>Click on any date in the calendar to view details.</p>
                </div>
              ) : !selectedBookingForDate ? (
                <div className="space-y-4">
                  <div className="bg-white border border-cream-200 p-4 rounded-luxury text-center text-xs space-y-2">
                    <CheckCircle className="mx-auto text-green-500" size={20} />
                    <p className="font-bold text-primary-800">Date is Available</p>
                    <p className="text-neutral-400">Selected Hall is fully open for reservations on {clickedDateStr}.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="bg-white border border-cream-200 p-4 rounded-luxury space-y-3 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">OccasionOccasion</p>
                        <p className="font-bold text-primary-800 text-sm mt-0.5">{selectedBookingForDate.eventType}</p>
                      </div>
                      <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded font-mono font-bold tracking-tight text-[10px]">
                        #{selectedBookingForDate.bookingNumber}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-cream-100 pt-3">
                      <div>
                        <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Customer Name</p>
                        <p className="font-semibold text-primary-800 mt-0.5 flex items-center gap-1">
                          <User size={12} className="text-gold-500" />
                          {selectedBookingForDate.user?.name || 'Walk-in Client'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Timings Slot</p>
                          <p className="font-semibold text-primary-800 mt-0.5 flex items-center gap-1">
                            <Clock size={12} className="text-gold-500" />
                            {selectedBookingForDate.startTime} - {selectedBookingForDate.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Guests Pax</p>
                          <p className="font-semibold text-primary-800 mt-0.5 flex items-center gap-1">
                            <Users size={12} className="text-gold-500" />
                            {selectedBookingForDate.guestCount} pax
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">Booking Status</p>
                        <span className={`inline-block mt-1 font-bold text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded ${
                          selectedBookingForDate.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-250'
                            : 'bg-green-50 text-green-700 border-green-250'
                        }`}>
                          {selectedBookingForDate.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cream-100/50 border border-cream-200 p-3.5 rounded-luxury text-[11px] leading-relaxed text-neutral-600">
                    <p className="font-bold text-[9px] text-primary-800 uppercase tracking-wider mb-1">Billing Notes Details</p>
                    <p className="font-sans font-medium line-clamp-4">{selectedBookingForDate.notes || 'No special requirements listed.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CalendarPage;
