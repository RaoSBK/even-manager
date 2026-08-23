import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { calendarApi, CalendarEventItem } from '../../api/calendarApi';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Landmark,
  IndianRupee,
  Info
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [items, setItems] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<CalendarEventItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = lastDay.toISOString().split('T')[0];

      const data = await calendarApi.getEvents(startStr, endStr);
      setItems(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenItemDetails = (item: CalendarEventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // Generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysGrid = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Executive Calendar</h3>
          <p className="text-xs text-neutral-400 mt-1">Cross-department calendar displaying events scheduling, hall reservations and bookings occupancy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="!p-1.5 rounded" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-bold text-primary-800 uppercase w-32 text-center">
            {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" className="!p-1.5 rounded" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Reservations & Events Grid" subtitle="Interactive calendar dashboard">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 border border-cream-150 rounded bg-cream-50/20 p-1">
              {/* Headers */}
              {weekDays.map(d => (
                <div key={d} className="text-center py-2 text-xs font-bold uppercase text-neutral-400">
                  {d}
                </div>
              ))}

              {/* Day cells */}
              {daysGrid.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="bg-transparent min-h-[5.5rem] aspect-square" />;
                }

                const dayStr = day.toISOString().split('T')[0];
                const dayEvents = items.filter(item => item.start.split('T')[0] === dayStr);

                return (
                  <div
                    key={dayStr}
                    className="min-h-[5.5rem] bg-white border border-cream-100 rounded p-1 flex flex-col justify-between hover:bg-cream-50/20 transition-all overflow-hidden"
                  >
                    <span className="text-xs font-bold text-neutral-600 block self-start mb-1">{day.getDate()}</span>
                    
                    {/* Events badges inside day cell */}
                    <div className="space-y-1 overflow-y-auto max-h-[3.5rem] w-full">
                      {dayEvents.map(item => (
                        <div
                          key={item.id}
                          onClick={(e) => handleOpenItemDetails(item, e)}
                          style={{ backgroundColor: item.color }}
                          className="text-[8px] text-white rounded font-bold px-1.5 py-0.5 truncate cursor-pointer hover:opacity-90 block leading-tight text-center"
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>
      )}

      {/* LEGEND DIAGRAM */}
      <div className="flex flex-wrap gap-4 text-xs font-bold text-neutral-500 font-sans px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-600" />
          <span>Planned Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-blue-900" />
          <span>Halls Bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-teal-600" />
          <span>General Bookings</span>
        </div>
      </div>

      {/* EVENT/BOOKING SPEC DETAILS POPUP MODAL */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Calendar Item Specifications">
        {selectedItem && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-start border-b border-cream-150 pb-3">
              <div>
                <h4 className="text-md font-bold text-primary-800 font-serif">
                  {selectedItem.title}
                </h4>
                <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">{selectedItem.type}</span>
              </div>
              <span className="text-xs font-bold bg-cream-100 text-gold-600 px-2 py-0.5 rounded">
                {selectedItem.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-neutral-400" />
                <span>Date: {new Date(selectedItem.start).toLocaleDateString()}</span>
              </div>
              {selectedItem.extendedProps.startTime && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-400" />
                  <span>Timings: {selectedItem.extendedProps.startTime} - {selectedItem.extendedProps.endTime || 'N/A'}</span>
                </div>
              )}
              {selectedItem.extendedProps.client && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-neutral-400" />
                  <span>Client: {selectedItem.extendedProps.client}</span>
                </div>
              )}
              {selectedItem.extendedProps.hall && (
                <div className="flex items-center gap-2">
                  <Landmark size={14} className="text-neutral-400" />
                  <span>Hall: {selectedItem.extendedProps.hall}</span>
                </div>
              )}
              {selectedItem.extendedProps.amount !== undefined && (
                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-neutral-400" />
                  <span>Value: ₹{Number(selectedItem.extendedProps.amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedItem.extendedProps.expectedGuests !== undefined && (
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-neutral-400" />
                  <span>Expected Guests: {selectedItem.extendedProps.expectedGuests}</span>
                </div>
              )}
              {selectedItem.extendedProps.description && (
                <div className="p-3 bg-cream-50/50 border border-cream-100 rounded text-neutral-600 italic">
                  {selectedItem.extendedProps.description}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
