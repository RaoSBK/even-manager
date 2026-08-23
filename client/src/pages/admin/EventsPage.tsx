import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { eventApi, EventDetails, EventPayload } from '../../api/eventApi';
import { customerApi, Customer } from '../../api/customerApi';
import { hallApi, Hall } from '../../api/hallApi';
import { employeeApi, Employee } from '../../api/employeeApi';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Edit
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const EVENT_STATUSES = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const EventsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lists for dropdown selectors
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [coordinators, setCoordinators] = useState<Employee[]>([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Forms data
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [formData, setFormData] = useState<EventPayload>({
    customerId: '',
    eventName: '',
    eventType: 'WEDDING',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    expectedGuestCount: 100,
    budget: 50000,
    notes: '',
    hallId: '',
    coordinatorIds: []
  });

  const [editStatus, setEditStatus] = useState<string>('PLANNING');

  // Task form for detail view
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      const data = await eventApi.getAll(filters);
      setEvents(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch events planning list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const cList = await customerApi.getAll();
      setCustomers(cList);

      const hList = await hallApi.getAll();
      setHalls(hList.filter(h => h.status === 'AVAILABLE'));

      const eList = await employeeApi.getAll();
      setCoordinators(eList.filter(e => e.status === 'ACTIVE'));
    } catch (err) {
      console.error('Failed to load selectors dropdown lists', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchDropdowns();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleOpenAdd = () => {
    setFormData({
      customerId: '',
      eventName: '',
      eventType: 'WEDDING',
      description: '',
      eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default 35 days in future to bypass 1-month booking constraint
      startTime: '09:00',
      endTime: '22:00',
      expectedGuestCount: 200,
      budget: 150000,
      notes: '',
      hallId: '',
      coordinatorIds: []
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (evt: EventDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(evt);
    setEditStatus(evt.status);
    setFormData({
      customerId: evt.customerId,
      eventName: evt.eventName,
      eventType: evt.eventType,
      description: evt.description || '',
      eventDate: evt.eventDate ? new Date(evt.eventDate).toISOString().split('T')[0] : '',
      startTime: evt.startTime || '',
      endTime: evt.endTime || '',
      expectedGuestCount: evt.expectedGuestCount ? Number(evt.expectedGuestCount) : 100,
      budget: evt.budget ? Number(evt.budget) : 50000,
      notes: evt.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDetails = async (evt: EventDetails) => {
    setLoading(true);
    try {
      const details = await eventApi.getById(evt.id);
      setSelectedEvent(details);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: details.eventDate ? new Date(details.eventDate).toISOString().split('T')[0] : '',
        assignedTo: ''
      });
      setIsDetailsOpen(true);
    } catch (err) {
      addToast('Failed to load event details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventApi.create(formData);
      addToast('Event planned and booked successfully.', 'success');
      setIsAddOpen(false);
      fetchEvents();
    } catch (err: any) {
      addToast(err.message || 'Failed to schedule event.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      const payload = {
        ...formData,
        status: editStatus
      };
      await eventApi.update(selectedEvent.id, payload);
      addToast('Event details updated successfully.', 'success');
      setIsEditOpen(false);
      fetchEvents();
    } catch (err: any) {
      addToast(err.message || 'Failed to update event details.', 'error');
    }
  };

  const handleCancelEvent = async (evt: EventDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this event? This will also cancel any associated function hall bookings.')) {
      return;
    }

    try {
      await eventApi.cancel(evt.id);
      addToast('Event planning cancelled successfully.', 'success');
      fetchEvents();
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel event.', 'error');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      await eventApi.createTask(selectedEvent.id, taskForm);
      addToast('Task added and assigned.', 'success');
      handleOpenDetails(selectedEvent);
    } catch (err: any) {
      addToast(err.message || 'Failed to add task.', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedEvent || !window.confirm('Delete this task?')) return;
    try {
      await eventApi.deleteTask(taskId);
      addToast('Task deleted.', 'success');
      handleOpenDetails(selectedEvent);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  const columns = [
    { key: 'eventCode', header: 'Event Code', render: (evt: EventDetails) => <span className="font-bold text-gold-600">{evt.eventCode}</span> },
    { key: 'eventName', header: 'Event Title', render: (evt: EventDetails) => <span className="font-semibold text-primary-800">{evt.eventName}</span> },
    { key: 'eventType', header: 'Type' },
    {
      key: 'eventDate',
      header: 'Date & Session',
      render: (evt: EventDetails) => (
        <span className="text-xs text-neutral-500">
          {new Date(evt.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {evt.startTime && ` (${evt.startTime} - ${evt.endTime})`}
        </span>
      )
    },
    { key: 'client', header: 'Client', render: (evt: EventDetails) => evt.customer?.fullName || 'N/A' },
    {
      key: 'status',
      header: 'Status',
      render: (evt: EventDetails) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
          evt.status === 'CONFIRMED' || evt.status === 'COMPLETED'
            ? 'bg-green-50 text-green-700 border border-green-150'
            : evt.status === 'PLANNING'
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
            : 'bg-red-50 text-red-700 border border-red-150'
        }`}>
          {evt.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (evt: EventDetails) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={() => handleOpenDetails(evt)}>
            <Eye size={14} />
          </Button>
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={(e) => handleOpenEdit(evt, e)}>
            <Edit size={14} />
          </Button>
          {evt.status !== 'CANCELLED' && evt.status !== 'COMPLETED' && (
            <Button variant="secondary" className="!p-1.5 !px-2 rounded text-red-600 hover:bg-red-50" onClick={(e) => handleCancelEvent(evt, e)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Event Management</h3>
          <p className="text-xs text-neutral-400 mt-1">Configure event coordinates, budgets, timelines and task delegation checklist</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Plan Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full sm:w-auto">
          <Input
            placeholder="Search by title, code, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
          <Button type="submit" variant="gold" className="!py-2">Search</Button>
        </form>

        <div className="flex flex-col gap-1 w-44">
          <label className="text-[10px] font-bold text-primary-800 uppercase tracking-wide">Status Filter</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {EVENT_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Planned Events" subtitle="Overview of scheduled client events">
          <Table
            columns={columns}
            data={events}
            loading={loading}
            emptyMessage="No events found."
            onRowClick={handleOpenDetails}
          />
        </DashboardCard>
      )}

      {/* CREATE EVENT MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Event" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Assign Customer *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">-- Choose Client --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>
            <Input
              label="Event Name/Title *"
              required
              placeholder="e.g. Wedding Banquet of Priya & Rahul"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Event Type *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="WEDDING">Wedding Ceremony</option>
                <option value="RECEPTION">Reception Banquet</option>
                <option value="BIRTHDAY">Birthday Bash</option>
                <option value="CONFERENCE">Corporate Meeting/Seminar</option>
                <option value="OTHER">Other Gathering</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Assign Function Hall (Optional)</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.hallId}
                onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
              >
                <option value="">-- Select Hall --</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>{h.name} (Max {h.capacity})</option>
                ))}
              </select>
            </div>
            <Input
              label="Expected Guests"
              type="number"
              value={formData.expectedGuestCount}
              onChange={(e) => setFormData({ ...formData, expectedGuestCount: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Event Date *"
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Budget Limit (INR)"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Select Staff Coordinator</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !formData.coordinatorIds?.includes(val)) {
                    setFormData({
                      ...formData,
                      coordinatorIds: [...(formData.coordinatorIds || []), val]
                    });
                  }
                }}
              >
                <option value="">-- Assign Employee --</option>
                {coordinators.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.name} - {c.designation}</option>
                ))}
              </select>
              {/* Selected Coordinators tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.coordinatorIds?.map(id => {
                  const emp = coordinators.find(c => c.id === id);
                  return (
                    <span key={id} className="text-[10px] font-bold bg-cream-100 text-primary-800 px-2 py-0.5 rounded flex items-center gap-1">
                      {emp?.user?.name || 'Staff'}
                      <button
                        type="button"
                        className="text-red-500 font-bold"
                        onClick={() => setFormData({
                          ...formData,
                          coordinatorIds: formData.coordinatorIds?.filter(x => x !== id)
                        })}
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Event Description / Details</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Plan Event</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT EVENT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Event Specifications">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Event Name/Title *"
            required
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Event Type *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="WEDDING">Wedding Ceremony</option>
                <option value="RECEPTION">Reception Banquet</option>
                <option value="BIRTHDAY">Birthday Bash</option>
                <option value="CONFERENCE">Corporate Meeting/Seminar</option>
                <option value="OTHER">Other Gathering</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Event Tracking Status *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white text-gold-600 font-bold"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                {EVENT_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Date"
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
            <Input
              label="Start"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="End"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Guests Count"
              type="number"
              value={formData.expectedGuestCount}
              onChange={(e) => setFormData({ ...formData, expectedGuestCount: Number(e.target.value) })}
            />
            <Input
              label="Budget limit (INR)"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Internal Notes</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Specifications</Button>
          </div>
        </form>
      </Modal>

      {/* EVENT DETAILED SPECIFICATION VIEW MODAL */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Event Detailed Overview" size="lg">
        {selectedEvent && (
          <div className="space-y-6">
            <div className="border-b border-cream-150 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-md font-bold text-primary-800 font-serif">
                  {selectedEvent.eventName}
                </h5>
                <span className="text-xs font-bold text-gold-600 bg-cream-100 px-2 py-0.5 rounded">
                  {selectedEvent.eventCode}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-3">{selectedEvent.description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-bold uppercase block">Event Date</span>
                  <span className="text-primary-800 font-semibold">
                    {new Date(selectedEvent.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold uppercase block">Timings</span>
                  <span className="text-primary-800 font-semibold">{selectedEvent.startTime || '09:00'} - {selectedEvent.endTime || '22:00'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold uppercase block">Expected Guests</span>
                  <span className="text-primary-800 font-semibold">{selectedEvent.expectedGuestCount || 'N/A'} Guests</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold uppercase block">Track Status</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    selectedEvent.status === 'CONFIRMED' || selectedEvent.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Client & Booking Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-cream-150 pb-4 text-xs">
              <div className="p-3 bg-cream-50/50 border border-cream-100 rounded">
                <span className="font-bold text-primary-800 block mb-2 uppercase text-[10px] text-neutral-400">Assigned Customer</span>
                <p className="font-semibold text-primary-800">{selectedEvent.customer?.fullName}</p>
                <p className="text-neutral-500">Phone: {selectedEvent.customer?.phone}</p>
                <p className="text-neutral-500">Email: {selectedEvent.customer?.email}</p>
              </div>
              <div className="p-3 bg-cream-50/50 border border-cream-100 rounded">
                <span className="font-bold text-primary-800 block mb-2 uppercase text-[10px] text-neutral-400">Function Hall Booking</span>
                {selectedEvent.booking ? (
                  <>
                    <p className="font-semibold text-primary-800">{selectedEvent.booking.hall?.name || 'Allocated Hall'}</p>
                    <p className="text-neutral-500">Booking Num: {selectedEvent.booking.bookingNumber}</p>
                    <p className="text-neutral-500">Cost per Event: ₹{Number(selectedEvent.booking.totalAmount).toLocaleString('en-IN')}</p>
                  </>
                ) : (
                  <p className="text-neutral-400 italic">No function hall reserved for this event.</p>
                )}
              </div>
            </div>

            {/* TASKS CHECKLIST */}
            <div>
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-gold-500" /> Event Coordinator Tasks
              </h5>
              
              {/* Task Adding Form */}
              <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 bg-cream-50/30 p-3 border border-cream-100 rounded">
                <div className="md:col-span-2">
                  <Input
                    placeholder="New task title..."
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <select
                    className="w-full bg-white border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  >
                    <option value="">Assign Coordinator</option>
                    {coordinators.map(c => (
                      <option key={c.id} value={c.id}>{c.user?.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="gold" className="!py-1.5 text-xs w-full">Add Task</Button>
              </form>

              {!selectedEvent.tasks || selectedEvent.tasks.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No checklist tasks defined yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedEvent.tasks.map((task: any) => (
                    <div key={task.id} className="p-3 bg-white border border-cream-150 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-primary-800 block">{task.title}</span>
                        {task.assigned && (
                          <span className="text-[10px] text-neutral-400">Assigned: {task.assigned.user?.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          task.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {task.status}
                        </span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsPage;
