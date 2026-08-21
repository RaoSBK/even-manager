import React, { useState, useEffect } from 'react';
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
          </div>
        </div>
      )}

    </div>
  );
};

export default HallBookingPage;
