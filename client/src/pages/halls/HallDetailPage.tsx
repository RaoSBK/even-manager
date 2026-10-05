import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { MapPin, Users, IndianRupee, ArrowRight, Info, ChevronRight, Home } from 'lucide-react';
import { hallApi } from '../../api/hallApi';
import { sampleHalls } from '../../constants/hallsData';

// Mapped assets for halls
const getHallAssets = (hallCode: string, name: string) => {
  const code = (hallCode || '').toUpperCase();
  const nameLower = (name || '').toLowerCase();
  if (code === 'HALL-A' || nameLower.includes('taj mahal')) {
    return {
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800'
      ],
      facilities: ['Central A/C', 'Luxury Chandelier Lighting', 'Premium JBL Sound System', 'Two VIP Lounges', 'Large Decor Stage', '24/7 Power Backup']
    };
  }
  if (code === 'T-LGA' || nameLower.includes('luxury grand') || nameLower.includes('arena')) {
    return {
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
      ],
      facilities: ['Central A/C', 'Spacious Seating Area', 'Concert-Grade Sound System', 'Dressing Rooms', 'Separate Dining Hall', 'Valet Parking']
    };
  }
  return {
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
    ],
    facilities: ['Spacious Stage', 'Standard Sound System', 'Dining Chairs & Tables', 'Changing Rooms']
  };
};

export const HallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const loadHallDetails = async () => {
      setLoading(true);
      if (!id) {
        setLoading(false);
        return;
      }
      
      // First check local sampleHalls
      const sample = sampleHalls.find((h) => h.id === id);
      if (sample) {
        setHall(sample);
        setActiveImage(sample.image);
        setLoading(false);
        return;
      }

      // Fetch from DB
      try {
        const dbHall = await hallApi.getById(id);
        if (dbHall) {
          const assets = getHallAssets(dbHall.hallCode, dbHall.name);
          const mapped = {
            id: dbHall.id,
            name: dbHall.name,
            hallCode: dbHall.hallCode,
            address: dbHall.location || 'Main Venue Campus',
            description: dbHall.description || 'Luxury banquet and function hall equipped with state-of-the-art facilities.',
            capacity: dbHall.capacity || 500,
            costPerDay: Number(dbHall.basePrice),
            image: assets.image,
            images: assets.images,
            facilities: assets.facilities,
            status: dbHall.status,
            state: 'Telangana',
            district: 'Central',
            mandal: 'Main'
          };
          setHall(mapped);
          setActiveImage(assets.image);
        }
      } catch (err) {
        console.error('Error fetching hall details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHallDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-cream-50 min-h-screen py-16 font-sans flex flex-col items-center justify-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-800 border-t-transparent"></span>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading venue details...</p>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="bg-cream-50 min-h-screen py-16 font-sans flex items-center justify-center">
        <div className="bg-white border border-cream-200 rounded-luxury p-8 max-w-md text-center shadow-luxury">
          <Info size={36} className="text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-primary-800 mb-2">Hall Not Found</h3>
          <p className="text-neutral-400 text-xs mb-6">
            The function hall you are trying to view does not exist or has been removed.
          </p>
          <Link
            to="/halls"
            className="bg-primary-800 text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-primary-900 transition-all inline-block shadow"
          >
            Back to Hall Listings
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = hall.status === 'AVAILABLE' || !hall.status;

  return (
    <div className="bg-cream-50 min-h-screen py-8 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-gold-500 transition-all flex items-center gap-1">
            <Home size={13} className="text-gold-500" />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to="/halls" className="hover:text-gold-500 transition-all">
            Function Halls
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-primary-800 font-medium">{hall.name}</span>
        </div>

        {/* Details Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info Columns (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image card & gallery */}
            <div className="bg-white border border-cream-200 rounded-luxury overflow-hidden shadow-luxury">
              <div className="h-64 sm:h-96 w-full relative">
                <img
                  src={activeImage}
                  alt={hall.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-4 left-4 bg-primary-800/90 text-white text-xs font-bold px-3 py-1 rounded tracking-wide uppercase">
                  ✨ Verified Venue
                </div>
              </div>

              {/* Thumbnails Gallery */}
              {hall.images && hall.images.length > 0 && (
                <div className="flex gap-2 p-4 bg-cream-50/50 border-t border-cream-100 overflow-x-auto">
                  {hall.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-14 rounded overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img ? 'border-gold-500 scale-95 shadow-sm' : 'border-transparent hover:border-cream-300'
                      }`}
                    >
                      <img src={img} alt={`${hall.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Basic info */}
              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 mb-3">
                  {hall.name}
                </h1>
                
                <div className="flex items-start gap-2 text-xs text-neutral-500 mb-4">
                  <MapPin size={16} className="text-gold-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{hall.address}</span>
                </div>
              </div>
            </div>

            {/* Venue Description */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
              <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-3 border-b border-cream-100 pb-3">
                Full Description
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                {hall.description}
              </p>
            </div>

            {/* Facilities Panel */}
            {hall.facilities && hall.facilities.length > 0 && (
              <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
                <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-4 border-b border-cream-100 pb-3">
                  Available Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hall.facilities.map((fac: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-500 bg-cream-50/30 p-2.5 rounded border border-cream-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                      <span className="font-semibold">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity & Price */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
              <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-4 border-b border-cream-100 pb-3">
                Venue Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Capacity</span>
                    <span className="text-xs font-bold text-primary-800">{hall.capacity} Guests Max</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Price Per Day</span>
                    <span className="text-xs font-bold text-primary-800">₹{hall.costPerDay.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
              <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-3 border-b border-cream-100 pb-3">
                Availability Status
              </h3>
              {isAvailable ? (
                <div className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <div className="bg-emerald-100 text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">Available for Online Booking</span>
                    <span className="text-[10px] text-emerald-600 leading-relaxed block mt-0.5">
                      Live schedule availability is validated automatically during checkout.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                  <div className="bg-amber-100 text-amber-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 block">Currently Unavailable ({hall.status})</span>
                    <span className="text-[10px] text-amber-600 leading-relaxed block mt-0.5">
                      This venue hall is currently under maintenance or disabled by administration.
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Action Sidebar */}
          <div className="w-full">
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury space-y-5 sticky top-6">
              <div className="border-b border-cream-100 pb-4">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Starting Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-gold-600">₹{hall.costPerDay.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-neutral-400 font-medium">/ event day</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 border-b border-cream-100 pb-4">
                <div className="flex justify-between">
                  <span>Guest Capacity:</span>
                  <span className="font-bold text-primary-800">{hall.capacity} Pax</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-bold text-primary-800 truncate max-w-[120px]">{hall.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-bold uppercase text-[10px] ${isAvailable ? 'text-green-600' : 'text-amber-600'}`}>
                    {isAvailable ? 'Available' : hall.status}
                  </span>
                </div>
              </div>

              {isAvailable ? (
                <button
                  onClick={() => navigate(`/halls/${hall.id}/book`)}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs rounded-lg transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Book This Hall</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-gray-150 text-gray-400 font-bold text-xs rounded-lg border border-gray-200 text-center uppercase tracking-wider cursor-not-allowed"
                >
                  Currently Unavailable
                </button>
              )}

              <button
                onClick={() => navigate('/halls')}
                className="w-full py-2.5 border border-cream-200 hover:bg-cream-50 text-primary-800 font-bold text-xs rounded-lg transition-all uppercase tracking-wider text-center"
              >
                Back to All Halls
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HallDetailPage;
