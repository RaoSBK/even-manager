import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Profile</h3>
        <p className="text-xs text-neutral-400 mt-1">Review and manage your contact credentials with GK BOOKING</p>
      </div>

      <DashboardCard title="Personal Information" subtitle="Your profile card details">
        <div className="space-y-3 text-sm">
          <p><span className="font-bold text-neutral-500">Name:</span> {user?.name}</p>
          <p><span className="font-bold text-neutral-500">Email:</span> {user?.email}</p>
          <p><span className="font-bold text-neutral-500">Mobile:</span> {user?.mobile}</p>
          <p><span className="font-bold text-neutral-500">Member Status:</span> Active Client</p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ProfilePage;
