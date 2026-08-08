import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, type = 'text', className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-bold text-primary-800 font-sans tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-neutral-400 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`w-full bg-cream-50/50 border ${
              error ? 'border-red-400 focus:border-red-500' : 'border-cream-200 focus:border-gold-500'
            } rounded-luxury ${
              leftIcon ? 'pl-11' : 'px-4'
            } ${
              isPassword ? 'pr-11' : 'pr-4'
            } py-3 text-sm text-primary-800 placeholder-neutral-400 focus:outline-none focus:bg-white transition-all duration-200 font-sans ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-neutral-400 hover:text-primary-800 transition-colors focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-medium text-red-500 mt-0.5 leading-tight">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
