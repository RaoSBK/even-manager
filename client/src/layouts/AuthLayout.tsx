import React from 'react';
import { Outlet } from 'react-router';
import logoImg from '../assets/images/logo.png';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="w-full max-w-md bg-white border border-cream-200 shadow-luxury rounded-luxury-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logoImg} alt="GK Events Logo" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-xl font-bold text-primary-800 uppercase tracking-wide font-serif">GK Event Management</h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
