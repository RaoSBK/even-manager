import React from 'react';
import { Outlet } from 'react-router';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-primary-800 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold tracking-wider mb-8">GK ADMIN PANEL</h2>
        <nav className="space-y-4">
          <div className="text-sm font-semibold text-gold-400 uppercase tracking-widest">Management Division</div>
          <div className="block py-2 px-3 rounded hover:bg-primary-900 cursor-pointer">Dashboard</div>
          <div className="block py-2 px-3 rounded hover:bg-primary-900 cursor-pointer">Users</div>
          <div className="block py-2 px-3 rounded hover:bg-primary-900 cursor-pointer">Events</div>
          <div className="block py-2 px-3 rounded hover:bg-primary-900 cursor-pointer">Halls</div>
        </nav>
      </aside>
      
      <main className="flex-1 p-8">
        <header className="mb-6 flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-primary-800">Admin Dashboard</h1>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
