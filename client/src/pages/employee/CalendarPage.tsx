import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { employeeWorkstationApi } from '../../api/employeeWorkstationApi';
import {
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface ScheduledItem {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  time: string;
  type: 'EVENT' | 'TASK';
  color: string;
  description?: string;
  original: any;
}

export const CalendarPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<ScheduledItem | null>(null);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const tasks = await employeeWorkstationApi.getTasks();
      const events = await employeeWorkstationApi.getEvents();

      const scheduled: ScheduledItem[] = [];

      // Add Events to calendar list
      events.forEach((ev) => {
        if (ev.eventDate) {
          const dateStr = new Date(ev.eventDate).toISOString().split('T')[0];
          scheduled.push({
            id: ev.id,
            title: ev.eventName,
            dateStr,
            time: `${ev.startTime || '09:00 AM'} - ${ev.endTime || '06:00 PM'}`,
            type: 'EVENT',
            color: 'bg-gold-500 text-white',
            description: `Client: ${ev.customer?.fullName || 'N/A'} | Venue: ${ev.booking?.hall?.name || 'Hall Venue'}`,
            original: ev
          });
        }
      });

      // Add Tasks to calendar list
      tasks.forEach((t) => {
        if (t.dueDate) {
          const dateStr = new Date(t.dueDate).toISOString().split('T')[0];
          scheduled.push({
            id: t.id,
            title: `Task: ${t.title}`,
            dateStr,
            time: new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'TASK',
            color: t.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-primary-800 text-white',
            description: `Priority: ${t.priority} | Status: ${t.status}`,
            original: t
          });
        }
      });

      setItems(scheduled);
    } catch {
      addToast('Failed to load workstation calendar scheduled items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenItemDetails = (item: ScheduledItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
  };

  // Generate calendar grid helper
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
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Duty Calendar</h3>
          <p className="text-xs text-neutral-400 mt-1">Check scheduled shifts, assigned venue details, and client meeting times</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="!p-1.5 rounded" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-bold text-primary-800 uppercase w-36 text-center">
            {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" className="!p-1.5 rounded" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <DashboardCard title="Work Calendar Scheduler" subtitle="Your assigned duties schedule ledger">
        {loading ? (
          <div className="flex items-center justify-center h-96 text-xs text-neutral-400">
            Syncing calendar schedule items...
          </div>
        ) : (
          <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white">
            {/* Weekdays header */}
            <div className="grid grid-cols-7 border-b border-cream-200 bg-cream-50/50">
              {weekDays.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider border-r border-cream-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr min-h-[500px]">
              {daysGrid.map((day, idx) => {
                if (!day) {
                  return (
                    <div key={`empty-${idx}`} className="border-b border-r border-cream-100 bg-cream-50/10 last:border-r-0" />
                  );
                }

                const dateStr = day.toISOString().split('T')[0];
                const dayEvents = items.filter((item) => item.dateStr === dateStr);
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <div key={dateStr} className={`p-1 border-b border-r border-cream-100 min-h-[100px] flex flex-col justify-between hover:bg-cream-50/10 transition-colors last:border-r-0 ${isToday ? 'bg-gold-50/20' : ''}`}>
                    <div className="flex justify-between items-center p-1">
                      <span className={`text-xs font-bold ${isToday ? 'bg-gold-500 text-white rounded-full h-5 w-5 flex items-center justify-center' : 'text-neutral-400'}`}>
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 flex-grow overflow-y-auto max-h-[80px]">
                      {dayEvents.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => handleOpenItemDetails(item, e)}
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer transition-all ${item.color} shadow-sm hover:scale-[1.02]`}
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DashboardCard>

      {/* EVENT OR TASK DETAILS MODAL */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={`${selectedItem?.type} Detail Overview`}>
        {selectedItem && (
          <div className="space-y-4 text-xs font-semibold text-neutral-700">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Title / Category</span>
              <p className="text-sm font-bold text-primary-800 mt-0.5">{selectedItem.title}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Execution Date & Time</span>
              <p className="flex items-center gap-1.5 mt-1 font-bold text-gold-700">
                <Clock size={14} /> {selectedItem.dateStr} | {selectedItem.time}
              </p>
            </div>
            {selectedItem.description && (
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Description Details</span>
                <p className="text-neutral-600 mt-1 p-2 bg-cream-50 rounded border border-cream-100 italic">{selectedItem.description}</p>
              </div>
            )}

            <div className="flex justify-end border-t border-cream-100 pt-4">
              <Button variant="secondary" onClick={() => setSelectedItem(null)}>Close Overview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
