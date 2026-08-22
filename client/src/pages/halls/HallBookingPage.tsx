import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hallApi, HallAvailabilityResponse } from '../../api/hallApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import DashboardCard from '../../components/dashboard/DashboardCard';
import {
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
  Utensils,
  Camera,
  Music,
  Heart,
  Truck
} from 'lucide-react';

// Mapped assets for halls
const getHallAssets = (hallCode: string, name: string) => {
  const code = (hallCode || '').toUpperCase();
  const nameLower = (name || '').toLowerCase();
  if (code === 'HALL-A' || nameLower.includes('taj mahal')) {
    return {
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      facilities: ['Central A/C', 'Luxury Chandelier Lighting', 'Premium JBL Sound System', 'Two VIP Lounges', 'Large Decor Stage', '24/7 Power Backup']
    };
  }
  if (code === 'T-LGA' || nameLower.includes('luxury grand') || nameLower.includes('arena')) {
    return {
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
      facilities: ['Central A/C', 'Spacious Seating Area', 'Concert-Grade Sound System', 'Dressing Rooms', 'Separate Dining Hall', 'Valet Parking']
    };
  }
  return {
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
    facilities: ['Spacious Stage', 'Standard Sound System', 'Dining Chairs & Tables', 'Changing Rooms']
  };
};

const AVAILABLE_SERVICES = [
  { id: 'decoration', name: 'Premium Theme Decoration', price: 25000, icon: Sparkles, desc: 'Full stage floral decoration and lighting setup' },
  { id: 'catering', name: 'Luxury Catering Package', price: 45000, icon: Utensils, desc: 'Unlimited Veg & Non-Veg buffet for guests' },
  { id: 'photography', name: 'Cinematic Photography & Video', price: 30000, icon: Camera, desc: '2 Photographers, 1 Videographer, and album' },
  { id: 'dj', name: 'DJ & Sound System', price: 15000, icon: Music, desc: 'Professional DJ with subwoofer sound & dance floor' },
  { id: 'flower', name: 'Entrance Flower Decoration', price: 10000, icon: Heart, desc: 'Fresh flower arch decoration at entry gates' },
  { id: 'transportation', name: 'Guest Transportation / Valet', price: 12000, icon: Truck, desc: 'Bus transport for close guests & valet staff' }
];

