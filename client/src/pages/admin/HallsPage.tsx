import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { hallApi, Hall, HallBookingCalendarEvent } from '../../api/hallApi';
import {
  Landmark,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const HallsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected state
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: 250,
    basePrice: 50000,
    status: 'AVAILABLE' as Hall['status']
  });

  // Calendar dates
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarBookings, setCalendarBookings] = useState<HallBookingCalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const data = await hallApi.getAll();
      setHalls(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch function halls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      capacity: 500,
      basePrice: 75000,
      status: 'AVAILABLE' as Hall['status']
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (hall: Hall, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHall(hall);
    setFormData({
      name: hall.name,
      description: hall.description || '',
      location: hall.location || '',
      capacity: hall.capacity || 250,
      basePrice: Number(hall.basePrice),
      status: hall.status
    });
    setIsEditOpen(true);
  };

  const fetchCalendar = async (hallId: string, date: Date) => {
    setLoadingCalendar(true);
    try {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = lastDay.toISOString().split('T')[0];
      const bookings = await hallApi.getBookingsCalendar(hallId, startStr, endStr);
      setCalendarBookings(bookings);
    } catch (err) {
      console.error('Failed to load hall bookings calendar', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleOpenDetail = (hall: Hall) => {
    setSelectedHall(hall);
    setCurrentDate(new Date());
    fetchCalendar(hall.id, new Date());
    setIsDetailOpen(true);
  };

  const handlePrevMonth = () => {
    if (!selectedHall) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    fetchCalendar(selectedHall.id, newDate);
  };

  const handleNextMonth = () => {
    if (!selectedHall) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    fetchCalendar(selectedHall.id, newDate);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hallApi.create(formData);
      addToast('Function Hall added successfully.', 'success');
      setIsAddOpen(false);
      fetchHalls();
    } catch (err: any) {
      addToast(err.message || 'Failed to add function hall.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHall) return;
    try {
      await hallApi.update(selectedHall.id, formData);
      addToast('Function Hall updated successfully.', 'success');
      setIsEditOpen(false);
      fetchHalls();
    } catch (err: any) {
      addToast(err.message || 'Failed to update function hall.', 'error');
    }
  };

  const handleDeleteHall = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to deactivate/delete this function hall?')) {
      return;
    }

    try {
      await hallApi.delete(id);
      addToast('Function Hall deactivated successfully.', 'success');
      fetchHalls();
    } catch (err: any) {
      addToast(err.message || 'Failed to deactivate function hall.', 'error');
    }
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
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Function Halls</h3>
          <p className="text-xs text-neutral-400 mt-1">Configure function halls parameters, seating capacity limits and daily base prices</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Add Hall
        </Button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : halls.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-luxury border border-cream-150 text-neutral-500">
          No function halls registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div
              key={hall.id}
              onClick={() => handleOpenDetail(hall)}
              className="group cursor-pointer bg-white border border-cream-150 rounded-luxury overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Placeholder */}
                <div className="h-40 bg-cream-100 flex items-center justify-center border-b border-cream-100 relative">
                  <Landmark size={48} className="text-gold-500/70" />
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-white text-gold-600 border border-cream-150 px-2 py-0.5 rounded">
                    {hall.hallCode}
                  </span>
                  <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded ${
                    hall.status === 'AVAILABLE'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {hall.status}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-md font-bold text-primary-800 group-hover:text-gold-500 transition-colors font-serif">
                    {hall.name}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-2">{hall.description || 'No description available.'}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-cream-50 text-[10px] uppercase font-bold text-neutral-400">
                  <div>
                    <span className="block text-[8px] text-neutral-400">Capacity</span>
                    <span className="text-primary-800 flex items-center gap-1 mt-0.5"><Users size={10} /> {hall.capacity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-400">Base Price</span>
                    <span className="text-gold-600 flex items-center gap-1 mt-0.5">₹{Number(hall.basePrice).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-400">Location</span>
                    <span className="text-primary-800 flex items-center gap-1 mt-0.5 truncate"><MapPin size={10} /> {hall.location || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-cream-50">
                  <Button variant="secondary" className="!p-1.5 !px-3 rounded text-xs" onClick={(e) => handleOpenEdit(hall, e)}>
                    <Edit size={12} /> Edit
                  </Button>
                  <Button variant="secondary" className="!p-1.5 !px-3 rounded text-xs text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteHall(hall.id, e)}>
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD HALL MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Function Hall">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Function Hall Name *"
            required
            placeholder="e.g. Taj Mahal Grand Ballroom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Maximum Seating Capacity *"
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
            <Input
              label="Base Price per Day (INR) *"
              type="number"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Venue Location/Address"
              placeholder="e.g. Ground Floor, Block A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Status</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.status || 'AVAILABLE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="MAINTENANCE">UNDER MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE / CLOSED</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Hall Description</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Register Hall</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT HALL MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Hall Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Function Hall Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Maximum Seating Capacity *"
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
            <Input
              label="Base Price per Day (INR) *"
              type="number"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Venue Location/Address"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Status</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.status || 'AVAILABLE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="MAINTENANCE">UNDER MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Hall Description</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* HALL DETAILS & AVAILABILITY CALENDAR MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Hall Specs & Monthly Availability" size="lg">
        {selectedHall && (
          <div className="space-y-6">
            <div className="border-b border-cream-150 pb-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-neutral-400 font-bold block">Capacity</span>
                <span className="text-primary-800 font-semibold">{selectedHall.capacity} Guests</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-bold block">Daily Price</span>
                <span className="text-gold-600 font-semibold">₹{Number(selectedHall.basePrice).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-bold block">Location</span>
                <span className="text-primary-800">{selectedHall.location || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-bold block">Operation Status</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  selectedHall.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {selectedHall.status}
                </span>
              </div>
            </div>

            {/* MONTHLY CALENDAR GRID */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-bold text-primary-800 font-serif flex items-center gap-2">
                  <Calendar size={16} className="text-gold-500" /> Availability Calendar
                </h5>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="!p-1 rounded" onClick={handlePrevMonth}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-primary-800 uppercase w-28 text-center">
                    {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="secondary" className="!p-1 rounded" onClick={handleNextMonth}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              {loadingCalendar ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 border border-cream-150 rounded bg-cream-50/20 p-1">
                  {/* Weekday headers */}
                  {weekDays.map(d => (
                    <div key={d} className="text-center py-2 text-[10px] font-bold uppercase text-neutral-400">
                      {d}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {daysGrid.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="bg-transparent aspect-square" />;
                    }

                    const dayStr = day.toISOString().split('T')[0];
                    const bookingsOnDate = calendarBookings.filter(b => b.start.split('T')[0] === dayStr);

                    let status = 'AVAILABLE';
                    let bookingRef: HallBookingCalendarEvent | null = null;
                    if (bookingsOnDate.length > 0) {
                      bookingRef = bookingsOnDate[0];
                      status = bookingRef.status === 'CONFIRMED' || bookingRef.status === 'COMPLETED' || bookingRef.status === 'Confirmed' ? 'BOOKED' : 'PENDING';
                    }

                    return (
                      <div
                        key={dayStr}
                        className={`aspect-square p-1 border border-cream-100 rounded bg-white flex flex-col justify-between relative group ${
                          status === 'BOOKED' ? 'border-red-200 bg-red-50/10' : status === 'PENDING' ? 'border-yellow-250 bg-yellow-50/10' : 'hover:bg-cream-50/30'
                        }`}
                      >
                        <span className="text-xs font-bold text-neutral-600">{day.getDate()}</span>
                        
                        {status === 'BOOKED' ? (
                          <span className="text-[8px] bg-red-600 text-white rounded font-bold px-1 py-0.5 truncate text-center block w-full">
                            BOOKED
                          </span>
                        ) : status === 'PENDING' ? (
                          <span className="text-[8px] bg-yellow-500 text-white rounded font-bold px-1 py-0.5 truncate text-center block w-full">
                            PENDING
                          </span>
                        ) : (
                          <span className="text-[8px] text-green-700 bg-green-50 rounded font-bold px-1 text-center block w-full">
                            FREE
                          </span>
                        )}

                        {bookingRef && (
                          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-primary-950 text-white text-[10px] p-2 rounded shadow-lg w-36 pointer-events-none text-left space-y-0.5">
                            <p className="font-bold text-gold-400">{bookingRef.title}</p>
                            <p>Client: {bookingRef.clientName}</p>
                            <p>Time: {bookingRef.startTime || '09:00'} - {bookingRef.endTime || '18:00'}</p>
                            <p className="font-semibold text-yellow-500 uppercase">{status}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HallsPage;
