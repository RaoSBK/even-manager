import React, { useState } from 'react';
import { Link } from 'react-router';
import { 
  Home, Camera, Gift, Heart, Check, X, ShieldAlert, ChevronRight, Calendar
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  category: 'wedding' | 'photography' | 'food';
  description?: string;
  iconName: string;
  perPlate?: boolean;
}

export const EventBookingPage: React.FC = () => {
  // Available Services
  const services: Service[] = [
    // Wedding Services
    { id: 'haldi', name: 'Haldi', price: 10000, category: 'wedding', iconName: 'haldi' },
    { id: 'sangeet', name: 'Sangeet', price: 15000, category: 'wedding', iconName: 'sangeet' },
    { id: 'mehndi', name: 'Mehndi', price: 12000, category: 'wedding', iconName: 'mehndi' },
    { id: 'baraat', name: 'Baraat', price: 20000, category: 'wedding', iconName: 'baraat' },
    { id: 'reception', name: 'Reception', price: 25000, category: 'wedding', iconName: 'reception' },
    
    // Photography
    { id: 'pre-wedding', name: 'Pre Wedding Shoot', price: 30000, category: 'photography', iconName: 'camera' },
    { id: 'wedding-shoot', name: 'Wedding Shoot', price: 50000, category: 'photography', iconName: 'couple' },
    { id: 'photography', name: 'Photography', price: 15000, category: 'photography', iconName: 'dslr' },
    
    // Food
    { id: 'veg', name: 'Veg', price: 300, category: 'food', iconName: 'veg', perPlate: true },
    { id: 'non-veg', name: 'Non-Veg', price: 500, category: 'food', iconName: 'non-veg', perPlate: true },
    { id: 'both-veg-nonveg', name: 'Both (Veg + Non Veg)', price: 400, category: 'food', iconName: 'both', perPlate: true },
  ];

  // Default selection matching Image 1
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'sangeet',
    'mehndi',
    'wedding-shoot',
    'both-veg-nonveg'
  ]);
  
  const [platesCount, setPlatesCount] = useState<number>(100);

  // Handle card selection
  const handleToggleService = (id: string, category: string) => {
    if (category === 'food') {
      // For food, single select option (deselect other food items)
      setSelectedIds((prev) => {
        const filtered = prev.filter(
          (item) => !services.find((s) => s.id === item)?.perPlate
        );
        return prev.includes(id) ? filtered : [...filtered, id];
      });
    } else {
      // For others, standard multi-select toggle
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const handleRemoveService = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));

  // Calculations
  const foodServiceSelected = selectedServices.find((s) => s.perPlate);
  const foodCost = foodServiceSelected ? foodServiceSelected.price * platesCount : 0;
  
  const nonFoodCost = selectedServices
    .filter((s) => !s.perPlate)
    .reduce((sum, s) => sum + s.price, 0);

  const subtotal = nonFoodCost + foodCost;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // Custom Icon Rendering to match Image 1
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'haldi':
        return (
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
              <path d="M12 2C8 2 5 5 5 9C5 13 8 16 12 16C16 16 19 13 19 9C19 5 16 2 12 2Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5"/>
              <ellipse cx="12" cy="9" rx="4" ry="2" fill="#FBBF24"/>
              <path d="M7 16H17V20H7V16Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'sangeet':
        return (
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-600">
              <circle cx="8" cy="14" r="4" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5"/>
              <circle cx="16" cy="14" r="4" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5"/>
              <path d="M12 5V14M12 5L18 8V12" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 10H10M14 10H18" stroke="#EA580C" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'mehndi':
        return (
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2C10 2 8 4 9 7C10 10 7 11 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 11 14 10 15 7C16 4 14 2 12 2Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="1.5" fill="#16A34A"/>
              <path d="M9 13H15" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M12 13V16" stroke="#16A34A" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'baraat':
        return (
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <path d="M19 10C19 6 16 4 12 4C8 4 5 7 5 11C5 12.5 5.5 13.5 6 14C6.5 14.5 6.5 16.5 6 18H18C17.5 16.5 17.5 14.5 18 14C18.5 13.5 19 12.5 19 10Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="2" fill="#D97706"/>
              <path d="M8 18L10 21M16 18L14 21" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'reception':
        return (
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600">
              <path d="M4 6H20V18H4V6Z" fill="#E9D5FF" stroke="#9333EA" strokeWidth="1.5"/>
              <path d="M4 6C8 10 8 14 4 18M20 6C16 10 16 14 20 18" stroke="#9333EA" strokeWidth="1.5"/>
              <path d="M7 6H17V10H7V6Z" fill="#F3E8FF" stroke="#9333EA" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'camera':
        return (
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              <path d="M4 8H8L10 5H14L16 8H20V18H4V8Z" fill="#BFDBFE" stroke="#2563EB" strokeWidth="1.5"/>
              <circle cx="12" cy="13" r="3" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'couple':
        return (
          <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-pink-600">
              <circle cx="9" cy="7" r="2.5" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.5"/>
              <path d="M5 14C5 11 7 11 9 11C11 11 13 11 13 14" stroke="#DB2777" strokeWidth="1.5"/>
              <circle cx="15" cy="7" r="2.5" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.5"/>
              <path d="M12 14C12 11.5 14 11.5 16 11.5C18 11.5 20 11.5 20 14" stroke="#DB2777" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'dslr':
        return (
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
              <path d="M3 7H7L9 4H15L17 7H21V19H3V7Z" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.5"/>
              <circle cx="12" cy="13" r="3.5" fill="#818CF8" stroke="#4F46E5" strokeWidth="1.5"/>
            </svg>
          </div>
        );
      case 'veg':
        return (
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
              <circle cx="12" cy="12" r="8" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" fill="#059669"/>
            </svg>
          </div>
        );
      case 'non-veg':
        return (
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
              <path d="M12 4C9 4 5 7 5 10C5 13 8 16 11 16C12.5 16 14 15 15 14L19 18L20 17L16 13C17 12 18 10.5 18 9C18 6 15 4 12 4Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5"/>
              <ellipse cx="12" cy="10" rx="3" ry="1.5" fill="#EF4444"/>
            </svg>
          </div>
        );
      case 'both':
        return (
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <circle cx="12" cy="12" r="8" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
              <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12" stroke="#D97706" strokeWidth="1.5"/>
              <circle cx="10" cy="13" r="1.5" fill="#D97706"/>
              <circle cx="14" cy="13" r="1.5" fill="#D97706"/>
            </svg>
          </div>
        );
      default:
        return <Gift size={24} className="text-gold-500" />;
    }
  };

  return (
    <div className="bg-cream-50 font-sans min-h-screen py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb (Image 1 Top Left) */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-gold-500 transition-all flex items-center gap-1">
            <Home size={13} className="text-gold-500" />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="hover:text-gold-500 cursor-pointer">Event Management</span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-primary-800 font-medium">Marriage Function</span>
        </div>

        {/* Title and Step Progress tracker (Image 1 Top Middle/Right) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-cream-200 pb-6 bg-white p-6 rounded-luxury shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 tracking-wide">
              Marriage Function Booking
            </h1>
            <div className="flex items-center gap-1 mt-1 mb-2">
              <div className="h-[1px] w-6 bg-gold-400"></div>
              <div className="w-1 h-1 rounded-full bg-gold-500"></div>
              <div className="h-[1px] w-6 bg-gold-400"></div>
            </div>
            <p className="text-xs text-neutral-500">
              Select the services you need for your special day
            </p>
          </div>

          {/* Progress Tracker Steps */}
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto overflow-x-auto py-1">
            {/* Step 1: Active */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                1
              </div>
              <div className="text-[10px]">
                <p className="font-bold text-gold-600 leading-none">Select Services</p>
              </div>
            </div>
            <div className="h-[1px] w-8 sm:w-12 bg-cream-300"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white border border-cream-300 text-gray-400 text-xs flex items-center justify-center">
                2
              </div>
              <div className="text-[10px]">
                <p className="font-semibold text-gray-400 leading-none">Event Details</p>
              </div>
            </div>
            <div className="h-[1px] w-8 sm:w-12 bg-cream-300"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white border border-cream-300 text-gray-400 text-xs flex items-center justify-center">
                3
              </div>
              <div className="text-[10px]">
                <p className="font-semibold text-gray-400 leading-none">Review & Confirm</p>
              </div>
            </div>
            <div className="h-[1px] w-8 sm:w-12 bg-cream-300"></div>

            {/* Step 4 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white border border-cream-300 text-gray-400 text-xs flex items-center justify-center">
                4
              </div>
              <div className="text-[10px]">
                <p className="font-semibold text-gray-400 leading-none">Booking Summary</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Grid Booking Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Services Selection (2 Columns in Grid) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Wedding Services category */}
            <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
              <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Heart size={18} /></div>
                <div>
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Wedding Services</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Traditional wedding ceremony services</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {services
                  .filter((s) => s.category === 'wedding')
                  .map((service) => {
                    const isSelected = selectedIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleToggleService(service.id, 'wedding')}
                        className={`border rounded-luxury p-3 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50/10 shadow-md'
                            : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Selected Checkbox */}
                        <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gold-500 border-gold-500 text-white' 
                            : 'border-cream-300 bg-white group-hover:border-gold-400'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>

                        <div className="my-auto">
                          {renderIcon(service.iconName)}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                          <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Photography Services category */}
            <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
              <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Camera size={18} /></div>
                <div>
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Photography Services</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Capture your beautiful moments</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {services
                  .filter((s) => s.category === 'photography')
                  .map((service) => {
                    const isSelected = selectedIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleToggleService(service.id, 'photography')}
                        className={`border rounded-luxury p-4 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50/10 shadow-md'
                            : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Selected Checkbox */}
                        <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gold-500 border-gold-500 text-white' 
                            : 'border-cream-300 bg-white group-hover:border-gold-400'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>

                        <div className="my-auto">
                          {renderIcon(service.iconName)}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                          <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Food Services category */}
            <div className="bg-white border border-cream-200 rounded-luxury-lg p-6 shadow-luxury">
              <div className="flex items-center gap-3 border-b border-cream-100 pb-4 mb-6">
                <div className="bg-gold-50 text-gold-600 p-2.5 rounded-full"><Gift size={18} /></div>
                <div>
                  <h3 className="font-bold text-sm text-primary-800 tracking-wide">Food Services</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Delicious food for your guests</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {services
                  .filter((s) => s.category === 'food')
                  .map((service) => {
                    const isSelected = selectedIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleToggleService(service.id, 'food')}
                        className={`border rounded-luxury p-4 text-center transition-all duration-300 cursor-pointer relative group flex flex-col justify-between items-center min-h-[140px] ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50/10 shadow-md'
                            : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Selected Checkbox */}
                        <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gold-500 border-gold-500 text-white' 
                            : 'border-cream-300 bg-white group-hover:border-gold-400'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>

                        <div className="my-auto">
                          {renderIcon(service.iconName)}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-[11px] font-bold text-primary-800 leading-tight truncate">{service.name}</p>
                          <p className="text-[10px] font-semibold text-gold-600 mt-0.5">₹{service.price} / Plate</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Booking Rule Amber Banner (Image 1 Bottom Left) */}
            <div className="bg-amber-50 border border-amber-200 rounded-luxury p-5 flex items-start gap-4 shadow-sm">
              <div className="bg-amber-500 text-white p-1 rounded-full shrink-0 mt-0.5">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-amber-800">Booking Rule</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                  Event date must be at least 40 days from the current date. If the event date is within 40 days, online booking is closed. Please contact customer care support.
                </p>
              </div>
            </div>

          </div>

          {/* Right Summary Sidebar (Image 1 Right) */}
          <div className="w-full">
            <div className="luxury-card p-6 border-cream-200 shadow-luxury-lg bg-white relative">
              <div className="flex items-center gap-2 border-b border-cream-100 pb-4 mb-5">
                <Calendar size={18} className="text-gold-500" />
                <h3 className="font-bold text-sm text-primary-800 tracking-wide">Booking Summary</h3>
              </div>

              {/* Selected Services Listing */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block">Selected Services</span>
                
                {selectedServices.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic">
                    No services selected yet. Please select services from the panels.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedServices.map((service) => {
                      const itemCost = service.perPlate ? service.price * platesCount : service.price;
                      return (
                        <div key={service.id} className="flex items-center justify-between gap-3 text-xs bg-cream-50/50 p-2.5 rounded-lg border border-cream-100/50">
                          <div className="flex items-center gap-2">
                            <span className="text-gold-500 font-bold">•</span>
                            <div>
                              <p className="font-bold text-primary-800 text-[11px]">{service.name}</p>
                              {service.perPlate && (
                                <p className="text-[9px] text-gray-400 font-medium">{platesCount} Plates</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-primary-800">₹{itemCost.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => handleRemoveService(service.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Plate count input (Dynamic control matching screenshot) */}
              {foodServiceSelected && (
                <div className="mt-5 pt-4 border-t border-cream-100 flex items-center justify-between text-xs">
                  <div>
                    <label htmlFor="plates" className="font-bold text-[11px] text-primary-800 block">Total Plates</label>
                    <span className="text-[9px] text-gray-400">Min 50 guests</span>
                  </div>
                  <div className="flex items-center gap-1 bg-cream-50 border border-cream-200 rounded-lg p-1">
                    <button 
                      onClick={() => setPlatesCount((p) => Math.max(50, p - 10))} 
                      className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="plates"
                      min={50}
                      value={platesCount}
                      onChange={(e) => setPlatesCount(Math.max(50, parseInt(e.target.value) || 0))}
                      className="w-12 text-center bg-transparent font-bold text-primary-800 outline-none text-[11px]"
                    />
                    <button 
                      onClick={() => setPlatesCount((p) => p + 10)} 
                      className="px-2 py-0.5 font-bold hover:bg-cream-100 text-primary-800 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Price calculations details */}
              <div className="mt-6 pt-5 border-t border-cream-100 space-y-2 text-xs">
                {foodServiceSelected && (
                  <div className="flex justify-between text-gray-500">
                    <span>Price per Plate</span>
                    <span className="font-medium text-neutral-800">₹{foodServiceSelected.price}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-neutral-800">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-baseline pt-4 border-t border-cream-100/50">
                  <span className="font-bold text-primary-800 text-sm">Total Amount</span>
                  <span className="font-extrabold text-gold-600 text-lg sm:text-xl">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Call-to-action button */}
              <button 
                onClick={() => alert(`Proceeding to next step with total: ₹${total.toLocaleString('en-IN')}`)}
                className="w-full mt-6 py-3 bg-gold-500 text-white font-bold text-xs rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Next: Event Details &rarr;
              </button>

              {/* Safe booking indicators */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50/50 py-1.5 rounded-lg border border-emerald-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="stroke-emerald-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Your booking is safe and secure</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EventBookingPage;
