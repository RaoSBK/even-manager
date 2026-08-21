import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Users, IndianRupee, Search, Building, ExternalLink, RefreshCw } from 'lucide-react';
import { locationsData, sampleHalls, FunctionHall } from '../../constants/hallsData';

export const HallListingPage: React.FC = () => {
  const navigate = useNavigate();

  // Dropdown States
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedMandal, setSelectedMandal] = useState<string>('');

  // Dropdown Options
  const [statesList, setStatesList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [mandalsList, setMandalsList] = useState<string[]>([]);

  // Search, loading and halls list
  const [filteredHalls, setFilteredHalls] = useState<FunctionHall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTriggered, setSearchTriggered] = useState<boolean>(false);

  // Initialize States
  useEffect(() => {
    setStatesList(Object.keys(locationsData.states));
  }, []);

  // Update Districts when State changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict('');
    setSelectedMandal('');
    setMandalsList([]);
    
    if (stateName) {
      setDistrictsList(Object.keys(locationsData.states[stateName].districts));
    } else {
      setDistrictsList([]);
    }
  };

  // Update Mandals when District changes
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedMandal('');
    
    if (selectedState && districtName) {
      setMandalsList(locationsData.states[selectedState].districts[districtName]);
    } else {
      setMandalsList([]);
    }
  };

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !selectedDistrict || !selectedMandal) return;

    setIsLoading(true);
    setSearchTriggered(true);

    setTimeout(() => {
      const results = sampleHalls.filter(
        (hall) =>
          hall.state.toLowerCase() === selectedState.toLowerCase() &&
          hall.district.toLowerCase() === selectedDistrict.toLowerCase() &&
          hall.mandal.toLowerCase() === selectedMandal.toLowerCase()
      );
      setFilteredHalls(results);
      setIsLoading(false);
    }, 800);
  };

  // Clear filters
  const handleReset = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMandal('');
    setDistrictsList([]);
    setMandalsList([]);
    setFilteredHalls([]);
    setSearchTriggered(false);
  };

  return (
    <div className="bg-cream-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-950 rounded-luxury-lg shadow-luxury p-8 sm:p-12 mb-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-gold-500 text-xs font-bold tracking-widest uppercase mb-2 block">
              Luxury Function Halls
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-4 leading-tight">
              Find the Perfect Venue for Your Celebration
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Explore premium banquet spaces and function halls across multiple states, districts, and mandals with seamless online booking and validation.
            </p>
          </div>
        </div>

        {/* Location Selector Card */}
        <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-cream-100 pb-3">
            <MapPin size={18} className="text-gold-500" />
            <h3 className="font-bold text-sm text-primary-800 tracking-wide">
              Select Venue Location
            </h3>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* State Select */}
            <div>
              <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer"
              >
                <option value="">Select State</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!selectedState}
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select District</option>
                {districtsList.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            {/* Mandal Select */}
            <div>
              <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                Mandal <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!selectedDistrict}
                value={selectedMandal}
                onChange={(e) => setSelectedMandal(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Mandal</option>
                {mandalsList.map((md) => (
                  <option key={md} value={md}>
                    {md}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!selectedMandal}
                className="flex-1 bg-gold-500 text-white font-bold text-xs py-3 px-4 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={14} />
                Search Halls
              </button>
              {searchTriggered && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-cream-100 hover:bg-cream-200 text-primary-800 p-3 rounded-lg transition-all"
                  title="Reset Filters"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Halls Listing Results */}
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
        ) : searchTriggered ? (
          filteredHalls.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-cream-200 rounded-luxury p-12 text-center max-w-md mx-auto shadow-luxury">
              <div className="w-16 h-16 bg-cream-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cream-100">
                <Building size={28} className="text-gray-400" />
              </div>
              <h4 className="font-bold text-sm text-primary-800 uppercase tracking-wider mb-2">
                No Halls Available
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                We couldn't find any function halls in the selected Mandal ({selectedMandal}). Please try checking neighboring districts or mandals.
              </p>
              <button
                onClick={handleReset}
                className="bg-primary-800 text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-primary-900 transition-all shadow"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Halls Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHalls.map((hall) => (
                <div
                  key={hall.id}
                  className="bg-white border border-cream-200 rounded-luxury overflow-hidden hover:shadow-luxury-lg hover:border-gold-300 transition-all duration-300 flex flex-col group"
                >
                  {/* Image wrapper */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={hall.image}
                      alt={hall.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-primary-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                      ⭐ Premium
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold font-serif text-lg text-primary-800 mb-2 truncate">
                        {hall.name}
                      </h3>
                      
                      <div className="flex items-start gap-1.5 text-xs text-neutral-500 mb-4">
                        <MapPin size={14} className="text-gold-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {hall.address}
                        </span>
                      </div>

                      {/* Google Maps link */}
                      <a
                        href={hall.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-600 hover:text-gold-700 transition-all mb-4"
                      >
                        View on Google Maps <ExternalLink size={10} />
                      </a>

                      {/* Short Description */}
                      <p className="text-xs text-neutral-500 mb-3 line-clamp-2 leading-relaxed">
                        {hall.description}
                      </p>

                      {/* Facilities list */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {hall.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} className="bg-cream-100 text-primary-800 text-[9px] font-semibold px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                        {hall.facilities.length > 3 && (
                          <span className="text-[9px] text-neutral-400 font-bold self-center ml-1">
                            +{hall.facilities.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Capacity and cost per day */}
                      <div className="grid grid-cols-2 gap-3 border-t border-b border-cream-100 py-3 mb-5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="bg-cream-50 p-1.5 rounded-full text-gold-500">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Capacity</p>
                            <p className="font-bold text-primary-800">{hall.capacity} Guests</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-cream-50 p-1.5 rounded-full text-gold-500">
                            <IndianRupee size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cost / Day</p>
                            <p className="font-bold text-primary-800">₹{hall.costPerDay.toLocaleString('en-IN')}</p>
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
                      <button
                        onClick={() => navigate(`/halls/${hall.id}/book`)}
                        className="w-1/2 bg-gold-500 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-gold-600 transition-all text-center shadow-sm"
                      >
                        Book Now &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Initial State - guide users to search */
          <div className="bg-white border border-cream-200 rounded-luxury p-12 text-center max-w-lg mx-auto shadow-luxury">
            <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-100">
              <Search size={28} className="text-gold-500" />
            </div>
            <h4 className="font-bold text-base text-primary-800 font-serif mb-2">
              Start Your Search
            </h4>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-sm mx-auto">
              Please select a State, District, and Mandal above to display the available convention centers, halls, and pricing.
            </p>
            
            {/* Quick Suggestions / Help */}
            <div className="mt-8 border-t border-cream-100 pt-6 text-left">
              <h5 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest mb-3">
                Quick Sample Search (Telangana)
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    handleStateChange('Telangana');
                    setTimeout(() => {
                      handleDistrictChange('Mahabubnagar');
                      setSelectedMandal('Jadcherla');
                    }, 50);
                  }}
                  className="bg-cream-50 hover:bg-cream-100 border border-cream-200 rounded-full px-3 py-1.5 text-[10px] font-bold text-primary-800 transition-all"
                >
                  📍 Mahabubnagar → Jadcherla
                </button>
                <button
                  onClick={() => {
                    handleStateChange('Telangana');
                    setTimeout(() => {
                      handleDistrictChange('Nagarkurnool');
                      setSelectedMandal('Nagarkurnool');
                    }, 50);
                  }}
                  className="bg-cream-50 hover:bg-cream-100 border border-cream-200 rounded-full px-3 py-1.5 text-[10px] font-bold text-primary-800 transition-all"
                >
                  📍 Nagarkurnool → Nagarkurnool
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HallListingPage;