export const HallBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const { id: routeHallId } = useParams<{ id?: string }>();

  // Current step state
  const [step, setStep] = useState(1);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [eventType, setEventType] = useState('Wedding Ceremony');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [guestCount, setGuestCount] = useState<number>(200);

  // Selected Hall & Available Halls lists
  const [selectedHallId, setSelectedHallId] = useState<string>(routeHallId || '');
  const [hallsList, setHallsList] = useState<HallAvailabilityResponse['halls']>([]);

  // Services selection
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Customer info (prefilled if user is logged in)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Booking result response
  const [bookingResult, setBookingResult] = useState<BookingDetails | null>(null);

  // Calendar navigation state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarCache, setCalendarCache] = useState<Record<string, { halls: any[]; allBooked: boolean }>>({});

  // ----------------------------------------------------
  // Sync router param hall ID
  // ----------------------------------------------------
  useEffect(() => {
    if (routeHallId) {
      setSelectedHallId(routeHallId);
    }
  }, [routeHallId]);

  // ----------------------------------------------------
  // Initial date pre-fill
  // ----------------------------------------------------
  useEffect(() => {
    // Default event date is 35 days from now (since backend limits online booking to > 30 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 35);
    const dateStr = futureDate.toISOString().split('T')[0];
    setEventDate(dateStr);
    setCurrentCalendarDate(futureDate);
  }, []);

  // ----------------------------------------------------
  // Fetch Availability for Calendar and Selection list
  // ----------------------------------------------------
  const fetchAvailabilityForDate = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      setLoading(true);
      const res = await hallApi.checkAvailability(dateStr, startTime, endTime);
      setHallsList(res.halls);
      // Cache date status
      const allBooked = res.halls.length > 0 && res.halls.every(h => !h.available);
      setCalendarCache(prev => ({
        ...prev,
        [dateStr]: { halls: res.halls, allBooked }
      }));
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      addToast(err.message || 'Failed to check hall availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when date or time selection changes
  useEffect(() => {
    if (eventDate && step === 2) {
      fetchAvailabilityForDate(eventDate);
    }
  }, [eventDate, startTime, endTime, step]);

  // Fetch visibility cache for visible month days in background
  const fetchMonthAvailability = async (year: number, month: number) => {
    setLoadingCalendar(true);
    try {
      const datesToFetch: string[] = [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        // Skip past dates
        const dateObj = new Date(dayStr);
        dateObj.setHours(23, 59, 59, 999);
        if (dateObj >= new Date() && !calendarCache[dayStr]) {
          datesToFetch.push(dayStr);
        }
      }

      // Fetch in chunks of 5 to avoid overloading
      const chunkSize = 5;
      for (let i = 0; i < datesToFetch.length; i += chunkSize) {
        const chunk = datesToFetch.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (d) => {
            try {
              const res = await hallApi.checkAvailability(d, startTime, endTime);
              const allBooked = res.halls.length > 0 && res.halls.every(h => !h.available);
              setCalendarCache(prev => ({
                ...prev,
                [d]: { halls: res.halls, allBooked }
              }));
            } catch {
              // Ignore failure for individual background dates
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      fetchMonthAvailability(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    }
  }, [currentCalendarDate, step]);

  // ----------------------------------------------------
  // Navigation handlers
  // ----------------------------------------------------
  const handleNextStep = () => {
    if (step === 1) {
      if (!eventType) {
        addToast('Please select an event type.', 'warning');
        return;
      }
      if (!eventDate) {
        addToast('Please select a date.', 'warning');
        return;
      }
      const selectedDateObj = new Date(eventDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDateObj < today) {
        addToast('Cannot book events in the past.', 'warning');
        return;
      }
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() + 30);
      if (selectedDateObj < limitDate) {
        addToast('Online booking is only available for dates at least 30 days in advance.', 'warning');
        return;
      }
      if (startTime >= endTime) {
        addToast('End time must be after start time.', 'warning');
        return;
      }
      if (guestCount <= 0) {
        addToast('Guest count must be greater than zero.', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedHallId) {
        addToast('Please select a function hall.', 'warning');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (!customerName.trim()) {
        addToast('Please enter customer name.', 'warning');
        return;
      }
      if (!customerPhone.trim() || customerPhone.length < 10) {
        addToast('Please enter a valid 10-digit mobile number.', 'warning');
        return;
      }
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        addToast('Please enter a valid email address.', 'warning');
        return;
      }
      if (!customerAddress.trim()) {
        addToast('Please enter billing address.', 'warning');
        return;
      }
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ----------------------------------------------------
  // Calculations
  // ----------------------------------------------------
  const selectedHall = hallsList.find(h => h.id === selectedHallId);
  const hallPrice = selectedHall ? selectedHall.basePrice : 0;
  
  const servicesTotal = AVAILABLE_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
    
  const grandTotal = hallPrice + servicesTotal;

  // ----------------------------------------------------
  // Submit Booking Form with Availability Verification
  // ----------------------------------------------------
  const handleSubmitBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. RE-VERIFY AVAILABILITY SECURELY BEFORE SUBMISSION
      const verifyRes = await hallApi.checkAvailability(eventDate, startTime, endTime);
      const targetHall = verifyRes.halls.find(h => h.id === selectedHallId);
      
      if (!targetHall || !targetHall.available) {
        setErrorMsg('This hall is no longer available for the selected date.');
        addToast('Hall is no longer available. Please select another date/time or hall.', 'error');
        setStep(2); // Send back to hall selection
        setLoading(false);
        return;
      }

      // 2. PROCEED TO SUBMIT BOOKING
      const notesCombined = `${specialNotes ? `Notes: ${specialNotes}. ` : ''}Services Selected: ${
        AVAILABLE_SERVICES.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', ')
      }. Billing Address: ${customerAddress}`;

      const res = await bookingApi.create({
        hallId: selectedHallId,
        eventType,
        eventDate,
        startTime,
        endTime,
        guestCount,
        notes: notesCombined
      });

      if (res.success) {
        setBookingResult(res.booking);
        addToast('Event booked successfully!', 'success');
        setStep(6);
      } else {
        throw new Error(res.message || 'Failed to complete booking.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during booking. Please try again.');
      addToast(err.message || 'Booking failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Services handlers
  // ----------------------------------------------------
  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  // ----------------------------------------------------
  // Calendar generation helpers
  // ----------------------------------------------------
  const handleMonthChange = (direction: 'next' | 'prev') => {
    const nextDate = new Date(currentCalendarDate);
    if (direction === 'next') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() - 1);
    }
    setCurrentCalendarDate(nextDate);
  };

  const generateDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Empty spaces for previous month's overlapping days
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({
        dateStr: '',
        dayNum: prevLastDay - i + 1,
        isCurrentMonth: false,
        disabled: true
      });
    }

    // Days of the current month
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30); // 30 days limit

    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      dateObj.setHours(23, 59, 59, 999);

      const isPast = dateObj < new Date();
      const under30Days = dateObj < limitDate;
      const isSelectable = !isPast && !under30Days;
      const isSelected = eventDate === dateStr;

      // Check cache for availability status
      const cached = calendarCache[dateStr];
      const isFullyBooked = cached ? cached.allBooked : false;

      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        disabled: !isSelectable,
        isFullyBooked,
        isSelected
      });
    }

    return days;
  };

  const calendarDays = generateDays();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-serif text-primary-800 tracking-tight">
          Reserve Venue Hall
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Complete the steps below to reserve one of our luxury function halls for your special event.
        </p>
      </div>

      {/* Progress Stepper Row */}
      {step < 6 && (
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-[700px] justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            {[
              { num: 1, label: 'Event Details' },
              { num: 2, label: 'Hall & Date' },
              { num: 3, label: 'Add-on Services' },
              { num: 4, label: 'Customer Details' },
              { num: 5, label: 'Review Booking' }
            ].map((s) => (
              <React.Fragment key={s.num}>
                <div
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${
                    step === s.num
                      ? 'border-primary-800 text-primary-800'
                      : step > s.num
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent'
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white ${
                      step === s.num ? 'bg-primary-800' : step > s.num ? 'bg-green-600' : 'bg-neutral-300'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
                {s.num < 5 && <ChevronRight size={14} className="text-neutral-300" />}
              </React.Fragment>
            ))}
=======
import { useParams, useNavigate, Link } from 'react-router';
import { 
  Home, ChevronRight, User, Mail, Phone, Calendar, ShieldCheck, 
  ShieldAlert, Sparkles, Building, MapPin, Loader2, Download,
  ChevronDown, ChevronUp, Utensils
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sampleHalls } from '../../constants/hallsData';
import { createHallBooking } from '../../api/bookingApi';
import { generateHallBookingPDF } from '../../services/pdfService';
import { useNotifications } from '../../contexts/NotificationContext';
import { getFoodItems, FoodItem } from '../../api/foodApi';

export const HallBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Find Hall info
  const hall = sampleHalls.find((h) => h.id === id);

  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventType, setEventType] = useState<string>('Marriage Function');
  const [eventSession, setEventSession] = useState<string>('Full Day');
  const [guestsCount, setGuestsCount] = useState<number>(100);
  
  const [bookingDate] = useState<string>(
    new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  );

  // Status state
  const [dateError, setDateError] = useState<string>('');
  const [guestsError, setGuestsError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Food items state
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem[]>([]);
  const [isVegExpanded, setIsVegExpanded] = useState<boolean>(false);
  const [isNonVegExpanded, setIsNonVegExpanded] = useState<boolean>(false);

  // Autofill user details
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
    }
  }, [user]);

  // Load active food items from backend
  useEffect(() => {
    async function loadFoodItems() {
      try {
        const data = await getFoodItems();
        setFoodMenu(data.filter(item => item.active));
      } catch (err: any) {
        console.error('Failed to fetch food items:', err);
      }
    }
    loadFoodItems();
  }, []);

  const handleFoodItemToggle = (item: FoodItem) => {
    setSelectedFood(prev => {
      const exists = prev.some(f => f.id === item.id);
      if (exists) {
        return prev.filter(f => f.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const foodTotal = selectedFood.reduce((sum, item) => sum + item.price, 0);
  const totalContractValue = (hall?.costPerDay || 0) + foodTotal;

  // Date validation check (Runs on input change)
  const handleDateChange = (dateString: string) => {
    setEventDate(dateString);
    setDateError('');

    if (!dateString) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      setDateError(
        "Online booking is closed because the event date is within one month. Please contact customer care."
      );
    }
  };

  // Guests validation check
  const handleGuestsChange = (val: number) => {
    setGuestsCount(val);
    setGuestsError('');

    if (hall && val > hall.capacity) {
      setGuestsError(`Guest count exceeds the hall capacity of ${hall.capacity} guests.`);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hall) return;

    if (!customerName || !email || !mobile || !eventDate) {
      addToast('Please fill in all the required form fields.', 'warning');
      return;
    }

    if (dateError) {
      addToast('Please choose a valid event date meeting the booking rule.', 'warning');
      return;
    }

    if (guestsError) {
      addToast(guestsError, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user?.id || 'USR-ANON',
        customerName,
        email,
        mobile,
        state: hall.state,
        district: hall.district,
        mandal: hall.mandal,
        hallId: hall.id,
        hallName: hall.name,
        hallAddress: hall.address,
        eventDate,
        costPerDay: hall.costPerDay,
        totalAmount: totalContractValue,
        capacity: hall.capacity,
        eventType,
        guestsCount,
        eventSession,
        foodItems: selectedFood.map(f => ({ id: f.id, name: f.name, price: f.price }))
      };

      const response = await createHallBooking(payload);
      setSuccessBooking(response.booking);
      addToast('Hall booking successfully confirmed!', 'success');
    } catch (err: any) {
      addToast(err.message || 'An error occurred during booking creation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Receipt Download
  const handleDownloadPDF = () => {
    if (successBooking) {
      let parsedFood = [];
      if (successBooking.foodItems) {
        try {
          parsedFood = typeof successBooking.foodItems === 'string' 
            ? JSON.parse(successBooking.foodItems) 
            : successBooking.foodItems;
        } catch (e) {
          console.error('Error parsing booking food items for PDF:', e);
        }
      }
      generateHallBookingPDF({
        bookingId: successBooking.bookingId,
        customerName: successBooking.customerName,
        email: successBooking.email,
        mobile: successBooking.mobile,
        state: successBooking.state,
        district: successBooking.district,
        mandal: successBooking.mandal,
        hallName: successBooking.hallName,
        hallAddress: successBooking.hallAddress,
        eventDate: successBooking.eventDate,
        bookingDate: successBooking.bookingDate,
        costPerDay: successBooking.costPerDay,
        totalAmount: successBooking.totalAmount,
        status: successBooking.status,
        eventType: successBooking.eventType,
        guestsCount: successBooking.guestsCount,
        eventSession: successBooking.eventSession,
        foodItems: parsedFood
      });
    }
  };

  if (!hall) {
    return (
      <div className="bg-cream-50 min-h-screen py-16 text-center font-sans">
        <div className="bg-white border border-cream-200 rounded-luxury p-8 max-w-md mx-auto shadow-luxury">
          <h3 className="font-bold text-lg text-primary-800 mb-2">Venue Reference Error</h3>
          <p className="text-neutral-400 text-xs mb-6">Invalid hall selected for booking registration.</p>
          <Link to="/halls" className="bg-primary-800 text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-primary-900 transition-all inline-block shadow">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-gold-500 transition-all flex items-center gap-1">
            <Home size={13} className="text-gold-500" />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to="/halls" className="hover:text-gold-500 transition-all">Function Halls</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to={`/halls/${hall.id}`} className="hover:text-gold-500 transition-all">{hall.name}</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-primary-800 font-medium">Checkout</span>
        </div>

        {/* Title Block */}
        <div className="mb-8 border-b border-cream-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 tracking-wide">
            Book Function Hall
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Complete details below to submit your event reservation request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Form Side (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Customer Info Card */}
              <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
                <div className="flex items-center gap-2.5 mb-5 border-b border-cream-100 pb-3">
                  <User size={18} className="text-gold-500" />
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Customer Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><User size={14} /></span>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Mail size={14} /></span>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Phone size={14} /></span>
                      <input
                        type="tel"
                        required
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event & Schedule Details Card */}
              <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
                <div className="flex items-center gap-2.5 mb-5 border-b border-cream-100 pb-3">
                  <Calendar size={18} className="text-gold-500" />
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Event & Schedule Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Booking Date */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Booking Request Date
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"><Calendar size={14} /></span>
                      <input
                        type="text"
                        readOnly
                        value={bookingDate}
                        className="w-full bg-cream-50/50 border border-cream-150 rounded-lg p-2.5 pl-10 text-xs font-semibold text-neutral-400 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Calendar size={14} /></span>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className={`w-full bg-cream-50 border rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer ${
                          dateError ? 'border-red-500 focus:border-red-500' : 'border-cream-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Event Type Select */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer"
                    >
                      <option value="Marriage Function">Marriage Function</option>
                      <option value="Birthday Celebration">Birthday Celebration</option>
                      <option value="Engagement Party">Engagement Party</option>
                      <option value="Saree Function">Saree Function</option>
                      <option value="General Event">General Event</option>
                    </select>
                  </div>

                  {/* Required Session Select */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Required Session <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eventSession}
                      onChange={(e) => setEventSession(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer"
                    >
                      <option value="Morning Session">Morning Session (6 AM - 2 PM)</option>
                      <option value="Evening Session">Evening Session (3 PM - 11 PM)</option>
                      <option value="Full Day">Full Day (6 AM - 11 PM)</option>
                    </select>
                  </div>

                  {/* Number of Guests */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                      Number of Guests <span className="text-red-500">*</span> (Max: {hall.capacity})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={hall.capacity}
                      required
                      value={guestsCount}
                      onChange={(e) => handleGuestsChange(parseInt(e.target.value) || 0)}
                      className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                        guestsError ? 'border-red-500 focus:border-red-500' : 'border-cream-200'
                      }`}
                    />
                    {guestsError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1.5">{guestsError}</p>
                    )}
                  </div>
                </div>

                {/* Validation Notice Box */}
                {dateError ? (
                  <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">{dateError}</p>
                  </div>
                ) : (
                  <div className="mt-5 bg-amber-50/70 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs">Advance Booking Policy</h4>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        Please note online booking is open only for events scheduled at least <strong>30 days</strong> from today. Booking inside 30 days is blocked.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Food Items Selection Card */}
              <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
                <div className="flex items-center gap-2.5 mb-5 border-b border-cream-100 pb-3">
                  <Utensils size={18} className="text-gold-500" />
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Catering & Food Item Selection</h3>
                </div>

                <div className="space-y-4">
                  {/* VEG Category */}
                  <div className="border border-cream-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsVegExpanded(!isVegExpanded)}
                      className="w-full flex items-center justify-between p-3.5 bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider outline-none hover:bg-emerald-100/70 transition-all text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        VEG MENU
                      </span>
                      {isVegExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isVegExpanded && (
                      <div className="p-4 bg-white divide-y divide-cream-100 space-y-3">
                        {foodMenu.filter(item => item.category === 'VEG').length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No vegetarian items available.</p>
                        ) : (
                          foodMenu.filter(item => item.category === 'VEG').map(item => (
                            <label
                              key={item.id}
                              className="flex items-center justify-between py-2 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedFood.some(f => f.id === item.id)}
                                  onChange={() => handleFoodItemToggle(item)}
                                  className="w-4 h-4 rounded border-cream-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-500"
                                />
                                <span className="text-xs font-semibold text-primary-800 group-hover:text-gold-600 transition-all">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-gold-600">₹{item.price}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* NON-VEG Category */}
                  <div className="border border-cream-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsNonVegExpanded(!isNonVegExpanded)}
                      className="w-full flex items-center justify-between p-3.5 bg-rose-50 text-rose-800 font-bold text-xs uppercase tracking-wider outline-none hover:bg-rose-100/70 transition-all text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        NON-VEG MENU
                      </span>
                      {isNonVegExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isNonVegExpanded && (
                      <div className="p-4 bg-white divide-y divide-cream-100 space-y-3">
                        {foodMenu.filter(item => item.category === 'NON-VEG').length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No non-vegetarian items available.</p>
                        ) : (
                          foodMenu.filter(item => item.category === 'NON-VEG').map(item => (
                            <label
                              key={item.id}
                              className="flex items-center justify-between py-2 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedFood.some(f => f.id === item.id)}
                                  onChange={() => handleFoodItemToggle(item)}
                                  className="w-4 h-4 rounded border-cream-300 text-gold-500 focus:ring-gold-500 cursor-pointer accent-gold-500"
                                />
                                <span className="text-xs font-semibold text-primary-800 group-hover:text-gold-600 transition-all">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-gold-600">₹{item.price}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Food Subtotal Display */}
                  <div className="mt-4 pt-3 border-t border-cream-100 flex justify-between items-center bg-cream-50/50 -mx-6 px-6 py-3 rounded-b-luxury">
                    <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Food Selection Total:</span>
                    <span className="text-sm font-extrabold text-gold-600">₹{foodTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/halls/${hall.id}`)}
                  className="bg-cream-100 hover:bg-cream-200 border border-cream-200 text-primary-800 font-bold text-xs py-3 px-6 rounded-lg transition-all shadow"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !!dateError || !!guestsError || !eventDate}
                  className="flex-1 bg-gold-500 text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Confirming Reservation...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Confirm & Place Booking
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Booking Summary Sidebar (Right 1/3) */}
          <div className="w-full">
            <div className="bg-white border border-cream-250 rounded-luxury p-6 shadow-luxury-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-800"></div>

              <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-4">
                <Building size={16} className="text-gold-500" />
                <h3 className="font-bold text-sm text-primary-800 tracking-wide font-serif">Booking Summary</h3>
              </div>

              {/* Venue details summary */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-primary-800 text-[13px]">{hall.name}</h4>
                  <div className="flex items-start gap-1 text-[11px] text-gray-500 mt-1">
                    <MapPin size={12} className="shrink-0 text-gold-500 mt-0.5" />
                    <span>{hall.address}</span>
                  </div>
                </div>

                <div className="border-t border-cream-100 pt-3 space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>State:</span>
                    <span className="font-bold text-primary-800">{hall.state}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>District:</span>
                    <span className="font-bold text-primary-800">{hall.district}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Mandal:</span>
                    <span className="font-bold text-primary-800">{hall.mandal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Capacity:</span>
                    <span className="font-bold text-primary-800">{hall.capacity} Guests</span>
                  </div>
                  {eventDate && (
                    <div className="flex justify-between text-gray-500">
                      <span>Event Date:</span>
                      <span className="font-bold text-gold-600 bg-gold-50 px-1.5 py-0.5 rounded text-[10px]">{eventDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Event Type:</span>
                    <span className="font-bold text-primary-800">{eventType}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Session:</span>
                    <span className="font-bold text-primary-800">{eventSession}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Guests count:</span>
                    <span className="font-bold text-primary-800">{guestsCount}</span>
                  </div>
                  {selectedFood.length > 0 && (
                    <div className="flex justify-between text-gray-500 flex-col gap-1 border-t border-cream-100 pt-3">
                      <span className="font-bold text-primary-850 uppercase text-[9px] tracking-wider">Selected Food items:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedFood.map(item => (
                          <span key={item.id} className="bg-cream-100 text-primary-800 border border-cream-200 px-1.5 py-0.5 rounded text-[10px]">
                            {item.name} (₹{item.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Costs breakdown */}
                <div className="border-t border-cream-100 pt-4 space-y-2 bg-cream-50/50 -mx-6 px-6 py-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Hall Rental (1 Day):</span>
                    <span className="font-semibold text-primary-800">₹{hall.costPerDay.toLocaleString('en-IN')}.00</span>
                  </div>
                  {foodTotal > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Food Selection ({selectedFood.length} items):</span>
                      <span className="font-semibold text-primary-800">₹{foodTotal.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & GST:</span>
                    <span className="font-semibold text-green-700">₹0.00 (Inclusive)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-cream-150">
                    <span className="font-bold text-primary-800 text-sm">Total Contract:</span>
                    <span className="font-extrabold text-gold-600 text-lg">
                      ₹{totalContractValue.toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Success Modal */}
      {successBooking && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-md w-full p-8 text-center shadow-luxury-lg relative overflow-hidden">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Sparkles size={28} className="animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-primary-800 mb-2">
              Booking Successful!
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Your function hall reservation is confirmed and stored in our database. An email receipt has been dispatched.
            </p>

            {/* Booking Details Card */}
            <div className="bg-cream-50 border border-cream-200 rounded-luxury p-4 mb-6 space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID:</span>
                <span className="font-mono font-bold text-gold-600 text-sm">#{successBooking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hall Name:</span>
                <span className="font-bold text-primary-800">{successBooking.hallName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Event Date:</span>
                <span className="font-bold text-primary-800">{successBooking.eventDate} ({successBooking.eventSession})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Event Type:</span>
                <span className="font-bold text-primary-800">{successBooking.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Number of Guests:</span>
                <span className="font-bold text-primary-800">{successBooking.guestsCount} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Booking Amount:</span>
                <span className="font-bold text-gold-600">₹{successBooking.totalAmount.toLocaleString('en-IN')}.00</span>
              </div>
              {successBooking.foodItems && (() => {
                try {
                  const foodList = typeof successBooking.foodItems === 'string' 
                    ? JSON.parse(successBooking.foodItems) 
                    : successBooking.foodItems;
                  if (foodList && foodList.length > 0) {
                    return (
                      <div className="flex flex-col gap-1 border-t border-cream-200 pt-2.5 mt-2.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Food Catering Selected:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {foodList.map((item: any) => (
                            <span key={item.id} className="bg-white border border-cream-200 px-2 py-0.5 rounded text-[10px] text-primary-800 font-semibold shadow-sm">
                              {item.name} (₹{item.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch(e) {}
                return null;
              })()}
              <div className="flex justify-between border-t border-cream-200 pt-2.5 mt-2.5">
                <span className="text-gray-400">Booking Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded text-[10px] uppercase">
                  {successBooking.status}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-gold-500 text-white font-bold text-xs py-3 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow"
              >
                <Download size={14} />
                Download Invoice PDF
              </button>
              
              <button
                onClick={() => navigate('/user/bookings')}
                className="w-full bg-primary-800 text-white font-bold text-xs py-3 rounded-lg hover:bg-primary-900 transition-all flex items-center justify-center gap-2 shadow"
              >
                Go to My Bookings
              </button>
            </div>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Main Form content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Multi-step Screens */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: EVENT DETAILS */}
          {step === 1 && (
            <DashboardCard title="Event Details" subtitle="Provide date, guest counts and timelines">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                    Event Occasion
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full border border-cream-200 p-3 rounded-luxury text-sm bg-white focus:ring-1 focus:ring-gold-500 focus:outline-none focus:border-gold-500"
                  >
                    <option>Wedding Ceremony</option>
                    <option>Birthday Party</option>
                    <option>Engagement Ceremony</option>
                    <option>Corporate Seminar</option>
                    <option>Saree Function</option>
                    <option>Dawath / Reception</option>
                    <option>General Social Gathering</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Timelines: Start Session
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <Clock size={16} />
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Timelines: End Session
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <Clock size={16} />
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Expected Guests Count
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <Users size={16} />
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                        placeholder="e.g. 250"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Estimate helps determine appropriate hall layouts.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Target Date
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <CalendarIcon size={16} />
                      </span>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <p className="text-[10px] text-gold-600 font-medium mt-1">
                      ⚠️ Note: Bookings must be selected at least 30 days in advance.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Choose Venue Hall</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 2: CALENDAR & HALL SELECTION */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Responsive Calendar Card */}
              <DashboardCard title="Availability Calendar" subtitle="Select your preferred date (dates under 30 days are locked)">
                <div className="space-y-4">
                  
                  {/* Calendar Header Controls */}
                  <div className="flex justify-between items-center bg-cream-50/50 p-3 rounded-luxury border border-cream-200">
                    <button
                      onClick={() => handleMonthChange('prev')}
                      className="p-1.5 text-primary-800 hover:bg-cream-100 rounded-full transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="text-sm font-bold text-primary-800 font-serif flex items-center gap-2">
                      <span>{monthName} {currentCalendarDate.getFullYear()}</span>
                      {loadingCalendar && <span className="h-3 w-3 animate-spin rounded-full border border-primary-800 border-t-transparent inline-block"></span>}
                    </div>
                    <button
                      onClick={() => handleMonthChange('next')}
                      className="p-1.5 text-primary-800 hover:bg-cream-100 rounded-full transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white shadow-sm">
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
                        const cellClass = day.isSelected
                          ? 'bg-primary-800 text-white font-bold'
                          : day.disabled
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : day.isFullyBooked
                          ? 'bg-red-50 text-red-500 cursor-not-allowed font-medium'
                          : 'bg-white text-primary-800 hover:bg-cream-50 cursor-pointer';

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (!day.disabled && day.dateStr) {
                                setEventDate(day.dateStr);
                              }
                            }}
                            className={`min-h-[50px] p-2 flex flex-col items-center justify-between transition-all ${cellClass}`}
                          >
                            <span className="text-[11px] self-start font-mono">{day.dayNum}</span>
                            {day.dateStr && (
                              <span className="text-[8px] font-bold uppercase tracking-wider scale-90">
                                {day.disabled ? (
                                  'Locked'
                                ) : day.isFullyBooked ? (
                                  'Full'
                                ) : day.isSelected ? (
                                  'Selected'
                                ) : (
                                  'Available'
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar Legend indicators */}
                  <div className="flex flex-wrap gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 border border-cream-200 rounded bg-white"></span>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 border border-primary-800 rounded bg-primary-800"></span>
                      <span>Selected Date</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 border border-red-200 rounded bg-red-50"></span>
                      <span>No Halls Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 border border-gray-200 rounded bg-gray-50"></span>
                      <span>Past / Under 30 Days</span>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              {/* Hall Cards displaying availability */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary-800 font-serif">
                  Available Venue Halls for {eventDate}
                </h4>

                {loading ? (
                  <div className="bg-white border border-cream-200 p-12 rounded-luxury text-center shadow-sm flex flex-col items-center justify-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading Halls Availability...</p>
                  </div>
                ) : hallsList.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-luxury text-center">
                    <AlertTriangle className="mx-auto text-yellow-600 mb-2" size={24} />
                    <p className="text-sm font-semibold text-yellow-800">No active function halls found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {hallsList.map((hall) => {
                      const assets = getHallAssets(hall.hallCode, hall.name);
                      const isSelected = selectedHallId === hall.id;

                      return (
                        <div
                          key={hall.id}
                          className={`bg-white border rounded-luxury overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row ${
                            isSelected ? 'border-primary-800 ring-2 ring-primary-100' : 'border-cream-200'
                          }`}
                        >
                          {/* Card Image */}
                          <div className="md:w-2/5 relative h-48 md:h-auto">
                            <img
                              src={assets.image}
                              alt={hall.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shadow ${
                                  hall.available ? 'bg-green-600' : 'bg-red-600'
                                }`}
                              >
                                {hall.available ? 'Available' : 'Booked'}
                              </span>
                            </div>
                          </div>

                          {/* Card Content details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <h5 className="font-bold text-base text-primary-800 font-serif">{hall.name}</h5>
                                <p className="text-sm font-bold text-gold-600 font-mono">₹{Number(hall.basePrice).toLocaleString('en-IN')}</p>
                              </div>
                              <p className="text-xs text-neutral-400 mt-1">{hall.description || 'Luxury convention venue with state-of-the-art facilities.'}</p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-500 mt-3">
                                <span className="flex items-center gap-1"><Users size={12} className="text-gold-500" /> Max: {hall.capacity || 500}</span>
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-gold-500" /> {hall.location || 'Main Venue'}</span>
                              </div>

                              <div className="mt-3.5">
                                <p className="text-[9px] font-bold text-primary-800 uppercase tracking-wider mb-1">Facilities Provided:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {assets.facilities.map((fac, i) => (
                                    <span key={i} className="bg-cream-50 text-neutral-600 border border-cream-200 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                      {fac}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-cream-100">
                              {hall.available ? (
                                <button
                                  onClick={() => setSelectedHallId(hall.id)}
                                  className={`px-4 py-2 rounded-luxury text-xs font-bold uppercase tracking-wider transition-all border ${
                                    isSelected
                                      ? 'bg-primary-800 text-white border-primary-800'
                                      : 'bg-white text-primary-800 border-primary-800 hover:bg-primary-50'
                                  }`}
                                >
                                  {isSelected ? '✓ Selected' : 'Select Hall'}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="bg-neutral-100 border border-neutral-200 text-neutral-400 px-4 py-2 rounded-luxury text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                                >
                                  Unavailable
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="border border-primary-800 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-primary-50 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <ChevronLeft size={14} />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={!selectedHallId}
                  className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury disabled:bg-primary-300 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Select Services</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICES SELECTION */}
          {step === 3 && (
            <DashboardCard title="Additional Event Services" subtitle="Choose add-on services and equipment rentals (Optional)">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_SERVICES.map((s) => {
                    const isChecked = selectedServices.includes(s.id);
                    const SvgIcon = s.icon;
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`border rounded-luxury p-4 cursor-pointer hover:border-gold-400 transition-all flex items-start gap-4 ${
                          isChecked ? 'border-primary-800 bg-primary-50/10' : 'border-cream-200'
                        }`}
                      >
                        <div className={`p-2.5 rounded-luxury ${isChecked ? 'bg-primary-800 text-white' : 'bg-cream-50 text-gold-500'}`}>
                          <SvgIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-xs text-primary-800 truncate">{s.name}</p>
                            <p className="text-xs font-bold text-gold-600 font-mono flex-shrink-0">₹{s.price.toLocaleString('en-IN')}</p>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{s.desc}</p>
                          <div className="mt-2.5 flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-cream-300 text-primary-800 focus:ring-primary-800 h-3.5 w-3.5"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              {isChecked ? 'Added to booking' : 'Add service'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between border-t border-cream-100">
                  <button
                    onClick={handlePrevStep}
                    className="border border-primary-800 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-primary-50 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    <span>Select Hall</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Contact Info</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}
          {step === 4 && (
            <DashboardCard title="Customer Contact Details" subtitle="Provide coordinator details and billing information">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Coordinator Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <UserIcon size={16} />
                      </span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="Coordinator's full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                      placeholder="e.g. user@gkevent.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                    Billing / Permanent Address
                  </label>
                  <textarea
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full border border-cream-200 p-3 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Enter full address for invoices..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary-800 mb-1.5">
                    Special Requirements / Instruction notes
                  </label>
                  <textarea
                    rows={3}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full border border-cream-200 p-3 rounded-luxury text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Specify caterers timings, decor themes, VIP lists, etc..."
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-between border-t border-cream-100">
                  <button
                    onClick={handlePrevStep}
                    className="border border-primary-800 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-primary-50 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    <span>Select Services</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Review Reservation</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 5: REVIEW BOOKING DETAILS */}
          {step === 5 && (
            <DashboardCard title="Review Booking Details" subtitle="Please verify all parameters before submitting invoice request">
              <div className="space-y-6">
                
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-luxury text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="border border-cream-200 rounded-luxury overflow-hidden divide-y divide-cream-100">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Occasion</p>
                      <p className="font-bold text-primary-800 mt-1">{eventType}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Function Date</p>
                      <p className="font-bold text-primary-800 mt-1">{eventDate}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Timings Slot</p>
                      <p className="font-bold text-primary-800 mt-1">{startTime} to {endTime}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Expected Guests</p>
                      <p className="font-bold text-primary-800 mt-1">{guestCount} pax</p>
                    </div>
                  </div>

                  <div className="p-4 text-xs">
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Selected Venue Hall</p>
                    <p className="font-bold text-primary-800 mt-1 text-sm font-serif">{selectedHall?.name}</p>
                    <p className="text-neutral-400 mt-0.5 text-[11px]">📍 {selectedHall?.location || 'Main Block'}</p>
                  </div>

                  <div className="p-4 text-xs">
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Add-on Services</p>
                    {selectedServices.length === 0 ? (
                      <p className="text-neutral-400 mt-1 italic">No extra services selected</p>
                    ) : (
                      <ul className="list-disc pl-4 space-y-1.5 mt-2 font-medium text-neutral-600">
                        {AVAILABLE_SERVICES.filter(s => selectedServices.includes(s.id)).map(s => (
                          <li key={s.id} className="flex justify-between">
                            <span>{s.name}</span>
                            <span className="font-mono text-gold-600">₹{s.price.toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-4 text-xs">
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Coordinator Details</p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <p className="font-medium text-primary-800">🧑 {customerName}</p>
                      <p className="font-medium text-primary-800">📞 {customerPhone}</p>
                      <p className="font-medium text-primary-800">✉️ {customerEmail}</p>
                    </div>
                    <p className="text-neutral-500 mt-2 leading-relaxed">🏡 {customerAddress}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t border-cream-100">
                  <button
                    disabled={loading}
                    onClick={handlePrevStep}
                    className="border border-primary-800 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-primary-50 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    <span>Contact Info</span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={handleSubmitBooking}
                    className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center gap-2 disabled:bg-primary-300"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Verifying & Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Booking Request</span>
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 6: BOOKING CONFIRMATION SUCCESS */}
          {step === 6 && bookingResult && (
            <DashboardCard title="Booking Request Submitted" subtitle="Your venue booking has been recorded. Reference billing summary below.">
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                
                <div>
                  <h4 className="text-xl font-bold font-serif text-primary-800">Reservation Confirmed!</h4>
                  <p className="text-xs text-neutral-400 mt-1">Booking reference ID is secure in our audit databases.</p>
                </div>

                <div className="max-w-md mx-auto border border-cream-200 rounded-luxury p-5 bg-cream-50/10 text-left text-xs divide-y divide-cream-100">
                  <div className="pb-3 flex justify-between">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Booking Reference</span>
                    <span className="font-mono font-bold text-gold-600">#{bookingResult.bookingNumber}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Target Event Date</span>
                    <span className="font-bold text-primary-800">{new Date(bookingResult.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Selected Venue</span>
                    <span className="font-bold text-primary-800 truncate max-w-[200px]">{selectedHall?.name}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Booking Status</span>
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {bookingResult.status}
                    </span>
                  </div>

                  <div className="pt-3 flex justify-between text-sm font-bold text-primary-800">
                    <span>Total Secured Invoice</span>
                    <span className="font-mono text-gold-600">₹{Number(bookingResult.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => navigate('/user/bookings')}
                    className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>View My Bookings</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="border border-cream-200 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-cream-50 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Home size={14} />
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

        </div>

        {/* Right 1 Column: Invoice Summary (Sticky Side Panel) */}
        {step < 6 && (
          <div className="lg:col-span-1">
            <div className="sticky top-6 border border-cream-200 bg-cream-50/20 rounded-luxury p-5 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-primary-800 font-serif border-b border-cream-100 pb-2">
                Booking Cost Summary
              </h4>

              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Occasion:</span>
                  <span className="font-bold text-primary-800">{eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Date:</span>
                  <span className="font-bold text-primary-800">{eventDate || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Guests:</span>
                  <span className="font-bold text-primary-800">{guestCount} guests</span>
                </div>
              </div>

              <div className="border-t border-cream-100 pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Venue Rent:</span>
                  <span className="font-semibold text-primary-800 font-mono">
                    ₹{hallPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Extra Services:</span>
                  <span className="font-semibold text-primary-800 font-mono">
                    ₹{servicesTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border-t border-cream-100 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Estimated Total</span>
                <span className="text-lg font-bold text-gold-600 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedHall && (
                <div className="bg-white border border-cream-200 p-3 rounded-luxury space-y-1 text-[11px] text-neutral-500">
                  <p className="font-bold text-primary-800">📍 {selectedHall.name}</p>
                  <p>Capacity: {selectedHall.capacity} Pax</p>
                  <p>Base price: ₹{Number(selectedHall.basePrice).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
=======
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
    </div>
  );
};

export default HallBookingPage;
