import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hallApi, HallAvailabilityResponse } from '../../api/hallApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { BookingConfirmationPage } from './BookingConfirmationPage';
import DashboardCard from '../../components/dashboard/DashboardCard';
import {
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
  Utensils,
  Camera,
  Music,
  Heart,
  Truck,
  CreditCard,
  RotateCcw
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

// Helper to dynamically load Razorpay Checkout Script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const HallBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
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

  // Booking result response & pending booking state
  const [bookingResult, setBookingResult] = useState<BookingDetails | null>(null);
  const [pendingBooking, setPendingBooking] = useState<BookingDetails | null>(null);

  // Active Razorpay Modal Fallback for test mode
  const [activePaymentModal, setActivePaymentModal] = useState<{
    booking: BookingDetails;
    razorpayOrder: any;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  // Calendar navigation state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarCache, setCalendarCache] = useState<Record<string, { halls: any[]; allBooked: boolean }>>({});

  // Sync router param hall ID
  useEffect(() => {
    if (routeHallId) {
      setSelectedHallId(routeHallId);
    }
  }, [routeHallId]);

  // Initial date pre-fill (default 35 days from now)
  useEffect(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 35);
    const dateStr = futureDate.toISOString().split('T')[0];
    setEventDate(dateStr);
    setCurrentCalendarDate(futureDate);
  }, []);

  // Fetch Availability for Calendar and Selection list
  const fetchAvailabilityForDate = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      setLoading(true);
      const res = await hallApi.checkAvailability(dateStr, startTime, endTime);
      setHallsList(res.halls);
      const allBooked = res.halls.length > 0 && res.halls.every(h => !h.available);
      setCalendarCache(prev => ({
        ...prev,
        [dateStr]: { halls: res.halls, allBooked }
      }));
      setErrorMsg(null);

      // Auto-normalize selectedHallId with actual available halls from backend
      if (res.halls && res.halls.length > 0) {
        const found = res.halls.find(
          h => h.id === selectedHallId || h.hallCode === selectedHallId || h.id === routeHallId
        );
        if (found) {
          setSelectedHallId(found.id);
        } else {
          const firstAvail = res.halls.find(h => h.available) || res.halls[0];
          if (firstAvail) {
            setSelectedHallId(firstAvail.id);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      addToast(err.message || 'Failed to check hall availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventDate && step === 2) {
      fetchAvailabilityForDate(eventDate);
    }
  }, [eventDate, startTime, endTime, step]);

  const fetchMonthAvailability = async (year: number, month: number) => {
    setLoadingCalendar(true);
    try {
      const datesToFetch: string[] = [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dateObj = new Date(dayStr);
        dateObj.setHours(23, 59, 59, 999);
        if (dateObj >= new Date() && !calendarCache[dayStr]) {
          datesToFetch.push(dayStr);
        }
      }

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

  // Navigation handlers
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
      const chosenHall = hallsList.find(h => h.id === selectedHallId);
      if (!chosenHall) {
        addToast('Selected hall was not found in current availability list.', 'warning');
        return;
      }
      if (!chosenHall.available) {
        addToast('This hall is already booked for the selected date. Please select another date or hall.', 'error');
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

  // Calculations
  const selectedHall = hallsList.find(h => h.id === selectedHallId);
  const hallPrice = selectedHall ? selectedHall.basePrice : 0;
  
  const servicesTotal = AVAILABLE_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
    
  const subtotal = hallPrice + servicesTotal;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  // Complete test payment verification with backend
  const handleCompleteTestPayment = async () => {
    if (!activePaymentModal) return;
    const { booking, razorpayOrder } = activePaymentModal;
    setLoading(true);
    setErrorMsg(null);
    try {
      const fakePaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
      const verifyRes = await paymentApi.verifyRazorpayPayment({
        bookingId: booking.id,
        razorpay_order_id: razorpayOrder.id,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'simulated_test_signature',
      });

      if (verifyRes.success) {
        setBookingResult(verifyRes.booking);
        setActivePaymentModal(null);
        addToast('Payment verified successfully! Booking confirmed.', 'success');
        setStep(6); // Step 6: Confirmation Page
      } else {
        setErrorMsg(verifyRes.message || 'Payment signature verification failed.');
        addToast(verifyRes.message || 'Payment verification failed.', 'error');
      }
    } catch (err: any) {
      console.error('Test payment error:', err);
      setErrorMsg(err.message || 'Failed to verify payment on server.');
      addToast(err.message || 'Server error during payment verification.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Checkout Launch Helper
  const initiateRazorpayPayment = async (bookingObj: BookingDetails, razorpayOrderObj: any) => {
    const keyId = razorpayOrderObj.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

    // Only fallback to interactive modal if NO key exists or if set to dummy placeholder 'rzp_test_placeholder'
    const isDummyPlaceholder = !keyId || keyId === 'rzp_test_placeholder';

    if (isDummyPlaceholder) {
      setActivePaymentModal({ booking: bookingObj, razorpayOrder: razorpayOrderObj });
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setActivePaymentModal({ booking: bookingObj, razorpayOrder: razorpayOrderObj });
      return;
    }

    const options = {
      key: keyId,
      amount: razorpayOrderObj.amount,
      currency: razorpayOrderObj.currency || 'INR',
      name: 'GK BOOKING',
      description: `${eventType} - ${selectedHall?.name || 'Function Hall'}`,
      order_id: razorpayOrderObj.id,
      handler: async function (response: any) {
        setLoading(true);
        setErrorMsg(null);
        try {
          const verifyRes = await paymentApi.verifyRazorpayPayment({
            bookingId: bookingObj.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.success) {
            setBookingResult(verifyRes.booking);
            addToast('Payment verified successfully! Booking confirmed.', 'success');
            setStep(6); // Render Confirmation Page
          } else {
            setErrorMsg(verifyRes.message || 'Payment signature verification failed.');
            addToast('Payment signature verification failed.', 'error');
          }
        } catch (err: any) {
          console.error('Payment verification error:', err);
          setErrorMsg(err.message || 'Payment verification failed on server.');
          addToast(err.message || 'Server error during payment verification.', 'error');
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          // Open interactive test payment modal so user can test and complete payment
          setActivePaymentModal({ booking: bookingObj, razorpayOrder: razorpayOrderObj });
        },
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        bookingId: bookingObj.id,
      },
      theme: {
        color: '#1e3a8a',
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        setActivePaymentModal({ booking: bookingObj, razorpayOrder: razorpayOrderObj });
      });
      rzp.open();
    } catch {
      setActivePaymentModal({ booking: bookingObj, razorpayOrder: razorpayOrderObj });
    }
  };

  // Submit Booking & Initiate Razorpay Payment
  const handleSubmitBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const selectedServicesPayload = AVAILABLE_SERVICES
        .filter(s => selectedServices.includes(s.id))
        .map(s => ({ id: s.id, name: s.name, price: s.price }));

      const res = await bookingApi.createPending({
        hallId: selectedHallId,
        eventType,
        eventDate,
        startTime,
        endTime,
        guestCount,
        selectedServices: selectedServicesPayload,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        specialNotes,
      });

      if (res.success && res.razorpayOrder) {
        setPendingBooking(res.booking);
        await initiateRazorpayPayment(res.booking, res.razorpayOrder);
      } else {
        throw new Error(res.message || 'Failed to create pending booking order.');
      }
    } catch (err: any) {
      console.error('Submit booking error:', err);
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('available'))) {
        setErrorMsg('This hall is no longer available for the selected date. Please select another date or hall.');
        addToast('This hall is no longer available for the selected date. Please select another date or hall.', 'error');
        setStep(2); // Redirect back to calendar hall selection
        fetchAvailabilityForDate(eventDate);
      } else {
        setErrorMsg(err.message || 'An error occurred during booking. Please try again.');
        addToast(err.message || 'Booking submission failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry Payment Handler for Pending Booking
  const handleRetryPayment = async () => {
    if (!pendingBooking) {
      handleSubmitBooking();
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await paymentApi.retryRazorpayOrder(pendingBooking.id);
      if (res.success && res.razorpayOrder) {
        await initiateRazorpayPayment(res.booking, res.razorpayOrder);
      } else {
        throw new Error('Failed to generate retry Razorpay order.');
      }
    } catch (err: any) {
      console.error('Retry payment error:', err);
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('available'))) {
        setErrorMsg('This hall is no longer available for the selected date. Please select another date or hall.');
        addToast('This hall is no longer available for the selected date. Please select another date or hall.', 'error');
        setStep(2);
        fetchAvailabilityForDate(eventDate);
      } else {
        setErrorMsg(err.message || 'Failed to retry payment.');
        addToast(err.message || 'Payment retry failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Services handlers
  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  // Calendar generation helpers
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

    for (let i = firstDayIndex; i > 0; i--) {
      days.push({
        dateStr: '',
        dayNum: prevLastDay - i + 1,
        isCurrentMonth: false,
        disabled: true
      });
    }

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30);

    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      dateObj.setHours(23, 59, 59, 999);

      const isPast = dateObj < new Date();
      const under30Days = dateObj < limitDate;
      const isSelectable = !isPast && !under30Days;
      const isSelected = eventDate === dateStr;

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
              { num: 5, label: 'Review & Pay' }
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
          </div>
        </div>
      )}

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
                    <div className="grid grid-cols-7 text-center bg-primary-800 text-white font-bold text-[10px] py-2 uppercase tracking-wider border-b border-cream-200">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

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
                                  onClick={() => {
                                    setSelectedHallId(hall.id);
                                    setStep(3);
                                  }}
                                  className={`px-4 py-2 rounded-luxury text-xs font-bold uppercase tracking-wider transition-all border ${
                                    isSelected
                                      ? 'bg-primary-800 text-white border-primary-800'
                                      : 'bg-white text-primary-800 border-primary-800 hover:bg-primary-50'
                                  }`}
                                >
                                  {isSelected ? '✓ Selected (Next)' : 'Select Hall & Continue'}
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
                    <span>Review & Pay</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 5: REVIEW BOOKING & RAZORPAY PAYMENT */}
          {step === 5 && (
            <DashboardCard title="Review Booking & Razorpay Payment" subtitle="Verify parameters before proceeding to Razorpay secure checkout">
              <div className="space-y-6">
                
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-luxury text-xs font-bold flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    {pendingBooking && (
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={handleRetryPayment}
                          className="bg-red-700 text-white px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-red-800 inline-flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> TRY AGAIN
                        </button>
                      </div>
                    )}
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

                  {/* Payment Breakdown Notice */}
                  <div className="p-4 bg-cream-50/30 text-xs space-y-2">
                    <p className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Payment Breakdown Summary</p>
                    <div className="flex justify-between text-neutral-600">
                      <span>Hall Base Rent:</span>
                      <span className="font-mono font-semibold">₹{hallPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Add-on Services:</span>
                      <span className="font-mono font-semibold">₹{servicesTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>GST (18%):</span>
                      <span className="font-mono font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-cream-200 pt-2 flex justify-between items-center text-sm font-bold text-primary-800">
                      <span>Grand Total:</span>
                      <span className="font-mono text-base text-gold-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4 border-t border-cream-100">
                  <button
                    disabled={loading}
                    onClick={handlePrevStep}
                    className="border border-primary-800 text-primary-800 font-bold py-3 px-6 rounded-luxury hover:bg-primary-50 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    <span>Contact Info</span>
                  </button>

                  {pendingBooking ? (
                    <button
                      disabled={loading}
                      onClick={handleRetryPayment}
                      className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-luxury shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-gold-300"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          <span>Opening Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>TRY AGAIN — Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={loading}
                      onClick={handleSubmitBooking}
                      className="bg-primary-800 text-white font-bold py-3 px-6 rounded-luxury hover:bg-primary-900 shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-primary-300"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          <span>Securing Order & Opening Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>SUBMIT BOOKING — Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </DashboardCard>
          )}

          {/* STEP 6: BOOKING CONFIRMATION SUCCESS */}
          {step === 6 && (
            <div className="space-y-6">
              <BookingConfirmationPage bookingData={bookingResult || undefined} />
            </div>
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

              <div className="border-t border-cream-100 pt-3 space-y-2 text-xs">
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

                <div className="flex justify-between">
                  <span className="text-neutral-400">GST (18%):</span>
                  <span className="font-semibold text-primary-800 font-mono">
                    ₹{gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border-t border-cream-100 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Grand Total</span>
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

      {/* Interactive Razorpay Payment Modal */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200">
            {/* Header: Razorpay Branded */}
            <div className="bg-[#0c2340] p-5 text-white relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                    ⚡ Razorpay Checkout
                  </span>
                  <h3 className="text-xl font-bold font-serif mt-1 text-white">GK BOOKING</h3>
                  <p className="text-[11px] text-blue-200">
                    Ref: {activePaymentModal.booking.bookingNumber} | Order: {activePaymentModal.razorpayOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setActivePaymentModal(null)}
                  className="text-blue-300 hover:text-white transition-all text-sm font-bold bg-blue-900/50 h-7 w-7 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-800/60 flex justify-between items-baseline">
                <span className="text-xs text-blue-200">Total Amount:</span>
                <span className="text-2xl font-black font-mono text-gold-400">
                  ₹{Number(activePaymentModal.booking.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Body: Select Method */}
            <div className="p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-800">
                Select Payment Option
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Card', icon: '💳' },
                  { id: 'upi', label: 'UPI / QR', icon: '📱' },
                  { id: 'netbanking', label: 'NetBanking', icon: '🏦' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === m.id
                        ? 'border-primary-800 bg-primary-50/50 text-primary-800 font-bold shadow-sm'
                        : 'border-cream-200 hover:border-cream-300 text-neutral-600'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[11px] font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>

              {selectedPaymentMethod === 'card' && (
                <div className="bg-cream-50/50 p-3.5 rounded-xl border border-cream-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Card Number:</span>
                    <span className="font-mono font-bold text-primary-800">4111 •••• •••• 1111</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Expiry / CVV:</span>
                    <span className="font-mono font-bold text-primary-800">12/28 | 123</span>
                  </div>
                  <div className="text-[10px] text-green-700 font-bold bg-green-50 p-1.5 rounded text-center border border-green-200">
                    ✓ Test Card prefilled for immediate checkout
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'upi' && (
                <div className="bg-cream-50/50 p-3.5 rounded-xl border border-cream-200 text-center space-y-2">
                  <p className="text-xs font-bold text-primary-800">Google Pay / PhonePe / Paytm</p>
                  <p className="text-[11px] text-neutral-500">Virtual VPA: customer@razorpay</p>
                  <div className="bg-white p-2 border rounded inline-block">
                    <span className="text-xs font-mono text-neutral-400">[ Simulated QR Code ]</span>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'netbanking' && (
                <div className="bg-cream-50/50 p-3.5 rounded-xl border border-cream-200 space-y-2 text-xs">
                  <p className="text-xs font-bold text-primary-800">Select Bank:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(b => (
                      <span key={b} className="bg-white p-2 rounded border border-cream-200 text-[11px] font-semibold text-center text-neutral-700">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCompleteTestPayment}
                  disabled={loading}
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-luxury flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying Signature...</span>
                    </>
                  ) : (
                    <span>Complete Payment ₹{Number(activePaymentModal.booking.totalAmount).toLocaleString('en-IN')}</span>
                  )}
                </button>

                <button
                  onClick={() => setActivePaymentModal(null)}
                  disabled={loading}
                  className="w-full bg-cream-100 hover:bg-cream-200 text-neutral-600 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all border border-cream-200"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default HallBookingPage;
