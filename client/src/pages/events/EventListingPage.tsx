import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Landmark,
  Users,
  Car,
  MapPin,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import EventHero from '../../components/home/EventHero';
import { hallApi, Hall } from '../../api/hallApi';
import {
  ALL_STATES,
  getDistrictsForState,
  getMandalsForDistrict,
  sampleHalls
} from '../../constants/hallsData';

// Mapped assets for halls
const getHallAssets = (hallCode: string, name: string) => {
  const code = (hallCode || '').toUpperCase();
  const nameLower = (name || '').toLowerCase();
  if (code === 'HALL-A' || nameLower.includes('taj mahal')) {
    return {
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      facilities: ['Central A/C', 'Luxury Chandelier Lighting', 'Premium JBL Sound System', 'Large Decor Stage']
    };
  }
  if (code === 'T-LGA' || nameLower.includes('luxury grand') || nameLower.includes('arena')) {
    return {
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
      facilities: ['Central A/C', 'Spacious Seating Area', 'Concert-Grade Sound System', 'Valet Parking']
    };
  }
  return {
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
    facilities: ['Spacious Stage', 'Standard Sound System', 'Dining Hall', 'Changing Rooms']
  };
};

export const EventListingPage: React.FC = () => {
  const navigate = useNavigate();

  // Halls and location filters on the landing page
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoadingHalls, setIsLoadingHalls] = useState<boolean>(true);

  // 3-tier Location Filters (State -> District -> Mandal)
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterMandal, setFilterMandal] = useState<string>('');

  // Fetch halls from backend on mount
  useEffect(() => {
    const fetchHalls = async () => {
      setIsLoadingHalls(true);
      try {
        const data = await hallApi.getAll();
        const active = (data || []).filter((h) => !h.deletedAt);
        if (active.length > 0) {
          setHalls(active);
        } else {
          // Fallback to sampleHalls if DB is empty
          setHalls(
            sampleHalls.map((s) => ({
              id: s.id,
              hallCode: s.id.toUpperCase(),
              name: s.name,
              description: s.description,
              location: s.address,
              state: s.state,
              district: s.district,
              mandal: s.mandal,
              capacity: s.capacity,
              basePrice: s.costPerDay,
              status: 'AVAILABLE' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching halls on landing page:', err);
        // Fallback to sampleHalls on error
        setHalls(
          sampleHalls.map((s) => ({
            id: s.id,
            hallCode: s.id.toUpperCase(),
            name: s.name,
            description: s.description,
            location: s.address,
            state: s.state,
            district: s.district,
            mandal: s.mandal,
            capacity: s.capacity,
            basePrice: s.costPerDay,
            status: 'AVAILABLE' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
          }))
        );
      } finally {
        setIsLoadingHalls(false);
      }
    };

    fetchHalls();
  }, []);

  // Filter halls based on State, District, and Mandal
  const filteredHalls = halls.filter((hall) => {
    if (filterState) {
      const hallState = (hall.state || '').toLowerCase();
      const hallLoc = (hall.location || '').toLowerCase();
      const match = hallState.includes(filterState.toLowerCase()) || hallLoc.includes(filterState.toLowerCase());
      if (!match) return false;
    }
    if (filterDistrict) {
      const hallDist = (hall.district || '').toLowerCase();
      const hallLoc = (hall.location || '').toLowerCase();
      const match = hallDist.includes(filterDistrict.toLowerCase()) || hallLoc.includes(filterDistrict.toLowerCase());
      if (!match) return false;
    }
    if (filterMandal) {
      const hallMandal = (hall.mandal || '').toLowerCase();
      const hallLoc = (hall.location || '').toLowerCase();
      const match = hallMandal.includes(filterMandal.toLowerCase()) || hallLoc.includes(filterMandal.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleNavigateToHallsWithFilter = () => {
    const params = new URLSearchParams();
    if (filterState) params.set('state', filterState);
    if (filterDistrict) params.set('district', filterDistrict);
    if (filterMandal) params.set('mandal', filterMandal);
    const queryString = params.toString();
    navigate(queryString ? `/halls?${queryString}` : '/halls');
  };

  return (
    <div className="bg-cream-50 font-sans pb-16">
      {/* 1. Hero Section (Dynamic Banner) */}
      <EventHero />

      {/* 2. Location Selection for Place (State > District > Mandal) right after landing */}
      <section id="location-venues" className="w-full max-w-[95%] mx-auto py-4">
        <div className="bg-white border border-cream-200 rounded-luxury p-5 sm:p-6 shadow-luxury space-y-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gold-50 text-gold-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gold-200 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Find Venues by Place
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {filteredHalls.length} {filteredHalls.length === 1 ? 'venue' : 'venues'} found
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-primary-800 flex items-center gap-2">
                <MapPin size={22} className="text-gold-500 shrink-0" />
                <span>Filter Venues by Location</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Select your State, District, and Mandal to find nearby function halls and book instantly.
              </p>
            </div>

            {(filterState || filterDistrict || filterMandal) && (
              <button
                onClick={() => {
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterMandal('');
                }}
                className="self-start sm:self-auto text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider flex items-center gap-1 bg-cream-50 hover:bg-cream-100 px-3 py-1.5 rounded-lg border border-cream-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Reset Location
              </button>
            )}
          </div>

          {/* 3-Tier Location Selection: State -> District -> Mandal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. SELECT STATE */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                1. Select State
              </label>
              <select
                value={filterState}
                onChange={(e) => {
                  const newState = e.target.value;
                  setFilterState(newState);
                  setFilterDistrict('');
                  setFilterMandal('');
                }}
                className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-800 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">All States ({ALL_STATES.length})</option>
                {ALL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 2. SELECT DISTRICT */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                2. Select District
              </label>
              <select
                value={filterDistrict}
                disabled={!filterState}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setFilterDistrict(newDist);
                  setFilterMandal('');
                }}
                className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-800 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {filterState ? 'All Districts' : 'Select State first'}
                </option>
                {getDistrictsForState(filterState).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 3. SELECT MANDAL */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                3. Select Mandal
              </label>
              <select
                value={filterMandal}
                disabled={!filterDistrict}
                onChange={(e) => setFilterMandal(e.target.value)}
                className="w-full bg-cream-50/60 border border-cream-200 rounded-luxury px-3.5 py-2.5 text-xs text-primary-800 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {filterDistrict ? 'All Mandals' : 'Select District first'}
                </option>
                {getMandalsForDistrict(filterState, filterDistrict).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Location Filter Breadcrumb */}
          {(filterState || filterDistrict || filterMandal) && (
            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-cream-50 px-3 py-1.5 rounded-lg border border-cream-150">
              <span className="font-semibold text-primary-800">Filtered Place:</span>
              <span className="font-medium text-gold-600">
                {[filterMandal, filterDistrict, filterState].filter(Boolean).join(' › ')}
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">
                ({filteredHalls.length} matching venues)
              </span>
            </div>
          )}

          {/* Venues Grid */}
          {isLoadingHalls ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading Function Halls...</p>
            </div>
          ) : filteredHalls.length === 0 ? (
            <div className="bg-cream-50/70 border border-cream-200 rounded-luxury p-8 text-center space-y-3">
              <p className="text-sm font-bold text-primary-800">No function halls found in this location.</p>
              <p className="text-xs text-neutral-400">
                Try selecting another mandal or district, or explore all available venues across the state.
              </p>
              <button
                onClick={() => {
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterMandal('');
                }}
                className="bg-primary-800 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-primary-900 transition-all cursor-pointer"
              >
                View All Function Halls
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredHalls.slice(0, 3).map((hall) => {
                const assets = getHallAssets(hall.hallCode, hall.name);
                const isAvailable = hall.status === 'AVAILABLE';
                const placeDisplay =
                  [hall.mandal, hall.district, hall.state].filter(Boolean).join(', ') ||
                  hall.location ||
                  'Main Venue Campus';

                return (
                  <div
                    key={hall.id}
                    className="bg-white border border-cream-200 hover:border-gold-300 rounded-luxury overflow-hidden hover:shadow-luxury-lg transition-all duration-300 flex flex-col group"
                  >
                    {/* Image with status badge */}
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={assets.image}
                        alt={hall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        {isAvailable ? (
                          <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow tracking-wide uppercase flex items-center gap-1">
                            <CheckCircle2 size={10} /> Available
                          </span>
                        ) : (
                          <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow tracking-wide uppercase flex items-center gap-1">
                            <ShieldAlert size={10} /> {hall.status}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-primary-950/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                        {hall.hallCode}
                      </div>
                    </div>

                    {/* Hall Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold font-serif text-base text-primary-800 line-clamp-1">
                          {hall.name}
                        </h3>

                        {/* Place / Location */}
                        <div className="flex items-start gap-1.5 text-xs text-neutral-600 mt-1 mb-2 font-medium">
                          <MapPin size={13} className="text-gold-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{placeDisplay}</span>
                        </div>

                        {/* Capacity & Price */}
                        <div className="grid grid-cols-2 gap-2 border-t border-b border-cream-100 py-2.5 text-xs">
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Capacity</p>
                            <p className="font-bold text-primary-800 flex items-center gap-1 mt-0.5">
                              <Users size={12} className="text-gold-500" />
                              <span>{hall.capacity || 500} Pax</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Base Price</p>
                            <p className="font-bold text-gold-600 font-mono mt-0.5">
                              ₹{Number(hall.basePrice).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => navigate(`/halls/${hall.id}`)}
                          className="w-1/2 bg-cream-100 text-primary-800 font-bold text-xs py-2 rounded-lg hover:bg-cream-200 border border-cream-200 transition-all text-center cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/halls/${hall.id}/book`)}
                          className="w-1/2 bg-gold-500 text-white font-bold text-xs py-2 rounded-lg hover:bg-gold-600 transition-all text-center shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Book Now</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Directory Link */}
          <div className="pt-2 text-center border-t border-cream-100">
            <button
              onClick={handleNavigateToHallsWithFilter}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 hover:text-gold-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <span>Explore All Function Halls in Directory ({halls.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* 3. Main Services Category section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Description */}
        <div className="text-center mb-12">
          <span className="text-gold-500 font-semibold text-xs tracking-widest uppercase">Our Services</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary-800 mt-1">Everything you need for your perfect event</h2>
          <div className="luxury-divider max-w-xs mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Event Management */}
          <div className="luxury-card flex flex-col justify-between p-6 hover:shadow-luxury-lg hover:border-gold-300 transition-all duration-300">
            <div>
              <div className="bg-primary-50 text-primary-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 border border-primary-100">
                <Calendar size={22} className="text-primary-800" />
              </div>
              <h3 className="text-lg font-bold font-serif text-primary-800 mb-2">Event Management</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                We plan and manage all types of events with perfection and creativity.
              </p>
            </div>
            <button 
              onClick={() => navigate('/events/book/marriage')} 
              className="w-full py-2.5 bg-primary-800 text-white font-medium text-xs rounded-lg hover:bg-primary-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Booking &rarr;
            </button>
          </div>

          {/* Card 2: Function Hall Booking */}
          <div className="luxury-card flex flex-col justify-between p-6 border-gold-300 shadow-luxury-lg hover:border-gold-500 transition-all duration-300">
            <div>
              <div className="bg-gold-50 text-gold-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 border border-gold-200">
                <Landmark size={22} className="text-gold-600" />
              </div>
              <h3 className="text-lg font-bold font-serif text-primary-800 mb-2">Function Hall Booking</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Find and book the best function halls for your special occasions.
              </p>
            </div>
            <button 
              onClick={() => navigate('/halls')} 
              className="w-full py-2.5 bg-gold-500 text-white font-medium text-xs rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Booking &rarr;
            </button>
          </div>

          {/* Card 3: Travelling Booking */}
          <div 
            onClick={() => { navigate('/travel-booking'); }}
            className="luxury-card flex flex-col justify-between p-6 hover:shadow-luxury-lg hover:border-emerald-400 transition-all duration-300 cursor-pointer group"
          >
            <div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 border border-emerald-200 group-hover:scale-105 transition-all">
                <Car size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold font-serif text-primary-800 mb-2">Travelling Booking</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Book luxury bridal cars, guest buses, and tempo travellers for smooth event transportation.
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/travel-booking'); }} 
              className="w-full py-2.5 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
            >
              Start Booking &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* 4. Numbers / Stats Bar */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="luxury-card bg-white border border-cream-200 p-6 shadow-luxury rounded-luxury">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 justify-items-center text-center">
            
            <div className="flex flex-col items-center">
              <div className="bg-gold-50 text-gold-500 p-3 rounded-full mb-2">
                <Users size={22} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary-800">5000+</p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Happy Clients</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-gold-50 text-gold-500 p-3 rounded-full mb-2">
                <Calendar size={22} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary-800">2500+</p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Events Managed</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-gold-50 text-gold-500 p-3 rounded-full mb-2">
                <Landmark size={22} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary-800">120+</p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Function Halls</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default EventListingPage;
