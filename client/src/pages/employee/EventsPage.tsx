import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { employeeWorkstationApi } from '../../api/employeeWorkstationApi';
import { EventDetails } from '../../api/eventApi';
import { Search, Eye, MapPin, Calendar, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const EventsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'upcoming' | 'today' | 'completed' | 'cancelled'>('upcoming');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const data = await employeeWorkstationApi.getEvents({ filter: filterType, search });
      setEvents(data);
    } catch {
      addToast('Failed to load assigned events portfolio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEventsData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'PLANNING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border border-blue-150';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-150';
      default:
        return 'bg-neutral-50 text-neutral-600 border border-neutral-150';
    }
  };

  const columns = [
    { key: 'eventCode', header: 'Event Code', render: (ev: EventDetails) => <span className="font-bold text-gold-600">{ev.eventCode}</span> },
    { key: 'eventName', header: 'Event Name', render: (ev: EventDetails) => <span className="font-semibold text-primary-800 font-serif">{ev.eventName}</span> },
    { key: 'customer', header: 'Client', render: (ev: EventDetails) => ev.customer?.fullName || 'N/A' },
    { key: 'eventType', header: 'Type' },
    { key: 'eventDate', header: 'Event Date', render: (ev: EventDetails) => new Date(ev.eventDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (ev: EventDetails) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getStatusBadge(ev.status)}`}>{ev.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (ev: EventDetails) => (
        <Button variant="secondary" className="!p-1 text-xs" onClick={() => setSelectedEvent(ev)}>
          <Eye size={12} /> Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Events Portfolio</h3>
        <p className="text-xs text-neutral-400 mt-1">Review event agendas, client requirements, and venue locations</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-grow max-w-sm">
          <Input
            placeholder="Search events name, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <div className="flex gap-2">
          {(['upcoming', 'today', 'completed', 'cancelled'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-luxury text-xs font-bold uppercase transition-all ${
                filterType === type
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-white border border-cream-200 text-neutral-500 hover:bg-cream-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      <DashboardCard title="Assigned Events Log" subtitle="Trace event timelines and client contacts">
        <Table
          columns={columns}
          data={events}
          loading={loading}
          emptyMessage="No events found matching your filter criteria."
          onRowClick={setSelectedEvent}
        />
      </DashboardCard>

      {/* EVENT DETAIL OVERVIEW MODAL */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Assigned Event Specifications" size="lg">
        {selectedEvent && (
          <div className="space-y-6 text-xs font-semibold text-neutral-700">
            <div className="border-b border-cream-100 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-primary-800 font-serif">{selectedEvent.eventName}</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Event Code: {selectedEvent.eventCode}</p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(selectedEvent.status)}`}>
                {selectedEvent.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Client Specifications</span>
                <p>Client: <strong className="text-primary-800">{selectedEvent.customer?.fullName || 'N/A'}</strong></p>
                <p>Phone: {selectedEvent.customer?.phone || 'N/A'}</p>
                <p>Email: {selectedEvent.customer?.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Schedule & Timings</span>
                <p className="flex items-center gap-1"><Calendar size={12} /> Date: {new Date(selectedEvent.eventDate).toLocaleDateString()}</p>
                <p className="flex items-center gap-1"><Clock size={12} /> Timings: {selectedEvent.startTime || '09:00 AM'} - {selectedEvent.endTime || '06:00 PM'}</p>
                <p>Guests Count: {selectedEvent.expectedGuestCount || 0} Expected</p>
              </div>
            </div>

            {selectedEvent.booking?.hall && (
              <div className="p-3 bg-cream-50/50 border border-cream-100 rounded">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Venue Hall Booking</span>
                <p className="font-bold text-primary-800">{selectedEvent.booking.hall.name}</p>
                <p className="flex items-center gap-1 mt-0.5 text-neutral-500"><MapPin size={11} /> Function banquet hall</p>
              </div>
            )}

            {selectedEvent.notes && (
              <div className="p-3 bg-cream-50/20 border border-cream-100 rounded text-neutral-600 italic">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Internal Agenda Notes</span>
                {selectedEvent.notes}
              </div>
            )}

            <div className="flex justify-end border-t border-cream-100 pt-4">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>Close Overview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsPage;
