import React from 'react';
import { Outlet } from 'react-router';
import logoImg from '../assets/images/logo.png';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-cream-200 shadow-luxury rounded-luxury-lg p-6 sm:p-8 my-auto">
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <img src={logoImg} alt="GK Events Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-1.5 sm:mb-2" />
          <h2 className="text-lg sm:text-xl text-center font-bold text-primary-800 uppercase tracking-wide font-serif">GK Event Management</h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
