import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router';
import { useNotifications } from '../../contexts/NotificationContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile.trim() || !password) {
      addToast('Please enter your email/mobile/login ID and password.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(emailOrMobile.trim(), password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      
      // Role based redirection
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else if (user.role === 'HALL_MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err: any) {
      addToast(err.message || 'Invalid credentials or password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-serif text-primary-800">Login to your account</h3>
        <p className="text-xs text-neutral-400 mt-1">Enter your credentials to access your dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
            Email, Mobile Number, or Login ID
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
              <Mail size={16} />
            </span>
            <input
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-luxury focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm"
              placeholder="e.g. admin@gkevent.com, 9876543210, or mgr_taj"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-gold-600 hover:text-gold-700 font-medium"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-800 text-white font-bold py-3 px-4 rounded-luxury hover:bg-primary-900 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-luxury disabled:bg-primary-300"
        >
          {submitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Demo credentials helper panel */}
      <div className="bg-cream-50 border border-cream-200 rounded-luxury p-4 text-xs text-primary-800">
        <p className="font-bold text-gold-600 uppercase tracking-wider mb-2">Demo Accounts (Click to Fill):</p>
        <div className="space-y-1.5 font-mono">
          <button
            type="button"
            onClick={() => {
              setEmailOrMobile('admin@gkevents.com');
              setPassword('admin123');
            }}
            className="block text-left w-full hover:bg-cream-100 p-1 rounded"
          >
            🔑 <span className="font-bold">ADMIN:</span> admin@gkevents.com / admin123
          </button>
          <button
            type="button"
            onClick={() => {
              setEmailOrMobile('employee@gkevents.com');
              setPassword('employee123');
            }}
            className="block text-left w-full hover:bg-cream-100 p-1 rounded"
          >
            🔑 <span className="font-bold">EMPLOYEE:</span> employee@gkevents.com / employee123
          </button>
          <button
            type="button"
            onClick={() => {
              setEmailOrMobile('customer@gkevents.com');
              setPassword('password123');
            }}
            className="block text-left w-full hover:bg-cream-100 p-1 rounded"
          >
            🔑 <span className="font-bold">USER:</span> customer@gkevents.com / password123
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-gold-600 hover:text-gold-700 font-bold flex items-center justify-center gap-1 mt-1.5">
          <span>Create an account</span> <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
