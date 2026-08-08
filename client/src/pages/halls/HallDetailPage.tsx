import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { MapPin, Users, IndianRupee, ArrowRight, ExternalLink, ShieldCheck, Info, ChevronRight, Home } from 'lucide-react';
import { sampleHalls } from '../../constants/hallsData';

export const HallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const hall = sampleHalls.find((h) => h.id === id);

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
            {/* Image card */}
            <div className="bg-white border border-cream-200 rounded-luxury overflow-hidden shadow-luxury">
              <div className="h-64 sm:h-96 w-full relative">
                <img
                  src={hall.image}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-primary-800/90 text-white text-xs font-bold px-3 py-1 rounded tracking-wide uppercase">
                  ✨ Verified Venue
                </div>
              </div>

              {/* Title & Basic info */}
              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 mb-3">
                  {hall.name}
                </h1>
                
                <div className="flex items-start gap-2 text-xs text-neutral-500 mb-4">
                  <MapPin size={16} className="text-gold-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{hall.address}</span>
                </div>

                <a
                  href={hall.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 hover:text-gold-700 border border-cream-200 hover:border-gold-300 bg-cream-50/50 py-2 px-4 rounded-lg transition-all"
                >
                  View Google Maps Location <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Venue Specifications */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
              <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-4 border-b border-cream-100 pb-3">
                Venue Specifications
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* State */}
                <div className="bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">State</span>
                  <span className="text-xs font-bold text-primary-800">{hall.state}</span>
                </div>
                {/* District */}
                <div className="bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">District</span>
                  <span className="text-xs font-bold text-primary-800">{hall.district}</span>
                </div>
                {/* Mandal */}
                <div className="bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mandal</span>
                  <span className="text-xs font-bold text-primary-800">{hall.mandal}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {/* Capacity */}
                <div className="flex items-center gap-3 bg-cream-50/50 p-4 rounded-lg border border-cream-100">
                  <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Capacity</span>
                    <span className="text-xs font-bold text-primary-800">{hall.capacity} Guests Max</span>
                  </div>
                </div>
                {/* Cost */}
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

            {/* General Information Panel */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
              <h3 className="font-bold text-sm text-primary-800 tracking-wide mb-3 border-b border-cream-100 pb-3">
                Booking Information & Rules
              </h3>
              <ul className="space-y-2 text-xs text-neutral-500 list-disc list-inside leading-relaxed">
                <li>Online booking requests must be submitted at least <strong className="text-primary-800">30 days</strong> before the scheduled event date.</li>
                <li>Single-day pricing is calculated directly as the cost-per-day rate of the venue.</li>
                <li>The customer care desk is available for custom seating, food catering, and multi-day packages.</li>
                <li>Cancellations and booking modifications must be requested at least 15 days in advance.</li>
              </ul>
            </div>
          </div>

          {/* Pricing & Booking Card (Right 1/3) */}
          <div className="w-full">
            <div className="bg-white border border-cream-250 rounded-luxury p-6 shadow-luxury-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-500"></div>

              <div className="mb-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Standard Daily Rate</span>
                <span className="text-2xl font-extrabold text-primary-800 font-serif">
                  ₹{hall.costPerDay.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-400"> / Per Day + Taxes</span>
              </div>

              <div className="border-t border-cream-100 pt-4 mb-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Instant Booking Confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Digital Invoice & PDF Receipt</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Configured SMTP Email Notifications</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/halls/${hall.id}/book`)}
                className="w-full bg-gold-500 text-white font-bold text-xs py-3 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
              >
                Proceed to Booking
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
              </button>

              <div className="mt-4 text-[10px] text-gray-400 text-center">
                Requires login. Redirection happens automatically.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HallDetailPage;
