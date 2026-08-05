import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="bg-white border p-6 rounded-luxury shadow-luxury">
      <h3 className="text-lg font-bold text-primary-800 mb-4">Admin Dashboard Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-luxury">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Earnings</p>
          <p className="text-2xl font-bold text-primary-800 mt-1">₹12,45,000</p>
        </div>
        <div className="bg-gold-50 border border-gold-100 p-5 rounded-luxury">
          <p className="text-xs text-gray-500 font-semibold uppercase">Active Bookings</p>
          <p className="text-2xl font-bold text-gold-600 mt-1">128</p>
        </div>
        <div className="bg-green-50 border border-green-100 p-5 rounded-luxury">
          <p className="text-xs text-gray-500 font-semibold uppercase">Halls Registered</p>
          <p className="text-2xl font-bold text-green-800 mt-1">42</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
