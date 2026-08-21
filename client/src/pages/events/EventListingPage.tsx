import React from 'react';
import { useNavigate } from 'react-router';
import { 
  Sparkles, Calendar, Landmark, Phone, 
  MessageSquare, Instagram, Facebook, Youtube, Mail,
  Users, Award
} from 'lucide-react';
import { contactConfig } from '../../constants/contactConfig';

export const EventListingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-cream-50 font-sans pb-16">
      {/* 1. Hero Section (Image 2 Top) */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="luxury-card overflow-hidden bg-white relative flex flex-col lg:flex-row items-center border border-cream-200">
          
          {/* Hero Left Content */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 z-10">
            <span className="inline-block bg-cream-100 text-gold-600 text-xs font-semibold px-3.5 py-1.5 rounded-full tracking-wider uppercase mb-4">
              Welcome To
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-800 tracking-tight leading-none font-serif">
              GK
              <span className="block text-gold-500 mt-2">BOOKING</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-3 mb-6">
              <div className="h-[2px] w-12 bg-gold-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500"></div>
              <div className="h-[2px] w-12 bg-gold-400"></div>
            </div>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md mb-8">
              From dream events to perfect celebrations - We handle every detail with creativity & perfection.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-2 border border-cream-100 bg-cream-50/50 p-2.5 rounded-luxury">
                <Sparkles size={16} className="text-gold-500 shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-primary-800">Best Planning</p>
                  <p className="text-gray-400">Every Detail</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-cream-100 bg-cream-50/50 p-2.5 rounded-luxury">
                <Award size={16} className="text-gold-500 shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-primary-800">Premium</p>
                  <p className="text-gray-400">Services</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-cream-100 bg-cream-50/50 p-2.5 rounded-luxury">
                <Users size={16} className="text-gold-500 shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-primary-800">Memorable</p>
                  <p className="text-gray-400">Experiences</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/events/book/marriage')} 
                className="luxury-button-primary"
              >
                Book Now &rarr;
              </button>
              <button 
                onClick={() => navigate('/events')} 
                className="luxury-button-secondary"
              >
                Explore Services &rarr;
              </button>
            </div>
          </div>

          {/* Hero Right Visual (Warm Stage Scene Mockup with gradients) */}
          <div className="w-full lg:w-1/2 h-[350px] lg:h-[520px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10 hidden lg:block"></div>
            {/* Visual elements representing premium wedding layout */}
            <div className="w-full h-full bg-cover bg-center flex flex-col justify-end p-8 relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent"></div>
              <div className="z-10 text-white max-w-sm">
                <span className="text-gold-400 text-xs font-bold tracking-widest uppercase">Premium Venues</span>
                <h3 className="text-xl font-serif font-bold mt-1 text-white">Grand Stage & Decoration Decor</h3>
                <p className="text-xs text-gray-300 mt-1">Stunning flower setups and crystal lighting customized to your specifications.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Services Category section (Image 2 Middle) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Description */}
        <div className="text-center mb-12">
          <span className="text-gold-500 font-semibold text-xs tracking-widest uppercase">Our Services</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary-800 mt-1">Everything you need for your perfect event</h2>
          <div className="luxury-divider max-w-xs mx-auto mt-3"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Cards Grid */}
          <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
            
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
                className="w-full py-2.5 bg-primary-800 text-white font-medium text-xs rounded-lg hover:bg-primary-900 transition-all flex items-center justify-center gap-1.5"
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
                className="w-full py-2.5 bg-gold-500 text-white font-medium text-xs rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-1.5"
              >
                Start Booking &rarr;
              </button>
            </div>

          </div>

          {/* Right Customer Care Card (Image 2 Right) */}
          <div className="w-full lg:w-1/4">
            <div className="luxury-card p-6 border-cream-200 shadow-luxury h-full flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-cream-100">
                  <Phone size={18} className="text-gold-500" />
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Customer Care</h3>
                </div>

                <div className="mt-6 space-y-4">
                  <a href={contactConfig.phone.value} className="flex items-center gap-3 text-xs text-neutral-700 hover:text-gold-600 transition-all">
                    <div className="bg-gold-50 text-gold-600 p-2 rounded-full"><Phone size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Call Support</p>
                      <p className="font-semibold text-primary-800">{contactConfig.phone.display}</p>
                    </div>
                  </a>

                  <a href={contactConfig.whatsapp.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs text-neutral-700 hover:text-gold-600 transition-all">
                    <div className="bg-green-50 text-green-600 p-2 rounded-full"><MessageSquare size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">WhatsApp</p>
                      <p className="font-semibold text-primary-800">WhatsApp Chat</p>
                    </div>
                  </a>

                  <a href="#" className="flex items-center gap-3 text-xs text-neutral-700 hover:text-gold-600 transition-all">
                    <div className="bg-pink-50 text-pink-600 p-2 rounded-full"><Instagram size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Instagram</p>
                      <p className="font-semibold text-primary-800">Instagram Profile</p>
                    </div>
                  </a>

                  <a href="#" className="flex items-center gap-3 text-xs text-neutral-700 hover:text-gold-600 transition-all">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><Facebook size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Facebook</p>
                      <p className="font-semibold text-primary-800">Facebook Page</p>
                    </div>
                  </a>

                  <a href="#" className="flex items-center gap-3 text-xs text-neutral-700 hover:text-gold-600 transition-all">
                    <div className="bg-red-50 text-red-600 p-2 rounded-full"><Youtube size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">YouTube</p>
                      <p className="font-semibold text-primary-800">YouTube Channel</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-8 border-t border-cream-100 pt-5">
                <a 
                  href="#contact" 
                  className="w-full py-2.5 border border-gold-500 text-gold-600 hover:bg-gold-50 font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={14} />
                  Contact Us
                </a>
              </div>
            </div>
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
