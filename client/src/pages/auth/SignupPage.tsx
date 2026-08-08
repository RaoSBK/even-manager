import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useNotifications } from '../../contexts/NotificationContext';
import { User, Mail, Phone, Lock, Gift } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { signupUser } from '../../api/authApi';

export const SignupPage: React.FC = () => {
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
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

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Agree Terms validation
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please correct the errors in the signup form', 'error');
      return;
    }

    setLoading(true);
    try {
      await signupUser({
        name: fullName,
        email: email,
        mobile: mobileNumber,
        password: password,
        referralCode: referralCode || undefined
      });
      
      setLoading(false);
      addToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || '';
      
      const newErrors: typeof errors = {};
      if (errMsg.toLowerCase().includes('mobile number')) {
        newErrors.mobileNumber = 'This mobile number is already registered';
      } else if (errMsg.toLowerCase().includes('email address')) {
        newErrors.email = 'This email address is already registered';
      }
      
      setErrors((prev) => ({ ...prev, ...newErrors }));
      addToast(errMsg || 'Registration failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold font-serif text-primary-800 tracking-wide">
          Create User Account
        </h3>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 sm:mt-1">
          Join us to explore and book premium event spaces
        </p>
      </div>

      <form onSubmit={handleSignupSubmit} className="space-y-3 sm:space-y-4" noValidate>
        {/* Full Name */}
        <Input
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={16} />}
          error={errors.fullName}
          required
        />

        {/* Email Address */}
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          error={errors.email}
          required
        />

        {/* Mobile Number */}
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

        {/* Password */}
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          error={errors.password}
          required
        />

        {/* Confirm Password */}
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword}
          required
        />

        {/* Referral Code */}
        <Input
          id="referralCode"
          name="referralCode"
          type="text"
          label="Referral Code (Optional)"
          placeholder="Enter referral code if any"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          leftIcon={<Gift size={16} />}
        />

        {/* Agree Terms Checkbox */}
        <div className="flex flex-col gap-1 mt-2">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-cream-200 text-gold-500 focus:ring-gold-500/20 focus:ring-2 accent-gold-500"
            />
            <span className="text-[11px] font-medium text-neutral-600 leading-normal">
              I agree to the{' '}
              <a href="#terms" className="text-gold-600 hover:text-gold-700 underline font-semibold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-gold-600 hover:text-gold-700 underline font-semibold">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] font-medium text-red-500 mt-0.5 leading-tight">
              {errors.agreeTerms}
            </p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="mt-4 sm:mt-6"
        >
          Sign Up
        </Button>
      </form>

      {/* Login link */}
      <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-cream-100">
        <p className="text-xs text-neutral-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-gold-600 hover:text-gold-700 transition-all hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
