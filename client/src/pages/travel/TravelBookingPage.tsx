import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Wind,
  Briefcase,
  Check,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  X,
  Info,
  Printer,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  VEHICLE_CATEGORIES,
  FLEET_VEHICLES,
  EVENT_TYPES,
  Vehicle,
  VehicleCategory
} from '../../constants/travelData';

type BookingStep = 'selection' | 'passenger' | 'review' | 'confirmation';

export const TravelBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Current multi-step flow
  const [currentStep, setCurrentStep] = useState<BookingStep>('selection');

  // Journey Details Form State
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    // Default to tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('08:00');
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [passengerCount, setPassengerCount] = useState<number>(4);
  const [eventType, setEventType] = useState('Wedding & Reception');

  // Form Validation Errors
  const [journeyErrors, setJourneyErrors] = useState<Record<string, string>>({});
  const [passengerErrors, setPassengerErrors] = useState<Record<string, string>>({});

  // Filtering & Search
  const initialCategory = searchParams.get('category') as VehicleCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(
    initialCategory && ['cars', 'buses', 'tempo'].includes(initialCategory) ? initialCategory : 'all'
  );
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState<string>('all');
  const [acFilterOnly, setAcFilterOnly] = useState<boolean>(false);
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Vehicle State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Vehicle Details Modal State
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  // Passenger Details Form State (pre-populated with auth info if available)
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [passengerPhone, setPassengerPhone] = useState(user?.mobile || '');
  const [passengerEmail, setPassengerEmail] = useState(user?.email || '');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Submission & Booking Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>('');
  const [bookingTimestamp, setBookingTimestamp] = useState<string>('');

  // Sync auth user changes if available
  useEffect(() => {
    if (user) {
      if (!passengerName && user.name) setPassengerName(user.name);
      if (!passengerEmail && user.email) setPassengerEmail(user.email);
      if (!passengerPhone && user.mobile) setPassengerPhone(user.mobile);
    }
  }, [user]);

  // Today's date string for input min attribute
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered vehicles list based on category, filters, and search
  const filteredVehicles = useMemo(() => {
    return FLEET_VEHICLES.filter((v) => {
      // Category filter
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }
      // AC filter
      if (acFilterOnly && !v.isAc) {
        return false;
      }
      // Capacity filter
      if (selectedCapacityFilter === '1-4' && v.capacity > 4) return false;
      if (selectedCapacityFilter === '5-8' && (v.capacity < 5 || v.capacity > 8)) return false;
      if (selectedCapacityFilter === '9-20' && (v.capacity < 9 || v.capacity > 20)) return false;
      if (selectedCapacityFilter === '20+' && v.capacity < 21) return false;

      // Price range filter
      if (priceRangeFilter === 'under-5000' && v.basePrice >= 5000) return false;
      if (priceRangeFilter === '5000-10000' && (v.basePrice < 5000 || v.basePrice > 10000)) return false;
      if (priceRangeFilter === 'above-10000' && v.basePrice <= 10000) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(query);
        const matchesCat = v.categoryLabel.toLowerCase().includes(query);
        const matchesDesc = v.description.toLowerCase().includes(query);
        const matchesFacility = v.facilities.some((f) => f.toLowerCase().includes(query));
        if (!matchesName && !matchesCat && !matchesDesc && !matchesFacility) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, acFilterOnly, selectedCapacityFilter, priceRangeFilter, searchQuery]);

  // Validate Journey Details
  const validateJourney = (): boolean => {
    const errors: Record<string, string> = {};
    if (!pickupLocation.trim()) {
      errors.pickupLocation = 'Please enter a pickup address or landmark';
    }
    if (!dropLocation.trim()) {
      errors.dropLocation = 'Please enter a drop/destination location';
    }
    if (!travelDate) {
      errors.travelDate = 'Travel date is required';
    } else if (travelDate < todayStr) {
      errors.travelDate = 'Travel date cannot be in the past';
    }
    if (!pickupTime) {
      errors.pickupTime = 'Pickup time is required';
    }
    if (isReturnTrip) {
      if (!returnDate) {
        errors.returnDate = 'Return date is required for round trips';
      } else if (returnDate < travelDate) {
        errors.returnDate = 'Return date cannot be earlier than travel date';
      }
    }
    if (!passengerCount || passengerCount < 1) {
      errors.passengerCount = 'Must have at least 1 passenger';
    }

    setJourneyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Passenger Details
  const validatePassenger = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passengerName.trim()) {
      errors.passengerName = 'Contact name is required';
    } else if (passengerName.trim().length < 3) {
      errors.passengerName = 'Please enter a valid full name';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = passengerPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.passengerPhone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.passengerPhone = 'Enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!passengerEmail.trim()) {
      errors.passengerEmail = 'Email address is required';
    } else if (!emailRegex.test(passengerEmail.trim())) {
      errors.passengerEmail = 'Enter a valid email address';
    }

    setPassengerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Search Vehicles Click (validates journey details and smooth scrolls to vehicles)
  const handleSearchVehicles = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateJourney()) {
      const el = document.getElementById('vehicle-catalogue-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle Continue from Vehicle Selection
  const handleProceedToPassenger = () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle before proceeding.');
      return;
    }
    if (validateJourney()) {
      setCurrentStep('passenger');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to journey form to show errors
      const el = document.getElementById('journey-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Proceed to Review
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassenger()) {
      setCurrentStep('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Demo Submission
  const handleSubmitDemoBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = `GK-TRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(generatedRef);
      setBookingTimestamp(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      setIsSubmitting(false);
      setCurrentStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Reset / Book another vehicle
  const handleResetFlow = () => {
    setSelectedVehicle(null);
    setCurrentStep('selection');
    setBookingRef('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate sample estimated fare
  const fareBreakdown = useMemo(() => {
    if (!selectedVehicle) return null;
    const base = selectedVehicle.basePrice;
    const returnMultiplier = isReturnTrip ? 1.75 : 1.0;
    const estimatedSubtotal = Math.round(base * returnMultiplier);
    const taxesAndPermit = Math.round(estimatedSubtotal * 0.05); // Illustrative 5% GST
    const estimatedTotal = estimatedSubtotal + taxesAndPermit;

    return {
      basePackage: base,
      returnDiscountNote: isReturnTrip ? 'Round trip package applied (1.75x base)' : 'One-way package included',
      estimatedSubtotal,
      taxesAndPermit,
      estimatedTotal
    };
  }, [selectedVehicle, isReturnTrip]);

  return (
    <div className="bg-cream-50 min-h-screen pb-16 font-sans">
      {/* ========================================================================= */}
      {/* SECTION A: PAGE HEADER & BREADCRUMBS                                     */}
      {/* ========================================================================= */}
      <section className="bg-primary-900 text-white relative overflow-hidden py-10 sm:py-14 border-b border-cream-200/20">
        {/* Decorative gold background ambient circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb & Back navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 text-xs text-cream-200">
              <Link to="/" className="hover:text-gold-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/events" className="hover:text-gold-400 transition-colors">
                Services
              </Link>
              <span>/</span>
              <span className="text-gold-400 font-semibold">Travel Booking</span>
            </nav>

            <button
              onClick={() => {
                if (currentStep === 'confirmation') {
                  navigate('/');
                } else if (currentStep === 'review') {
                  setCurrentStep('passenger');
                } else if (currentStep === 'passenger') {
                  setCurrentStep('selection');
                } else {
                  navigate(-1);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-gold-400 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition-all border border-white/10"
            >
              <ArrowLeft size={13} />
              <span>{currentStep === 'selection' ? 'Back to Services' : 'Back to Previous Step'}</span>
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-gold-400" />
              <span>Event Transportation Fleet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white mb-3">
              Travel Booking
            </h1>
            <p className="text-sm sm:text-base text-cream-100 font-normal leading-relaxed max-w-2xl">
              Book comfortable transportation for your special events. Choose from luxury bridal sedans, spacious tempo
              travellers, and grand guest buses with professional chauffeurs.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => currentStep !== 'confirmation' && setCurrentStep('selection')}
                className={`flex items-center gap-2 text-left group ${
                  currentStep !== 'confirmation' ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'selection'
                      ? 'bg-gold-500 text-primary-900 ring-4 ring-gold-400/30 font-black'
                      : 'bg-white/15 text-white/80'
                  }`}
                >
                  1
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Step 1</p>
                  <p className="text-xs text-cream-200">Vehicle</p>
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedVehicle && validateJourney() && currentStep !== 'confirmation') {
                    setCurrentStep('passenger');
                  }
                }}
                className={`flex items-center gap-2 text-left group ${
                  selectedVehicle && currentStep !== 'confirmation' ? 'cursor-pointer' : 'cursor-default opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'passenger'
                      ? 'bg-gold-500 text-primary-900 ring-4 ring-gold-400/30 font-black'
                      : 'bg-white/15 text-white/80'
                  }`}
                >
                  2
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Step 2</p>
                  <p className="text-xs text-cream-200">Passenger</p>
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedVehicle && validateJourney() && validatePassenger() && currentStep !== 'confirmation') {
                    setCurrentStep('review');
                  }
                }}
                className={`flex items-center gap-2 text-left group ${
                  selectedVehicle && currentStep !== 'confirmation' ? 'cursor-pointer' : 'cursor-default opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'review'
                      ? 'bg-gold-500 text-primary-900 ring-4 ring-gold-400/30 font-black'
                      : 'bg-white/15 text-white/80'
                  }`}
                >
                  3
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Step 3</p>
                  <p className="text-xs text-cream-200">Review</p>
                </div>
              </button>

              {/* Step 4 */}
              <div className={`flex items-center gap-2 text-left opacity-60 ${currentStep === 'confirmation' ? 'opacity-100' : ''}`}>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 'confirmation'
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/30'
                      : 'bg-white/15 text-white/80'
                  }`}
                >
                  4
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Step 4</p>
                  <p className="text-xs text-cream-200">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ========================================================================= */}
        {/* VIEW 1: VEHICLE & JOURNEY SELECTION (STEPS 1 & 2)                         */}
        {/* ========================================================================= */}
        {currentStep === 'selection' && (
          <div className="space-y-10">
            {/* ===================================================================== */}
            {/* SECTION B: JOURNEY DETAILS FORM                                      */}
            {/* ===================================================================== */}
            <section id="journey-form-section" className="bg-white rounded-luxury border border-cream-200 p-6 sm:p-8 shadow-luxury">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-cream-100 gap-2 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-primary-800 flex items-center gap-2">
                    <MapPin className="text-gold-500" size={20} />
                    Plan Your Journey
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter event pickup & drop points to find the best matched fleet.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-cream-50 text-gold-700 px-3 py-1 rounded-full border border-cream-200 self-start sm:self-auto">
                  Instant Estimate
                </span>
              </div>

              <form onSubmit={handleSearchVehicles} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Banjara Hills, Hyderabad"
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          if (journeyErrors.pickupLocation) {
                            setJourneyErrors((prev) => ({ ...prev, pickupLocation: '' }));
                          }
                        }}
                        className={`w-full bg-cream-50/70 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                          journeyErrors.pickupLocation ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                        }`}
                      />
                    </div>
                    {journeyErrors.pickupLocation && (
                      <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {journeyErrors.pickupLocation}
                      </p>
                    )}
                  </div>

                  {/* Drop Location */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Drop / Venue Destination <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. GK Grand Convention Hall"
                        value={dropLocation}
                        onChange={(e) => {
                          setDropLocation(e.target.value);
                          if (journeyErrors.dropLocation) {
                            setJourneyErrors((prev) => ({ ...prev, dropLocation: '' }));
                          }
                        }}
                        className={`w-full bg-cream-50/70 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                          journeyErrors.dropLocation ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                        }`}
                      />
                    </div>
                    {journeyErrors.dropLocation && (
                      <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {journeyErrors.dropLocation}
                      </p>
                    )}
                  </div>

                  {/* Travel Date */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Travel Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={todayStr}
                        value={travelDate}
                        onChange={(e) => {
                          setTravelDate(e.target.value);
                          if (returnDate && e.target.value > returnDate) {
                            setReturnDate(e.target.value);
                          }
                          if (journeyErrors.travelDate) {
                            setJourneyErrors((prev) => ({ ...prev, travelDate: '' }));
                          }
                        }}
                        className={`w-full bg-cream-50/70 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                          journeyErrors.travelDate ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                        }`}
                      />
                    </div>
                    {journeyErrors.travelDate && (
                      <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {journeyErrors.travelDate}
                      </p>
                    )}
                  </div>

                  {/* Pickup Time */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-cream-50/70 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Second row of form: Return trip, Passenger count, Event type */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start pt-2">
                  {/* Return Trip Toggle */}
                  <div className="bg-cream-50/60 border border-cream-200 rounded-luxury p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <label htmlFor="returnTripToggle" className="text-xs font-bold text-primary-800 cursor-pointer">
                        Round Trip / Return Trip
                      </label>
                      <input
                        id="returnTripToggle"
                        type="checkbox"
                        checked={isReturnTrip}
                        onChange={(e) => setIsReturnTrip(e.target.checked)}
                        className="w-4 h-4 text-gold-600 rounded border-gray-300 focus:ring-gold-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {isReturnTrip ? 'Vehicle stays with you for return journey' : 'One-way drop to event venue'}
                    </p>
                  </div>

                  {/* Return Date (Visible only when return trip is true) */}
                  {isReturnTrip && (
                    <div className="transition-all">
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Return Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={travelDate || todayStr}
                        value={returnDate}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          if (journeyErrors.returnDate) {
                            setJourneyErrors((prev) => ({ ...prev, returnDate: '' }));
                          }
                        }}
                        className={`w-full bg-cream-50/70 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                          journeyErrors.returnDate ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                        }`}
                      />
                      {journeyErrors.returnDate && (
                        <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {journeyErrors.returnDate}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Passenger Count */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Approx Passengers
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-cream-50/70 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all"
                      />
                      <span className="absolute right-3 text-xs text-neutral-400 font-medium pointer-events-none">
                        Guests
                      </span>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className={!isReturnTrip ? 'lg:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Event / Occasion Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-cream-50/70 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all cursor-pointer"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-cream-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck size={16} className="text-gold-500 shrink-0" />
                    <span>Free cancellation up to 24 hours before pickup. Transparent illustrative estimates.</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-luxury text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer"
                  >
                    <Search size={14} />
                    <span>Search Available Vehicles</span>
                  </button>
                </div>
              </form>
            </section>

            {/* ===================================================================== */}
            {/* SECTION C: VEHICLE CATEGORIES DISPLAY                                */}
            {/* ===================================================================== */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold font-serif text-primary-800">
                    Explore Vehicle Categories
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Select a category to filter suitable fleet for your guest count and preference.
                  </p>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw size={12} /> Show All Categories
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {VEHICLE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(isSelected ? 'all' : cat.id);
                      }}
                      className={`luxury-card bg-white border rounded-luxury overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between group ${
                        isSelected
                          ? 'border-primary-800 ring-2 ring-primary-800/20 shadow-luxury-lg scale-[1.01]'
                          : 'border-cream-200 hover:border-gold-400 hover:shadow-luxury'
                      }`}
                    >
                      <div>
                        {/* Image banner with overlay */}
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent"></div>
                          
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-bold bg-white/90 text-primary-900 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                              <span>{cat.icon}</span>
                              <span>{cat.countText}</span>
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h4 className="text-base font-bold font-serif">{cat.title}</h4>
                            <p className="text-[11px] text-cream-200">{cat.subtitle}</p>
                          </div>
                        </div>

                        {/* Content & Subcategories */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {cat.description}
                          </p>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                              Includes:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories.map((sub) => (
                                <span
                                  key={sub}
                                  className="text-[10px] font-medium bg-cream-50 text-primary-800 px-2 py-0.5 rounded border border-cream-200"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="px-4 pb-4 pt-1">
                        <button
                          type="button"
                          className={`w-full py-2 rounded-luxury text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-800 text-white shadow-sm'
                              : 'bg-cream-100 text-primary-800 hover:bg-gold-500 hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check size={13} /> Category Active
                            </>
                          ) : (
                            <>
                              View Vehicles &rarr;
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===================================================================== */}
            {/* SECTION D: AVAILABLE VEHICLE CARDS & FILTERS                         */}
            {/* ===================================================================== */}
            <section id="vehicle-catalogue-section" className="space-y-6 pt-4">
              <div className="bg-white rounded-luxury border border-cream-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-primary-800 flex items-center gap-2">
                      <Filter size={18} className="text-gold-500" />
                      Available Vehicles Fleet
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Showing {filteredVehicles.length} of {FLEET_VEHICLES.length} vehicles • Demonstration catalogue
                    </p>
                  </div>

                  {/* Active filters reset */}
                  {(selectedCategory !== 'all' ||
                    selectedCapacityFilter !== 'all' ||
                    acFilterOnly ||
                    priceRangeFilter !== 'all' ||
                    searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedCapacityFilter('all');
                        setAcFilterOnly(false);
                        setPriceRangeFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 bg-cream-50 hover:bg-cream-100 px-3 py-1.5 rounded-full border border-cream-200 transition-all self-start md:self-auto cursor-pointer"
                    >
                      <RotateCcw size={12} /> Reset All Filters
                    </button>
                  )}
                </div>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-cream-100">
                  {/* Search input */}
                  <div>
                    <label className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-1">
                      Search By Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Mercedes, Urbania, Bus..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3 py-2 text-xs text-primary-800 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Capacity Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-1">
                      Seating Capacity
                    </label>
                    <select
                      value={selectedCapacityFilter}
                      onChange={(e) => setSelectedCapacityFilter(e.target.value)}
                      className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3 py-2 text-xs text-primary-800 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                    >
                      <option value="all">Any Seating Capacity</option>
                      <option value="1-4">1 – 4 Seats (Sedans & Luxury)</option>
                      <option value="5-8">5 – 8 Seats (SUVs)</option>
                      <option value="9-20">9 – 20 Seats (Tempo Travellers)</option>
                      <option value="20+">20+ Seats (Guest Buses & Coaches)</option>
                    </select>
                  </div>

                  {/* AC Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-1">
                      Air Conditioning
                    </label>
                    <select
                      value={acFilterOnly ? 'ac' : 'all'}
                      onChange={(e) => setAcFilterOnly(e.target.value === 'ac')}
                      className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3 py-2 text-xs text-primary-800 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                    >
                      <option value="all">All (AC & Non-AC)</option>
                      <option value="ac">AC Only Vehicles</option>
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-1">
                      Sample Price Range
                    </label>
                    <select
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3 py-2 text-xs text-primary-800 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                    >
                      <option value="all">All Price Ranges</option>
                      <option value="under-5000">Under ₹5,000 / day</option>
                      <option value="5000-10000">₹5,000 – ₹10,000 / day</option>
                      <option value="above-10000">Above ₹10,000 / day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Demo Sample Notice */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-luxury p-3 text-amber-800 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Illustrative Demo Catalogue:</strong> Sample vehicles, capacities, and rates are displayed for
                    demonstration and preview. No real fleet reservation or credit card charge will occur.
                  </span>
                </div>
              </div>

              {/* Vehicles List / Grid */}
              {filteredVehicles.length === 0 ? (
                <div className="bg-white border border-cream-200 rounded-luxury p-12 text-center space-y-3">
                  <AlertCircle size={32} className="mx-auto text-gold-500" />
                  <h4 className="text-base font-bold font-serif text-primary-800">
                    No vehicles match your active filters
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Try clearing one or more filters or searching with a different term to view all available cars, tempo travellers, and buses.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedCapacityFilter('all');
                      setAcFilterOnly(false);
                      setPriceRangeFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-800 text-white rounded-luxury text-xs font-bold uppercase tracking-wider hover:bg-primary-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} /> Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => {
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    return (
                      <div
                        key={vehicle.id}
                        className={`luxury-card bg-white border rounded-luxury overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                          isSelected
                            ? 'border-primary-800 ring-2 ring-primary-800 shadow-luxury-lg'
                            : 'border-cream-200 hover:border-gold-400 hover:shadow-luxury'
                        }`}
                      >
                        <div>
                          {/* Vehicle Image Header */}
                          <div className="relative h-48 overflow-hidden bg-neutral-100">
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            {/* Badges on image */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-900/90 text-white backdrop-blur-sm">
                                {vehicle.categoryLabel}
                              </span>
                              {vehicle.popularBadge && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500 text-primary-950 shadow-sm">
                                  {vehicle.popularBadge}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3 right-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shadow ${
                                  vehicle.isAc ? 'bg-emerald-600' : 'bg-neutral-600'
                                }`}
                              >
                                {vehicle.isAc ? 'AC' : 'Non-AC'}
                              </span>
                            </div>

                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                              <Users size={11} /> {vehicle.capacityLabel}
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-5 space-y-4">
                            <div>
                              <h4 className="text-base font-bold font-serif text-primary-800 leading-snug line-clamp-1">
                                {vehicle.name}
                              </h4>
                              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                                {vehicle.description}
                              </p>
                            </div>

                            {/* Key specs pills */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 bg-cream-50/70 p-2.5 rounded-lg border border-cream-150">
                              <div className="flex items-center gap-1.5">
                                <Users size={13} className="text-gold-500 shrink-0" />
                                <span className="truncate">{vehicle.capacityLabel}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Wind size={13} className="text-gold-500 shrink-0" />
                                <span className="truncate">{vehicle.isAc ? 'Chilled AC' : 'Non-AC'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Briefcase size={13} className="text-gold-500 shrink-0" />
                                <span className="truncate">{vehicle.luggageCapacity}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-gold-500 shrink-0" />
                                <span className="truncate">{vehicle.extraKmRate}</span>
                              </div>
                            </div>

                            {/* Facilities chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {vehicle.facilities.slice(0, 3).map((facility) => (
                                <span
                                  key={facility}
                                  className="text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded"
                                >
                                  {facility}
                                </span>
                              ))}
                              {vehicle.facilities.length > 3 && (
                                <span className="text-[10px] font-bold text-neutral-400 px-1 py-0.5">
                                  +{vehicle.facilities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pricing and Action Buttons */}
                        <div className="p-5 pt-0 space-y-3">
                          <div className="flex items-baseline justify-between border-t border-cream-100 pt-3">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                Illustrative Rate
                              </p>
                              <p className="text-base font-bold text-gold-600 font-mono">
                                ₹{vehicle.basePrice.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium">
                              8 hrs / 80 km package
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingVehicle(vehicle)}
                              className="py-2.5 px-3 border border-cream-300 hover:border-gold-500 bg-white hover:bg-cream-50 text-primary-800 rounded-luxury text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                // Smooth scroll to Section E summary
                                setTimeout(() => {
                                  const el = document.getElementById('selected-summary-card');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className={`py-2.5 px-3 rounded-luxury text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                  : 'bg-primary-800 hover:bg-primary-900 text-white'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check size={13} /> Selected
                                </>
                              ) : (
                                'Select Vehicle'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===================================================================== */}
            {/* SECTION E: SELECTED VEHICLE SUMMARY                                 */}
            {/* ===================================================================== */}
            {selectedVehicle && (
              <section
                id="selected-summary-card"
                className="bg-primary-900 text-white rounded-luxury p-6 sm:p-8 shadow-luxury-lg border border-gold-500/30 relative overflow-hidden transition-all animate-fadeIn"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 bg-gold-500/20 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                        Section E • Selected Vehicle Summary
                      </span>
                      <h3 className="text-xl font-bold font-serif text-white mt-1">
                        {selectedVehicle.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedVehicle(null)}
                        className="text-xs font-semibold text-cream-200 hover:text-white underline underline-offset-4 cursor-pointer"
                      >
                        Change Vehicle
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedToPassenger}
                        className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-primary-950 font-bold text-xs uppercase tracking-wider rounded-luxury transition-all flex items-center gap-2 shadow-lg hover:shadow-gold-500/30 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Vehicle Mini Snapshot */}
                    <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-luxury border border-white/10 md:col-span-1">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedVehicle.name}</p>
                        <p className="text-[11px] text-gold-400">{selectedVehicle.categoryLabel}</p>
                        <p className="text-[10px] text-cream-200 mt-0.5">{selectedVehicle.capacityLabel} • {selectedVehicle.isAc ? 'AC' : 'Non-AC'}</p>
                      </div>
                    </div>

                    {/* Journey Details */}
                    <div className="space-y-1.5 md:col-span-2 text-xs text-cream-100">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white">Route: </span>
                          <span>{pickupLocation || 'Pickup location not specified'}</span>
                          <span className="text-gold-400 mx-1">➔</span>
                          <span>{dropLocation || 'Destination not specified'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gold-400" />
                          {travelDate || 'Date pending'} at {pickupTime || 'Time pending'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-gold-400" />
                          {passengerCount} Guests
                        </span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-cream-200">
                          {isReturnTrip ? `Round Trip (Return: ${returnDate})` : 'One-Way Trip'}
                        </span>
                      </div>
                    </div>

                    {/* Estimated Fare Column */}
                    <div className="bg-white/10 p-4 rounded-luxury border border-white/10 text-right md:col-span-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-cream-200">
                        Demo Estimated Total
                      </p>
                      <p className="text-2xl font-bold font-mono text-gold-400">
                        ₹{fareBreakdown?.estimatedTotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-cream-300 mt-0.5">
                        {isReturnTrip ? 'Round trip approx + GST' : 'Base 8 hrs package + GST'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SECTION F: PASSENGER DETAILS FORM                                 */}
        {/* ========================================================================= */}
        {currentStep === 'passenger' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header / Back Action */}
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                  Step 2 of 3 • Section F
                </span>
                <h2 className="text-2xl font-bold font-serif text-primary-800">
                  Primary Passenger & Event Contact
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Please provide the details of the coordinator or passenger travelling.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('selection')}
                className="text-xs font-bold text-primary-800 hover:text-gold-600 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-cream-200 shadow-sm"
              >
                <ArrowLeft size={13} /> Change Vehicle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form Left Container (2 columns) */}
              <div className="md:col-span-2 bg-white rounded-luxury border border-cream-200 p-6 sm:p-8 shadow-luxury space-y-6">
                <form onSubmit={handleProceedToReview} className="space-y-5">
                  {/* Passenger Name */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Full Name of Contact / Passenger <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={passengerName}
                      onChange={(e) => {
                        setPassengerName(e.target.value);
                        if (passengerErrors.passengerName) {
                          setPassengerErrors((prev) => ({ ...prev, passengerName: '' }));
                        }
                      }}
                      className={`w-full bg-cream-50/60 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                        passengerErrors.passengerName ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                      }`}
                    />
                    {passengerErrors.passengerName && (
                      <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {passengerErrors.passengerName}
                      </p>
                    )}
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Contact Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          value={passengerPhone}
                          onChange={(e) => {
                            setPassengerPhone(e.target.value);
                            if (passengerErrors.passengerPhone) {
                              setPassengerErrors((prev) => ({ ...prev, passengerPhone: '' }));
                            }
                          }}
                          className={`w-full bg-cream-50/60 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                            passengerErrors.passengerPhone ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                          }`}
                        />
                      </div>
                      {passengerErrors.passengerPhone && (
                        <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {passengerErrors.passengerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        value={passengerEmail}
                        onChange={(e) => {
                          setPassengerEmail(e.target.value);
                          if (passengerErrors.passengerEmail) {
                            setPassengerErrors((prev) => ({ ...prev, passengerEmail: '' }));
                          }
                        }}
                        className={`w-full bg-cream-50/60 border rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all ${
                          passengerErrors.passengerEmail ? 'border-red-500 bg-red-50/40' : 'border-cream-200'
                        }`}
                      />
                      {passengerErrors.passengerEmail && (
                        <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {passengerErrors.passengerEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confirmed Passenger Count */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Number of Passengers Travelling
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedVehicle ? selectedVehicle.capacity : 60}
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                    {selectedVehicle && passengerCount > selectedVehicle.capacity && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1">
                        Note: Vehicle capacity is {selectedVehicle.capacity} seats. You have specified {passengerCount} guests.
                      </p>
                    )}
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Special Requirements or Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need bridal ribbon decor on hood, 2 intermediate stops at temple, wheelchair accessible boarding assistance..."
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury p-3 text-xs text-primary-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    ></textarea>
                  </div>

                  {/* Form Footer Buttons */}
                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('selection')}
                      className="px-5 py-2.5 border border-cream-300 hover:border-gold-500 bg-white text-primary-800 rounded-luxury text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      &larr; Back
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-luxury text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>Review Booking</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Right (Trip & Vehicle Quick Recap) */}
              <div className="space-y-4">
                {selectedVehicle && (
                  <div className="bg-white rounded-luxury border border-cream-200 p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800 border-b border-cream-100 pb-2">
                      Selected Vehicle
                    </h4>
                    <div className="flex gap-3 items-center">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-cream-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-primary-800 leading-tight">{selectedVehicle.name}</p>
                        <p className="text-[11px] text-gold-600 font-medium">{selectedVehicle.categoryLabel}</p>
                        <p className="text-[10px] text-neutral-400">{selectedVehicle.capacityLabel} • {selectedVehicle.isAc ? 'AC' : 'Non-AC'}</p>
                      </div>
                    </div>

                    <div className="border-t border-cream-100 pt-3 space-y-2 text-xs text-neutral-600">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Pickup:</span>
                        <span className="font-semibold text-right max-w-[160px] truncate">{pickupLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Drop:</span>
                        <span className="font-semibold text-right max-w-[160px] truncate">{dropLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Date:</span>
                        <span className="font-semibold">{travelDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Time:</span>
                        <span className="font-semibold">{pickupTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Trip:</span>
                        <span className="font-semibold">{isReturnTrip ? 'Round Trip' : 'One-Way'}</span>
                      </div>
                    </div>

                    <div className="bg-cream-50 p-3 rounded-lg border border-cream-150 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-primary-800 uppercase tracking-wider">Demo Estimate</span>
                      <span className="text-sm font-bold font-mono text-gold-600">₹{fareBreakdown?.estimatedTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50/60 border border-blue-200 rounded-luxury p-4 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span>GK Verified Chauffeurs</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    All our chauffeurs are background verified, uniformed, punctual, and trained specifically for wedding and ceremonial decorum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SECTION G: BOOKING REVIEW                                         */}
        {/* ========================================================================= */}
        {currentStep === 'review' && selectedVehicle && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-200 pb-4 gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                  Step 3 of 3 • Section G
                </span>
                <h2 className="text-2xl font-bold font-serif text-primary-800">
                  Review Your Travel Booking
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Inspect journey, vehicle, and passenger information before submitting this demo booking.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                <Info size={13} /> Demo Presentation Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Details Recaps */}
              <div className="md:col-span-2 space-y-6">
                {/* 1. Journey Overview Card */}
                <div className="bg-white rounded-luxury border border-cream-200 p-6 shadow-luxury space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                    <h3 className="font-bold text-sm font-serif text-primary-800 flex items-center gap-2">
                      <MapPin size={16} className="text-gold-500" />
                      Journey Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('selection')}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Pickup Location
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{pickupLocation}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Destination / Drop
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{dropLocation}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Travel Date & Time
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">
                        {travelDate} at {pickupTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Trip Type
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">
                        {isReturnTrip ? `Round Trip (Return on ${returnDate})` : 'One-Way Journey'}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Event Occasion
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{eventType}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Number of Passengers
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{passengerCount} Guests</p>
                    </div>
                  </div>
                </div>

                {/* 2. Vehicle Overview Card */}
                <div className="bg-white rounded-luxury border border-cream-200 p-6 shadow-luxury space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                    <h3 className="font-bold text-sm font-serif text-primary-800 flex items-center gap-2">
                      <Car size={16} className="text-gold-500" />
                      Selected Vehicle Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('selection')}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider cursor-pointer"
                    >
                      Change Vehicle
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <img
                      src={selectedVehicle.image}
                      alt={selectedVehicle.name}
                      className="w-full sm:w-36 h-28 object-cover rounded-luxury border border-cream-200 shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                          {selectedVehicle.categoryLabel}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {selectedVehicle.isAc ? 'Air Conditioned' : 'Non-AC'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold font-serif text-primary-800">{selectedVehicle.name}</h4>
                      <p className="text-xs text-neutral-500">{selectedVehicle.description}</p>
                      
                      <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600 pt-1">
                        <span>• Capacity: {selectedVehicle.capacityLabel}</span>
                        <span>• Luggage: {selectedVehicle.luggageCapacity}</span>
                        <span>• AC: {selectedVehicle.acInfo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Passenger Information Card */}
                <div className="bg-white rounded-luxury border border-cream-200 p-6 shadow-luxury space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                    <h3 className="font-bold text-sm font-serif text-primary-800 flex items-center gap-2">
                      <Users size={16} className="text-gold-500" />
                      Passenger Contact Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('passenger')}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider cursor-pointer"
                    >
                      Edit Passenger
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Full Name
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{passengerName}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Mobile Phone
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{passengerPhone}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Email Address
                      </span>
                      <p className="font-semibold text-primary-800 mt-0.5">{passengerEmail}</p>
                    </div>
                  </div>

                  {specialRequirements && (
                    <div className="bg-cream-50 p-3 rounded-luxury border border-cream-150 text-xs">
                      <span className="text-[10px] uppercase font-bold text-primary-800 block mb-0.5">
                        Special Instructions:
                      </span>
                      <p className="text-neutral-600 italic">{specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Fare Breakdown & Submit */}
              <div className="space-y-6">
                <div className="bg-white rounded-luxury border border-cream-200 p-6 shadow-luxury space-y-5">
                  <h3 className="font-bold text-sm font-serif text-primary-800 border-b border-cream-100 pb-3">
                    Illustrative Fare Breakdown
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Vehicle Base Package (8 hrs / 80 km)</span>
                      <span className="font-mono font-semibold">₹{fareBreakdown?.basePackage.toLocaleString('en-IN')}</span>
                    </div>

                    {isReturnTrip && (
                      <div className="flex justify-between items-center text-neutral-600">
                        <span>Round Trip Package Surcharge</span>
                        <span className="font-mono font-semibold">
                          ₹{((fareBreakdown?.estimatedSubtotal || 0) - (fareBreakdown?.basePackage || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Uniformed Chauffeur & Sanitization</span>
                      <span className="text-emerald-600 font-bold uppercase text-[10px]">Included</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Tolls & Fuel Estimate (Local demo)</span>
                      <span className="text-emerald-600 font-bold uppercase text-[10px]">Included</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Illustrative GST / Taxes (5%)</span>
                      <span className="font-mono font-semibold">₹{fareBreakdown?.taxesAndPermit.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t border-cream-200 pt-3 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-primary-800 uppercase tracking-wider block">
                          Total Estimate
                        </span>
                        <span className="text-[10px] text-neutral-400">All-inclusive demo quote</span>
                      </div>
                      <span className="text-xl font-bold font-mono text-gold-600">
                        ₹{fareBreakdown?.estimatedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Demo Notice */}
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                    <strong>Demo Simulation:</strong> Submitting will record this as a demonstration preview. No real charges or payment gateway will be triggered.
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitDemoBooking}
                      className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-primary-950 font-bold text-xs uppercase tracking-wider rounded-luxury transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-primary-900 border-t-transparent animate-spin rounded-full"></span>
                          <span>Processing Demo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>Submit Demo Booking</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('passenger')}
                      className="w-full py-2.5 bg-cream-50 hover:bg-cream-100 text-primary-800 font-bold text-xs uppercase tracking-wider rounded-luxury border border-cream-200 transition-colors cursor-pointer"
                    >
                      Back to Passenger Form
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-luxury bg-cream-100/70 border border-cream-200 text-neutral-500 text-[11px] space-y-1">
                  <p className="font-bold text-primary-800">Need a custom itinerary or multiple buses?</p>
                  <p>Our dedicated transport logistics desk can coordinate multi-city fleet for over 1,000 attendees.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: DEMO CONFIRMATION RECEIPT (SUCCESS)                               */}
        {/* ========================================================================= */}
        {currentStep === 'confirmation' && selectedVehicle && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Success Banner */}
            <div className="bg-white rounded-luxury border-2 border-emerald-500 p-8 shadow-luxury-lg text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  Frontend Demonstration Only
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-primary-900">
                  Demo Booking Simulated!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  Your travel reservation demo has been generated successfully. No real charge, driver dispatch, or booking record was created.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="bg-cream-50 border border-cream-200 p-4 rounded-luxury max-w-sm mx-auto space-y-1">
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Client Demo Reference ID
                </p>
                <p className="text-xl font-bold font-mono text-primary-900 tracking-wider">
                  {bookingRef}
                </p>
                <p className="text-[10px] text-neutral-400">Generated: {bookingTimestamp}</p>
              </div>

              {/* Printable / Viewable Receipt Card */}
              <div className="border border-dashed border-cream-300 rounded-luxury p-5 text-left text-xs space-y-3 bg-cream-50/40">
                <div className="flex justify-between items-center border-b border-cream-200 pb-2">
                  <span className="font-bold text-primary-800 font-serif text-sm">GK Travel Voucher Preview</span>
                  <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">Illustrative</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-neutral-600">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Vehicle:</span>
                    <strong className="text-primary-800">{selectedVehicle.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Category:</span>
                    <strong className="text-primary-800">{selectedVehicle.categoryLabel}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Pickup:</span>
                    <span className="truncate block font-medium">{pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Destination:</span>
                    <span className="truncate block font-medium">{dropLocation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Date & Time:</span>
                    <span className="font-medium">{travelDate} @ {pickupTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Trip Type:</span>
                    <span className="font-medium">{isReturnTrip ? 'Round Trip' : 'One-Way'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Contact Name:</span>
                    <span className="font-medium">{passengerName} ({passengerPhone})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Demo Fare:</span>
                    <strong className="font-mono text-gold-600">₹{fareBreakdown?.estimatedTotal.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {specialRequirements && (
                  <div className="pt-2 border-t border-cream-200 text-[11px] text-neutral-500">
                    <span className="font-semibold text-primary-800">Special Notes: </span>
                    <span>{specialRequirements}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-primary-800 text-xs font-bold uppercase tracking-wider rounded-luxury flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-cream-300"
                >
                  <Printer size={14} /> Print Demo Voucher
                </button>

                <button
                  type="button"
                  onClick={handleResetFlow}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold uppercase tracking-wider rounded-luxury flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} /> Book Another Vehicle
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-primary-950 text-xs font-bold uppercase tracking-wider rounded-luxury flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Return to Home &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* VEHICLE DETAILS MODAL (VIEW DETAILS ACTION)                               */}
      {/* ========================================================================= */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-luxury border border-cream-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-luxury-lg relative flex flex-col">
            {/* Modal Header */}
            <div className="relative h-60 bg-neutral-900 shrink-0">
              <img
                src={viewingVehicle.image}
                alt={viewingVehicle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <button
                type="button"
                onClick={() => setViewingVehicle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 bg-gold-500/20 px-2.5 py-0.5 rounded-full border border-gold-400/30">
                  {viewingVehicle.categoryLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif mt-1">{viewingVehicle.name}</h3>
                <p className="text-xs text-cream-200">{viewingVehicle.subcategory}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800 mb-1">
                  About this Vehicle
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {viewingVehicle.description}
                </p>
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cream-50 p-3 rounded-luxury border border-cream-200 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Seating</span>
                  <p className="font-semibold text-primary-800">{viewingVehicle.capacityLabel}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Air Condition</span>
                  <p className="font-semibold text-primary-800">{viewingVehicle.isAc ? 'Chilled AC' : 'Non-AC'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Luggage Space</span>
                  <p className="font-semibold text-primary-800">{viewingVehicle.luggageCapacity}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Extra Per Km</span>
                  <p className="font-semibold text-primary-800">{viewingVehicle.extraKmRate}</p>
                </div>
              </div>

              {/* Detailed features list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800 mb-2">
                  Key Features & Amenities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingVehicle.featuresDetailed.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                      <CheckCircle2 size={14} className="text-gold-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample pricing disclaimer */}
              <div className="bg-cream-50 p-4 rounded-luxury border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    Illustrative Base Package
                  </p>
                  <p className="text-lg font-bold font-mono text-gold-600">
                    ₹{viewingVehicle.basePrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-neutral-400">/ 8 hrs (80 km)</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicle(viewingVehicle);
                    setViewingVehicle(null);
                    setTimeout(() => {
                      const el = document.getElementById('selected-summary-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-luxury text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Select this Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelBookingPage;
