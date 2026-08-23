import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { settingsApi } from '../../api/settingsApi';
import {
  Save
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [loading, setLoading] = useState<boolean>(true);
  const [config, setConfig] = useState<Record<string, string>>({
    COMPANY_NAME: 'GK Event Management Co.',
    SUPPORT_PHONE: '+91 12345 67890',
    COMPANY_EMAIL: 'bookings@gkevents.com',
    GST_PERCENTAGE: '18',
    REFERRAL_DISCOUNT: '1000',
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    MSG91_AUTH_KEY: '',
    MSG91_TEMPLATE_ID: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsApi.getAll();
      setConfig(prev => ({
        ...prev,
        ...data
      }));
    } catch {
      addToast('Failed to load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setConfig({
      ...config,
      [key]: val
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsApi.update(config);
      addToast('System settings updated successfully.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save settings.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs font-bold text-neutral-400">
        Loading system configuration settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">System Settings</h3>
        <p className="text-xs text-neutral-400 mt-1">Configure SMTP relays, Msg91 credentials, SMS templates, and general tax margins</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-xs font-semibold">
        {/* COMPANY DETAILS SECTION */}
        <DashboardCard title="1. Enterprise Identity" subtitle="Set company support numbers, emails and branding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Company Name Branding"
              value={config.COMPANY_NAME}
              onChange={(e) => handleChange('COMPANY_NAME', e.target.value)}
            />
            <Input
              label="Support Hotline Phone"
              value={config.SUPPORT_PHONE}
              onChange={(e) => handleChange('SUPPORT_PHONE', e.target.value)}
            />
            <Input
              label="Sender Email Address"
              value={config.COMPANY_EMAIL}
              onChange={(e) => handleChange('COMPANY_EMAIL', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="GST Percentage (%)"
                type="number"
                value={config.GST_PERCENTAGE}
                onChange={(e) => handleChange('GST_PERCENTAGE', e.target.value)}
              />
              <Input
                label="Referral Bonus (INR)"
                type="number"
                value={config.REFERRAL_DISCOUNT}
                onChange={(e) => handleChange('REFERRAL_DISCOUNT', e.target.value)}
              />
            </div>
          </div>
        </DashboardCard>

        {/* SMTP RELAY MODULE */}
        <DashboardCard title="2. SMTP E-Mail Server Configuration" subtitle="Configure SMTP relay server parameters for booking invoice updates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="SMTP Host Name"
              placeholder="e.g. smtp.gmail.com"
              value={config.SMTP_HOST}
              onChange={(e) => handleChange('SMTP_HOST', e.target.value)}
            />
            <Input
              label="SMTP Port Number"
              placeholder="e.g. 587 or 465"
              value={config.SMTP_PORT}
              onChange={(e) => handleChange('SMTP_PORT', e.target.value)}
            />
            <Input
              label="SMTP Username"
              value={config.SMTP_USER}
              onChange={(e) => handleChange('SMTP_USER', e.target.value)}
            />
            <Input
              label="SMTP Password / Auth Secret"
              type="password"
              value={config.SMTP_PASS}
              onChange={(e) => handleChange('SMTP_PASS', e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* MSG91 SMS SMS GATEWAY */}
        <DashboardCard title="3. MSG91 SMS Gateway Configs" subtitle="Configure templates and auth keys for mobile password reset OTP flow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="MSG91 Auth Key"
              type="password"
              placeholder="Enter SMS API key..."
              value={config.MSG91_AUTH_KEY}
              onChange={(e) => handleChange('MSG91_AUTH_KEY', e.target.value)}
            />
            <Input
              label="OTP SMS Template ID"
              placeholder="Enter Msg91 Template code..."
              value={config.MSG91_TEMPLATE_ID}
              onChange={(e) => handleChange('MSG91_TEMPLATE_ID', e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* SUBMIT BUTTON BAR */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gold" className="gap-2">
            <Save size={16} /> Save Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
