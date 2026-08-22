import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hallApi } from '../../api/hallApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { 
  Home, Camera, Gift, Heart, Check, X, ShieldAlert, ChevronRight, ChevronLeft,
  Calendar, AlertTriangle, CheckCircle2
=======
import { Link } from 'react-router';
import { 
  Home, Camera, Gift, Heart, Check, X, ShieldAlert, ChevronRight, Calendar,
  ChevronDown, ChevronUp, Utensils
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
} from 'lucide-react';
import { getFoodItems, FoodItem } from '../../api/foodApi';

interface Service {
  id: string;
  name: string;
  price: number;
  category: 'wedding' | 'photography' | 'food';
  description?: string;
  iconName: string;
  perPlate?: boolean;
}

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

export const EventBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const { type: urlType } = useParams<{ type?: string }>();

  // Occasion display name
  const occasionDisplayName = urlType
    ? urlType.charAt(0).toUpperCase() + urlType.slice(1).replace('-', ' ') + ' Booking'
    : 'Event Booking';

  // Available Services
  const services: Service[] = [
    // Wedding Services
    { id: 'haldi', name: 'Haldi', price: 10000, category: 'wedding', iconName: 'haldi' },
    { id: 'sangeet', name: 'Sangeet', price: 15000, category: 'wedding', iconName: 'sangeet' },
    { id: 'mehndi', name: 'Mehndi', price: 12000, category: 'wedding', iconName: 'mehndi' },
    { id: 'baraat', name: 'Baraat', price: 20000, category: 'wedding', iconName: 'baraat' },
    { id: 'reception', name: 'Reception', price: 25000, category: 'wedding', iconName: 'reception' },
    
    // Photography
    { id: 'pre-wedding', name: 'Pre Wedding Shoot', price: 30000, category: 'photography', iconName: 'camera' },
    { id: 'wedding-shoot', name: 'Wedding Shoot', price: 50000, category: 'photography', iconName: 'couple' },
    { id: 'photography', name: 'Photography', price: 15000, category: 'photography', iconName: 'dslr' },
    
  ];

  // Stepper state
  const [step, setStep] = useState(1);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 states
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'sangeet',
    'mehndi',
    'wedding-shoot'
  ]);
<<<<<<< HEAD
  const [platesCount, setPlatesCount] = useState<number>(100);

  // Step 2 states (Event details & coordinator info)
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 3 states (Halls availability grid)
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [hallsList, setHallsList] = useState<any[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarCache, setCalendarCache] = useState<Record<string, { halls: any[]; allBooked: boolean }>>({});

  // Step 4 state (Booking response result)
  const [bookingResult, setBookingResult] = useState<BookingDetails | null>(null);

  // ----------------------------------------------------
  // Sync details on mount
  // ----------------------------------------------------
  useEffect(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 35); // Default is 35 days in advance
    const dateStr = futureDate.toISOString().split('T')[0];
    setEventDate(dateStr);
    setCurrentCalendarDate(futureDate);
  }, []);

  // Fetch hall list availability for review page
  const fetchHallsAvailability = async (dateStr: string) => {
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
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to check hall availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventDate && step === 3) {
      fetchHallsAvailability(eventDate);
    }
  }, [eventDate, startTime, endTime, step]);

  // Fetch calendar month days in background
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
            } catch {}
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
    if (step === 3) {
      fetchMonthAvailability(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    }
  }, [currentCalendarDate, step]);

  // ----------------------------------------------------
  // Selection Logic
  // ----------------------------------------------------
