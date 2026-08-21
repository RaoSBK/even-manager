import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { helpCategories, helpFAQs, HelpFAQ } from '../../constants/helpConfig';
import { contactConfig } from '../../constants/contactConfig';
import { submitSupportRequest } from '../../api/supportApi';
import logoImg from '../../assets/images/logo.png';
import { 
  Search, Phone, MessageSquare, Mail, Send, ChevronDown, ChevronUp, 
  HelpCircle, Sparkles, Building, User, Lock, AlertCircle, ShieldAlert, Loader2, Compass
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Search & Category States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('General');
  const [filteredFAQs, setFilteredFAQs] = useState<HelpFAQ[]>([]);

  // Accordion Expand State
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [message, setMessage] = useState<string>('');

  // Form Errors State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Reference to FAQ section for scrolling
  const faqSectionRef = useRef<HTMLDivElement>(null);

  // Autofill user details
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
    }
  }, [user]);

  // Filter FAQs based on active category & search query
  useEffect(() => {
    let results = helpFAQs;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (faq) =>
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term)
      );
    } else {
      results = results.filter((faq) => faq.category === activeCategory);
    }

    setFilteredFAQs(results);
    setExpandedFaq(null);
  }, [activeCategory, searchTerm]);

  // Quick Help Card Actions
  const handleQuickHelp = (categoryName: string) => {
    setActiveCategory(categoryName);
    setSearchTerm('');
    // Scroll to FAQ view
    faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Form Field Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email format';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (mobile.trim().length !== 10 || isNaN(Number(mobile))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please resolve all validation errors.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user?.id,
        name,
        email,
        mobile,
        category,
        message
      };

      await submitSupportRequest(payload);
      setShowSuccessModal(true);
      addToast('Support request submitted successfully!', 'success');

      // Clear non-auth fields
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
        setMobile('');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to submit support request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-50 min-h-screen py-8 sm:py-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Help Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <img src={logoImg} alt="GK BOOKING Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-primary-800 tracking-wide uppercase">
            Help & Support
          </h1>
          <div className="flex items-center justify-center gap-1 mt-1 mb-3">
            <div className="h-[1.5px] w-12 bg-gold-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold-500"></div>
            <div className="h-[1.5px] w-12 bg-gold-400"></div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Find answers to common questions or contact our support team for assistance. Search help articles or file a support ticket below.
          </p>
        </div>

        {/* Search help bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <div className="relative shadow-luxury rounded-luxuryoverflow-hidden bg-white border border-cream-200">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gold-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-primary-800 py-3.5 pl-12 pr-4"
            />
          </div>
        </div>

        {/* Quick Help Cards (Section 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Booking Help */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Booking Help</h4>
              <p className="text-[11px] text-neutral-400 mb-4">Need help making a booking?</p>
            </div>
            <button
              onClick={() => handleQuickHelp('Event Booking')}
              className="bg-primary-800 hover:bg-primary-900 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all"
            >
              Learn More
            </button>
          </div>

          {/* Function Hall Help */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Function Hall Help</h4>
              <p className="text-[11px] text-neutral-400 mb-4">Need assistance selecting a function hall?</p>
            </div>
            <button
              onClick={() => handleQuickHelp('Function Hall Booking')}
              className="bg-primary-800 hover:bg-primary-900 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all"
            >
              Learn More
            </button>
          </div>

          {/* Account Help */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Account Help</h4>
              <p className="text-[11px] text-neutral-400 mb-4">Having trouble with your account?</p>
            </div>
            <button
              onClick={() => handleQuickHelp('Account & Login')}
              className="bg-primary-800 hover:bg-primary-900 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* FAQ list & Categories */}
        <div ref={faqSectionRef} className="bg-white border border-cream-200 rounded-luxury p-6 sm:p-8 shadow-luxury mb-12">
          
          <div className="flex items-center gap-2 border-b border-cream-100 pb-4 mb-6">
            <HelpCircle size={18} className="text-gold-500" />
            <h3 className="font-bold font-serif text-lg text-primary-800 tracking-wide">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Browse FAQs by Category'}
            </h3>
          </div>

          {/* Category tabs (only shown when not searching) */}
          {!searchTerm && (
            <div className="flex flex-wrap gap-2 mb-6">
              {helpCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat
                      ? 'bg-gold-500 border-gold-500 text-white shadow-sm'
                      : 'bg-cream-50/50 border-cream-200 text-primary-850 hover:bg-cream-100/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Accordion list */}
          {filteredFAQs.length === 0 ? (
            /* Empty state (Section 2) */
            <div className="text-center py-10 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldAlert size={20} />
              </div>
              <h4 className="font-bold text-xs text-primary-800 uppercase tracking-wider mb-2">No help articles found</h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                We couldn't find any articles matching your search query. Please contact customer care.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`border rounded-luxury overflow-hidden transition-all duration-300 ${
                      isOpen ? 'border-gold-300 bg-gold-50/5' : 'border-cream-150 bg-white hover:border-gold-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-primary-850 outline-none"
                    >
                      <span>{faq.question}</span>
                      <span className="text-gold-500 shrink-0 ml-4">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-neutral-500 leading-relaxed border-t border-cream-100 pt-3 animate-slideDown">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Important Booking Rules Block (Section 6) */}
        <div className="bg-amber-50 border border-amber-200 rounded-luxury p-6 shadow-sm mb-12">
          <div className="flex items-center gap-2 mb-4 border-b border-amber-250 pb-2">
            <ShieldAlert size={18} className="text-amber-700" />
            <h3 className="font-bold text-sm text-amber-800 tracking-wide font-serif">
              Important Booking Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-amber-800 leading-relaxed">
            {/* Event booking rule */}
            <div>
              <h4 className="font-bold text-[13px] text-amber-900 mb-1.5">Event Booking Rules</h4>
              <p>
                All marriage ceremonies, sangeets, photography bookings, and catering plans must be requested at least <strong className="text-amber-950">40 days</strong> in advance. If your scheduled function date is within 40 days, online booking is closed.
              </p>
            </div>
            {/* Hall booking rule */}
            <div>
              <h4 className="font-bold text-[13px] text-amber-900 mb-1.5">Function Hall Booking Rules</h4>
              <p>
                Function hall booking must be made at least <strong className="text-amber-950">30 days</strong> before the event. Date validation ensures compliance, and reservations scheduled under 30 days are blocked from online checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Support Request Form & Contact details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Support Form (Left 2/3) */}
          <div className="lg:col-span-2 bg-white border border-cream-200 rounded-luxury p-6 sm:p-8 shadow-luxury">
            <div className="flex items-center gap-2.5 mb-6 border-b border-cream-100 pb-4">
              <Mail size={18} className="text-gold-500" />
              <h3 className="font-bold font-serif text-lg text-primary-800 tracking-wide">
                Submit Support Request
              </h3>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><User size={14} /></span>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-cream-50 border rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                        errors.name ? 'border-red-400' : 'border-cream-200'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Mail size={14} /></span>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-cream-50 border rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                        errors.email ? 'border-red-400' : 'border-cream-200'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Phone size={14} /></span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className={`w-full bg-cream-50 border rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                        errors.mobile ? 'border-red-400' : 'border-cream-200'
                      }`}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.mobile}
                    </p>
                  )}
                </div>

                {/* Category selector */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500"><Compass size={14} /></span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none cursor-pointer focus:border-gold-500 transition-all"
                    >
                      {helpCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  Detailed Enquiry / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain your problem or questions in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all resize-none ${
                    errors.message ? 'border-red-400' : 'border-cream-200'
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={10} /> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-500 text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting Support Ticket...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details Card (Right 1/3) */}
          <div className="bg-white border border-cream-250 rounded-luxury p-6 shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-800"></div>
            
            <div className="flex items-center gap-2 mb-4 border-b border-cream-100 pb-2">
              <Sparkles size={16} className="text-gold-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 font-serif">Still Need Help?</h4>
            </div>
            
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              Can't find the answer you're looking for? Our customer care team is ready to help.
            </p>

            <div className="flex flex-col gap-3">
              {/* Call */}
              <a
                href={contactConfig.phone.value}
                className="flex items-center gap-3 border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-3 rounded-lg text-xs font-bold text-primary-800 hover:bg-cream-100/50 transition-all"
              >
                <span className="text-gold-500 p-1.5 bg-gold-50 rounded-full"><Phone size={14} /></span>
                <span>Call Customer Care</span>
              </a>

              {/* WhatsApp */}
              <a
                href={contactConfig.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-3 rounded-lg text-xs font-bold text-primary-800 hover:bg-cream-100/50 transition-all"
              >
                <span className="text-green-600 p-1.5 bg-green-50 rounded-full"><MessageSquare size={14} /></span>
                <span>Chat on WhatsApp</span>
              </a>

              {/* Email */}
              <a
                href={contactConfig.email.value}
                className="flex items-center gap-3 border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-3 rounded-lg text-xs font-bold text-primary-800 hover:bg-cream-100/50 transition-all"
              >
                <span className="text-blue-600 p-1.5 bg-blue-50 rounded-full"><Mail size={14} /></span>
                <span>Email Support Us</span>
              </a>

              {/* Contact Us button */}
              <button
                onClick={() => navigate('/contact')}
                className="w-full mt-4 bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs py-2.5 rounded-lg transition-all text-center shadow-sm"
              >
                📩 Open Contact Page
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Success Modal Dialogue */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-sm w-full p-8 text-center shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
            
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-pulse">
              <Sparkles size={24} />
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-primary-800 mb-2">
              Support Request Submitted
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Your request has been submitted successfully. Our support team will contact you soon.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpPage;
