import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useNotifications } from '../../contexts/NotificationContext';
import { Phone, ArrowLeft, Send } from 'lucide-react';
import { forgotPassword } from '../../api/authApi';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || mobile.length !== 10 || isNaN(Number(mobile))) {
      addToast('Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await forgotPassword(mobile);
      if (response.devOtp) {
        addToast(`[DEV] OTP sent successfully! Code is: ${response.devOtp}`, 'success');
      } else {
        addToast('OTP has been sent to your registered mobile number.', 'success');
      }
      navigate(`/otp?mobile=${mobile}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to initiate password reset.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-serif text-primary-800">Forgot Password</h3>
        <p className="text-xs text-neutral-400 mt-1">Enter your registered mobile number to receive an OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <Phone size={16} />
            </span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm"
              placeholder="e.g. 9876543210"
              disabled={submitting}
              maxLength={10}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-800 text-white font-bold py-3 px-4 rounded-luxury hover:bg-primary-900 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-luxury disabled:bg-primary-300"
        >
          {submitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <Send size={16} />
              <span>Send OTP</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-400">
        <Link to="/login" className="text-gold-600 hover:text-gold-700 font-bold flex items-center justify-center gap-1 mt-1.5">
          <ArrowLeft size={12} /> <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
