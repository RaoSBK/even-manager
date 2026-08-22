import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import { 
  Calendar, X, Edit, Trash2, RefreshCw, Search,
  ChevronRight, AlertTriangle, Landmark, Clock, CheckCircle, Utensils,
  ChevronDown, ChevronUp, User
} from 'lucide-react';
import { getHallBookings, updateHallBooking, getBookingHistory, HallBookingResponse, BookingHistoryResponse } from '../../api/bookingApi';
import { getFoodItems, FoodItem } from '../../api/foodApi';
import { sampleHalls } from '../../constants/hallsData';

interface SelectedFoodItemMetadata {
  id: string;
  name: string;
  price: number;
  category: string;
  status?: 'Available' | 'Unavailable';
  replacedWith?: {
    id: string;
    name: string;
    price: number;
    category: string;
  } | null;
}

interface EditBookingFormState {
  bookingId: string;
  customerName: string;
  email: string;
  mobile: string;
  hallId: string;
  hallName: string;
  hallAddress: string;
  costPerDay: number;
  eventDate: string;
  eventSession: string;
  startTime: string;
  endTime: string;
  eventType: string;
  guestsCount: number;
  foodItems: SelectedFoodItemMetadata[];
  totalAmount: number;
  paymentStatus: string;
  status: string;
  specialNotes: string;
}

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<HallBookingResponse[]>([]);
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Selection & Details state
  const [selectedBooking, setSelectedBooking] = useState<HallBookingResponse | null>(null);
  const [history, setHistory] = useState<BookingHistoryResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFoodItems, setEditFoodItems] = useState<SelectedFoodItemMetadata[]>([]);
  
  const [isEditBookingOpen, setIsEditBookingOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<EditBookingFormState | null>(null);
  const [isVegExpanded, setIsVegExpanded] = useState<boolean>(false);
  const [isNonVegExpanded, setIsNonVegExpanded] = useState<boolean>(false);
  
  // Styled Confirm Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'food' | 'booking' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      fetchHistory(selectedBooking.bookingId);
    } else {
      setHistory([]);
    }
  }, [selectedBooking]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsData, foodData] = await Promise.all([
        getHallBookings(),
        getFoodItems()
      ]);
      setBookings(bookingsData);
      setFoodMenu(foodData.filter(item => item.active));
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load bookings or food menu.');
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const fetchHistory = async (bookingId: string) => {
    setLoadingHistory(true);
    try {
      const data = await getBookingHistory(bookingId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Parse food items JSON
  const parseFoodItems = (foodItemsStr: string | null | undefined): SelectedFoodItemMetadata[] => {
    if (!foodItemsStr) return [];
    try {
      const parsed = typeof foodItemsStr === 'string' ? JSON.parse(foodItemsStr) : foodItemsStr;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse food items:', e);
      return [];
    }
  };

  // Calculate food total dynamically for a set of food items
  const calculateFoodTotal = (items: SelectedFoodItemMetadata[]): number => {
    return items.reduce((sum, item) => {
      if (item.status === 'Unavailable') {
        return sum + (item.replacedWith ? item.replacedWith.price : 0);
      }
      return sum + item.price;
    }, 0);
  };

  // Open Edit food items modal
  const handleOpenEdit = (booking: HallBookingResponse) => {
    const items = parseFoodItems(booking.foodItems);
    const initializedItems = items.map(item => ({
      ...item,
      status: (item.status || 'Available') as 'Available' | 'Unavailable',
      replacedWith: item.replacedWith || null
    }));
    setEditFoodItems(initializedItems);
    setIsEditModalOpen(true);
  };

  // Toggle status for edit food modal
  const handleToggleStatus = (index: number) => {
    setEditFoodItems(prev => {
      const copy = [...prev];
      const current = copy[index];
      if (current.status === 'Unavailable') {
        current.status = 'Available';
        current.replacedWith = null;
      } else {
        current.status = 'Unavailable';
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setEditFoodItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplaceItem = (index: number, replacementId: string) => {
    if (!replacementId) {
      setEditFoodItems(prev => {
        const copy = [...prev];
        copy[index].replacedWith = null;
        return copy;
      });
      return;
    }
    const replacement = foodMenu.find(item => item.id === replacementId);
    if (!replacement) return;

    setEditFoodItems(prev => {
      const copy = [...prev];
      copy[index].replacedWith = {
        id: replacement.id,
        name: replacement.name,
        price: replacement.price,
        category: replacement.category
      };
      return copy;
    });
  };

  // Open full edit booking modal
  const handleOpenEditBooking = (booking: HallBookingResponse) => {
    const items = parseFoodItems(booking.foodItems).map(item => ({
      ...item,
      status: (item.status || 'Available') as 'Available' | 'Unavailable',
      replacedWith: item.replacedWith || null
    }));
    setEditForm({
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      email: booking.email,
      mobile: booking.mobile,
      hallId: booking.hallId,
      hallName: booking.hallName,
      hallAddress: booking.hallAddress,
      costPerDay: booking.costPerDay,
      eventDate: booking.eventDate,
      eventSession: booking.eventSession,
      startTime: booking.startTime || '09:00',
      endTime: booking.endTime || '18:00',
      eventType: booking.eventType || 'General Event',
      guestsCount: booking.guestsCount || 100,
      foodItems: items,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus || 'Paid',
      status: booking.status,
      specialNotes: booking.specialNotes || ''
    });
    setIsEditBookingOpen(true);
  };

  // Food selection toggle in edit booking form
  const handleEditBookingFoodToggle = (item: FoodItem) => {
    if (!editForm) return;
    const exists = editForm.foodItems.some(f => f.id === item.id);
    let updatedFoodItems;
    if (exists) {
      updatedFoodItems = editForm.foodItems.filter(f => f.id !== item.id);
    } else {
      updatedFoodItems = [
        ...editForm.foodItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          status: 'Available' as 'Available' | 'Unavailable',
          replacedWith: null
        }
      ];
    }

    const recalculatedFoodTotal = calculateFoodTotal(updatedFoodItems);
    const newTotal = editForm.costPerDay + recalculatedFoodTotal;

    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        foodItems: updatedFoodItems,
        totalAmount: newTotal
      };
    });
  };

  // Food toggle status in edit booking form
  const handleEditBookingFoodStatusToggle = (index: number) => {
    if (!editForm) return;
    const copy = [...editForm.foodItems];
    const current = copy[index];
    if (current.status === 'Unavailable') {
      current.status = 'Available';
      current.replacedWith = null;
    } else {
      current.status = 'Unavailable';
    }

    const recalculatedFoodTotal = calculateFoodTotal(copy);
    const newTotal = editForm.costPerDay + recalculatedFoodTotal;

    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        foodItems: copy,
        totalAmount: newTotal
      };
    });
  };

  // Food replacement in edit booking form
  const handleEditBookingFoodReplace = (index: number, replacementId: string) => {
    if (!editForm) return;
    const copy = [...editForm.foodItems];
    if (!replacementId) {
      copy[index].replacedWith = null;
    } else {
      const replacement = foodMenu.find(item => item.id === replacementId);
      if (replacement) {
        copy[index].replacedWith = {
          id: replacement.id,
          name: replacement.name,
          price: replacement.price,
          category: replacement.category
        };
      }
    }

    const recalculatedFoodTotal = calculateFoodTotal(copy);
    const newTotal = editForm.costPerDay + recalculatedFoodTotal;

    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        foodItems: copy,
        totalAmount: newTotal
      };
    });
  };

  // Food remove in edit booking form
  const handleEditBookingFoodRemove = (index: number) => {
    if (!editForm) return;
    const copy = editForm.foodItems.filter((_, i) => i !== index);
    const recalculatedFoodTotal = calculateFoodTotal(copy);
    const newTotal = editForm.costPerDay + recalculatedFoodTotal;

    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        foodItems: copy,
        totalAmount: newTotal
      };
    });
  };

  // Save updates trigger
  const handleSaveTrigger = (action: 'food' | 'booking') => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  // Final confirm submit
  const handleConfirmSave = async () => {
    setIsConfirmOpen(false);
    setIsSaving(true);

    try {
      if (confirmAction === 'food') {
        if (!selectedBooking) return;
        const response = await updateHallBooking(selectedBooking.bookingId, {
          foodItems: editFoodItems
        });
        showToast('Food items updated successfully.');
        setIsEditModalOpen(false);
        setBookings(prev => prev.map(b => b.bookingId === selectedBooking.bookingId ? response.booking : b));
        setSelectedBooking(response.booking);
        fetchHistory(selectedBooking.bookingId);
      } else if (confirmAction === 'booking') {
        if (!editForm || !selectedBooking) return;
        const response = await updateHallBooking(editForm.bookingId, {
          ...editForm,
          changedBy: 'Admin'
        });
        showToast('Booking updated successfully.');
        setIsEditBookingOpen(false);
        setBookings(prev => prev.map(b => b.bookingId === editForm.bookingId ? response.booking : b));
        setSelectedBooking(response.booking);
        fetchHistory(editForm.bookingId);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(err.message || 'Failed to save updates.');
    } finally {
      setIsSaving(false);
      setConfirmAction(null);
    }
  };

  // Filtered bookings list
  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Single food modal pricing totals
  const tempFoodTotal = calculateFoodTotal(editFoodItems);
  const tempBookingTotal = (selectedBooking?.costPerDay || 0) + tempFoodTotal;

  // Edit booking modal pricing totals
  const recalculatedFoodTotal = editForm ? calculateFoodTotal(editForm.foodItems) : 0;
  const recalculatedBookingTotal = editForm ? (editForm.costPerDay + recalculatedFoodTotal) : 0;

  return (
    <div className="space-y-6 relative min-h-[600px]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-luxury shadow-luxury flex items-center gap-2 border border-emerald-500 animate-fadeIn">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cream-100 pb-5">
        <div>
          <h2 className="font-extrabold text-2xl text-primary-800 tracking-wide">Manage Bookings</h2>
          <p className="text-xs text-neutral-500 mt-1">
            View customer bookings, manage catering menu availability, and perform detail edits.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-cream-200 hover:border-gold-300 hover:text-gold-600 text-xs font-semibold rounded-luxury transition-all text-neutral-600"
        >
          <RefreshCw size={12} />
          Reload List
        </button>
      </div>

      {/* Main Grid: List on Left, Detail Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings List Card */}
        <div className="lg:col-span-2 luxury-card bg-white p-6 border-cream-200 shadow-luxury">
          
          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 text-cream-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, customer name, or hall name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury pl-9 pr-4 py-2 text-xs font-medium text-primary-800 focus:border-gold-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400 font-medium">
              <span className="inline-block w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading bookings data...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-red-500 font-semibold border border-red-100 bg-red-50 rounded-luxury">
              {error}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 italic">
              No matching bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cream-100 text-neutral-500 font-bold uppercase tracking-wider">
                    <th className="py-3 pr-2">Booking ID</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Hall</th>
                    <th className="py-3">Event Date</th>
                    <th className="py-3 text-right">Total Fee</th>
                    <th className="py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-50 font-medium text-primary-800">
                  {filteredBookings.map((booking) => {
                    const isSelected = selectedBooking?.bookingId === booking.bookingId;
                    return (
                      <tr 
                        key={booking.bookingId}
                        onClick={() => setSelectedBooking(booking)}
                        className={`hover:bg-gold-50/10 cursor-pointer transition-all ${
                          isSelected ? 'bg-gold-50/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-3.5 pr-2 font-mono text-[10px] text-neutral-500">
                          {booking.bookingId}
                        </td>
                        <td className="py-3.5">
                          {booking.customerName}
                        </td>
                        <td className="py-3.5">
                          {booking.hallName}
                        </td>
                        <td className="py-3.5">
                          {booking.eventDate}
                        </td>
                        <td className="py-3.5 text-right font-bold text-gold-600">
                          ₹{booking.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            booking.status === 'Confirmed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : booking.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : booking.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-full">
          {selectedBooking ? (
            <div className="luxury-card bg-white p-6 border-cream-200 shadow-luxury-lg space-y-6 sticky top-6">
              
              {/* Card Title */}
              <div className="border-b border-cream-100 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                    ID: {selectedBooking.bookingId}
                  </span>
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide mt-1">Booking Detail Sheet</h3>
                </div>
                <button
                  onClick={() => handleOpenEditBooking(selectedBooking)}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-gold-500 hover:bg-gold-600 rounded shadow transition-all uppercase tracking-wide"
                >
                  <Edit size={10} />
                  Edit Booking
                </button>
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Customer</span>
                  <span className="font-bold text-primary-800">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Mobile Number</span>
                  <span className="font-bold text-primary-800">{selectedBooking.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Email Address</span>
                  <span className="font-bold text-primary-800 truncate block">{selectedBooking.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Hall Selected</span>
                  <span className="font-bold text-primary-800 flex items-center gap-1">
                    <Landmark size={12} className="text-gold-500" />
                    {selectedBooking.hallName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Event Date</span>
                  <span className="font-bold text-primary-800 flex items-center gap-1">
                    <Calendar size={12} className="text-gold-500" />
                    {selectedBooking.eventDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Time / Session</span>
                  <span className="font-bold text-primary-800">
                    {selectedBooking.eventSession || 'Full Day'}
                    {selectedBooking.startTime && ` (${selectedBooking.startTime} - ${selectedBooking.endTime})`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Guests Count</span>
                  <span className="font-bold text-primary-800">{selectedBooking.guestsCount || 100} Guests</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Payment Status</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    selectedBooking.paymentStatus === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : selectedBooking.paymentStatus === 'Refunded'
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : 'bg-yellow-50 text-yellow-750 border-yellow-100'
                  }`}>
                    {selectedBooking.paymentStatus || 'Paid'}
                  </span>
                </div>
              </div>

              {selectedBooking.specialNotes && (
                <div className="bg-cream-50/50 border border-cream-100/50 p-3 rounded-lg text-xs">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider mb-1">
                    Special Notes
                  </span>
                  <p className="text-neutral-700 font-medium whitespace-pre-line">{selectedBooking.specialNotes}</p>
                </div>
              )}

              {/* Selected Food Items List */}
              <div className="space-y-3 pt-3 border-t border-cream-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-primary-800 tracking-wide flex items-center gap-1.5">
                    <Utensils size={14} className="text-emerald-600" />
                    Catering & Food Items
                  </h4>
                  <button
                    onClick={() => handleOpenEdit(selectedBooking)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gold-600 hover:text-gold-700 bg-gold-50/50 hover:bg-gold-50 rounded border border-gold-200/50 transition-all uppercase tracking-wide"
                  >
                    <Edit size={10} />
                    Edit Food Items
                  </button>
                </div>

                {parseFoodItems(selectedBooking.foodItems).length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center bg-cream-50/50 rounded-lg">
                    No food catering items selected for this booking.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {parseFoodItems(selectedBooking.foodItems).map((item, idx) => {
                      const isUnavailable = item.status === 'Unavailable';
                      return (
                        <div key={idx} className="bg-cream-50/40 border border-cream-100/50 p-2.5 rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary-800 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.category === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {isUnavailable ? (
                                <span className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  Unavailable
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  Available
                                </span>
                              )}
                              <span className="font-bold text-neutral-500">₹{item.price}</span>
                            </div>
                          </div>

                          {isUnavailable && item.replacedWith && (
                            <div className="bg-white border border-gold-200/50 p-2 rounded flex justify-between items-center text-[11px] animate-fadeIn">
                              <span className="text-gray-400 flex items-center gap-1">
                                <ChevronRight size={10} />
                                Replaced with: <span className="font-bold text-primary-800">{item.replacedWith.name}</span>
                              </span>
                              <span className="font-bold text-gold-600">₹{item.replacedWith.price}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total Calculation breakdown */}
              <div className="pt-4 border-t border-cream-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Base Hall Cost</span>
                  <span className="font-semibold text-neutral-800">₹{selectedBooking.costPerDay.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Catering Subtotal</span>
                  <span className="font-semibold text-neutral-800">
                    ₹{calculateFoodTotal(parseFoodItems(selectedBooking.foodItems)).toLocaleString('en-IN')}.00
                  </span>
                </div>
                
                {selectedBooking.updatedAt && (
                  <div className="bg-cream-50 p-2 rounded text-[10px] text-gray-400 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Last updated: {new Date(selectedBooking.updatedAt).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-4 border-t border-cream-100">
                  <span className="font-bold text-primary-800 text-sm">Contract Total</span>
                  <span className="font-extrabold text-gold-600 text-lg sm:text-xl">
                    ₹{selectedBooking.totalAmount.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>

              {/* Audit History Log */}
              <div className="pt-5 border-t border-cream-100 space-y-3">
                <h4 className="font-bold text-xs text-primary-800 tracking-wide flex items-center gap-1.5">
                  <Clock size={14} className="text-neutral-500" />
                  Audit Change History
                </h4>
                {loadingHistory ? (
                  <p className="text-[10px] text-gray-400 italic">Loading change logs...</p>
                ) : history.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic py-2 text-center bg-cream-50/50 rounded-lg">
                    No edits have been made to this booking yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {history.map((log) => (
                      <div key={log.id} className="bg-cream-50/30 border border-cream-100/50 p-2.5 rounded text-[10px] space-y-1">
                        <div className="flex justify-between items-center text-neutral-400 font-bold">
                          <span>{log.fieldName}</span>
                          <span>{new Date(log.changedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-primary-800 font-medium leading-normal">
                          Changed from <span className="text-neutral-400 line-through">"{log.oldValue || 'none'}"</span> to <span className="text-gold-600 font-bold">"{log.newValue}"</span>
                        </p>
                        <span className="text-[9px] text-gray-400 block text-right font-semibold">
                          By: {log.changedBy}
                        </span>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
                      </div>
                    ))}
                  </div>
                )}
              </div>
<<<<<<< HEAD
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

=======

            </div>
          ) : (
            <div className="luxury-card border-cream-200 bg-white p-12 text-center text-xs text-gray-400 italic">
              Select a booking from the table to view details.
            </div>
          )}
        </div>

      </div>

      {/* Edit Food Selection Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury-lg shadow-luxury-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scaleIn">
            
            <div className="p-5 border-b border-cream-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-primary-800 tracking-wide">
                  Edit Booking Food Menu Selection
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Update item availability, remove items, or configure replacements.
                </p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-primary-800 transition-all p-1 hover:bg-cream-50 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {editFoodItems.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-8">No food items to edit.</p>
              ) : (
                <div className="space-y-4 divide-y divide-cream-100">
                  {editFoodItems.map((item, index) => {
                    const isUnavailable = item.status === 'Unavailable';
                    return (
                      <div key={index} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-3`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-primary-800 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.category === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 block">
                              Category: {item.category} • Original Price: ₹{item.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(index)}
                              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-all ${
                                isUnavailable
                                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100/50'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
                              }`}
                            >
                              {isUnavailable ? 'Mark Available' : 'Mark Unavailable'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 border border-cream-200 hover:border-red-300 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-all"
                              title="Remove item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {isUnavailable && (
                          <div className="bg-cream-50/50 border border-cream-100/80 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center gap-4 text-xs animate-fadeIn">
                            <div className="flex items-center gap-1.5 text-neutral-600 shrink-0">
                              <RefreshCw size={12} className="text-gold-500" />
                              <span className="font-semibold text-[10px] uppercase">Replace item with:</span>
                            </div>
                            <select
                              value={item.replacedWith?.id || ''}
                              onChange={(e) => handleReplaceItem(index, e.target.value)}
                              className="flex-1 bg-white border border-cream-200 rounded p-1.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                            >
                              <option value="">-- No Replacement --</option>
                              {foodMenu
                                .filter(f => f.category === item.category && f.id !== item.id)
                                .map(f => (
                                  <option key={f.id} value={f.id}>
                                    {f.name} (₹{f.price})
                                  </option>
                                ))}
                            </select>
                            {item.replacedWith && (
                              <div className="bg-gold-50 border border-gold-200/50 px-2.5 py-1.5 rounded text-[10px] text-gold-800 font-bold shrink-0">
                                Replacement Cost: ₹{item.replacedWith.price}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-cream-50 p-5 border-t border-cream-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs rounded-b-luxury-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">New Food Total:</span>
                  <span className="font-extrabold text-primary-800">₹{tempFoodTotal}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">New Booking Total:</span>
                  <span className="font-extrabold text-gold-600">₹{tempBookingTotal}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-cream-200 hover:bg-cream-100 text-neutral-600 text-xs font-bold rounded-luxury transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveTrigger('food')}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-luxury shadow-md transition-all ${
                    isSaving 
                      ? 'bg-gold-450 cursor-not-allowed opacity-70' 
                      : 'bg-gold-500 hover:bg-gold-600 hover:shadow-lg'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Food Items'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Booking Form Modal */}
      {isEditBookingOpen && editForm && (
        <div className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury-lg shadow-luxury-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-cream-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-primary-800 tracking-wide">
                  Edit Booking Sheet: #{editForm.bookingId}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Update customer information, hall details, timeslots, catering list, and booking status.
                </p>
              </div>
              <button 
                onClick={() => setIsEditBookingOpen(false)} 
                className="text-gray-400 hover:text-primary-800 transition-all p-1 hover:bg-cream-50 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Customer & Venue Fields */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-primary-800 border-b border-cream-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <User size={14} className="text-gold-500" />
                  Customer & Venue Info
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editForm.customerName}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, customerName: e.target.value } : null)}
                    className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, mobile: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Function Hall Assigned</label>
                  <select
                    value={editForm.hallId}
                    onChange={(e) => {
                      const h = sampleHalls.find(hall => hall.id === e.target.value);
                      if (h) {
                        setEditForm(prev => {
                          if (!prev) return null;
                          const newTotal = h.costPerDay + calculateFoodTotal(prev.foodItems);
                          return {
                            ...prev,
                            hallId: h.id,
                            hallName: h.name,
                            hallAddress: h.address,
                            costPerDay: h.costPerDay,
                            state: h.state,
                            district: h.district,
                            mandal: h.mandal,
                            totalAmount: newTotal
                          };
                        });
                      }
                    }}
                    className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                  >
                    {sampleHalls.map(hall => (
                      <option key={hall.id} value={hall.id}>
                        {hall.name} (₹{hall.costPerDay}/day)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Event Date</label>
                    <input
                      type="date"
                      value={editForm.eventDate}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, eventDate: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Booking Session</label>
                    <select
                      value={editForm.eventSession}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, eventSession: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">End Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 18:00"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Event Type</label>
                    <input
                      type="text"
                      value={editForm.eventType}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, eventType: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Number of Guests</label>
                    <input
                      type="number"
                      value={editForm.guestsCount}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, guestsCount: parseInt(e.target.value) || 0 } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Booking Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Payment Status</label>
                    <select
                      value={editForm.paymentStatus}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, paymentStatus: e.target.value } : null)}
                      className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Special Requirements / Notes</label>
                  <textarea
                    value={editForm.specialNotes}
                    rows={2}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, specialNotes: e.target.value } : null)}
                    className="w-full bg-cream-50/50 border border-cream-200 rounded p-2 text-xs font-medium text-primary-800 outline-none focus:border-gold-500 resize-none"
                  />
                </div>

              </div>

              {/* Right Column: Catering & Food item selections */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-primary-800 border-b border-cream-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <Utensils size={14} className="text-emerald-600" />
                  Catering Selections
                </h4>

                {/* Collapsible Food Menu items selector */}
                <div className="space-y-3">
                  
                  {/* VEG MENU */}
                  <div className="border border-cream-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsVegExpanded(!isVegExpanded)}
                      className="w-full flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase tracking-wider outline-none hover:bg-emerald-100/70 transition-all text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        VEG MENU SELECTOR
                      </span>
                      {isVegExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isVegExpanded && (
                      <div className="p-3 bg-white divide-y divide-cream-100 space-y-2 max-h-[160px] overflow-y-auto">
                        {foodMenu.filter(f => f.category === 'VEG').map(item => (
                          <label key={item.id} className="flex items-center justify-between py-1.5 cursor-pointer group text-[11px]">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.foodItems.some(f => f.id === item.id)}
                                onChange={() => handleEditBookingFoodToggle(item)}
                                className="w-3.5 h-3.5 rounded border-cream-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-500"
                              />
                              <span className="font-semibold text-primary-800 group-hover:text-gold-600 transition-all">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-bold text-gold-600">₹{item.price}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NON-VEG MENU */}
                  <div className="border border-cream-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsNonVegExpanded(!isNonVegExpanded)}
                      className="w-full flex items-center justify-between p-2.5 bg-rose-50 text-rose-800 font-bold text-[10px] uppercase tracking-wider outline-none hover:bg-rose-100/70 transition-all text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        NON-VEG MENU SELECTOR
                      </span>
                      {isNonVegExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isNonVegExpanded && (
                      <div className="p-3 bg-white divide-y divide-cream-100 space-y-2 max-h-[160px] overflow-y-auto">
                        {foodMenu.filter(f => f.category === 'NON-VEG').map(item => (
                          <label key={item.id} className="flex items-center justify-between py-1.5 cursor-pointer group text-[11px]">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.foodItems.some(f => f.id === item.id)}
                                onChange={() => handleEditBookingFoodToggle(item)}
                                className="w-3.5 h-3.5 rounded border-cream-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-500"
                              />
                              <span className="font-semibold text-primary-800 group-hover:text-gold-600 transition-all">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-bold text-gold-600">₹{item.price}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* List selected items to configure availability/replacements */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Modify Selected Catering Availability
                  </span>
                  
                  {editForm.foodItems.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-3 text-center bg-cream-50/50 rounded-lg">
                      No items checked. Select menu items above.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {editForm.foodItems.map((item, idx) => {
                        const isUnavailable = item.status === 'Unavailable';
                        return (
                          <div key={idx} className="bg-cream-50/40 border border-cream-100/50 p-2.5 rounded-lg text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-primary-800 flex items-center gap-1">
                                <span className={`w-1 h-1 rounded-full ${item.category === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {item.name} (₹{item.price})
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditBookingFoodStatusToggle(idx)}
                                  className={`px-2 py-1 text-[8px] font-bold uppercase rounded border transition-all ${
                                    isUnavailable
                                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100/50'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
                                  }`}
                                >
                                  {isUnavailable ? 'Available' : 'Unavailable'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditBookingFoodRemove(idx)}
                                  className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Replacement select dropdown inside edit booking modal */}
                            {isUnavailable && (
                              <div className="bg-white border border-cream-200 p-2 rounded flex flex-col gap-1.5 text-[10px]">
                                <label className="text-[9px] font-bold text-gray-450 uppercase">Replacement:</label>
                                <select
                                  value={item.replacedWith?.id || ''}
                                  onChange={(e) => handleEditBookingFoodReplace(idx, e.target.value)}
                                  className="bg-cream-50 border border-cream-200 rounded p-1 text-[10px] font-semibold text-primary-800"
                                >
                                  <option value="">-- No Replacement --</option>
                                  {foodMenu
                                    .filter(f => f.category === item.category && f.id !== item.id)
                                    .map(f => (
                                      <option key={f.id} value={f.id}>
                                        {f.name} (₹{f.price})
                                      </option>
                                    ))}
                                </select>
                                {item.replacedWith && (
                                  <span className="text-[9px] text-gold-600 font-bold text-right block mt-0.5">
                                    Price: ₹{item.replacedWith.price}
                                  </span>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Amount Overriding & Price Sync Panel */}
                <div className="bg-cream-50/50 border border-cream-150 p-4 rounded-luxury space-y-3 pt-3">
                  <h5 className="font-bold text-xs text-primary-850 border-b border-cream-100 pb-1.5 uppercase tracking-wide">
                    Amount & Recalculation
                  </h5>
                  
                  <div className="flex justify-between text-xs text-neutral-500 font-medium">
                    <span>Base Hall Rent:</span>
                    <span>₹{editForm.costPerDay.toLocaleString('en-IN')}.00</span>
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500 font-medium">
                    <span>Catering Food Subtotal:</span>
                    <span>₹{recalculatedFoodTotal.toLocaleString('en-IN')}.00</span>
                  </div>

                  {/* Form amount field input override */}
                  <div className="space-y-1.5 pt-2 border-t border-cream-100/50">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Booking Contract Amount (₹)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editForm.totalAmount}
                        onChange={(e) => setEditForm(prev => {
                          if (!prev) return null;
                          return { ...prev, totalAmount: parseFloat(e.target.value) || 0 };
                        })}
                        className="flex-1 bg-white border border-cream-250 rounded p-2 text-xs font-bold text-primary-800 outline-none focus:border-gold-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => {
                          if (!prev) return null;
                          return { ...prev, totalAmount: recalculatedBookingTotal };
                        })}
                        className="px-3 py-1.5 bg-gold-50 hover:bg-gold-100 hover:text-gold-700 text-[10px] font-bold text-gold-600 rounded border border-gold-200/50 transition-all uppercase tracking-wide"
                        title="Use the recalculated sum of base hall + food"
                      >
                        Recalculate Total
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-cream-50 p-5 border-t border-cream-100 flex justify-end gap-2 text-xs rounded-b-luxury-lg">
              <button
                type="button"
                onClick={() => setIsEditBookingOpen(false)}
                className="px-4 py-2 border border-cream-200 hover:bg-cream-100 text-neutral-600 text-xs font-bold rounded-luxury transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveTrigger('booking')}
                className={`px-5 py-2 text-white text-xs font-bold rounded-luxury shadow-md transition-all ${
                  isSaving 
                    ? 'bg-gold-450 cursor-not-allowed opacity-70' 
                      : 'bg-gold-500 hover:bg-gold-600 hover:shadow-lg'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Booking'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Styled State confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury shadow-luxury-2xl p-6 w-full max-w-sm text-center animate-scaleIn">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 mx-auto mb-4 text-amber-500">
              <AlertTriangle size={24} />
            </div>
            
            <h4 className="font-bold text-sm text-primary-800 tracking-wide font-serif">
              Confirm Update
            </h4>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              {confirmAction === 'food' 
                ? 'Are you sure you want to update the food items for this booking?'
                : 'Are you sure you want to update this booking?'}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 border border-cream-200 hover:bg-cream-50 text-neutral-500 text-xs font-bold rounded-luxury transition-all"
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold rounded-luxury shadow-md hover:shadow-lg transition-all"
              >
                Yes, Save
              </button>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
    </div>
  );
};

export default BookingsPage;
