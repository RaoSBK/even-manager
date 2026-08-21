import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useNotifications } from '../../contexts/NotificationContext';
import { KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword, forgotPassword } from '../../api/authApi';

export const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useNotifications();

  // Extract mobile number from query parameters
  const queryParams = new URLSearchParams(location.search);
  const mobile = queryParams.get('mobile') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30); // 30-second countdown for resend

  useEffect(() => {
    if (!mobile) {
      addToast('No mobile number specified. Redirecting...', 'error');
      navigate('/forgot-password');
    }
  }, [mobile, navigate, addToast]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6 || isNaN(Number(otp))) {
      addToast('Please enter a valid 6-digit OTP.', 'warning');
      return;
    }

    if (!password || password.length < 6) {
      addToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        mobile,
        otp,
        password
      });
      addToast('Password reset successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'OTP verification or password reset failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const response = await forgotPassword(mobile);
      setTimer(30);
      setOtp('');
      if (response.devOtp) {
        addToast(`[DEV] OTP sent successfully! Code is: ${response.devOtp}`, 'success');
      } else {
        addToast('A new OTP has been sent successfully.', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to resend OTP.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-serif text-primary-800">Reset Password</h3>
        <p className="text-xs text-neutral-400 mt-1">Enter the OTP sent to: <span className="font-semibold">+91 {mobile}</span></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
            Verification Code (OTP)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <KeyRound size={16} />
            </span>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm"
              placeholder="000000"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm"
              placeholder="••••••••"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm"
              placeholder="••••••••"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs px-1">
          <span className="text-neutral-400">Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || submitting || resending}
            className={`font-bold transition-all ${
              timer > 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-gold-600 hover:text-gold-700 hover:underline'
            }`}
          >
            {resending ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </button>
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
              <CheckCircle size={18} />
              <span>Reset Password</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-400">
        <Link to="/login" className="text-neutral-500 hover:text-primary-800 font-medium flex items-center justify-center gap-1">
          <ArrowLeft size={12} /> <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default OTPPage;