=======

  const [platesCount, setPlatesCount] = useState<number>(100);

  // Food items state
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem[]>([]);
  const [isVegExpanded, setIsVegExpanded] = useState<boolean>(false);
  const [isNonVegExpanded, setIsNonVegExpanded] = useState<boolean>(false);

  // Load active food items from backend
  useEffect(() => {
    async function loadFoodItems() {
      try {
        const data = await getFoodItems();
        setFoodMenu(data.filter(item => item.active));
      } catch (err: any) {
        console.error('Failed to load food menu:', err);
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

  // Handle card selection
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
  const handleToggleService = (id: string, category: string) => {
    if (category === 'food') {
      setSelectedIds((prev) => {
        const filtered = prev.filter(
          (item) => !services.find((s) => s.id === item)?.perPlate
        );
        return prev.includes(id) ? filtered : [...filtered, id];
      });
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const handleRemoveService = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));

  // Calculations
<<<<<<< HEAD
  const foodServiceSelected = selectedServices.find((s) => s.perPlate);
  const foodCost = foodServiceSelected ? foodServiceSelected.price * platesCount : 0;
=======
  const hasFood = selectedFood.length > 0;
  const foodPricePerPlate = selectedFood.reduce((sum, item) => sum + item.price, 0);
  const foodCost = foodPricePerPlate * platesCount;
  
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
  const nonFoodCost = selectedServices
    .reduce((sum, s) => sum + s.price, 0);

  const servicesSubtotal = nonFoodCost + foodCost;

  // Selected Hall base price
  const chosenHall = hallsList.find(h => h.id === selectedHallId);
  const hallRent = chosenHall ? chosenHall.basePrice : 0;

  const subtotal = servicesSubtotal + hallRent;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // ----------------------------------------------------
  // Stepper navigation
  // ----------------------------------------------------
  const handleNextStep = () => {
    if (step === 1) {
      if (selectedServices.length === 0) {
        addToast('Please select at least one service.', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
      if (!customerName.trim()) {
        addToast('Please enter coordinator name.', 'warning');
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
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Submit secure booking request
  const handleSubmitBooking = async () => {
    if (!selectedHallId) {
      addToast('Please select an available venue hall.', 'warning');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. RE-VERIFY AVAILABILITY
      const verifyRes = await hallApi.checkAvailability(eventDate, startTime, endTime);
      const targetHall = verifyRes.halls.find(h => h.id === selectedHallId);
      if (!targetHall || !targetHall.available) {
        setErrorMsg('This hall is no longer available for the selected date.');
        addToast('Selected hall is no longer available. Please select another date or hall.', 'error');
        setLoading(false);
        return;
      }

      // 2. CREATE BOOKING
      const notesCombined = `${specialNotes ? `Notes: ${specialNotes}. ` : ''}Services: ${
        selectedServices.map(s => s.name + (s.perPlate ? ` (${platesCount} plates)` : '')).join(', ')
      }. Address: ${customerAddress}`;

      const res = await bookingApi.create({
        hallId: selectedHallId,
        eventType: urlType ? urlType.charAt(0).toUpperCase() + urlType.slice(1) + ' Function' : 'General Function',
        eventDate,
        startTime,
        endTime,
        guestCount: platesCount, // Pax matches plates count
        notes: notesCombined
      });

      if (res.success) {
        setBookingResult(res.booking);
        addToast('Booking completed successfully!', 'success');
        setStep(4);
      } else {
        throw new Error(res.message || 'Failed to submit booking request.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
      addToast(err.message || 'Booking submission failed.', 'error');
    } finally {
      setLoading(false);
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
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({
        dateStr: '',
        dayNum: prevLastDay - i + 1,
        isCurrentMonth: false,
        disabled: true
      });
    }

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30); // 30 days lock

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

  // Custom Icon Rendering
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'haldi':
        return (
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
              <path d="M12 2C8 2 5 5 5 9C5 13 8 16 12 16C16 16 19 13 19 9C19 5 16 2 12 2Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5"/>
              <ellipse cx="12" cy="9" rx="4" ry="2" fill="#FBBF24"/>
              <path d="M7 16H17V20H7V16Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'sangeet':
        return (
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-600">
              <circle cx="8" cy="14" r="4" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5"/>
              <circle cx="16" cy="14" r="4" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5"/>
              <path d="M12 5V14M12 5L18 8V12" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 10H10M14 10H18" stroke="#EA580C" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'mehndi':
        return (
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2C10 2 8 4 9 7C10 10 7 11 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 11 14 10 15 7C16 4 14 2 12 2Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="1.5" fill="#16A34A"/>
              <path d="M9 13H15" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M12 13V16" stroke="#16A34A" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'baraat':
        return (
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <path d="M19 10C19 6 16 4 12 4C8 4 5 7 5 11C5 12.5 5.5 13.5 6 14C6.5 14.5 6.5 16.5 6 18H18C17.5 16.5 17.5 14.5 18 14C18.5 13.5 19 12.5 19 10Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="2" fill="#D97706"/>
              <path d="M8 18L10 21M16 18L14 21" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'reception':
        return (
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600">
              <path d="M4 6H20V18H4V6Z" fill="#E9D5FF" stroke="#9333EA" strokeWidth="1.5"/>
              <path d="M4 6C8 10 8 14 4 18M20 6C16 10 16 14 20 18" stroke="#9333EA" strokeWidth="1.5"/>
              <path d="M7 6H17V10H7V6Z" fill="#F3E8FF" stroke="#9333EA" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'camera':
        return (
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              <path d="M4 8H8L10 5H14L16 8H20V18H4V8Z" fill="#BFDBFE" stroke="#2563EB" strokeWidth="1.5"/>
              <circle cx="12" cy="13" r="3" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'couple':
        return (
          <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-pink-600">
              <circle cx="9" cy="7" r="2.5" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.5"/>
              <path d="M5 14C5 11 7 11 9 11C11 11 13 11 13 14" stroke="#DB2777" strokeWidth="1.5"/>
              <circle cx="15" cy="7" r="2.5" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.5"/>
              <path d="M12 14C12 11.5 14 11.5 16 11.5C18 11.5 20 11.5 20 14" stroke="#DB2777" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'dslr':
        return (
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
              <path d="M3 7H7L9 4H15L17 7H21V19H3V7Z" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.5"/>
              <circle cx="12" cy="13" r="3.5" fill="#818CF8" stroke="#4F46E5" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'veg':
        return (
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
              <circle cx="12" cy="12" r="8" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" fill="#059669"/>
            </svg>
          </div>
        );
      case 'non-veg':
        return (
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
              <path d="M12 4C9 4 5 7 5 10C5 13 8 16 11 16C12.5 16 14 15 15 14L19 18L20 17L16 13C17 12 18 10.5 18 9C18 6 15 4 12 4Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5"/>
              <ellipse cx="12" cy="10" rx="3" ry="1.5" fill="#EF4444"/>
            </svg>
          </div>
        );
      case 'both':
        return (
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <circle cx="12" cy="12" r="8" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
              <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12" stroke="#D97706" strokeWidth="1.5"/>
              <circle cx="10" cy="13" r="1.5" fill="#D97706"/>
              <circle cx="14" cy="13" r="1.5" fill="#D97706"/>
            </svg>
          </div>
        );
      default:
        return <Gift size={24} className="text-gold-500" />;
    }
  };

  return (
    <div className="bg-cream-50 font-sans min-h-screen py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-gold-500 transition-all flex items-center gap-1">
            <Home size={13} className="text-gold-500" />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="hover:text-gold-500 cursor-pointer">Event Management</span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-primary-800 font-medium">{urlType ? urlType.charAt(0).toUpperCase() + urlType.slice(1) : 'Event'} Function</span>
        </div>

        {/* Title and Stepper Tracker */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-cream-200 pb-6 bg-white p-6 rounded-luxury shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 tracking-wide">
              {occasionDisplayName}
            </h1>
            <div className="flex items-center gap-1 mt-1 mb-2">
              <div className="h-[1px] w-6 bg-gold-400"></div>
              <div className="w-1 h-1 rounded-full bg-gold-500"></div>
              <div className="h-[1px] w-6 bg-gold-400"></div>
            </div>
            <p className="text-xs text-neutral-500">
              {step === 1 && 'Select the services you need for your special day'}
              {step === 2 && 'Provide event details and coordinator contact info'}
              {step === 3 && 'Choose a function hall and review reservation invoice'}
              {step === 4 && 'Your event has been successfully reserved!'}
            </p>
          </div>

          {/* Stepper progress indicator */}
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto overflow-x-auto py-1">
            {[
              { num: 1, label: 'Select Services' },
              { num: 2, label: 'Event Details' },
              { num: 3, label: 'Review & Confirm' },
              { num: 4, label: 'Booking Summary' }
            ].map((s) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    step === s.num
                      ? 'bg-gold-500 text-white shadow-md'
                      : step > s.num
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-cream-300 text-gray-400'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <div className="text-[10px]">
                    <p className={`font-bold leading-none ${
                      step === s.num ? 'text-gold-600' : step > s.num ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {s.num < 4 && <div className={`h-[1px] w-6 sm:w-10 ${step > s.num ? 'bg-green-600' : 'bg-cream-300'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* STEP 1: SERVICES SELECTION */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Services Panels */}
            <div className="lg:col-span-2 space-y-8">
              {/* Wedding Services */}
              <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
                <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Heart size={18} /></div>
                  <div>
                    <h3 className="font-bold text-sm text-primary-800 tracking-wide">Wedding Services</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Traditional wedding ceremony services</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {services
                    .filter((s) => s.category === 'wedding')
                    .map((service) => {
                      const isSelected = selectedIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleToggleService(service.id, 'wedding')}
                          className={`border rounded-luxury p-3 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                            isSelected
                              ? 'border-gold-500 bg-gold-50/10 shadow-md'
                              : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-gold-500 border-gold-500 text-white' : 'border-cream-300 bg-white group-hover:border-gold-400'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="my-auto">{renderIcon(service.iconName)}</div>
                          <div className="mt-3">
                            <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                            <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Photography Services */}
              <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
                <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Camera size={18} /></div>
                  <div>
                    <h3 className="font-bold text-sm text-primary-800 tracking-wide">Photography Services</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Capture your beautiful moments</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {services
                    .filter((s) => s.category === 'photography')
                    .map((service) => {
                      const isSelected = selectedIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleToggleService(service.id, 'photography')}
                          className={`border rounded-luxury p-4 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                            isSelected ? 'border-gold-500 bg-gold-50/10 shadow-md' : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-gold-500 border-gold-500 text-white' : 'border-cream-300 bg-white group-hover:border-gold-400'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="my-auto">{renderIcon(service.iconName)}</div>
                          <div className="mt-3">
                            <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                            <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Food Services */}
              <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
                <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Gift size={18} /></div>
                  <div>
                    <h3 className="font-bold text-sm text-primary-800 tracking-wide">Food Services</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Delicious food for your guests</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {services
                    .filter((s) => s.category === 'food')
                    .map((service) => {
                      const isSelected = selectedIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleToggleService(service.id, 'food')}
                          className={`border rounded-luxury p-4 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                            isSelected ? 'border-gold-500 bg-gold-50/10 shadow-md' : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-gold-500 border-gold-500 text-white' : 'border-cream-300 bg-white group-hover:border-gold-400'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="my-auto">{renderIcon(service.iconName)}</div>
                          <div className="mt-3">
                            <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                            <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price} / Plate</p>
                          </div>
                        </div>
<<<<<<< HEAD
                      );
                    })}
                </div>
              </div>

              {/* Booking Rule Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-luxury p-5 flex items-start gap-4 shadow-sm">
                <div className="bg-amber-500 text-white p-1 rounded-full shrink-0 mt-0.5">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-800">Booking Rule</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                    Event date must be at least 30 days from the current date. If the event date is within 30 days, online booking is closed. Please contact customer care support.
                  </p>
=======
                        
                        <div className="mt-3">
                          <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                          <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Food Services category */}
            <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
              <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Utensils size={18} /></div>
                <div>
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Food Services</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Select multiple food items for Veg and Non-Veg categories</p>
                </div>
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

                {/* Subtotal Display */}
                <div className="mt-4 pt-3 border-t border-cream-100 flex justify-between items-center bg-cream-50/50 -mx-6 px-6 py-3 rounded-b-luxury">
                  <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Price per Plate:</span>
                  <span className="text-sm font-extrabold text-gold-600">₹{foodPricePerPlate.toLocaleString('en-IN')}.00</span>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
                </div>
              </div>

            </div>

            {/* Right Summary Sidebar */}
            <div className="w-full">
              <div className="bg-white p-6 border border-cream-200 rounded-luxury shadow-luxury bg-white relative space-y-5">
                <div className="flex items-center gap-2 border-b border-cream-100 pb-4">
                  <Calendar size={18} className="text-gold-500" />
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Booking Summary</h3>
                </div>

                <div className="space-y-4">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block">Selected Services</span>
                  {selectedServices.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 italic">
                      No services selected yet. Please select services from the panels.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedServices.map((service) => {
                        const itemCost = service.perPlate ? service.price * platesCount : service.price;
                        return (
                          <div key={service.id} className="flex items-center justify-between gap-3 text-xs bg-cream-50/50 p-2.5 rounded-lg border border-cream-100/50">
                            <div className="flex items-center gap-2">
                              <span className="text-gold-500 font-bold">•</span>
                              <div>
                                <p className="font-bold text-primary-800 text-[11px]">{service.name}</p>
                                {service.perPlate && (
                                  <p className="text-[9px] text-gray-400 font-medium">{platesCount} Plates</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-semibold text-primary-800">₹{itemCost.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() => handleRemoveService(service.id)}
                                className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Plates counter */}
                {foodServiceSelected && (
                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between text-xs">
                    <div>
                      <label htmlFor="plates" className="font-bold text-[11px] text-primary-800 block">Total Plates</label>
                      <span className="text-[9px] text-gray-400">Min 50 guests</span>
                    </div>
                    <div className="flex items-center gap-1 bg-cream-50 border border-cream-200 rounded-lg p-1">
                      <button 
                        onClick={() => setPlatesCount((p) => Math.max(50, p - 10))} 
                        className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="plates"
                        min={50}
                        value={platesCount}
                        onChange={(e) => setPlatesCount(Math.max(50, parseInt(e.target.value) || 0))}
                        className="w-12 text-center bg-transparent font-bold text-primary-800 outline-none text-[11px]"
                      />
                      <button 
                        onClick={() => setPlatesCount((p) => p + 10)} 
                        className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Calculations details */}
                <div className="pt-4 border-t border-cream-100 space-y-2 text-xs">
                  {foodServiceSelected && (
                    <div className="flex justify-between text-gray-500">
                      <span>Price per Plate</span>
                      <span className="font-medium text-neutral-800">₹{foodServiceSelected.price}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Services Subtotal</span>
                    <span className="font-semibold text-neutral-800">₹{servicesSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-neutral-800">₹{Math.round(servicesSubtotal * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t border-cream-100/50">
                    <span className="font-bold text-primary-800 text-sm">Est. Services Cost</span>
                    <span className="font-extrabold text-gold-600 text-lg">
                      ₹{Math.round(servicesSubtotal * 1.05).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 italic mt-2">
                    * Note: Venue hall rent fee will be added during hall selection step.
                  </p>
                </div>

                {/* Next button */}
                <button 
                  onClick={handleNextStep}
                  className="w-full mt-4 py-3 bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Next: Event Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: EVENT DETAILS & COORDINATOR DETAILS */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto bg-white border border-cream-200 p-6 rounded-luxury shadow-md space-y-6">
            <h3 className="text-xl font-bold font-serif text-primary-800 border-b border-cream-100 pb-3">
              Event Details & Coordinator Contact Info
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                  <p className="text-[9px] text-gold-600 font-semibold mt-1">
                    ⚠️ Online booking must be made at least 30 days in advance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter invoice billing address..."
                  className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                  Special Requirements
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="E.g. stage layout requirements, food items, etc..."
                  className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                />
              </div>

              <div className="pt-4 flex justify-between border-t border-cream-100">
                <button
                  onClick={handlePrevStep}
                  className="border border-primary-800 text-primary-800 font-bold py-2.5 px-5 rounded-luxury hover:bg-primary-50 transition-all uppercase tracking-wider text-[10px] flex items-center gap-1.5"
                >
                  <ChevronLeft size={12} />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-primary-800 text-white font-bold py-2.5 px-5 rounded-luxury hover:bg-primary-900 transition-all uppercase tracking-wider text-[10px] flex items-center gap-1.5"
                >
                  <span>Choose Venue Hall</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: HALL SELECTION, DATE CALENDAR & SUBMIT */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 Columns: Calendar & Hall Selection Cards */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Calendar Grid */}
              <div className="bg-white border border-cream-200 p-5 rounded-luxury shadow-sm space-y-4">
                <div className="flex justify-between items-center bg-cream-50 p-2.5 rounded-luxury">
                  <button onClick={() => handleMonthChange('prev')} className="p-1 hover:bg-cream-100 rounded-full transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-xs font-bold text-primary-800 font-serif flex items-center gap-2">
                    <span>{monthName} {currentCalendarDate.getFullYear()}</span>
                    {loadingCalendar && <span className="h-3 w-3 animate-spin rounded-full border border-primary-800 border-t-transparent inline-block"></span>}
                  </div>
                  <button onClick={() => handleMonthChange('next')} className="p-1 hover:bg-cream-100 rounded-full transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="border border-cream-150 rounded-luxury overflow-hidden bg-white">
                  <div className="grid grid-cols-7 text-center bg-primary-800 text-white font-bold text-[9px] py-1.5 uppercase tracking-wider">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[11px] divide-x divide-y divide-cream-100">
                    {calendarDays.map((day, idx) => {
                      const isSelected = eventDate === day.dateStr;
                      const cellClass = isSelected
                        ? 'bg-primary-800 text-white font-bold'
                        : day.disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : day.isFullyBooked
                        ? 'bg-red-50 text-red-500 font-semibold cursor-not-allowed'
                        : 'bg-white text-primary-800 hover:bg-cream-50 cursor-pointer';

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!day.disabled && day.dateStr) {
                              setEventDate(day.dateStr);
                            }
                          }}
                          className={`min-h-[48px] p-1.5 flex flex-col items-center justify-between ${cellClass}`}
                        >
                          <span className="self-start font-mono text-[9px]">{day.dayNum}</span>
                          {day.dateStr && (
                            <span className="text-[7px] uppercase font-bold scale-90">
                              {day.disabled ? 'Locked' : day.isFullyBooked ? 'Full' : isSelected ? 'Selected' : 'Available'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hall cards */}
              <div className="space-y-4">
<<<<<<< HEAD
                <h4 className="font-bold text-sm text-primary-800 font-serif">
                  Select Function Hall for {eventDate}
                </h4>

                {loading ? (
                  <div className="bg-white border border-cream-200 p-12 rounded-luxury text-center flex flex-col items-center justify-center gap-2">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fetching halls availability...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hallsList.map((hall) => {
                      const assets = getHallAssets(hall.hallCode, hall.name);
                      const isSelected = selectedHallId === hall.id;

                      return (
                        <div
                          key={hall.id}
                          className={`bg-white border rounded-luxury overflow-hidden shadow-sm flex flex-col sm:flex-row transition-all ${
                            isSelected ? 'border-primary-800 ring-2 ring-primary-50' : 'border-cream-200'
                          }`}
                        >
                          <div className="sm:w-1/3 relative h-36 sm:h-auto">
                            <img src={assets.image} alt={hall.name} className="w-full h-full object-cover" />
                            <span className={`absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white shadow ${
                              hall.available ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {hall.available ? 'Available' : 'Booked'}
                            </span>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <h5 className="font-bold text-primary-800 font-serif text-sm">{hall.name}</h5>
                                <p className="font-bold text-gold-600 font-mono text-xs">₹{Number(hall.basePrice).toLocaleString('en-IN')}</p>
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-1">{hall.description || 'Luxury function hall'}</p>
                              
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500 mt-2">
                                <span>🧑 Capacity: {hall.capacity || 500} pax</span>
                                <span>📍 Location: {hall.location || 'Block A'}</span>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {assets.facilities.map((fac, i) => (
                                  <span key={i} className="bg-cream-50 text-neutral-600 border border-cream-150 text-[8px] font-medium px-2 py-0.5 rounded-full">
                                    {fac}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end pt-2.5 border-t border-cream-100">
                              {hall.available ? (
                                <button
                                  onClick={() => setSelectedHallId(hall.id)}
                                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                    isSelected
                                      ? 'bg-primary-800 text-white border-primary-800'
                                      : 'bg-white text-primary-800 border-primary-800 hover:bg-primary-50'
                                  }`}
                                >
                                  {isSelected ? '✓ Selected' : 'Select Hall'}
                                </button>
                              ) : (
                                <button disabled className="bg-gray-150 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
                                  Unavailable
                                </button>
                              )}
                            </div>
                          </div>
=======
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block">Selected Services</span>
                
                {selectedServices.length === 0 && !hasFood ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic">
                    No services selected yet. Please select services from the panels.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {/* Non-food services */}
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between gap-3 text-xs bg-cream-50/50 p-2.5 rounded-lg border border-cream-100/50">
                        <div className="flex items-center gap-2">
                          <span className="text-gold-500 font-bold">•</span>
                          <div>
                            <p className="font-bold text-primary-800 text-[11px]">{service.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-primary-800">₹{service.price.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Food catering items */}
                    {hasFood && (
                      <div className="flex flex-col gap-1.5 text-xs bg-cream-50/50 p-2.5 rounded-lg border border-cream-100/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <div>
                              <p className="font-bold text-primary-800 text-[11px]">Catering Selection</p>
                              <p className="text-[9px] text-gray-400 font-medium">{platesCount} Plates</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-primary-800">₹{foodCost.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => setSelectedFood([])}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50"
                            >
                              <X size={12} />
                            </button>
                          </div>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1 border-t border-cream-100/50 pt-1.5">
                          {selectedFood.map(item => (
                            <span key={item.id} className="bg-white border border-cream-200 text-primary-800 px-1.5 py-0.5 rounded text-[9px]">
                              {item.name} (₹{item.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

<<<<<<< HEAD
            {/* Right Summary Sidebar */}
            <div className="w-full">
              <div className="bg-white border border-cream-200 p-5 rounded-luxury shadow-sm space-y-4 text-xs">
                <h4 className="font-bold text-primary-800 font-serif border-b border-cream-100 pb-2 text-sm">
                  Invoice Recap
                </h4>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-[11px] font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
=======
              {/* Plate count input (Dynamic control matching screenshot) */}
              {hasFood && (
                <div className="mt-5 pt-4 border-t border-cream-100 flex items-center justify-between text-xs">
                  <div>
                    <label htmlFor="plates" className="font-bold text-[11px] text-primary-800 block">Total Plates</label>
                    <span className="text-[9px] text-gray-400">Min 50 guests</span>
                  </div>
                  <div className="flex items-center gap-1 bg-cream-50 border border-cream-200 rounded-lg p-1">
                    <button 
                      onClick={() => setPlatesCount((p) => Math.max(50, p - 10))} 
                      className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="plates"
                      min={50}
                      value={platesCount}
                      onChange={(e) => setPlatesCount(Math.max(50, parseInt(e.target.value) || 0))}
                      className="w-12 text-center bg-transparent font-bold text-primary-800 outline-none text-[11px]"
                    />
                    <button 
                      onClick={() => setPlatesCount((p) => p + 10)} 
                      className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Price calculations details */}
              <div className="mt-6 pt-5 border-t border-cream-100 space-y-2 text-xs">
                {hasFood && (
                  <div className="flex justify-between text-gray-500">
                    <span>Price per Plate ({selectedFood.length} items)</span>
                    <span className="font-medium text-neutral-800">₹{foodPricePerPlate}</span>
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
                  </div>
                )}

                <div className="space-y-2 text-neutral-500">
                  <div className="flex justify-between">
                    <span>Selected Hall:</span>
                    <span className="font-bold text-primary-800 truncate max-w-[120px]">
                      {chosenHall ? chosenHall.name : 'None selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Date:</span>
                    <span className="font-bold text-primary-800">{eventDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plates / Guests:</span>
                    <span className="font-bold text-primary-800">{platesCount} pax</span>
                  </div>
                </div>

                <div className="border-t border-cream-100 pt-3 space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Services Total:</span>
                    <span className="font-bold font-mono text-primary-800">₹{servicesSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Hall Rent Fee:</span>
                    <span className="font-bold font-mono text-primary-800">₹{hallRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">GST (5%):</span>
                    <span className="font-bold font-mono text-primary-800">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="border-t border-cream-100 pt-3 flex justify-between items-baseline font-bold">
                  <span className="text-sm text-primary-800 uppercase tracking-wider">Grand Total</span>
                  <span className="text-lg text-gold-600 font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    disabled={loading}
                    onClick={handleSubmitBooking}
                    className="w-full py-3 bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs uppercase tracking-wider rounded-luxury flex items-center justify-center gap-1.5 shadow disabled:bg-primary-300"
                  >
                    {loading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Booking</span>
                        <ChevronRight size={12} />
                      </>
                    )}
                  </button>
                  <button
                    disabled={loading}
                    onClick={handlePrevStep}
                    className="w-full py-2.5 border border-cream-200 hover:bg-cream-50 text-neutral-600 font-bold text-xs uppercase tracking-wider rounded-luxury flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={12} />
                    <span>Back to Details</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: BOOKING SUMMARY CONFIRMATION */}
        {step === 4 && bookingResult && (
          <div className="max-w-md mx-auto bg-white border border-cream-200 rounded-luxury p-6 shadow-md text-center space-y-5 text-xs">
            <div className="mx-auto h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold font-serif text-primary-800">Reservation Completed!</h3>
              <p className="text-[10px] text-neutral-400 mt-1">Your reservation has been recorded successfully in PostgreSQL.</p>
            </div>

            <div className="border border-cream-150 rounded-luxury p-4 bg-cream-50/10 text-left divide-y divide-cream-100 space-y-2">
              <div className="pb-2 flex justify-between">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">Booking ID</span>
                <span className="font-mono font-bold text-gold-600">#{bookingResult.bookingNumber}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">Event Date</span>
                <span className="font-bold text-primary-800">{new Date(bookingResult.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">Venue Hall</span>
                <span className="font-bold text-primary-800">{chosenHall ? chosenHall.name : 'Taj Mahal Ballroom'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">Booking Status</span>
                <span className="bg-yellow-50 text-yellow-700 border border-yellow-250 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                  {bookingResult.status}
                </span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-sm text-primary-800">
                <span>Total Amount Paid</span>
                <span className="font-mono text-gold-600">₹{Number(bookingResult.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/user/bookings')}
                className="bg-primary-800 text-white font-bold py-2.5 px-5 rounded hover:bg-primary-900 transition-all uppercase tracking-wider text-[10px]"
              >
                Go to My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-cream-200 text-primary-800 font-bold py-2.5 px-5 rounded hover:bg-cream-50 transition-all uppercase tracking-wider text-[10px]"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EventBookingPage;
