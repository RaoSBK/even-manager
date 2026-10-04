import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { hallApi } from '../../api/hallApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { 
  Home, Camera, Gift, Heart, Check, X, ShieldAlert, ChevronRight, ChevronLeft,
  Calendar, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown, Utensils
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

const defaultFoodItems: FoodItem[] = [
  // VEG
  { id: 'v1', name: 'Paneer Tikka', category: 'VEG', price: 180, active: true },
  { id: 'v2', name: 'Hara Bhara Kebab', category: 'VEG', price: 140, active: true },
  { id: 'v3', name: 'Veg Manchurian', category: 'VEG', price: 130, active: true },
  { id: 'v4', name: 'Paneer Butter Masala', category: 'VEG', price: 180, active: true },
  { id: 'v5', name: 'Kadai Paneer', category: 'VEG', price: 180, active: true },
  { id: 'v6', name: 'Dal Makhani', category: 'VEG', price: 130, active: true },
  { id: 'v7', name: 'Veg Biryani', category: 'VEG', price: 160, active: true },
  { id: 'v8', name: 'Jeera Rice', category: 'VEG', price: 90, active: true },
  { id: 'v9', name: 'Veg Pulao', category: 'VEG', price: 120, active: true },
  { id: 'v10', name: 'Butter Naan', category: 'VEG', price: 50, active: true },
  { id: 'v11', name: 'Tandoori Roti', category: 'VEG', price: 35, active: true },
  { id: 'v12', name: 'Veg Raita', category: 'VEG', price: 70, active: true },
  { id: 'v13', name: 'Salad', category: 'VEG', price: 60, active: true },
  { id: 'v14', name: 'Gulab Jamun', category: 'VEG', price: 80, active: true },
  { id: 'v15', name: 'Ice Cream', category: 'VEG', price: 100, active: true },
  // NON-VEG
  { id: 'nv1', name: 'Chicken 65', category: 'NON-VEG', price: 200, active: true },
  { id: 'nv2', name: 'Chicken Tikka', category: 'NON-VEG', price: 220, active: true },
  { id: 'nv3', name: 'Chicken Lollipop', category: 'NON-VEG', price: 230, active: true },
  { id: 'nv4', name: 'Chicken Curry', category: 'NON-VEG', price: 220, active: true },
  { id: 'nv5', name: 'Butter Chicken', category: 'NON-VEG', price: 240, active: true },
  { id: 'nv6', name: 'Chicken Tikka Masala', category: 'NON-VEG', price: 240, active: true },
  { id: 'nv7', name: 'Kadai Chicken', category: 'NON-VEG', price: 230, active: true },
  { id: 'nv8', name: 'Mutton Curry', category: 'NON-VEG', price: 300, active: true },
  { id: 'nv9', name: 'Mutton Rogan Josh', category: 'NON-VEG', price: 320, active: true },
  { id: 'nv10', name: 'Fish Fry', category: 'NON-VEG', price: 250, active: true },
  { id: 'nv11', name: 'Fish Curry', category: 'NON-VEG', price: 260, active: true },
  { id: 'nv12', name: 'Chicken Biryani', category: 'NON-VEG', price: 220, active: true },
  { id: 'nv13', name: 'Mutton Biryani', category: 'NON-VEG', price: 320, active: true },
  { id: 'nv14', name: 'Chicken Pulao', category: 'NON-VEG', price: 200, active: true },
  { id: 'nv15', name: 'Egg Biryani', category: 'NON-VEG', price: 170, active: true },
  { id: 'nv16', name: 'Egg Curry', category: 'NON-VEG', price: 130, active: true },
  { id: 'nv17', name: 'Egg Masala', category: 'NON-VEG', price: 120, active: true },
  { id: 'nv18', name: 'Egg Bhurji', category: 'NON-VEG', price: 100, active: true },
];

