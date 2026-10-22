import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/common/Navbar';
import { ShieldCheck, Percent, HelpCircle, Lock, Instagram, Mail, Facebook, Youtube } from 'lucide-react';
import { contactConfig } from '../constants/contactConfig';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-primary-800 font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Luxury Footer Banner (Matching Landing Page Footer Bar) */}
      <footer className="bg-primary-900 text-white border-t border-cream-900/10 py-6 sm:py-8 font-sans">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <div className="p-2.5 rounded-full bg-white/10 text-gold-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide">Trusted & Reliable</h4>
                <p className="text-[10px] text-gray-300">Years of premium experience</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <div className="p-2.5 rounded-full bg-white/10 text-gold-400">
                <Percent size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide">Best Price Guarantee</h4>
                <p className="text-[10px] text-gray-300">Affordable & transparent pricing</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <div className="p-2.5 rounded-full bg-white/10 text-gold-400">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide">24/7 Support</h4>
                <p className="text-[10px] text-gray-300">We are always here to help you</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <div className="p-2.5 rounded-full bg-white/10 text-gold-400">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide">Secure Booking</h4>
                <p className="text-[10px] text-gray-300">Safe & encrypted payments</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} GK BOOKING. All rights reserved. Designed for Premium Events.</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a 
                href={contactConfig.email.value} 
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                title="Send Email"
              >
                <Mail size={14} className="text-gold-400" />
                <span>{contactConfig.email.display}</span>
              </a>
              <a 
                href={contactConfig.socials.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                title="Follow us on Instagram"
              >
                <Instagram size={14} className="text-gold-400" />
                <span>Instagram</span>
              </a>
              <a 
                href={contactConfig.socials.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={14} className="text-gold-400" />
                <span>Facebook</span>
              </a>
              <a 
                href={contactConfig.socials.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                title="Subscribe on YouTube"
              >
                <Youtube size={14} className="text-gold-400" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
