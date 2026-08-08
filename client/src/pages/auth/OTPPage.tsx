import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router';
import { useNotifications } from '../../contexts/NotificationContext';
import { ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';

export const OTPPage: React.FC = () => {
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minute countdown

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

    if (timer <= 0) {
      addToast('OTP has expired. Please request a new one.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await verifyOTP(otp);
      addToast('Account verified successfully!', 'success');
      navigate('/user/dashboard');
    } catch (err: any) {
      addToast(err.message || 'OTP verification failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    setOtp('');
    setTimer(120);
    addToast('A new OTP has been sent to your registered mobile/email. Use demo code 123456.', 'success');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-serif text-primary-800">OTP Verification</h3>
        <p className="text-xs text-neutral-400 mt-1">We have sent a 6-digit verification code to your device</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider text-center mb-3">
            Enter 6-Digit OTP
          </label>
          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-48 text-center text-2xl font-bold font-mono py-2.5 border-2 border-cream-200 focus:border-gold-500 rounded-luxury focus:outline-none tracking-widest"
              placeholder="000000"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs px-2">
          <span className="text-neutral-400">
            {timer > 0 ? (
              <>Expires in: <span className="font-bold text-primary-800">{formatTime(timer)}</span></>
            ) : (
              <span className="text-red-500 font-semibold">OTP Expired</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || submitting}
            className={`font-bold uppercase tracking-wider transition-all ${
              timer > 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-gold-600 hover:text-gold-700'
            }`}
          >
            Resend OTP
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
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </form>

      {/* Demo OTP Helper Panel */}
      <div className="bg-cream-50 border border-cream-200 rounded-luxury p-3 text-xs text-primary-800 flex items-start gap-2.5">
        <ShieldAlert size={18} className="text-gold-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-gold-600 uppercase tracking-wider">Demo Code:</p>
          <p className="font-mono mt-0.5">Please enter **123456** to complete registration.</p>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400">
        <Link to="/signup" className="text-neutral-500 hover:text-primary-800 font-medium flex items-center justify-center gap-1">
          <ArrowLeft size={12} /> <span>Change details / Back</span>
        </Link>
      </div>
    </div>
  );
};

export default OTPPage;