export const EventBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const { type: urlType } = useParams<{ type?: string }>();

  // Occasion display name
  const occasionDisplayName = urlType
    ? urlType.charAt(0).toUpperCase() + urlType.slice(1).replace('-', ' ') + ' Booking'
    : 'Event Booking';

  // Available Non-Food Services (Wedding & Photography)
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

  // Step 1 states (Services & Food Menu)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'sangeet',
    'mehndi',
    'wedding-shoot'
  ]);

  // Food Menu items loaded from Database/API
  const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>(defaultFoodItems);
  const [vegExpanded, setVegExpanded] = useState<boolean>(true);
  const [nonVegExpanded, setNonVegExpanded] = useState<boolean>(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(['v4', 'v7', 'nv12']);
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

  // Complete Event Address states
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  // Step 3 states (Halls availability grid)
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [hallsList, setHallsList] = useState<any[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarCache, setCalendarCache] = useState<Record<string, { halls: any[]; allBooked: boolean }>>({});

  // Step 4 state (Booking response result)
  const [bookingResult, setBookingResult] = useState<BookingDetails | null>(null);

  // Sync details on mount
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

  // Load Food Menu items from DB / API so Admin updates auto reflect
  useEffect(() => {
    const fetchFoodMenu = async () => {
      try {
        const items = await getFoodItems();
        if (items && items.length > 0) {
          const activeItems = items.filter((i) => i.active !== false);
          if (activeItems.length > 0) {
            setAllFoodItems(activeItems);
          }
        }
      } catch (err) {
        console.error('Using default food items menu:', err);
      }
    };
    fetchFoodMenu();
  }, []);

  const handleToggleService = (id: string, category: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemoveService = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleToggleFoodItem = (id: string) => {
    setSelectedFoodIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const selectedFoodObjects = allFoodItems.filter((item) => selectedFoodIds.includes(item.id));
  const foodServiceSelected = true;

  // Food calculations
  const foodPerPlateRate = selectedFoodObjects.reduce((sum, item) => sum + item.price, 0);
  const foodCost = foodPerPlateRate * platesCount;

  const nonFoodCost = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const servicesSubtotal = nonFoodCost + foodCost;

  // Selected Hall base price
  const chosenHall = hallsList.find(h => h.id === selectedHallId);
  const hallRent = chosenHall ? chosenHall.basePrice : 0;

  const subtotal = servicesSubtotal + hallRent;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

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
      // Marriage Booking Event Address Validation
      if (urlType?.toLowerCase() === 'marriage') {
        if (!addressLine1.trim()) {
          addToast('Please enter Address Line 1 for Event Address.', 'warning');
          return;
        }
        if (!city.trim()) {
          addToast('Please enter City for Event Address.', 'warning');
          return;
        }
        if (!district.trim()) {
          addToast('Please enter District for Event Address.', 'warning');
          return;
        }
        if (!stateName.trim()) {
          addToast('Please enter State for Event Address.', 'warning');
          return;
        }
        if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
          setPincodeError('PIN Code must be a valid 6-digit number');
          addToast('Please enter a valid 6-digit PIN code.', 'warning');
          return;
        }
      } else if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
        setPincodeError('PIN Code must be a valid 6-digit number');
        addToast('Please enter a valid 6-digit PIN code.', 'warning');
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
      const foodItemsText = selectedFoodObjects.length > 0 
        ? `. Food Menu Items (${selectedFoodObjects.length}): ${selectedFoodObjects.map(f => `${f.name} (₹${f.price})`).join(', ')} [Food Rate: ₹${foodPerPlateRate}/plate]` 
        : '';
      const notesCombined = `${specialNotes ? `Notes: ${specialNotes}. ` : ''}Services: ${
        selectedServices.map(s => s.name + (s.perPlate ? ` (${platesCount} plates)` : '')).join(', ')
      }${foodItemsText}. Address: ${customerAddress}`;

      const res = await bookingApi.create({
        hallId: selectedHallId,
        eventType: urlType ? urlType.charAt(0).toUpperCase() + urlType.slice(1) + ' Function' : 'General Function',
        eventDate,
        startTime,
        endTime,
        guestCount: platesCount, // Pax matches plates count
        notes: notesCombined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        state: stateName.trim() || undefined,
        country: country.trim() || undefined,
        pincode: pincode.trim() || undefined
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

              {/* Food Services Selection UI */}
              <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Gift size={18} /></div>
                    <div>
                      <h3 className="font-bold text-sm text-primary-800 tracking-wide">Food Services & Menu Selection</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Select VEG / NON-VEG dishes for your event menu</p>
                    </div>
                  </div>
                  {selectedFoodObjects.length > 0 && (
                    <span className="bg-gold-50 text-gold-700 border border-gold-200 text-[10px] font-bold px-3 py-1 rounded-full shrink-0">
                      {selectedFoodObjects.length} Dishes Selected (₹{foodPerPlateRate}/plate)
                    </span>
                  )}
                </div>

                {/* VEG Category Accordion */}
                <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setVegExpanded(!vegExpanded)}
                    className="w-full bg-emerald-50/60 hover:bg-emerald-50 p-4 flex items-center justify-between border-b border-cream-150 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                        🌱
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary-800 font-serif flex items-center gap-2">
                          <span>Vegetarian Menu</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">VEG</span>
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          {allFoodItems.filter(i => i.category === 'VEG' && selectedFoodIds.includes(i.id)).length} of {allFoodItems.filter(i => i.category === 'VEG').length} dishes selected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline">
                        {vegExpanded ? 'Collapse Menu' : 'Expand Menu'}
                      </span>
                      {vegExpanded ? <ChevronUp size={16} className="text-emerald-700" /> : <ChevronDown size={16} className="text-emerald-700" />}
                    </div>
                  </button>

                  {vegExpanded && (
                    <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                      {allFoodItems
                        .filter((item) => item.category === 'VEG')
                        .map((item) => {
                          const isChecked = selectedFoodIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleFoodItem(item.id)}
                              className={`p-3 rounded-luxury border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                                isChecked
                                  ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                                  : 'border-cream-200 hover:border-emerald-300 hover:bg-cream-50/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-emerald-600 rounded border-cream-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                                />
                                <span className="text-xs font-semibold text-primary-800 truncate">{item.name}</span>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-700 shrink-0 font-mono">
                                ₹{item.price}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* NON-VEG Category Accordion */}
                <div className="border border-cream-200 rounded-luxury overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setNonVegExpanded(!nonVegExpanded)}
                    className="w-full bg-red-50/60 hover:bg-red-50 p-4 flex items-center justify-between border-b border-cream-150 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-xs border border-red-200 shrink-0">
                        🍖
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary-800 font-serif flex items-center gap-2">
                          <span>Non-Vegetarian Menu</span>
                          <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">NON-VEG</span>
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          {allFoodItems.filter(i => i.category === 'NON-VEG' && selectedFoodIds.includes(i.id)).length} of {allFoodItems.filter(i => i.category === 'NON-VEG').length} dishes selected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider hidden sm:inline">
                        {nonVegExpanded ? 'Collapse Menu' : 'Expand Menu'}
                      </span>
                      {nonVegExpanded ? <ChevronUp size={16} className="text-red-700" /> : <ChevronDown size={16} className="text-red-700" />}
                    </div>
                  </button>

                  {nonVegExpanded && (
                    <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                      {allFoodItems
                        .filter((item) => item.category === 'NON-VEG')
                        .map((item) => {
                          const isChecked = selectedFoodIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleFoodItem(item.id)}
                              className={`p-3 rounded-luxury border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                                isChecked
                                  ? 'border-red-500 bg-red-50/20 shadow-sm'
                                  : 'border-cream-200 hover:border-red-300 hover:bg-cream-50/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-red-600 rounded border-cream-300 focus:ring-red-500 cursor-pointer shrink-0"
                                />
                                <span className="text-xs font-semibold text-primary-800 truncate">{item.name}</span>
                              </div>
                              <span className="text-[11px] font-bold text-red-700 shrink-0 font-mono">
                                ₹{item.price}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
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

                {/* Selected Food Menu Items Section */}
                {foodServiceSelected && (
                  <div className="pt-4 border-t border-cream-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block">Food Menu Items</span>
                      <span className="text-[10px] font-bold text-gold-600 font-mono">₹{foodPerPlateRate}/plate</span>
                    </div>

                    {selectedFoodObjects.length === 0 ? (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        No food items selected yet. Click <strong>VEG</strong> or <strong>NON-VEG</strong> menu panels to choose dishes!
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {selectedFoodObjects.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs bg-cream-50 p-2 rounded border border-cream-100">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${item.category === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              <span className="font-semibold text-primary-800 text-[11px] truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-neutral-600 font-mono">₹{item.price}</span>
                              <button
                                onClick={() => handleToggleFoodItem(item.id)}
                                className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Plates counter */}
                {foodServiceSelected && (
                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between text-xs">
                    <div>
                      <label htmlFor="plates" className="font-bold text-[11px] text-primary-800 block">Total Plates / Guests</label>
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
                    <>
                      <div className="flex justify-between text-gray-500">
                        <span>Food Rate per Plate</span>
                        <span className="font-bold text-neutral-800 font-mono">₹{foodPerPlateRate}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Total Food Cost ({platesCount} plates)</span>
                        <span className="font-bold text-neutral-800 font-mono">₹{foodCost.toLocaleString('en-IN')}</span>
                      </div>
                    </>
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

              {/* Event Address Section */}
              <div className="border-t border-cream-200 pt-5 mt-6 space-y-4">
                <h4 className="text-sm font-bold font-serif text-primary-800 tracking-wide uppercase flex items-center gap-1">
                  <span>Event Address</span>
                  <span className="text-red-500">*</span>
                </h4>

                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House/Building No., Street/Road, Area/Locality"
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                    Address Line 2 <span className="text-gray-400 font-normal text-[10px] lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Landmark"
                    className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District"
                      className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="w-full border border-cream-200 p-2.5 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPincode(val);
                        if (pincodeError) setPincodeError('');
                      }}
                      placeholder="6-digit PIN code"
                      className={`w-full border p-2.5 rounded-luxury focus:outline-none focus:ring-1 text-sm ${
                        pincodeError ? 'border-red-500 focus:ring-red-500' : 'border-cream-200 focus:ring-gold-500'
                      }`}
                    />
                    {pincodeError && <p className="text-[10px] text-red-500 font-bold mt-1">{pincodeError}</p>}
                  </div>
                </div>
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
                <h4 className="font-bold text-sm text-primary-800 font-serif">
                  Select Function Hall for {eventDate}
                </h4>

                {/* Requirement 5: Selected Hall details at the top/bottom of the page before the user continues */}
                {!loading && chosenHall && (
                  <div className="bg-primary-50 border border-primary-200 p-4 rounded-luxury flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] text-primary-600 font-bold uppercase tracking-wider">Your Selected Venue</p>
                      <h4 className="font-bold text-primary-800 font-serif text-sm mt-0.5">{chosenHall.name}</h4>
                      <p className="text-[10px] text-neutral-500">📍 {chosenHall.location || 'Block A'} | 🧑 Capacity: {chosenHall.capacity || 500} pax</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Starting Price</p>
                      <p className="font-bold text-gold-600 font-mono text-sm mt-0.5">₹{Number(chosenHall.basePrice).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="bg-white border border-cream-200 p-12 rounded-luxury text-center flex flex-col items-center justify-center gap-2">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fetching halls availability...</p>
                  </div>
                ) : hallsList.length === 0 ? (
                  /* Requirement 7: Show "No Function Halls Available" instead of a blank page */
                  <div className="bg-white border border-cream-200 p-12 rounded-luxury text-center flex flex-col items-center justify-center gap-2">
                    <AlertTriangle size={24} className="text-gold-600 mb-1" />
                    <p className="text-xs font-bold text-primary-800 font-serif uppercase tracking-wider">No Function Halls Available</p>
                    <p className="text-[10px] text-neutral-400">Please try another date or check your connection.</p>
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

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
                  {addressLine1 && (
                    <div className="pt-2 border-t border-cream-100 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-primary-800 uppercase tracking-wider">Event Address:</span>
                      <span className="text-[10px] text-neutral-600 leading-snug">
                        {[addressLine1, addressLine2, city, district, stateName, pincode ? `PIN: ${pincode}` : ''].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
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
              <h3 className="text-lg font-bold font-serif text-primary-800">Booking Completed!</h3>
              <p className="text-[10px] text-neutral-400 mt-1">Your reservation has been recorded successfully.</p>
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
              {(bookingResult.addressLine1 || addressLine1) && (
                <div className="py-2 flex flex-col items-start gap-1">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">Event Address</span>
                  <span className="font-semibold text-primary-800 text-left text-[11px] leading-snug">
                    {[
                      bookingResult.addressLine1 || addressLine1,
                      bookingResult.addressLine2 || addressLine2,
                      bookingResult.city || city,
                      bookingResult.district || district,
                      bookingResult.state || stateName,
                      (bookingResult.pincode || pincode) ? `PIN: ${bookingResult.pincode || pincode}` : ''
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <div className="pt-2 flex justify-between font-bold text-sm text-primary-800">
                <span>Total Amount</span>
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
