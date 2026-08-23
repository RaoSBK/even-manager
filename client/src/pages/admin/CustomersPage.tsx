import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { customerApi, Customer, CustomerPayload } from '../../api/customerApi';
import {
  Search,
  UserPlus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const CustomersPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Forms & Selected states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerPayload>({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    password: ''
  });

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const data = await customerApi.getAll(query);
      setCustomers(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      notes: '',
      password: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      notes: customer.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenProfile = async (customer: Customer) => {
    setLoading(true);
    try {
      const details = await customerApi.getById(customer.id);
      setSelectedCustomer(details);
      setIsProfileOpen(true);
    } catch (err) {
      addToast('Failed to load customer profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerApi.create(formData);
      addToast('Customer registered successfully.', 'success');
      setIsAddOpen(false);
      fetchCustomers();
    } catch (err: any) {
      addToast(err.message || 'Failed to register customer.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await customerApi.update(selectedCustomer.id, formData);
      addToast('Customer profile updated successfully.', 'success');
      setIsEditOpen(false);
      fetchCustomers();
    } catch (err: any) {
      addToast(err.message || 'Failed to update customer profile.', 'error');
    }
  };

  const handleToggleActive = async (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = customer.user?.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this customer's account?`)) {
      return;
    }

    try {
      const res = await customerApi.toggleActive(customer.id);
      addToast(res.message, 'success');
      fetchCustomers();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle account status.', 'error');
    }
  };

  const columns = [
    { key: 'fullName', header: 'Client Name', render: (c: Customer) => <span className="font-semibold text-primary-800">{c.fullName}</span> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'events', header: 'Events Booked', align: 'center' as const, render: (c: Customer) => c.events?.length || 0 },
    {
      key: 'isActive',
      header: 'Status',
      render: (c: Customer) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
          c.user?.isActive ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-red-50 text-red-700 border border-red-150'
        }`}>
          {c.user?.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (c: Customer) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={() => handleOpenProfile(c)}>
            <Eye size={14} />
          </Button>
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={(e) => handleOpenEdit(c, e)}>
            <Edit2 size={14} />
          </Button>
          <Button
            variant="secondary"
            className="!p-1.5 !px-2 rounded hover:bg-neutral-100"
            onClick={(e) => handleToggleActive(c, e)}
          >
            {c.user?.isActive ? <ToggleRight className="text-green-600" size={16} /> : <ToggleLeft className="text-neutral-400" size={16} />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Customer Base</h3>
          <p className="text-xs text-neutral-400 mt-1">Monitor user bookings history, engagement history, and total spending metrics</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <UserPlus size={16} /> Add Customer
        </Button>
      </div>

      {/* Search and filter */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={18} />}
        />
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Client List" subtitle="List of registered clients and billing profiles">
          <Table
            columns={columns}
            data={customers}
            loading={loading}
            emptyMessage="No customers found."
            onRowClick={handleOpenProfile}
          />
        </DashboardCard>
      )}

      {/* ADD CUSTOMER MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Customer">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Alternate Phone"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
            />
            <Input
              label="Password (optional, default: password123)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Internal Notes</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Register Client</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Customer Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Alternate Phone"
            value={formData.alternatePhone}
            onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Internal Notes</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* CUSTOMER PROFILE DETAIL MODAL */}
      <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Client Profile Details" size="lg">
        {selectedCustomer && (
          <div className="space-y-6">
            {/* PERSONAL INFO */}
            <div className="border-b border-cream-150 pb-4">
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-gold-500" /> Personal Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Name</span>
                  <span className="text-primary-800 font-semibold">{selectedCustomer.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Email</span>
                  <span className="text-primary-800 flex items-center gap-1"><Mail size={12} /> {selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Phone</span>
                  <span className="text-primary-800 flex items-center gap-1"><Phone size={12} /> {selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.alternatePhone && (
                  <div>
                    <span className="text-xs text-neutral-400 block font-bold uppercase">Alternate Phone</span>
                    <span className="text-primary-800">{selectedCustomer.alternatePhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">City/State</span>
                  <span className="text-primary-800 flex items-center gap-1">
                    <MapPin size={12} /> {selectedCustomer.city || 'N/A'}, {selectedCustomer.state || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Account Status</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    selectedCustomer.user?.isActive ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-red-50 text-red-700 border border-red-150'
                  }`}>
                    {selectedCustomer.user?.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              {selectedCustomer.address && (
                <div className="mt-3 text-sm">
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Address</span>
                  <span className="text-primary-800">{selectedCustomer.address} {selectedCustomer.postalCode}</span>
                </div>
              )}
              {selectedCustomer.notes && (
                <div className="mt-3 p-2 bg-cream-50 rounded border border-cream-100 text-xs text-neutral-600">
                  <span className="font-bold block uppercase text-[10px] text-neutral-400 mb-1">Notes</span>
                  {selectedCustomer.notes}
                </div>
              )}
            </div>

            {/* BOOKINGS */}
            <div className="border-b border-cream-150 pb-4">
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-gold-500" /> Bookings
              </h5>
              {!selectedCustomer.bookings || selectedCustomer.bookings.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No bookings recorded for this client.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedCustomer.bookings.map((b: any) => (
                    <div key={b.id} className="p-3 bg-white border border-cream-150 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gold-600 block">{b.bookingNumber}</span>
                        <span className="text-primary-800 font-semibold">{b.eventType} at {b.hall?.name || 'Hall'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">₹{Number(b.totalAmount).toLocaleString('en-IN')}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EVENTS */}
            <div className="border-b border-cream-150 pb-4">
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-gold-500" /> Events History
              </h5>
              {!selectedCustomer.events || selectedCustomer.events.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No events planning history found.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedCustomer.events.map((e: any) => (
                    <div key={e.id} className="p-3 bg-white border border-cream-150 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-primary-800 block">{e.eventName} ({e.eventCode})</span>
                        <span className="text-neutral-500">{new Date(e.eventDate).toLocaleDateString()} — {e.eventType}</span>
                      </div>
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          e.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENTS */}
            <div className="border-b border-cream-150 pb-4">
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-gold-500" /> Payments History
              </h5>
              {!selectedCustomer.payments || selectedCustomer.payments.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-2 bg-cream-50/50 rounded">No payment history found.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedCustomer.payments.map((p: any) => (
                    <div key={p.id} className="p-2 bg-white border border-cream-100 rounded flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-semibold block">{p.paymentNumber} ({p.paymentMethod})</span>
                        <span className="text-neutral-400">{new Date(p.paymentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600 block">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                        <span className="text-[9px] uppercase font-bold text-neutral-500">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* INVOICES */}
            <div>
              <h5 className="text-md font-bold text-primary-800 font-serif mb-3 flex items-center gap-2">
                <FileText size={16} className="text-gold-500" /> Invoices
              </h5>
              {!selectedCustomer.invoices || selectedCustomer.invoices.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-2 bg-cream-50/50 rounded">No invoices generated.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedCustomer.invoices.map((inv: any) => (
                    <div key={inv.id} className="p-2 bg-white border border-cream-100 rounded flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-semibold block">{inv.invoiceNumber}</span>
                        <span className="text-neutral-400">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          inv.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
