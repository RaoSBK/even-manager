import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'Customer' | 'Admin') => {
    login(role);
    if (role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-center text-primary-800">Login to your account</h3>
      <button onClick={() => handleLogin('Customer')} className="bg-primary-800 text-white font-medium py-2 rounded hover:bg-primary-900 transition-all">
        Login as Customer
      </button>
      <button onClick={() => handleLogin('Admin')} className="border border-gold-500 text-gold-600 font-medium py-2 rounded hover:bg-gold-50 transition-all">
        Login as Admin
      </button>
    </div>
  );
};

export default LoginPage;
