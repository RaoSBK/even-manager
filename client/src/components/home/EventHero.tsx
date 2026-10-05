import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Award, Users, ArrowRight, X } from 'lucide-react';
import heroImage from '../../assets/images/hero-wedding.jpg';

export const EventHero: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    // Trigger animations on load
    setMounted(true);
  }, []);

  const existingEventOptions = [
    { name: 'Marriage Function', path: '/events/book/marriage', icon: '💍', desc: 'Pre-wedding, rituals & grand reception' },
    { name: 'Birthday Party', path: '/events/book/birthday', icon: '🎂', desc: 'Custom themes & catering' },
    { name: 'Saree Function', path: '/events/book/saree', icon: '✨', desc: 'Traditional decor & stage setups' },
    { name: 'Dawath', path: '/events/book/dawath', icon: '🍽️', desc: 'Premium banquet dining & feasts' },
    { name: 'Other Events', path: '/events/book/other', icon: '🎉', desc: 'Custom event management' }
  ];

  return (
    <section className="relative w-full max-w-[95%] mx-auto pt-8 pb-12 z-10">
      <div className="overflow-hidden bg-white relative flex flex-col lg:flex-row items-center border border-cream-200 rounded-luxury shadow-luxury min-h-[550px] w-full z-10">
        {/* 1. Background / Right Side Image */}
        <div 
          className="w-full h-[280px] sm:h-[350px] lg:h-full lg:absolute lg:right-0 lg:top-0 lg:w-[58%] bg-cover bg-[position:center_right] order-last lg:order-none z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Soft edge blending to merge image with the left white content area */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        </div>

        {/* 2. Left Content Container */}
        <div className="w-full lg:w-[48%] p-8 sm:p-12 lg:p-16 z-10 flex flex-col items-start text-left">
          
          {/* Top Pill Badge */}
          <div 
            className={`transition-all duration-700 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            } mb-6`}
          >
            <span className="inline-block bg-white text-[#155EEF] text-[15px] font-bold px-5 py-2.5 rounded-full border border-blue-100 shadow-sm uppercase tracking-wider">
              Welcome To
            </span>
          </div>

          {/* Main Heading */}
          <h1 
            className={`text-[42px] sm:text-[54px] lg:text-[68px] font-[900] tracking-tight leading-[0.95] sm:leading-[1.0] mb-5 font-sans transition-all duration-700 delay-100 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-[#155EEF] block">GK EVENT</span>
            <span className="text-[#101828] block mt-1">MANAGEMENT</span>
          </h1>

          {/* Description */}
          <p 
            className={`text-[17px] sm:text-[18px] text-[#344054] font-medium leading-relaxed max-w-[480px] mb-8 transition-all duration-700 delay-200 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            From Dream Events to Perfect Celebrations –<br className="hidden sm:inline" />
            We handle every detail with creativity & perfection.
          </p>

          {/* Feature Highlights */}
          <div 
            className={`flex flex-wrap items-center gap-6 mb-8 transition-all duration-700 delay-300 transform ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Feature 1 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-blue-100 flex items-center justify-center bg-[#F8FAFC] text-[#155EEF] shrink-0 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div className="text-[12px] leading-tight">
                <p className="font-bold text-[#101828]">Best Planning</p>
                <p className="text-[#344054] mt-0.5">Every Detail</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-blue-100 flex items-center justify-center bg-[#F8FAFC] text-[#155EEF] shrink-0 shadow-sm">
                <Award size={20} />
              </div>
              <div className="text-[12px] leading-tight">
                <p className="font-bold text-[#101828]">Premium</p>
                <p className="text-[#344054] mt-0.5">Services</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-blue-100 flex items-center justify-center bg-[#F8FAFC] text-[#155EEF] shrink-0 shadow-sm">
                <Users size={20} />
              </div>
              <div className="text-[12px] leading-tight">
                <p className="font-bold text-[#101828]">Memorable</p>
                <p className="text-[#344054] mt-0.5">Experiences</p>
              </div>
            </div>
          </div>

          {/* Call to Actions (Buttons) */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-700 delay-400 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button 
              onClick={() => setIsBookingModalOpen(true)} 
              className="bg-[#155EEF] hover:bg-[#1254d3] text-white font-bold text-[16px] px-8 rounded-[8px] h-[52px] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <span>Book Now</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/events')} 
              className="bg-white border border-[#155EEF] text-[#155EEF] hover:bg-blue-50/40 font-bold text-[16px] px-8 rounded-[8px] h-[52px] flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
            >
              <span>Explore Services</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>

      {/* Booking Options Modal Overlay */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-cream-200 rounded-luxury max-w-lg w-full p-6 shadow-luxury relative animate-in fade-in zoom-in-95 duration-200 space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-cream-100 pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-primary-800">Select Booking Option</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Select an existing event option to proceed with your booking</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-neutral-400 hover:text-primary-800 p-1.5 rounded-full transition-all hover:bg-cream-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {existingEventOptions.map((opt) => (
                <button
                  key={opt.path}
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    navigate(opt.path);
                  }}
                  className="flex items-start gap-3 p-3.5 border border-cream-200 hover:border-gold-400 hover:bg-cream-50/60 rounded-luxury text-left transition-all group"
                >
                  <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                  <div>
                    <p className="font-bold text-primary-800 text-xs group-hover:text-gold-600 transition-all font-serif">
                      {opt.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-cream-100 text-center">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-xs font-bold text-neutral-500 hover:text-primary-800 uppercase tracking-wider py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventHero;
