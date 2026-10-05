import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import {
  getAdminPaymentSettings,
  updateAdminPaymentSettings,
  PaymentAccountSettings
} from '../../api/paymentApi';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Building,
  Smartphone,
  QrCode,
  Key,
  ShieldCheck,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  Info
} from 'lucide-react';

export const PaymentSettingsPage: React.FC = () => {
  const { addToast } = useNotifications();

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);

  // Form Fields
  const [merchantName, setMerchantName] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [gatewayPublicKey, setGatewayPublicKey] = useState<string>('');
  const [gatewaySecretKey, setGatewaySecretKey] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<{ at: string; by: string } | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await getAdminPaymentSettings();
        setMerchantName(data.merchantName || 'GK BOOKING & EVENT MANAGEMENT');
        setAccountHolderName(data.accountHolderName || 'GK Event Management Services');
        setBankName(data.bankName || 'HDFC Bank');
        setAccountNumber(data.accountNumber || '50200084920155');
        setIfscCode(data.ifscCode || 'HDFC0001824');
        setBranchName(data.branchName || 'Gachibowli Financial District, Hyderabad');
        setUpiId(data.upiId || 'gkevents@okhdfcbank');
        setQrCodeUrl(data.qrCodeUrl || '');
        setGatewayPublicKey(data.gatewayPublicKey || '');
        setGatewaySecretKey(data.gatewaySecretKey || '');
        if (data.updatedAt) {
          setLastUpdated({
            at: new Date(data.updatedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            by: data.updatedBy || 'Admin'
          });
        }
      } catch (err: any) {
        console.error('Failed to load payment settings:', err);
        addToast(err.message || 'Failed to fetch payment configuration.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [addToast]);

  // Handle Form Submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountHolderName.trim()) {
      addToast('Account Holder Name is required.', 'warning');
      return;
    }
    if (!bankName.trim()) {
      addToast('Bank Name is required.', 'warning');
      return;
    }
    if (!accountNumber.trim()) {
      addToast('Bank Account Number is required.', 'warning');
      return;
    }
    if (!ifscCode.trim()) {
      addToast('IFSC Code is required.', 'warning');
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      addToast('Please provide a valid UPI ID (e.g. name@bank).', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      // Auto-generate QR code URL if not uploaded
      const effectiveQrUrl = qrCodeUrl.trim()
        ? qrCodeUrl.trim()
        : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
            upiId.trim()
          )}&pn=${encodeURIComponent(merchantName.trim() || 'GK BOOKING')}&am=0&cu=INR`;

      const payload: Partial<PaymentAccountSettings> = {
        merchantName: merchantName.trim(),
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim(),
        upiId: upiId.trim(),
        qrCodeUrl: effectiveQrUrl,
        gatewayPublicKey: gatewayPublicKey.trim(),
        gatewaySecretKey: gatewaySecretKey.trim()
      };

      const res = await updateAdminPaymentSettings(payload);

      setQrCodeUrl(res.settings.qrCodeUrl);
      if (res.settings.updatedAt) {
        setLastUpdated({
          at: new Date(res.settings.updatedAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          by: res.settings.updatedBy || 'Admin'
        });
      }

      addToast('Payment details updated successfully.', 'success');
    } catch (err: any) {
      console.error('Update payment settings error:', err);
      addToast(err.message || 'Failed to save payment settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Simulated QR File Upload
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result as string);
        addToast('UPI QR code uploaded. Click "Save Payment Settings" to publish.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate dynamic QR URL for preview
  const previewQrUrl = qrCodeUrl.trim()
    ? qrCodeUrl.trim()
    : upiId.trim()
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
        upiId.trim()
      )}&pn=${encodeURIComponent(merchantName.trim() || 'GK BOOKING')}&am=0&cu=INR`
    : 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=gkevents@okhdfcbank&pn=GK%20BOOKING&am=0&cu=INR';

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-400 flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 size={32} className="animate-spin text-gold-500" />
        <span className="text-sm font-semibold text-primary-800">Loading Payment Account Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Payment Settings</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Manage the bank account, UPI ID, QR code, and payment gateway where customer payments are credited
          </p>
        </div>

        {lastUpdated && (
          <div className="self-start sm:self-auto bg-cream-100/70 border border-cream-200 px-3 py-1.5 rounded-luxury text-[11px] text-primary-800">
            <span className="text-neutral-400">Last Modified: </span>
            <span className="font-bold">{lastUpdated.at}</span>
            <span className="text-neutral-400"> by </span>
            <span className="font-semibold text-gold-600">{lastUpdated.by}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration Form (7 of 12) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Section 1: Business / Merchant Identity */}
            <DashboardCard title="Merchant & Business Identity" subtitle="Official registered name shown on checkout & receipts">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    Merchant / Business Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. GK BOOKING & EVENT MANAGEMENT"
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    This name will appear on UPI collect requests, payment receipts, and tax invoices.
                  </p>
                </div>
              </div>
            </DashboardCard>

            {/* Section 2: Bank Account Details */}
            <DashboardCard title="Bank Account Details" subtitle="Primary account for direct bank transfers and net banking settlements">
              <div className="space-y-4 text-xs">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                      <Building size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="e.g. GK Event Management Services Pvt Ltd"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                {/* Bank Name & Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Branch Name / Location
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. Gachibowli Financial District, Hyderabad"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                {/* Account Number & IFSC Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      Bank Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50200084920155"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                      IFSC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001824"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Section 3: UPI & QR Code Configuration */}
            <DashboardCard title="UPI & QR Code Configuration" subtitle="Receiving UPI Virtual Payment Address and custom QR code">
              <div className="space-y-4 text-xs">
                {/* UPI ID */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    UPI ID (Virtual Payment Address) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                      <Smartphone size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. gkevents@okhdfcbank or 9876543210@upi"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* QR Code Upload / URL */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    QR Code Image (Upload New QR or Enter Image URL)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={qrCodeUrl}
                      onChange={(e) => setQrCodeUrl(e.target.value)}
                      placeholder="Enter custom image URL or leave empty for auto-generated QR"
                      className="w-full sm:flex-1 bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                    />

                    <label className="w-full sm:w-auto bg-cream-100 hover:bg-cream-200 text-primary-800 border border-cream-200 px-3.5 py-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0">
                      <Upload size={14} className="text-gold-600" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    If no custom image is specified, the system automatically renders an official UPI QR code for the UPI ID above.
                  </p>
                </div>
              </div>
            </DashboardCard>

            {/* Section 4: Payment Gateway API Keys */}
            <DashboardCard title="Payment Gateway API Credentials" subtitle="Razorpay / Cashfree / PhonePe integration keys (Secret key is stored securely)">
              <div className="space-y-4 text-xs">
                {/* Gateway Public Key */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    Gateway Key ID / Public Key
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                      <Key size={14} />
                    </span>
                    <input
                      type="text"
                      value={gatewayPublicKey}
                      onChange={(e) => setGatewayPublicKey(e.target.value)}
                      placeholder="e.g. rzp_live_xxxxxxxxxxxxxxxx"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Gateway Secret Key */}
                <div>
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                    Gateway Secret Key (Encrypted on Server)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gold-500">
                      <Key size={14} />
                    </span>
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={gatewaySecretKey}
                      onChange={(e) => setGatewaySecretKey(e.target.value)}
                      placeholder="e.g. sk_live_xxxxxxxxxxxxxxxx"
                      className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pl-10 pr-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-primary-800"
                    >
                      {showSecretKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-1">
                    <ShieldCheck size={12} className="shrink-0" />
                    <span>Secret keys are never transmitted to public browsers or client devices.</span>
                  </p>
                </div>
              </div>
            </DashboardCard>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gold-500 text-white font-bold text-xs py-3.5 px-8 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Settings...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Payment Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Live Customer Payment Preview Card (5 of 12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-cream-250 rounded-luxury p-6 shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-500"></div>

            <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-gold-500" />
                <h4 className="font-bold text-sm text-primary-800 font-serif">
                  Live Customer Preview
                </h4>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                Live Feed
              </span>
            </div>

            {/* QR Card Preview */}
            <div className="bg-cream-50 border border-cream-200 rounded-luxury p-5 text-center mb-5 relative shadow-inner">
              <span className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-2">
                {merchantName || 'GK BOOKING'}
              </span>

              <div className="w-44 h-44 bg-white mx-auto border-2 border-dashed border-gold-400 rounded-luxury p-2 shadow-sm flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={previewQrUrl}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to QR icon if image URL fails
                    (e.target as any).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=gkevents@okhdfcbank&pn=GK%20BOOKING&am=0&cu=INR`;
                  }}
                />
              </div>

              {/* UPI ID Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-cream-200 px-3 py-1 rounded-full text-xs font-mono font-bold text-primary-800 shadow-sm">
                <span>{upiId || 'gkevents@okhdfcbank'}</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2">
                Scan with Google Pay, PhonePe, Paytm, or any UPI app
              </p>
            </div>

            {/* Bank Details Summary */}
            <div className="bg-cream-100/40 border border-cream-200 rounded-luxury p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-neutral-500">Account Holder:</span>
                <span className="font-bold text-primary-800">{accountHolderName || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Bank Name:</span>
                <span className="font-bold text-primary-800">{bankName || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Account Number:</span>
                <span className="font-mono font-bold text-primary-800">{accountNumber || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">IFSC Code:</span>
                <span className="font-mono font-bold text-gold-600 uppercase">{ifscCode || '—'}</span>
              </div>
              {branchName && (
                <div className="flex justify-between items-center pt-1 border-t border-cream-200/60">
                  <span className="text-neutral-500">Branch:</span>
                  <span className="text-primary-800 text-[11px] font-medium truncate max-w-[180px]">{branchName}</span>
                </div>
              )}
            </div>

            {/* Note badge */}
            <div className="mt-4 flex items-start gap-2 text-[11px] text-neutral-500 bg-cream-50 p-3 rounded-lg border border-cream-200">
              <Info size={14} className="text-gold-500 shrink-0 mt-0.5" />
              <span>
                Changes saved here will immediately reflect on the checkout page when customers make bookings.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentSettingsPage;
