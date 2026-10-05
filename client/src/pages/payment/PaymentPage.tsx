import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import {
  ShieldCheck, Lock, CreditCard, Smartphone, Building2, Wallet,
  XCircle, AlertCircle, Download,
  ChevronRight, Home, Calendar, Clock, Users, MapPin, Loader2,
  Sparkles, RefreshCw, QrCode, Check, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  createPaymentOrder,
  processPayment,
  getPublicPaymentSettings,
  PublicPaymentSettings,
  PaymentMethodType,
  PaymentDetails
} from '../../api/paymentApi';
import { generatePaymentReceiptPDF } from '../../services/pdfService';
import { contactConfig } from '../../constants/contactConfig';

// Popular Indian Banks list for Net Banking
const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC001', short: 'HDFC' },
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN001', short: 'SBI' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC001', short: 'ICICI' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB001', short: 'Axis' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KKBK001', short: 'Kotak' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB001', short: 'PNB' }
];

const ALL_BANKS = [
  'Axis Bank',
  'Bank of Baroda',
  'Bank of India',
  'Bank of Maharashtra',
  'Canara Bank',
  'Central Bank of India',
  'City Union Bank',
  'Federal Bank',
  'HDFC Bank',
  'ICICI Bank',
  'IDBI Bank',
  'IDFC FIRST Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'IndusInd Bank',
  'Jammu & Kashmir Bank',
  'Karnataka Bank',
  'Karur Vysya Bank',
  'Kotak Mahindra Bank',
  'Punjab & Sind Bank',
  'Punjab National Bank',
  'RBL Bank',
  'South Indian Bank',
  'State Bank of India',
  'Tamilnad Mercantile Bank',
  'UCO Bank',
  'Union Bank of India',
  'YES Bank'
];

const POPULAR_WALLETS = [
  { id: 'PHONEPE', name: 'PhonePe', color: '#5f259f', tag: 'Fastest' },
  { id: 'GPAY', name: 'Google Pay', color: '#4285f4', tag: 'Instant' },
  { id: 'PAYTM', name: 'Paytm Wallet', color: '#002970', tag: 'Cashback' },
  { id: 'AMAZON', name: 'Amazon Pay', color: '#ff9900', tag: 'Auto-Link' },
  { id: 'MOBIKWIK', name: 'MobiKwik', color: '#273491', tag: 'ZIP Eligible' }
];

