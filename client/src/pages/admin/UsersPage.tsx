import React, { useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { searchApi, GlobalSearchResults } from '../../api/searchApi';
import {
  Search,
  User,
  Users,
  Calendar,
  Briefcase,
  Layers,
  FileText
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const UsersPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const data = await searchApi.search(searchQuery);
      setResults(data);
    } catch {
      addToast('Search query failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Global Enterprise Search</h3>
        <p className="text-xs text-neutral-400 mt-1">Perform search queries across customers, staff, bookings, vendors, halls, and bills</p>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-6 rounded-luxury shadow-sm max-w-2xl flex gap-3">
        <div className="flex-grow">
          <Input
            placeholder="Type search terms (e.g. name, code, booking number, email...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <Button type="submit" variant="gold" className="!py-2.5 px-6">
          Search System
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-10 text-xs font-bold text-neutral-400">
          Searching registry databases...
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          {/* Customers matches */}
          {results.customers.length > 0 && (
            <DashboardCard title={`Matched Customers (${results.customers.length})`} subtitle="System registration contacts">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.customers.map(c => (
                  <div key={c.id} className="p-3 border border-cream-100 rounded bg-cream-50/20">
                    <p className="font-bold text-primary-800 flex items-center gap-1.5"><User size={14} /> {c.fullName}</p>
                    <p className="text-neutral-500 mt-1">Phone: {c.phone} | Email: {c.email || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Employees matches */}
          {results.employees.length > 0 && (
            <DashboardCard title={`Matched Coordinators (${results.employees.length})`} subtitle="Internal operations staff members">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.employees.map(emp => (
                  <div key={emp.id} className="p-3 border border-cream-100 rounded bg-cream-50/20">
                    <p className="font-bold text-primary-800 flex items-center gap-1.5"><Users size={14} /> {emp.user?.name || 'Staff'}</p>
                    <p className="text-neutral-500 mt-1">Code: {emp.employeeCode} | Designation: {emp.designation}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Bookings matches */}
          {results.bookings.length > 0 && (
            <DashboardCard title={`Matched Bookings (${results.bookings.length})`} subtitle="Function halls reservations">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.bookings.map(b => (
                  <div key={b.id} className="p-3 border border-cream-100 rounded bg-cream-50/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-primary-800 flex items-center gap-1.5"><Calendar size={14} /> Booking: {b.bookingNumber}</p>
                      <p className="text-neutral-500 mt-1">Client: {b.user?.name || 'Client'} | Venue: {b.hall?.name || 'Event Hall'}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-gold-600 bg-white border border-cream-200 px-2 py-0.5 rounded">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Vendors matches */}
          {results.vendors.length > 0 && (
            <DashboardCard title={`Matched Partners (${results.vendors.length})`} subtitle="Vendor directories">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.vendors.map(v => (
                  <div key={v.id} className="p-3 border border-cream-100 rounded bg-cream-50/20">
                    <p className="font-bold text-primary-800 flex items-center gap-1.5"><Briefcase size={14} /> {v.companyName || v.name}</p>
                    <p className="text-neutral-500 mt-1">Phone: {v.phone} | Status: {v.status}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Halls matches */}
          {results.halls.length > 0 && (
            <DashboardCard title={`Matched Banquets (${results.halls.length})`} subtitle="Event function venues">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.halls.map(h => (
                  <div key={h.id} className="p-3 border border-cream-100 rounded bg-cream-50/20">
                    <p className="font-bold text-primary-800 flex items-center gap-1.5"><Layers size={14} /> {h.name}</p>
                    <p className="text-neutral-500 mt-1">Code: {h.hallCode} | Capacity: {h.capacity || 0} Guests</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Invoices matches */}
          {results.invoices.length > 0 && (
            <DashboardCard title={`Matched Invoices (${results.invoices.length})`} subtitle="GST billing files">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {results.invoices.map(inv => (
                  <div key={inv.id} className="p-3 border border-cream-100 rounded bg-cream-50/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-primary-800 flex items-center gap-1.5"><FileText size={14} /> {inv.invoiceNumber}</p>
                      <p className="text-neutral-500 mt-1">Value: ₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-white border px-2 py-0.5 rounded uppercase">
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Empty search fallback */}
          {results.customers.length === 0 &&
           results.employees.length === 0 &&
           results.bookings.length === 0 &&
           results.vendors.length === 0 &&
           results.halls.length === 0 &&
           results.invoices.length === 0 && (
             <div className="text-center py-10 text-xs font-bold text-neutral-400 bg-white border border-cream-150 rounded-luxury shadow-sm">
               No matches found across enterprise registers.
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
