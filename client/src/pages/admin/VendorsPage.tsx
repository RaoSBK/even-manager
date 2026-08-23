import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { vendorApi, Vendor, VendorServiceItem } from '../../api/vendorApi';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const CATEGORIES = [
  'Catering',
  'Decoration',
  'Photography',
  'Videography',
  'DJ',
  'Transportation',
  'Florist',
  'Equipment',
  'Other'
];

export const VendorsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected & Form state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    status: 'ACTIVE' as Vendor['status'],
    notes: '',
    services: [] as VendorServiceItem[]
  });

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const filters = {
        search,
        category: categoryFilter,
        status: statusFilter
      };
      const data = await vendorApi.getAll(filters);
      setVendors(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      status: 'ACTIVE',
      notes: '',
      services: []
    });
    setNewServiceName('');
    setNewServicePrice(0);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVendor(v);
    setFormData({
      name: v.name,
      companyName: v.companyName || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      city: v.city || '',
      state: v.state || '',
      status: v.status,
      notes: v.notes || '',
      services: v.services || []
    });
    setNewServiceName('');
    setNewServicePrice(0);
    setIsEditOpen(true);
  };

  const handleOpenDetail = async (v: Vendor) => {
    setLoading(true);
    try {
      const data = await vendorApi.getById(v.id);
      setSelectedVendor(data);
      setIsDetailOpen(true);
    } catch {
      addToast('Failed to load vendor specifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    if (!newServiceName) return;
    const item: VendorServiceItem = {
      name: newServiceName,
      basePrice: newServicePrice
    };
    setFormData({
      ...formData,
      services: [...formData.services, item]
    });
    setNewServiceName('');
    setNewServicePrice(0);
  };

  const handleRemoveService = (idx: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== idx)
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorApi.create(formData);
      addToast('Vendor registered successfully.', 'success');
      setIsAddOpen(false);
      fetchVendors();
    } catch (err: any) {
      addToast(err.message || 'Failed to register vendor.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      await vendorApi.update(selectedVendor.id, formData);
      addToast('Vendor details updated successfully.', 'success');
      setIsEditOpen(false);
      fetchVendors();
    } catch (err: any) {
      addToast(err.message || 'Failed to update vendor details.', 'error');
    }
  };

  const handleToggleStatus = async (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Deactivate/activate vendor "${v.name}"?`)) return;

    try {
      await vendorApi.update(v.id, { status: newStatus });
      addToast(`Vendor status updated to ${newStatus}.`, 'success');
      fetchVendors();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle vendor status.', 'error');
    }
  };

  const columns = [
    { key: 'vendorCode', header: 'Vendor ID', render: (v: Vendor) => <span className="font-bold text-gold-600">{v.vendorCode}</span> },
    { key: 'name', header: 'Vendor Name', render: (v: Vendor) => <span className="font-semibold text-primary-800">{v.name}</span> },
    { key: 'companyName', header: 'Company Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Status',
      render: (v: Vendor) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
          v.status === 'ACTIVE'
            ? 'bg-green-50 text-green-700 border border-green-150'
            : v.status === 'INACTIVE'
            ? 'bg-red-50 text-red-700 border border-red-150'
            : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
        }`}>
          {v.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (v: Vendor) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={() => handleOpenDetail(v)}>
            <Eye size={12} />
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleOpenEdit(v, e)}>
            <Edit2 size={12} />
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleToggleStatus(v, e)}>
            {v.status === 'ACTIVE' ? <ToggleRight className="text-green-600" size={14} /> : <ToggleLeft className="text-neutral-400" size={14} />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Vendors & Partners</h3>
          <p className="text-xs text-neutral-400 mt-1">Coordinate third-party decorators, caterers, florists, and production crews</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Add Vendor
        </Button>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by code, company, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
        />
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Category</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold text-primary-800 uppercase tracking-wide">Status</label>
          <select
            className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-3 py-2 text-xs focus:outline-none focus:bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="BLACKLISTED">BLACKLISTED</option>
          </select>
        </div>
        <Button type="submit" variant="gold" className="self-end !py-2">Apply Filters</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Active Partners Log" subtitle="Manage vendor catalogs and directory profiles">
          <Table
            columns={columns}
            data={vendors}
            loading={loading}
            emptyMessage="No vendors registered."
            onRowClick={handleOpenDetail}
          />
        </DashboardCard>
      )}

      {/* ADD VENDOR MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Partner Vendor" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vendor / Contact Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Service items adder */}
          <div className="border border-cream-150 p-4 rounded bg-cream-50/20 text-xs space-y-3">
            <span className="font-bold text-primary-800 uppercase text-[10px] block">Services Catalogue Pricing</span>
            <div className="flex gap-2">
              <select
                className="w-1/2 bg-white border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              >
                <option value="">-- Choose Category --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input
                placeholder="Base Price (INR)"
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Number(e.target.value))}
              />
              <Button type="button" variant="secondary" onClick={handleAddService}>Add</Button>
            </div>
            {/* Added Services Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.services.map((s, idx) => (
                <span key={idx} className="bg-white border border-cream-200 px-3 py-1 rounded-full font-semibold flex items-center gap-2">
                  {s.name} (₹{s.basePrice})
                  <button type="button" className="text-red-500 font-bold" onClick={() => handleRemoveService(idx)}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800">Internal Notes</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-sm focus:outline-none focus:bg-white"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Register Vendor</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT VENDOR MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Partner Vendor" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vendor / Contact Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Service items adder */}
          <div className="border border-cream-150 p-4 rounded bg-cream-50/20 text-xs space-y-3">
            <span className="font-bold text-primary-800 uppercase text-[10px] block">Services Catalogue Pricing</span>
            <div className="flex gap-2">
              <select
                className="w-1/2 bg-white border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              >
                <option value="">-- Choose Category --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input
                placeholder="Base Price (INR)"
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Number(e.target.value))}
              />
              <Button type="button" variant="secondary" onClick={handleAddService}>Add</Button>
            </div>
            {/* Added Services Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.services.map((s, idx) => (
                <span key={idx} className="bg-white border border-cream-200 px-3 py-1 rounded-full font-semibold flex items-center gap-2">
                  {s.name} (₹{s.basePrice})
                  <button type="button" className="text-red-500 font-bold" onClick={() => handleRemoveService(idx)}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* VENDOR DETAILS MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Vendor Catalog Overview" size="lg">
        {selectedVendor && (
          <div className="space-y-6">
            <div className="border-b border-cream-150 pb-4 flex justify-between items-start">
              <div>
                <h4 className="text-md font-bold text-primary-800 font-serif">
                  {selectedVendor.companyName || selectedVendor.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Partner ID: {selectedVendor.vendorCode}</p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${
                selectedVendor.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {selectedVendor.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="text-neutral-400 font-bold block uppercase text-[10px]">Contact Info</span>
                <p className="font-semibold text-primary-800">Primary Contact: {selectedVendor.name}</p>
                <p className="flex items-center gap-1"><Phone size={12} /> {selectedVendor.phone || 'N/A'}</p>
                <p className="flex items-center gap-1"><Mail size={12} /> {selectedVendor.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-neutral-400 font-bold block uppercase text-[10px]">Address Details</span>
                <p className="flex items-center gap-1"><MapPin size={12} /> {selectedVendor.address || 'N/A'}</p>
                <p>{selectedVendor.city || ''}, {selectedVendor.state || ''}</p>
              </div>
            </div>

            {selectedVendor.notes && (
              <div className="p-3 bg-cream-50 border border-cream-100 rounded text-xs text-neutral-600">
                <span className="font-bold block uppercase text-[10px] text-neutral-400 mb-1">Internal Notes</span>
                {selectedVendor.notes}
              </div>
            )}

            <div>
              <span className="text-neutral-400 font-bold block uppercase text-[10px] mb-3">Service Catalog List</span>
              {!selectedVendor.services || selectedVendor.services.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No services listed in catalog.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedVendor.services.map((svc) => (
                    <div key={svc.id} className="p-3 bg-cream-50/20 border border-cream-100 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-primary-800 block">{svc.name}</span>
                        {svc.description && <span className="text-neutral-400 text-[10px]">{svc.description}</span>}
                      </div>
                      <span className="font-semibold text-gold-600">₹{Number(svc.basePrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorsPage;
