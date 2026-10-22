import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { contactConfig } from '../../constants/contactConfig';
import { submitContactMessage } from '../../api/contactApi';
import logoImg from '../../assets/images/logo.png';
import { 
  Phone, Mail, MessageSquare, MapPin, Send, Instagram, Facebook, 
  Youtube, ChevronDown, ChevronUp, Loader2, Sparkles, AlertCircle, HelpCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Form States
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // FAQ Accordion State (key: faq ID, value: boolean)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
    }
  }, [user]);

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email format';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (mobile.trim().length !== 10 || isNaN(Number(mobile))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!message.trim()) {
      newErrors.message = 'Message content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please fix the validation errors in the form.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user?.id,
        name,
        email,
        mobile,
        subject,
        message
      };

      await submitContactMessage(payload);
      setShowSuccessModal(true);
      addToast('Your message has been sent successfully!', 'success');

      // Clear Form Fields (excluding pre-filled auth details)
      setSubject('');
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
        setMobile('');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to submit enquiry. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle FAQ collapse
  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="bg-cream-50 min-h-screen py-8 sm:py-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <img src={logoImg} alt="GK BOOKING Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-primary-800 tracking-wide uppercase">
            Contact Us
          </h1>
          <div className="flex items-center justify-center gap-1 mt-1 mb-3">
            <div className="h-[1.5px] w-12 bg-gold-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold-500"></div>
            <div className="h-[1.5px] w-12 bg-gold-400"></div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
            We're here to help you with your event and function hall bookings. Reach out via cards, social links, or submit a message below.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Customer Care */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Customer Care</h4>
              <p className="text-xs font-semibold text-neutral-500 mb-4">{contactConfig.phone.display}</p>
            </div>
            <a
              href={contactConfig.phone.value}
              className="bg-primary-800 hover:bg-primary-900 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-sm"
            >
              📞 Call Now
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">WhatsApp Chat</h4>
              <p className="text-xs font-semibold text-neutral-500 mb-4">{contactConfig.whatsapp.display}</p>
            </div>
            <a
              href={contactConfig.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-sm"
            >
              💬 Open WhatsApp
            </a>
          </div>

          {/* Email */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Email Us</h4>
              <p className="text-xs font-semibold text-neutral-500 mb-4 truncate">{contactConfig.email.display}</p>
            </div>
            <a
              href={contactConfig.email.value}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-sm"
            >
              ✉️ Email Support
            </a>
          </div>

          {/* Office Address */}
          <div className="bg-white border border-cream-200 rounded-luxury p-5 text-center shadow-luxury flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin size={18} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800 mb-1">Office Address</h4>
              <p className="text-[10px] text-neutral-500 leading-normal mb-4 line-clamp-2">{contactConfig.address.display}</p>
            </div>
            <a
              href={contactConfig.address.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-sm"
            >
              📍 View Location
            </a>
          </div>
        </div>

        {/* Main Grid: Form, Map, Socials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
          
          {/* Contact Form Card (Left 2/3) */}
          <div className="lg:col-span-2 bg-white border border-cream-200 rounded-luxury p-6 sm:p-8 shadow-luxury">
            <div className="flex items-center gap-2.5 mb-6 border-b border-cream-100 pb-4">
              <Mail size={18} className="text-gold-500" />
              <h3 className="font-bold font-serif text-lg text-primary-800 tracking-wide">
                Send us a Message
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                      errors.name ? 'border-red-400' : 'border-cream-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                      errors.email ? 'border-red-400' : 'border-cream-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                      errors.mobile ? 'border-red-400' : 'border-cream-200'
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.mobile}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Booking assistance"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full bg-cream-50 border rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all ${
                      errors.subject ? 'border-red-400' : 'border-cream-200'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={10} /> {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Type your message or enquiry here..."
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-500 text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Sidebar: Location/Google Maps and Socials */}
          <div className="space-y-6">
            
            {/* Google Map Card */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-650"></div>
              
              <div className="flex items-center gap-2 mb-4 border-b border-cream-100 pb-2">
                <MapPin size={16} className="text-gold-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800">Our Location</h4>
              </div>

              {/* Styled Maps Placeholder */}
              <a
                href={contactConfig.address.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="h-44 bg-cream-100 hover:bg-cream-150/70 border border-cream-150 rounded-lg flex flex-col items-center justify-center text-center p-4 relative mb-4 transition-all group block cursor-pointer"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform animate-bounce">
                  <MapPin size={20} />
                </div>
                <h5 className="font-bold text-xs text-primary-800 mb-1">{contactConfig.address.title || 'Mahbubnagar, Telangana'}</h5>
                <p className="text-[10px] text-neutral-500 max-w-[220px] leading-relaxed">{contactConfig.address.display}</p>
              </a>

              <a
                href={contactConfig.address.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2.5 rounded-lg text-center block transition-all shadow-sm"
              >
                View Location on Google Maps
              </a>
            </div>

            {/* Connect Section */}
            <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>

              <div className="flex items-center gap-2 mb-4 border-b border-cream-100 pb-2">
                <Sparkles size={16} className="text-gold-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-800">Connect With Us</h4>
              </div>

              <div className="flex flex-col gap-3">
                {/* Instagram */}
                <a
                  href={contactConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-2.5 rounded-lg text-xs font-semibold text-primary-850 hover:bg-cream-100/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600 p-1 bg-pink-50 rounded-full"><Instagram size={14} /></span>
                    <span>Instagram</span>
                  </div>
                  <span className="text-[10px] text-gray-400">@gkbooking26 &rarr;</span>
                </a>

                {/* Facebook */}
                <a
                  href={contactConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-2.5 rounded-lg text-xs font-semibold text-primary-850 hover:bg-cream-100/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 p-1 bg-blue-50 rounded-full"><Facebook size={14} /></span>
                    <span>Facebook</span>
                  </div>
                  <span className="text-[10px] text-gray-400">GK Booking &rarr;</span>
                </a>

                {/* YouTube */}
                <a
                  href={contactConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-cream-200 hover:border-gold-300 bg-cream-50/50 p-2.5 rounded-lg text-xs font-semibold text-primary-850 hover:bg-cream-100/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 p-1 bg-red-50 rounded-full"><Youtube size={14} /></span>
                    <span>YouTube</span>
                  </div>
                  <span className="text-[10px] text-gray-400">@gkbooking &rarr;</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-cream-200 rounded-luxury p-6 sm:p-8 shadow-luxury">
          <div className="flex items-center gap-2 border-b border-cream-100 pb-4 mb-6">
            <HelpCircle size={18} className="text-gold-500" />
            <h3 className="font-bold font-serif text-lg text-primary-800 tracking-wide">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {contactConfig.faqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`border rounded-luxury overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-gold-300 bg-gold-50/5' : 'border-cream-150 bg-white hover:border-gold-200'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-primary-800 outline-none"
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
        </div>

      </div>

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-sm w-full p-8 text-center shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
            
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-pulse">
              <Sparkles size={24} />
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-primary-800 mb-2">
              Message Sent Successfully!
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Thank you for contacting GK BOOKING. Our customer care team will get back to you soon.
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:gkbooking26@gmail.com?subject=Enquiry%20to%20GK%20Booking"
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow flex items-center justify-center gap-1.5"
              >
                <Mail size={14} />
                <span>Open in Email App (gkbooking26@gmail.com)</span>
              </a>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactPage;
