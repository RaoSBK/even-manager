import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Phone, User, ChevronDown, Menu, X, LogOut, Settings, Calendar } from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/events');
    }
    return location.pathname.startsWith(path);
  };

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-cream-200 shadow-sm font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="GK Events Logo" className="w-14 h-14 object-contain shrink-0" />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-primary-800 tracking-wide uppercase leading-tight font-serif">
                GK Event Management
              </h1>
              <p className="text-[9px] sm:text-[10px] text-gold-600 tracking-widest leading-none font-serif italic">
                Making Memories, Celebrating Moments
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-[1px] w-8 bg-gold-400"></div>
                <div className="w-1 h-1 rounded-full bg-gold-500"></div>
                <div className="h-[1px] w-8 bg-gold-400"></div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/"
              className={`text-sm font-medium tracking-wide transition-all py-1 border-b-2 ${
                isActive('/') ? 'text-gold-500 border-gold-500' : 'text-primary-800 border-transparent hover:text-gold-500'
              }`}
            >
              Home
            </Link>
            
            <div className="relative group py-1">
              <button className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-gold-500 transition-all tracking-wide">
                Services <ChevronDown size={14} className="text-gold-500" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-cream-200 shadow-luxury rounded-luxury py-2 w-48 mt-1">
                <Link to="/events/book/marriage" className="block px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 hover:text-gold-600">Marriage Function</Link>
                <Link to="/events/book/birthday" className="block px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 hover:text-gold-600">Birthday Party</Link>
                <Link to="/events/book/saree" className="block px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 hover:text-gold-600">Saree Function</Link>
                <Link to="/events/book/dawath" className="block px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 hover:text-gold-600">Dawath</Link>
                <Link to="/events/book/other" className="block px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 hover:text-gold-600">Other Events</Link>
              </div>
            </div>

            <Link
              to="/halls"
              className={`text-sm font-medium tracking-wide transition-all py-1 border-b-2 ${
                isActive('/halls') ? 'text-gold-500 border-gold-500' : 'text-primary-800 border-transparent hover:text-gold-500'
              }`}
            >
              Function Halls
            </Link>

            <Link
              to="/travel"
              className={`text-sm font-medium tracking-wide transition-all py-1 border-b-2 ${
                isActive('/travel') ? 'text-gold-500 border-gold-500' : 'text-primary-800 border-transparent hover:text-gold-500'
              }`}
            >
              Travel
            </Link>

            <Link
              to="/dashboard"
              className={`text-sm font-medium tracking-wide transition-all py-1 border-b-2 ${
                isActive('/dashboard') ? 'text-gold-500 border-gold-500' : 'text-primary-800 border-transparent hover:text-gold-500'
              }`}
            >
              My Bookings
            </Link>

            <a
              href="#contact"
              className="text-sm font-medium text-primary-800 hover:text-gold-500 transition-all tracking-wide py-1"
            >
              Contact
            </a>

            <a
              href="#help"
              className="text-sm font-medium text-primary-800 hover:text-gold-500 transition-all tracking-wide py-1"
            >
              Help
            </a>
          </nav>

          {/* Contact Details & User profile */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Phone */}
            <a
              href="tel:+911234567890"
              className="flex items-center gap-2 border border-cream-200 bg-cream-50/50 hover:bg-cream-50 px-4 py-2 rounded-full text-xs font-semibold text-primary-800 transition-all"
            >
              <Phone size={14} className="text-gold-500" />
              <span>+91 12345 67890</span>
            </a>

            {/* Profile Dropdown / Login button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-1.5 border border-cream-200 hover:border-gold-500 p-2 rounded-full transition-all bg-cream-50/30"
                >
                  <div className="bg-primary-800 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <ChevronDown size={14} className="text-gold-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-cream-200 shadow-luxury-lg rounded-luxury py-2 z-50">
                    <div className="px-4 py-2 border-b border-cream-100">
                      <p className="text-sm font-semibold text-primary-800">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-[10px] uppercase font-bold text-gold-600 mt-1 bg-gold-50 px-2 py-0.5 rounded-full inline-block">
                        {user.role}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-800 hover:bg-cream-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={15} className="text-gold-500" /> My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-800 hover:bg-cream-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Calendar size={15} className="text-gold-500" /> Bookings
                    </Link>
                    {user.role !== 'Customer' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-800 hover:bg-cream-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={15} className="text-gold-500" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-cream-100 mt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => login('Customer')}
                className="flex items-center gap-2 bg-primary-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-primary-900 transition-all shadow-md"
              >
                <User size={14} />
                <span>Login / Signup</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="bg-primary-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-primary-800 hover:text-gold-500 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-cream-200 py-4 px-4 shadow-inner space-y-3 font-sans">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-primary-800 hover:text-gold-500 py-1"
          >
            Home
          </Link>
          <div className="space-y-1.5 pl-3 border-l-2 border-gold-300">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Services</span>
            <Link to="/events/book/marriage" onClick={() => setIsMenuOpen(false)} className="block text-sm text-primary-700 hover:text-gold-500 py-0.5">Marriage Function</Link>
            <Link to="/events/book/birthday" onClick={() => setIsMenuOpen(false)} className="block text-sm text-primary-700 hover:text-gold-500 py-0.5">Birthday Party</Link>
            <Link to="/events/book/saree" onClick={() => setIsMenuOpen(false)} className="block text-sm text-primary-700 hover:text-gold-500 py-0.5">Saree Function</Link>
            <Link to="/events/book/dawath" onClick={() => setIsMenuOpen(false)} className="block text-sm text-primary-700 hover:text-gold-500 py-0.5">Dawath</Link>
          </div>
          <Link
            to="/halls"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-primary-800 hover:text-gold-500 py-1"
          >
            Function Halls
          </Link>
          <Link
            to="/travel"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-primary-800 hover:text-gold-500 py-1"
          >
            Travel
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-primary-800 hover:text-gold-500 py-1"
          >
            My Bookings
          </Link>
          <div className="border-t border-cream-100 pt-3 flex flex-col gap-2">
            <a
              href="tel:+911234567890"
              className="flex items-center justify-center gap-2 border border-cream-200 bg-cream-50 px-4 py-2.5 rounded-full text-xs font-semibold text-primary-800"
            >
              <Phone size={14} className="text-gold-500" />
              <span>+91 12345 67890</span>
            </a>
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  login('Customer');
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-primary-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                <User size={14} />
                <span>Login / Signup</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
