import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { paymentApi, Payment } from '../../api/paymentApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { customerApi, Customer } from '../../api/customerApi';
import {
  Search,
  Plus,
  CreditCard,
  Clock,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const PaymentsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected payment
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bookingId: '',
    customerId: '',
    amount: 10000,
    paymentMethod: 'CASH',
    transactionReference: '',
    status: 'SUCCESS',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = { search, status: statusFilter };
      const list = await paymentApi.getAll(filters);
      setPayments(list);

      const bList = await bookingApi.getAll();
      setBookings(bList.filter(b => b.status !== 'CANCELLED'));

      const cList = await customerApi.getAll();
      setCustomers(cList);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch payments records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenRecord = () => {
    setFormData({
      bookingId: '',
      customerId: '',
      amount: 25000,
      paymentMethod: 'CASH',
      transactionReference: '',
      status: 'SUCCESS',
      notes: ''
    });
    setIsRecordOpen(true);
  };

  const handleOpenDetail = async (p: Payment) => {
    setLoading(true);
    try {
      const data = await paymentApi.getById(p.id);
      setSelectedPayment(data);
      setIsDetailOpen(true);
    } catch {
      addToast('Failed to load transaction specifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.create({ ...formData, paymentMethod: formData.paymentMethod as any, status: formData.status as any });
      addToast('Payment recorded successfully.', 'success');
      setIsRecordOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to record payment transaction.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Mark payment status as ${status}?`)) return;
    try {
      await paymentApi.updateStatus(id, status);
      addToast(`Payment marked as ${status}.`, 'success');
      setIsDetailOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update transaction status.', 'error');
    }
  };

  // Pricing calculations
  const calculateTotalRevenue = () => {
    return payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const calculatePendingPayments = () => {
    return payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border border-red-150';
      default:
        return 'bg-neutral-50 text-neutral-700';
    }
  };

  const columns = [
    { key: 'paymentNumber', header: 'Payment ID', render: (p: Payment) => <span className="font-bold text-gold-600">{p.paymentNumber}</span> },
    { key: 'booking', header: 'Booking Ref', render: (p: Payment) => p.booking?.bookingNumber || 'Direct Payment' },
    { key: 'customer', header: 'Customer', render: (p: Payment) => p.customer?.fullName || 'N/A' },
    { key: 'amount', header: 'Amount', render: (p: Payment) => <span className="font-bold">₹{Number(p.amount).toLocaleString('en-IN')}</span> },
    { key: 'paymentMethod', header: 'Method' },
    { key: 'paymentDate', header: 'Payment Date', render: (p: Payment) => new Date(p.paymentDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (p: Payment) => <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(p.status)}`}>{p.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (p: Payment) => (
        <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={() => handleOpenDetail(p)}>
          <Eye size={12} /> Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Payment Ledger</h3>
          <p className="text-xs text-neutral-400 mt-1">Monitor billing receipts, transaction audit trails, and revenue summaries</p>
        </div>
        <Button onClick={handleOpenRecord} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Record Receipt
        </Button>
      </div>

      {/* Revenue summary indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Collected Revenue (SUCCESS)</span>
            <span className="text-md font-bold text-green-700">₹{calculateTotalRevenue().toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-700">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Pending Verification</span>
            <span className="text-md font-bold text-yellow-700">₹{calculatePendingPayments().toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-800">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Total Transactions log</span>
            <span className="text-md font-bold text-primary-800">{payments.length} Records</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm flex gap-4 max-w-xl">
        <Input
          placeholder="Search by transaction reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
        />
        <select
          className="bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none focus:bg-white w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Receipts Log" subtitle="Overview of collected booking invoices payments">
          <Table
            columns={columns}
            data={payments}
            loading={loading}
            emptyMessage="No payments recorded."
            onRowClick={handleOpenDetail}
          />
        </DashboardCard>
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Record Payment Receipt">
        <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs font-semibold">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800">Select Booking Account *</label>
            <select
              className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
              required
              value={formData.bookingId}
              onChange={(e) => {
                const bId = e.target.value;
                const bookObj = bookings.find(b => b.id === bId);
                setFormData({
                  ...formData,
                  bookingId: bId,
                  customerId: bookObj ? (bookObj.customerId || '') : '',
                  amount: bookObj ? Number(bookObj.totalAmount) : 0
                });
              }}
            >
              <option value="">-- Choose Booking --</option>
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} — Client: {b.user?.name || 'Client'} (₹{Number(b.totalAmount).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {!formData.bookingId && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Or Direct Customer Payment *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Receipt Amount (INR) *"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Payment Mode *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2.5 text-sm focus:outline-none"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI / PAYTM</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CARD">CREDIT/DEBIT CARD</option>
                <option value="ONLINE">OTHER ONLINE GATEWAY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transaction ID / Ref"
              placeholder="e.g. TXN987654321"
              value={formData.transactionReference}
              onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Clear status *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2.5 text-sm focus:outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="SUCCESS">SUCCESS / VERIFIED</option>
                <option value="PENDING">PENDING VERIFICATION</option>
                <option value="FAILED">FAILED / RETURNED</option>
              </select>
            </div>
          </div>

          <Input
            label="Internal Notes"
            placeholder="e.g. Cheque clearance details"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsRecordOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Record Receipt</Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL VIEW MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Receipt Transaction Specification">
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="border-b border-cream-150 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-primary-800 font-serif">
                  Receipt: {selectedPayment.paymentNumber}
                </h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Recorded on {new Date(selectedPayment.paymentDate).toLocaleString()}</p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(selectedPayment.status)}`}>
                {selectedPayment.status}
              </span>
            </div>

            <div className="space-y-2">
              <p>Customer: <strong>{selectedPayment.customer?.fullName}</strong></p>
              <p>Phone: <strong>{selectedPayment.customer?.phone}</strong></p>
              {selectedPayment.booking && <p>Linked Booking: <strong>{selectedPayment.booking.bookingNumber}</strong></p>}
              <p className="text-sm font-bold text-primary-800">Amount Collected: ₹{Number(selectedPayment.amount).toLocaleString('en-IN')}</p>
              <p>Payment Method: <span className="font-bold text-gold-600">{selectedPayment.paymentMethod}</span></p>
              {selectedPayment.transactionReference && <p>Transaction Reference: <span className="font-mono">{selectedPayment.transactionReference}</span></p>}
              {selectedPayment.notes && <p className="p-2.5 bg-cream-50 rounded border border-cream-100 italic text-neutral-500">{selectedPayment.notes}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cream-100">
              {selectedPayment.status === 'PENDING' && (
                <>
                  <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(selectedPayment.id, 'FAILED')}>
                    Mark Failed
                  </Button>
                  <Button variant="gold" onClick={() => handleUpdateStatus(selectedPayment.id, 'SUCCESS')}>
                    Approve/Success
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
