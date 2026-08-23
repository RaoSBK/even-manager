import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { paymentApi, Payment } from '../../api/paymentApi';
import { hallApi, Hall } from '../../api/hallApi';
import { customerApi, Customer } from '../../api/customerApi';
import {
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';
import Button from '../../components/common/Button';

export const ReportsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [b, p, h, c] = await Promise.all([
        bookingApi.getAll(),
        paymentApi.getAll(),
        hallApi.getAll(),
        customerApi.getAll()
      ]);
      setBookings(b);
      setPayments(p);
      setHalls(h);
      setCustomers(c);
    } catch (error) {
      console.error('Failed to load reports metadata', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Compute analytics
  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingRevenue = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

  const occupiedHalls = halls.filter((h) => h.status === 'MAINTENANCE').length;

  // Hall utilization stats
  const getHallBookingCount = (hallId: string) => {
    return bookings.filter(b => b.hallId === hallId).length;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs font-bold text-neutral-400">
        Compiling business statistics log analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Executive Reports</h3>
          <p className="text-xs text-neutral-400 mt-1">Live analytics audit compilation representing revenue growth and hall occupancy</p>
        </div>
        <Button onClick={handlePrint} variant="gold" className="self-start sm:self-auto gap-2">
          <Printer size={16} /> Print Report Statement
        </Button>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="reports-numerical-grid">
        <div className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Total Revenue (Clear)</span>
          <span className="text-xl font-bold text-green-700 block mt-1">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-neutral-400">Verified cash flow</span>
        </div>
        <div className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Pending Clearance</span>
          <span className="text-xl font-bold text-yellow-600 block mt-1">₹{pendingRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-neutral-400">Awaiting bank logs</span>
        </div>
        <div className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Banquets Occupied</span>
          <span className="text-xl font-bold text-primary-800 block mt-1">{occupiedHalls} / {halls.length} Halls</span>
          <span className="text-[9px] text-neutral-400">Active maintenance cycles</span>
        </div>
        <div className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wide">Registered Accounts</span>
          <span className="text-xl font-bold text-gold-600 block mt-1">{customers.length} Customers</span>
          <span className="text-[9px] text-neutral-400">Client registration log count</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings Status Audit */}
        <DashboardCard title="Reservations Lifecycle Audit" subtitle="Breakdown of booking statuses logs">
          <div className="space-y-4 text-xs font-semibold text-neutral-700 pt-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-600" /> Confirmed / Completed</span>
              <span>{confirmedBookings} bookings</span>
            </div>
            <div className="w-full bg-cream-50 h-2 rounded-full overflow-hidden">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${bookings.length > 0 ? (confirmedBookings / bookings.length) * 100 : 0}%` }} />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-yellow-600" /> Pending Approval</span>
              <span>{pendingBookings} bookings</span>
            </div>
            <div className="w-full bg-cream-50 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${bookings.length > 0 ? (pendingBookings / bookings.length) * 100 : 0}%` }} />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-red-500" /> Cancelled / Returned</span>
              <span>{cancelledBookings} bookings</span>
            </div>
            <div className="w-full bg-cream-50 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${bookings.length > 0 ? (cancelledBookings / bookings.length) * 100 : 0}%` }} />
            </div>
          </div>
        </DashboardCard>

        {/* Banquets Utilization Tracker */}
        <DashboardCard title="Banquets Venue Performance" subtitle="Ranking halls based on booking frequency logs">
          <div className="space-y-4 text-xs max-h-80 overflow-y-auto pt-2">
            {halls.map((h) => {
              const count = getHallBookingCount(h.id);
              return (
                <div key={h.id} className="border-b border-cream-100 pb-2 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-primary-800 font-bold">{h.name}</span>
                    <span className="text-gold-600">{count} Bookings</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Code: {h.hallCode}</span>
                    <span>Max Capacity: {h.capacity || 0} Guests</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      {/* GST Payments Audit Logs */}
      <DashboardCard title="Verification Audit Logs" subtitle="Verified transaction logs matching clear invoices balance status">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-150 text-xs text-left">
            <thead>
              <tr className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Clear Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount Value</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-neutral-700">
              {payments.slice(0, 10).map((p) => (
                <tr key={p.id}>
                  <td className="py-2 px-3 font-bold text-gold-600">{p.paymentNumber}</td>
                  <td className="py-2 px-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-2 px-3">{p.paymentMethod}</td>
                  <td className="py-2 px-3 text-right font-bold">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                      p.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ReportsPage;
