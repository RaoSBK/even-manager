import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { employeeWorkstationApi } from '../../api/employeeWorkstationApi';
import { Employee } from '../../api/employeeApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { Save, ShieldAlert } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { addToast } = useNotifications();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    emergencyContact: ''
  });

  const fetchProfile = async () => {
    try {
      const data = await employeeWorkstationApi.getProfile();
      setEmployee(data);
      setFormData({
        name: data.user?.name || '',
        email: data.user?.email || '',
        mobile: data.user?.mobile || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || ''
      });
    } catch {
      addToast('Failed to load employee profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeWorkstationApi.updateProfile(formData);
      addToast('Profile personal details updated successfully.', 'success');
      fetchProfile();
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xs font-bold text-neutral-400">
        Loading employee specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">My Workplace Account</h3>
        <p className="text-xs text-neutral-400 mt-1">Review contact information, employment parameters, and edit permitted personal credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar and Non-editable specs */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white border border-cream-150 p-6 rounded-luxury shadow-sm text-center">
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120"
              alt={employee?.user?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gold-300 mx-auto shadow-sm"
            />
            <h4 className="font-bold text-base text-primary-800 font-serif mt-3">{employee?.user?.name}</h4>
            <p className="text-xs text-gold-600 font-semibold">{employee?.designation || 'Staff Coordinator'}</p>
            <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-150 uppercase mt-2">
              {employee?.status || 'ACTIVE'}
            </span>
          </div>

          <div className="bg-white border border-cream-150 p-6 rounded-luxury shadow-sm space-y-4 text-xs font-semibold">
            <h5 className="font-bold text-primary-800 border-b border-cream-100 pb-2">Employment Information</h5>
            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">Employee ID</span>
                <span className="text-primary-800">{employee?.employeeCode}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">Department</span>
                <span>{employee?.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">Joining Date</span>
                <span>{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="flex gap-2 p-2 bg-yellow-50 text-yellow-800 border border-yellow-150 rounded text-[10px]">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>Employment descriptors are locked. Contact admin to change role/salary designation.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Allowed form edits */}
        <div className="md:col-span-2">
          <DashboardCard title="Edit Permitted Personal Details" subtitle="Update contact credentials & emergency directories">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Contact"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
                <Input
                  label="Emergency Contact No"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] text-primary-800 font-bold uppercase tracking-wider block mb-1">Residential Address</label>
                <textarea
                  className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury p-3 text-xs focus:outline-none focus:bg-white min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="gold" disabled={submitting} className="gap-2">
                  <Save size={16} /> Save Profiles Information
                </Button>
              </div>
            </form>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
