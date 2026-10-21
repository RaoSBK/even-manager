import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { MapPin, Users, IndianRupee, Search, Building, RefreshCw, CheckCircle2, ShieldAlert, ChevronRight, RotateCcw } from 'lucide-react';
import { hallApi, Hall } from '../../api/hallApi';
import { ALL_STATES, getDistrictsForState, getMandalsForDistrict } from '../../constants/hallsData';

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

export const HallListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // DB Halls state
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 3-tier Location Filters (State -> District -> Mandal)
  const [filterState, setFilterState] = useState<string>(() => searchParams.get('state') || '');
  const [filterDistrict, setFilterDistrict] = useState<string>(() => searchParams.get('district') || '');
  const [filterMandal, setFilterMandal] = useState<string>(() => searchParams.get('mandal') || '');

  // Sync if URL search params change
  useEffect(() => {
    const s = searchParams.get('state');
    const d = searchParams.get('district');
    const m = searchParams.get('mandal');
    if (s !== null) setFilterState(s);
    if (d !== null) setFilterDistrict(d);
    if (m !== null) setFilterMandal(m);
  }, [searchParams]);

  // Fetch all halls from database on mount
  const fetchAllHalls = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await hallApi.getAll();
      // Filter out deleted halls if any
      const activeHalls = (data || []).filter((h) => !h.deletedAt);
      setHalls(activeHalls);
    } catch (err: any) {
      console.error('Error fetching database halls:', err);
      setErrorMsg('Failed to load function halls. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHalls();
  }, []);

  // Filter halls based on location and search query
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
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      hall.name.toLowerCase().includes(q) ||
      (hall.location && hall.location.toLowerCase().includes(q)) ||
      (hall.description && hall.description.toLowerCase().includes(q)) ||
      (hall.hallCode && hall.hallCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-cream-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-950 rounded-luxury-lg shadow-luxury p-8 sm:p-12 mb-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-gold-500 text-xs font-bold tracking-widest uppercase mb-2 block">
              Function Halls
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-4 leading-tight">
              Function Halls & Convention Venues
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Explore all function halls available in our system with live availability and instant online reservation.
            </p>
          </div>
        </div>

        {/* Filter Venues by Location: State -> District -> Mandal */}
        <div className="bg-white border border-cream-200 rounded-luxury p-5 shadow-luxury mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-100 pb-3">
            <div>
              <h5 className="font-bold text-sm text-primary-800 font-serif flex items-center gap-2">
                <MapPin size={16} className="text-gold-500" />
                Filter Venues by Location
              </h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Select your State, District, and Mandal to find nearby function halls
              </p>
            </div>
            {(filterState || filterDistrict || filterMandal) && (
              <button
                onClick={() => {
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterMandal('');
                }}
                className="self-start sm:self-auto text-[10px] font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider flex items-center gap-1 bg-cream-50 hover:bg-cream-100 px-2.5 py-1 rounded border border-cream-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} /> Reset Location
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. SELECT STATE */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                1. Select State
              </label>
              <div className="relative">
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
            </div>

            {/* 2. SELECT DISTRICT */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                2. Select District
              </label>
              <div className="relative">
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
            </div>

            {/* 3. SELECT MANDAL */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider">
                3. Select Mandal
              </label>
              <div className="relative">
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
          </div>

          {/* Filter Status Badge */}
          {(filterState || filterDistrict || filterMandal) && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-600 bg-cream-50 px-3 py-1.5 rounded border border-cream-150">
              <span className="font-semibold text-primary-800">Active Location:</span>
              <span>
                {[filterMandal, filterDistrict, filterState].filter(Boolean).join(' › ')}
              </span>
              <span className="text-neutral-400 font-mono">
                ({filteredHalls.length} {filteredHalls.length === 1 ? 'hall' : 'halls'} found)
              </span>
            </div>
          )}
        </div>

        {/* Search Bar & Refresh Bar */}
        <div className="bg-white border border-cream-200 rounded-luxury p-4 shadow-luxury mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search function halls by name, location, or hall code..."
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50/50 border border-cream-200 rounded-lg text-xs font-semibold text-primary-800 focus:outline-none focus:border-gold-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-neutral-500">
              Showing <span className="text-gold-600 font-mono">{filteredHalls.length}</span> of {halls.length} Halls
            </span>
            <button
              onClick={fetchAllHalls}
              disabled={isLoading}
              className="bg-cream-100 hover:bg-cream-200 text-primary-800 p-2.5 rounded-lg transition-all border border-cream-200 flex items-center gap-1 text-xs font-bold"
              title="Refresh Halls List"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Halls Listing Grid */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-cream-200 rounded-luxury overflow-hidden animate-pulse">
                <div className="h-48 bg-cream-100"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-cream-150 rounded w-2/3"></div>
                  <div className="h-3 bg-cream-100 rounded w-full"></div>
                  <div className="h-3 bg-cream-100 rounded w-5/6"></div>
                  <div className="flex justify-between items-center pt-3 border-t border-cream-100">
                    <div className="h-4 bg-cream-150 rounded w-1/3"></div>
                    <div className="h-8 bg-cream-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="bg-white border border-cream-200 rounded-luxury p-12 text-center max-w-md mx-auto shadow-luxury">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldAlert size={28} className="text-red-500" />
            </div>
            <h4 className="font-bold text-sm text-primary-800 uppercase tracking-wider mb-2">
              Unable to Load Halls
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed mb-6">
              {errorMsg}
            </p>
            <button
              onClick={fetchAllHalls}
              className="bg-primary-800 text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-primary-900 transition-all shadow"
            >
              Try Again
            </button>
          </div>
        ) : filteredHalls.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-cream-200 rounded-luxury p-12 text-center max-w-md mx-auto shadow-luxury">
            <div className="w-16 h-16 bg-cream-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cream-100">
              <Building size={28} className="text-gray-400" />
            </div>
            <h4 className="font-bold text-sm text-primary-800 uppercase tracking-wider mb-2">
              {searchQuery || filterState || filterDistrict || filterMandal
                ? 'No Matching Halls Found'
                : 'No Function Halls Available'}
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed mb-6">
              {searchQuery || filterState || filterDistrict || filterMandal
                ? `No function halls match your search or location criteria. Try changing or resetting the filters.`
                : 'There are currently no function halls added in the Admin Panel.'}
            </p>
            {(searchQuery || filterState || filterDistrict || filterMandal) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterMandal('');
                }}
                className="bg-primary-800 text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-primary-900 transition-all shadow cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          /* Halls Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHalls.map((hall) => {
              const assets = getHallAssets(hall.hallCode, hall.name);
              const isAvailable = hall.status === 'AVAILABLE';

              return (
                <div
                  key={hall.id}
                  className={`bg-white border rounded-luxury overflow-hidden hover:shadow-luxury-lg transition-all duration-300 flex flex-col group ${
                    isAvailable ? 'border-cream-200 hover:border-gold-300' : 'border-cream-200 opacity-90'
                  }`}
                >
                  {/* Image wrapper */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={assets.image}
                      alt={hall.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {isAvailable ? (
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow tracking-wide uppercase flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Available
                        </span>
                      ) : (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow tracking-wide uppercase flex items-center gap-1">
                          <ShieldAlert size={11} />
                          {hall.status}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-primary-950/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                      {hall.hallCode}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold font-serif text-lg text-primary-800 mb-1 truncate">
                        {hall.name}
                      </h3>
                      
                      <div className="flex items-start gap-1.5 text-xs text-neutral-500 mb-3">
                        <MapPin size={14} className="text-gold-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {hall.location || 'Main Venue Campus'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
                        {hall.description || 'Luxury banquet & function hall equipped with modern facilities.'}
                      </p>

                      {/* Facilities list */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {assets.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} className="bg-cream-100 text-primary-800 text-[9px] font-semibold px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                        {assets.facilities.length > 3 && (
                          <span className="text-[9px] text-neutral-400 font-bold self-center ml-1">
                            +{assets.facilities.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Capacity and cost per day */}
                      <div className="grid grid-cols-2 gap-3 border-t border-b border-cream-100 py-3 mb-5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="bg-cream-50 p-1.5 rounded-full text-gold-500 shrink-0">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Capacity</p>
                            <p className="font-bold text-primary-800">{hall.capacity || 500} Pax</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-cream-50 p-1.5 rounded-full text-gold-500 shrink-0">
                            <IndianRupee size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Base Price</p>
                            <p className="font-bold text-primary-800">₹{Number(hall.basePrice).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/halls/${hall.id}`)}
                        className="w-1/2 bg-cream-100 text-primary-800 font-bold text-xs py-2.5 rounded-lg hover:bg-cream-200 border border-cream-200 transition-all text-center"
                      >
                        View Details
                      </button>

                      {isAvailable ? (
                        <button
                          onClick={() => navigate(`/halls/${hall.id}/book`)}
                          className="w-1/2 bg-gold-500 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-gold-600 transition-all text-center shadow-sm flex items-center justify-center gap-1"
                        >
                          <span>Book Hall</span>
                          <ChevronRight size={14} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-1/2 bg-gray-150 text-gray-400 font-bold text-xs py-2.5 rounded-lg border border-gray-200 text-center cursor-not-allowed"
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
    </div>
  );
};

export default HallListingPage;
