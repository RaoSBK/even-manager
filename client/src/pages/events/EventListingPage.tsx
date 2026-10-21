import React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Landmark, Users, Car } from 'lucide-react';
import EventHero from '../../components/home/EventHero';

export const EventListingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-cream-50 font-sans pb-16">
      {/* 1. Hero Section (Dynamic Banner) */}
      <EventHero />

      {/* 2. Main Services Category section */}
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

      {/* 3. Numbers / Stats Bar (Image 2 Bottom middle) */}
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