const POPULAR_UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', handle: '@okhdfcbank' },
  { id: 'phonepe', name: 'PhonePe', handle: '@ybl' },
  { id: 'paytm', name: 'Paytm', handle: '@paytm' },
  { id: 'bhim', name: 'BHIM UPI', handle: '@upi' },
  { id: 'cred', name: 'CRED UPI', handle: '@cred' }
];

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Retrieve passed booking payload from navigation state or fallback to default sample
  const stateData = location.state?.bookingData || location.state;

  // Fallback demo booking data if user navigated directly
  const fallbackBooking = {
    userId: user?.id || 'USR-DEMO-01',
    customerName: user?.name || 'Rahul Kumar',
    email: user?.email || 'user@gkevent.com',
    mobile: user?.mobile || '9876543210',
    state: 'Telangana',
    district: 'Hyderabad',
    mandal: 'Gachibowli',
    hallId: 'hall-01',
    hallName: 'GK Royal Palace Banquet Hall',
    hallAddress: 'Financial District, Gachibowli, Hyderabad, Telangana 500032',
    eventDate: '2026-11-20',
    costPerDay: 150000,
    totalAmount: 168000,
    capacity: 600,
    eventType: 'Wedding Reception',
    guestsCount: 400,
    eventSession: 'Full Day (09:00 AM - 06:00 PM)',
    foodItems: [
      { id: 'f-1', name: 'Hyderabadi Dum Biryani (Chicken)', price: 350 },
      { id: 'f-2', name: 'Paneer Butter Masala & Butter Naan', price: 250 },
      { id: 'f-3', name: 'Gulab Jamun & Ice Cream', price: 120 }
    ]
  };

  const bookingData = stateData?.hallName ? stateData : fallbackBooking;

  // Calculate Subtotals
  const foodList: Array<{ id: string; name: string; price: number }> = 
    Array.isArray(bookingData.foodItems) ? bookingData.foodItems : [];
  const foodTotal = foodList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const hallCost = Number(bookingData.costPerDay || bookingData.totalAmount || 150000);
  const grandTotal = Number(bookingData.totalAmount || (hallCost + foodTotal));

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');

  // Admin Configured Payment Settings
  const [adminSettings, setAdminSettings] = useState<PublicPaymentSettings | null>(null);

  // Load public payment settings on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getPublicPaymentSettings();
        if (config) {
          setAdminSettings(config);
          if (config.upiId) {
            setUpiId(config.upiId);
          }
        }
      } catch (err) {
        console.error('Failed to load public payment configuration:', err);
      }
    }
    loadConfig();
  }, []);

  // Form Fields State
  // UPI
  const [upiId, setUpiId] = useState<string>('gkevents@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrTimer, setQrTimer] = useState<number>(300);

  // Card
  const [cardHolder, setCardHolder] = useState<string>(bookingData.customerName || 'Rahul Kumar');
  const [cardNumber, setCardNumber] = useState<string>('4532 8921 7845 9210');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('842');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Net Banking
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');
  const [dropdownBank, setDropdownBank] = useState<string>('');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState<string>('PHONEPE');
  const [walletPhone, setWalletPhone] = useState<string>(bookingData.mobile || '9876543210');

  // Processing & State Machine
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'>('IDLE');
  const [processingStep, setProcessingStep] = useState<string>('Initiating secure gateway connection...');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // QR Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (showQrModal && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showQrModal, qrTimer]);

  // Card Number Auto-formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Card Expiry Formatting
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  // Card Brand Detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { brand: 'VISA', icon: '💳 Visa' };
    if (/^5[1-5]/.test(clean)) return { brand: 'MASTERCARD', icon: '💳 Mastercard' };
    if (/^6(011|5)/.test(clean) || clean.startsWith('508')) return { brand: 'RUPAY', icon: '💳 RuPay' };
    if (/^3[47]/.test(clean)) return { brand: 'AMEX', icon: '💳 American Express' };
    return { brand: 'CARD', icon: '💳 Credit/Debit Card' };
  };

  // Payment Execution Workflow
  const handleInitiatePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Field Validations
    if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        addToast('Please provide a valid UPI ID (e.g. name@bank)', 'warning');
        return;
      }
    } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        addToast('Please enter a valid 16-digit card number.', 'warning');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        addToast('Please enter card expiry in MM/YY format.', 'warning');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        addToast('Please enter a valid 3 or 4 digit CVV code.', 'warning');
        return;
      }
    }

    setStatus('PROCESSING');
    setErrorMessage('');

    try {
      // Step 1: Create Order
      setProcessingStep('Initializing 256-Bit SSL Order Session...');
      const order = await createPaymentOrder({
        amount: grandTotal,
        customerName: bookingData.customerName,
        customerEmail: bookingData.email,
        bookingSummary: {
          hallName: bookingData.hallName,
          eventDate: bookingData.eventDate
        }
      });
      setOrderInfo(order);

      // Step 2: Gateway authorization simulation
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Authorizing payment with banking network...');

      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('Confirming reservation & generating transaction receipt...');

      // Prepare Payment Details object
      let details: PaymentDetails = {};
      let resolvedMethodName = 'UPI';

      if (paymentMethod === 'UPI') {
        details = { upiId, upiApp: selectedUpiApp };
        resolvedMethodName = `UPI (${selectedUpiApp.toUpperCase()})`;
      } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        const clean = cardNumber.replace(/\s/g, '');
        const brand = getCardBrand(clean).brand;
        details = {
          cardHolder,
          cardLast4: clean.slice(-4),
          cardBrand: brand,
          cardExpiry
        };
        resolvedMethodName = `${paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'Debit Card'} (${brand} •••• ${clean.slice(-4)})`;
      } else if (paymentMethod === 'NET_BANKING') {
        const bankName = dropdownBank || POPULAR_BANKS.find(b => b.id === selectedBank)?.name || selectedBank;
        details = { bankName };
        resolvedMethodName = `Net Banking (${bankName})`;
      } else if (paymentMethod === 'WALLET') {
        const wallet = POPULAR_WALLETS.find(w => w.id === selectedWallet)?.name || selectedWallet;
        details = { walletName: wallet, walletMobile: walletPhone };
        resolvedMethodName = `Wallet (${wallet})`;
      }

      // Step 3: Process Payment and Record Booking
      const result = await processPayment({
        orderId: order.orderId,
        paymentMethod: resolvedMethodName,
        paymentDetails: details,
        bookingData: {
          ...bookingData,
          totalAmount: grandTotal,
          costPerDay: hallCost
        }
      });

      setPaymentResult(result);
      setStatus('SUCCESS');
      addToast('Payment confirmed! Booking reservation is secured.', 'success');

    } catch (err: any) {
      console.error('Payment failure:', err);
      setErrorMessage(err.message || 'Payment authorization failed. Please try again.');
      setStatus('FAILED');
      addToast(err.message || 'Payment failed.', 'error');
    }
  };

  // Download PDF Payment Receipt
  const handleDownloadReceipt = () => {
    if (!paymentResult) return;

    generatePaymentReceiptPDF({
      paymentId: paymentResult.payment.paymentId,
      orderId: paymentResult.payment.orderId,
      transactionId: paymentResult.payment.transactionId,
      bookingId: paymentResult.booking.bookingId,
      customerName: paymentResult.booking.customerName,
      email: paymentResult.booking.email,
      mobile: paymentResult.booking.mobile,
      hallName: paymentResult.booking.hallName,
      hallAddress: paymentResult.booking.hallAddress,
      eventDate: paymentResult.booking.eventDate,
      eventSession: paymentResult.booking.eventSession,
      eventType: paymentResult.booking.eventType,
      guestsCount: paymentResult.booking.guestsCount,
      paymentMethod: paymentResult.payment.paymentMethod,
      paymentDate: paymentResult.payment.paymentDate,
      hallCost: paymentResult.booking.costPerDay || hallCost,
      foodItems: foodList,
      foodTotal,
      totalAmount: paymentResult.payment.amountPaid || grandTotal,
      paymentStatus: 'PAID & CONFIRMED'
    });
  };

  return (
    <div className="bg-cream-50 min-h-screen py-8 font-sans text-primary-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-gold-500 transition-all flex items-center gap-1">
            <Home size={13} className="text-gold-500" />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to="/halls" className="hover:text-gold-500 transition-all">Function Halls</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-neutral-400 truncate max-w-[180px]">{bookingData.hallName}</span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-primary-800 font-bold">Secure Payment</span>
        </div>

        {/* Page Title & Trust Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-cream-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-800 text-gold-400 flex items-center justify-center shadow-md">
                <Lock size={18} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 tracking-wide">
                  GK BOOKING Checkout
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Complete payment securely with 256-bit bank-grade encryption
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white border border-cream-200 px-3.5 py-2 rounded-luxury shadow-sm">
            <ShieldCheck size={20} className="text-emerald-600" />
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">100% Secure Payment</span>
              <span className="block text-[9px] text-neutral-400">PCI-DSS Compliant • RBI Authorized</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SUCCESS VIEW */}
        {/* ========================================================================= */}
        {status === 'SUCCESS' && paymentResult && (
          <div className="max-w-2xl mx-auto bg-white border border-emerald-100 rounded-luxury-xl p-8 shadow-luxury-lg text-center animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-200 shadow-inner">
              <Sparkles size={36} className="animate-pulse" />
            </div>

            <span className="inline-block px-3 py-1 bg-emerald-100/70 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider rounded-full mb-2">
              Payment Successful & Verified
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-primary-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
              Thank you, <span className="font-bold text-primary-800">{bookingData.customerName}</span>. Your function hall reservation is confirmed and stored in our database. An email receipt has been sent to <span className="font-bold text-primary-800">{bookingData.email}</span>.
            </p>

            {/* Receipt Details Card */}
            <div className="bg-cream-50/80 border border-cream-200 rounded-luxury p-5 text-left text-xs space-y-3 mb-6">
              <div className="flex justify-between items-center pb-2.5 border-b border-cream-200">
                <span className="text-neutral-500">Booking Reference ID:</span>
                <span className="font-mono font-extrabold text-gold-600 text-sm">#{paymentResult.booking.bookingId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Transaction ID:</span>
                <span className="font-mono font-bold text-primary-800">{paymentResult.payment.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono text-neutral-600">{paymentResult.payment.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Venue Booked:</span>
                <span className="font-bold text-primary-800">{bookingData.hallName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Event Date & Session:</span>
                <span className="font-bold text-primary-800">{bookingData.eventDate} ({bookingData.eventSession || 'Full Day'})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Payment Method:</span>
                <span className="font-semibold text-primary-800 bg-white px-2 py-0.5 border border-cream-200 rounded">{paymentResult.payment.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-cream-200">
                <span className="font-bold text-primary-800 text-sm">Total Amount Paid:</span>
                <span className="font-extrabold text-gold-600 text-base">₹{grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full bg-gold-500 text-white font-bold text-xs py-3 px-4 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Download size={15} />
                Download Receipt (PDF)
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/user/bookings')}
                className="w-full bg-primary-800 text-white font-bold text-xs py-3 px-4 rounded-luxury hover:bg-primary-900 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                Go to My Bookings &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FAILED VIEW */}
        {/* ========================================================================= */}
        {status === 'FAILED' && (
          <div className="max-w-xl mx-auto bg-white border border-rose-200 rounded-luxury-xl p-8 shadow-luxury-lg text-center animate-fadeIn">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <XCircle size={32} />
            </div>

            <h2 className="text-2xl font-bold font-serif text-rose-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              {errorMessage || 'The transaction could not be processed by your bank. No money has been deducted.'}
            </p>

            <div className="bg-rose-50/60 border border-rose-100 rounded-luxury p-4 mb-6 text-xs text-left space-y-2 text-rose-900">
              <div className="flex justify-between">
                <span>Attempted Amount:</span>
                <span className="font-bold">₹{grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Method:</span>
                <span className="font-bold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold uppercase text-rose-700">Declined / Timeout</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStatus('IDLE')}
                className="flex-1 bg-gold-500 text-white font-bold text-xs py-3 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow"
              >
                <RefreshCw size={14} />
                Retry Payment
              </button>
              <button
                type="button"
                onClick={() => setStatus('IDLE')}
                className="flex-1 bg-cream-100 text-primary-800 font-bold text-xs py-3 rounded-luxury hover:bg-cream-200 transition-all"
              >
                Change Payment Method
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CANCELLED VIEW */}
        {/* ========================================================================= */}
        {status === 'CANCELLED' && (
          <div className="max-w-xl mx-auto bg-white border border-amber-200 rounded-luxury-xl p-8 shadow-luxury text-center animate-fadeIn">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-2xl font-bold font-serif text-primary-800 mb-2">
              Payment Cancelled
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              You cancelled the transaction request. Your booking is in pending state and not yet confirmed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStatus('IDLE')}
                className="flex-1 bg-gold-500 text-white font-bold text-xs py-3 rounded-luxury hover:bg-gold-600 transition-all"
              >
                Resume Payment
              </button>
              <button
                type="button"
                onClick={() => navigate('/halls')}
                className="flex-1 bg-cream-100 text-primary-800 font-bold text-xs py-3 rounded-luxury hover:bg-cream-200 transition-all"
              >
                Return to Halls Listing
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ACTIVE PAYMENT CHECKOUT (IDLE / PROCESSING) */}
        {/* ========================================================================= */}
        {(status === 'IDLE' || status === 'PROCESSING') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / MAIN COLUMN: Payment Methods & Details (7 of 12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Payment Methods Tabs */}
              <div className="bg-white border border-cream-200 rounded-luxury p-6 shadow-luxury">
                <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gold-500" />
                    <h2 className="font-bold text-sm text-primary-800 tracking-wide font-serif">
                      Choose Payment Method
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Step 2 of 2
                  </span>
                </div>

                {/* Method Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex flex-col items-center justify-center p-3 rounded-luxury border transition-all text-center ${
                      paymentMethod === 'UPI'
                        ? 'border-gold-500 bg-gold-50/40 text-primary-800 shadow-sm ring-2 ring-gold-400/30'
                        : 'border-cream-200 bg-white text-neutral-600 hover:bg-cream-50'
                    }`}
                  >
                    <Smartphone size={20} className={paymentMethod === 'UPI' ? 'text-gold-600' : 'text-neutral-400'} />
                    <span className="text-xs font-bold mt-1.5">UPI / QR</span>
                    <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Instant 0% Fee</span>
                  </button>

                  {/* Credit / Debit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-luxury border transition-all text-center ${
                      paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD'
                        ? 'border-gold-500 bg-gold-50/40 text-primary-800 shadow-sm ring-2 ring-gold-400/30'
                        : 'border-cream-200 bg-white text-neutral-600 hover:bg-cream-50'
                    }`}
                  >
                    <CreditCard size={20} className={paymentMethod === 'CREDIT_CARD' ? 'text-gold-600' : 'text-neutral-400'} />
                    <span className="text-xs font-bold mt-1.5">Cards</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">Visa, Master, RuPay</span>
                  </button>

                  {/* Net Banking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`flex flex-col items-center justify-center p-3 rounded-luxury border transition-all text-center ${
                      paymentMethod === 'NET_BANKING'
                        ? 'border-gold-500 bg-gold-50/40 text-primary-800 shadow-sm ring-2 ring-gold-400/30'
                        : 'border-cream-200 bg-white text-neutral-600 hover:bg-cream-50'
                    }`}
                  >
                    <Building2 size={20} className={paymentMethod === 'NET_BANKING' ? 'text-gold-600' : 'text-neutral-400'} />
                    <span className="text-xs font-bold mt-1.5">Net Banking</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">40+ Indian Banks</span>
                  </button>

                  {/* Wallets */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`flex flex-col items-center justify-center p-3 rounded-luxury border transition-all text-center ${
                      paymentMethod === 'WALLET'
                        ? 'border-gold-500 bg-gold-50/40 text-primary-800 shadow-sm ring-2 ring-gold-400/30'
                        : 'border-cream-200 bg-white text-neutral-600 hover:bg-cream-50'
                    }`}
                  >
                    <Wallet size={20} className={paymentMethod === 'WALLET' ? 'text-gold-600' : 'text-neutral-400'} />
                    <span className="text-xs font-bold mt-1.5">Wallets</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">PhonePe, Paytm</span>
                  </button>
                </div>

                {/* ============================================================= */}
                {/* METHOD FORM: UPI */}
                {/* ============================================================= */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Quick App Select */}
                    <div>
                      <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider mb-2">
                        Select UPI App or Enter Virtual Payment Address (VPA)
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {POPULAR_UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setSelectedUpiApp(app.id);
                              setUpiId(bookingData.mobile ? `${bookingData.mobile}${app.handle}` : `user${app.handle}`);
                            }}
                            className={`p-2.5 rounded-lg border text-center transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-primary-800 bg-primary-50/60 text-primary-800 font-bold ring-1 ring-primary-800'
                                : 'border-cream-200 bg-cream-50/40 text-neutral-600 hover:bg-cream-100/60'
                            }`}
                          >
                            <span className="block text-xs font-bold">{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom UPI ID Input */}
                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        UPI ID / VPA <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@upi or username@okhdfcbank"
                          className="w-full bg-cream-50 border border-cream-200 rounded-lg p-3 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                        />
                        <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified VPA
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 flex items-center justify-between">
                        <span>Receiving Merchant: <strong className="text-primary-800">{adminSettings?.merchantName || 'GK BOOKING'}</strong></span>
                        <span className="text-[10px] text-neutral-400 font-mono">({adminSettings?.upiId || upiId})</span>
                      </p>
                    </div>

                    {/* QR Code Option */}
                    <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode size={18} className="text-gold-600" />
                        <div>
                          <p className="text-xs font-bold text-primary-800">Scan & Pay via Dynamic QR</p>
                          <p className="text-[10px] text-neutral-400">Scan from Google Pay, PhonePe, Paytm, or CRED</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="bg-cream-100 hover:bg-cream-200 text-primary-800 text-xs font-bold py-1.5 px-3 rounded-lg border border-cream-200 transition-all"
                      >
                        Show QR Code
                      </button>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      disabled={status === 'PROCESSING' || !upiId}
                      onClick={handleInitiatePayment}
                      className="w-full bg-gold-500 text-white font-bold text-xs py-3.5 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {status === 'PROCESSING' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing UPI Payment...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Pay with UPI ₹{grandTotal.toLocaleString('en-IN')}.00
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ============================================================= */}
                {/* METHOD FORM: CARDS */}
                {/* ============================================================= */}
                {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                  <form onSubmit={handleInitiatePayment} className="space-y-4 animate-fadeIn">
                    {/* Card Brand Header */}
                    <div className="flex items-center justify-between bg-primary-800 text-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-gold-400" />
                        <span className="text-xs font-bold">{getCardBrand(cardNumber).icon}</span>
                      </div>
                      <span className="text-[10px] bg-primary-900/80 px-2 py-0.5 rounded text-gold-300 font-mono">
                        256-Bit Encrypted
                      </span>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Cardholder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name printed on card"
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Card Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• 9210"
                          className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 pr-12 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono tracking-wider"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-neutral-400">
                          {getCardBrand(cardNumber).brand}
                        </span>
                      </div>
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                          Expiry Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono text-center"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider">
                            CVV / CVC <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-neutral-400 cursor-help" title="3-digit security code on the back of your card">
                            What's this?
                          </span>
                        </div>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono text-center tracking-widest"
                        />
                      </div>
                    </div>

                    {/* Save card toggle */}
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 accent-gold-500 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600">
                        Securely save card details as per RBI tokenization guidelines
                      </span>
                    </label>

                    {/* Pay Button */}
                    <button
                      type="submit"
                      disabled={status === 'PROCESSING'}
                      className="w-full bg-gold-500 text-white font-bold text-xs py-3.5 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
                    >
                      {status === 'PROCESSING' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing Card Payment...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Pay Securely ₹{grandTotal.toLocaleString('en-IN')}.00
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ============================================================= */}
                {/* METHOD FORM: NET BANKING */}
                {/* ============================================================= */}
                {paymentMethod === 'NET_BANKING' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider mb-2.5">
                        Popular Indian Banks
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setSelectedBank(b.id);
                              setDropdownBank('');
                            }}
                            className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                              selectedBank === b.id && !dropdownBank
                                ? 'border-primary-800 bg-primary-50/70 text-primary-800 ring-1 ring-primary-800 shadow-sm'
                                : 'border-cream-200 bg-cream-50/30 text-neutral-700 hover:bg-cream-100/60'
                            }`}
                          >
                            <span className="text-xs font-bold">{b.short}</span>
                            {selectedBank === b.id && !dropdownBank && (
                              <Check size={14} className="text-primary-800" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* All Banks Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Or Select Other Bank
                      </label>
                      <select
                        value={dropdownBank}
                        onChange={(e) => {
                          setDropdownBank(e.target.value);
                          if (e.target.value) setSelectedBank('');
                        }}
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all cursor-pointer"
                      >
                        <option value="">-- Choose from all Indian Banks (40+ available) --</option>
                        {ALL_BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      disabled={status === 'PROCESSING'}
                      onClick={handleInitiatePayment}
                      className="w-full bg-gold-500 text-white font-bold text-xs py-3.5 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {status === 'PROCESSING' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Redirecting to Bank Portal...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Proceed to Net Banking ₹{grandTotal.toLocaleString('en-IN')}.00
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ============================================================= */}
                {/* METHOD FORM: WALLETS */}
                {/* ============================================================= */}
                {paymentMethod === 'WALLET' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-primary-800 uppercase tracking-wider mb-2.5">
                        Supported Digital Wallets
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {POPULAR_WALLETS.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setSelectedWallet(w.id)}
                            className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                              selectedWallet === w.id
                                ? 'border-primary-800 bg-primary-50/70 text-primary-800 ring-1 ring-primary-800 shadow-sm'
                                : 'border-cream-200 bg-white text-neutral-700 hover:bg-cream-50'
                            }`}
                          >
                            <div>
                              <span className="block text-xs font-bold">{w.name}</span>
                              <span className="text-[10px] text-neutral-400">Instant Linking</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase bg-cream-100 text-primary-800 px-2 py-0.5 rounded border border-cream-200">
                              {w.tag}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1.5">
                        Linked Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all font-mono"
                      />
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      disabled={status === 'PROCESSING'}
                      onClick={handleInitiatePayment}
                      className="w-full bg-gold-500 text-white font-bold text-xs py-3.5 rounded-luxury hover:bg-gold-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
                    >
                      {status === 'PROCESSING' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Authorizing Wallet...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Pay with {POPULAR_WALLETS.find(w => w.id === selectedWallet)?.name || 'Wallet'} ₹{grandTotal.toLocaleString('en-IN')}.00
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>

              {/* Security Badges Card */}
              <div className="bg-cream-100/60 border border-cream-200 rounded-luxury p-4 text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <span className="text-[11px]">
                    Your payment details are end-to-end encrypted and never stored in plain text.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-white border border-cream-200 px-2 py-0.5 rounded font-bold text-primary-800">
                    256-Bit SSL
                  </span>
                  <span className="text-[10px] bg-white border border-cream-200 px-2 py-0.5 rounded font-bold text-primary-800">
                    PCI-DSS
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Booking Summary Card (5 of 12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-cream-250 rounded-luxury p-6 shadow-luxury-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-800"></div>

                <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gold-500" />
                    <h3 className="font-bold text-sm text-primary-800 tracking-wide font-serif">
                      Booking Summary
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                    Contract ID: Pending
                  </span>
                </div>

                {/* Venue Details */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h4 className="font-bold text-primary-800 text-sm">{bookingData.hallName}</h4>
                    <div className="flex items-start gap-1 text-[11px] text-neutral-500 mt-1">
                      <MapPin size={13} className="shrink-0 text-gold-500 mt-0.5" />
                      <span>{bookingData.hallAddress || `${bookingData.mandal}, ${bookingData.district}, ${bookingData.state}`}</span>
                    </div>
                  </div>

                  {/* Customer Info Strip */}
                  <div className="bg-cream-50/70 border border-cream-200/80 rounded-lg p-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Customer Name:</span>
                      <span className="font-bold text-primary-800">{bookingData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Contact Email:</span>
                      <span className="font-semibold text-primary-800">{bookingData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Contact Mobile:</span>
                      <span className="font-semibold text-primary-800">{bookingData.mobile}</span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="border-t border-cream-100 pt-3 space-y-2">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gold-500" />
                        Event Date:
                      </span>
                      <span className="font-bold text-primary-800 bg-cream-100 px-2 py-0.5 rounded text-[11px]">
                        {bookingData.eventDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gold-500" />
                        Session Time:
                      </span>
                      <span className="font-semibold text-primary-800">
                        {bookingData.eventSession || 'Full Day (09:00 AM - 06:00 PM)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-gold-500" />
                        Expected Guests:
                      </span>
                      <span className="font-semibold text-primary-800">
                        {bookingData.guestsCount || 100} Guests
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Event Category:</span>
                      <span className="font-semibold text-primary-800">
                        {bookingData.eventType || 'General Celebration'}
                      </span>
                    </div>
                  </div>

                  {/* Food Catering Breakdown */}
                  {foodList.length > 0 && (
                    <div className="border-t border-cream-100 pt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-primary-800 uppercase text-[9px] tracking-wider">
                          Selected Catering Menu ({foodList.length} items):
                        </span>
                        <span className="font-bold text-primary-800 text-xs">
                          ₹{foodTotal.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {foodList.map((item) => (
                          <span
                            key={item.id}
                            className="bg-cream-100 text-primary-800 border border-cream-200 px-2 py-0.5 rounded text-[10px] font-medium"
                          >
                            {item.name} (₹{item.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Breakdown */}
                  <div className="border-t border-cream-100 pt-3.5 space-y-2 bg-cream-50/50 -mx-6 px-6 py-4 rounded-b-luxury">
                    <div className="flex justify-between text-neutral-600 text-xs">
                      <span>Hall Booking Price:</span>
                      <span className="font-semibold text-primary-800">₹{hallCost.toLocaleString('en-IN')}.00</span>
                    </div>
                    {foodTotal > 0 && (
                      <div className="flex justify-between text-neutral-600 text-xs">
                        <span>Catering Total:</span>
                        <span className="font-semibold text-primary-800">₹{foodTotal.toLocaleString('en-IN')}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-600 text-xs">
                      <span>Taxes & GST:</span>
                      <span className="font-semibold text-emerald-600">₹0.00 (Inclusive)</span>
                    </div>
                    
                    {/* Highlighted Grand Total */}
                    <div className="flex justify-between items-baseline pt-3 border-t border-cream-200">
                      <span className="font-bold text-primary-800 text-sm">Grand Total:</span>
                      <span className="font-extrabold text-gold-600 text-xl tracking-tight">
                        ₹{grandTotal.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-white border border-cream-200 rounded-luxury p-4 text-xs space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-primary-800 font-bold">
                  <HelpCircle size={15} className="text-gold-500" />
                  <span>Need assistance with your payment?</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Contact GK Booking Customer Care 24/7 at <span className="font-bold text-primary-800">{contactConfig.phone.display}</span> or write to <span className="font-bold text-primary-800">{contactConfig.email.display}</span>.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: QR CODE SCANNER */}
        {/* ========================================================================= */}
        {showQrModal && (
          <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-cream-200 rounded-luxury-xl max-w-sm w-full p-6 text-center shadow-luxury-lg relative">
              <h3 className="text-lg font-bold font-serif text-primary-800 mb-1">
                Scan & Pay with any UPI App
              </h3>
              <p className="text-[11px] text-neutral-400 mb-3">
                Google Pay, PhonePe, Paytm, BHIM, CRED
              </p>

              {/* Dynamic QR Code */}
              <div className="bg-cream-50 border-2 border-dashed border-gold-400 rounded-luxury p-4 max-w-[220px] mx-auto mb-3 relative shadow-inner">
                <span className="block text-[10px] font-bold text-primary-800 uppercase tracking-wider mb-2">
                  {adminSettings?.merchantName || 'GK BOOKING'}
                </span>
                <div className="w-40 h-40 bg-white mx-auto flex items-center justify-center border border-cream-200 rounded p-1 shadow-sm overflow-hidden">
                  <img
                    src={
                      adminSettings?.qrCodeUrl ||
                      `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        `upi://pay?pa=${adminSettings?.upiId || upiId}&pn=${encodeURIComponent(
                          adminSettings?.merchantName || 'GK BOOKING'
                        )}&am=${grandTotal}&cu=INR`
                      )}`
                    }
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-2 inline-flex items-center gap-1 bg-white border border-cream-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-primary-800">
                  <span>{adminSettings?.upiId || upiId}</span>
                </div>
              </div>

              <div className="text-xs font-bold text-primary-800 mb-1">
                Amount to Pay: <span className="text-gold-600 text-sm font-extrabold">₹{grandTotal.toLocaleString('en-IN')}.00</span>
              </div>

              <p className="text-[10px] text-neutral-400 mb-4">
                QR expires in <span className="font-bold text-primary-800">{Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}</span>
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowQrModal(false);
                    handleInitiatePayment();
                  }}
                  className="w-full bg-gold-500 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-gold-600 transition-all shadow"
                >
                  Simulate QR Payment Done
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full bg-cream-100 text-primary-800 font-bold text-xs py-2 rounded-lg hover:bg-cream-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY: PROCESSING MODAL */}
        {/* ========================================================================= */}
        {status === 'PROCESSING' && (
          <div className="fixed inset-0 bg-primary-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-cream-200 rounded-luxury-xl max-w-sm w-full p-8 text-center shadow-luxury-lg">
              <div className="w-16 h-16 bg-gold-50 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-gold-200">
                <Loader2 size={32} className="animate-spin text-gold-600" />
              </div>

              <h3 className="text-lg font-bold font-serif text-primary-800 mb-1">
                Processing Secure Payment
              </h3>
              <p className="text-xs text-neutral-500 font-medium mb-4 animate-pulse">
                {processingStep}
              </p>

              <div className="w-full bg-cream-100 rounded-full h-1.5 overflow-hidden mb-6">
                <div className="bg-gold-500 h-1.5 rounded-full animate-indeterminate"></div>
              </div>

              <div className="bg-cream-50 border border-cream-200 rounded-lg p-3 text-[10px] text-neutral-500 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span className="font-bold text-primary-800">₹{grandTotal.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Channel:</span>
                  <span className="font-bold text-primary-800">{paymentMethod}</span>
                </div>
                {orderInfo?.orderId && (
                  <div className="flex justify-between">
                    <span>Order Ref:</span>
                    <span className="font-mono text-primary-800 font-semibold">{orderInfo.orderId}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-neutral-400">
                Please do not refresh the page or press the back button.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentPage;
