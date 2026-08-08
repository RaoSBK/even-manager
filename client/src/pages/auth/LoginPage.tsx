import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Phone, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginUser } from '../../api/authApi';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState(() => {
    return localStorage.getItem('remembered_mobileNumber') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('remembered_password') || '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('remembered_rememberMe') === 'true';
  });

  // Validation States
  const [errors, setErrors] = useState<{ mobileNumber?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { mobileNumber?: string; password?: string } = {};

    // Mobile Number validation
    if (!mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d+$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must contain only digits';
    } else if (mobileNumber.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please correct the errors in the form', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        mobile: mobileNumber,
        password: password
      });

      const handleRememberMe = () => {
        if (rememberMe) {
          localStorage.setItem('remembered_mobileNumber', mobileNumber);
          localStorage.setItem('remembered_password', password);
          localStorage.setItem('remembered_rememberMe', 'true');
        } else {
          localStorage.removeItem('remembered_mobileNumber');
          localStorage.removeItem('remembered_password');
          localStorage.removeItem('remembered_rememberMe');
        }
      };

      handleRememberMe();
      
      const { user: backendUser } = response;
      login(backendUser.role, {
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.mobile
      });

      addToast(`Logged in successfully! Welcome, ${backendUser.name}`, 'success');
      
      if (backendUser.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || '';
      
      const newErrors: { mobileNumber?: string; password?: string } = {};
      if (errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('not exist')) {
        newErrors.mobileNumber = 'This mobile number is not registered';
      } else if (errMsg.toLowerCase().includes('password')) {
        newErrors.password = 'Incorrect password';
      }
      
      setErrors(newErrors);
      addToast(errMsg || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold font-serif text-primary-800 tracking-wide">
          Welcome Back
        </h3>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 sm:mt-1">
          Please enter your credentials to access your account
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4" noValidate>
        {/* Mobile Number Input */}
        <Input
          id="mobileNumber"
          name="mobileNumber"
          type="tel"
          label="Mobile Number"
          placeholder="Enter 10-digit mobile number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          leftIcon={<Phone size={16} />}
          error={errors.mobileNumber}
          maxLength={10}
          required
        />

        {/* Password Input */}
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          error={errors.password}
          required
        />

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-cream-200 text-gold-500 focus:ring-gold-500/20 focus:ring-2 accent-gold-500"
            />
            <span className="text-[11px] font-medium text-neutral-600">Remember Me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 hover:underline transition-all"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="mt-4 sm:mt-6"
        >
          Sign In
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-cream-100">
        <p className="text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold text-gold-600 hover:text-gold-700 transition-all hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
