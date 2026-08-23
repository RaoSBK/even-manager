import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { quotationApi, Quotation, QuotationItem } from '../../api/quotationApi';
import { customerApi, Customer } from '../../api/customerApi';
import { eventApi, EventDetails } from '../../api/eventApi';
import { vendorApi, Vendor } from '../../api/vendorApi';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Check,
  X,
  Printer
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const QuotationsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selector lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected Quotation
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    eventId: '',
    validUntil: '',
    discount: 0,
    tax: 0,
    notes: '',
    items: [] as QuotationItem[]
  });

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemVendor, setNewItemVendor] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = { search, status: statusFilter };
      const list = await quotationApi.getAll(filters);
      setQuotations(list);

      const cList = await customerApi.getAll();
      setCustomers(cList);

      const eList = await eventApi.getAll();
      setEvents(eList);

      const vList = await vendorApi.getAll();
      setVendors(vList.filter(v => v.status === 'ACTIVE'));
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch quotations.');
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

  const handleOpenCreate = () => {
    setFormData({
      customerId: '',
      eventId: '',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discount: 0,
      tax: 0,
      notes: '',
      items: []
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setNewItemVendor('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = async (q: Quotation, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const data = await quotationApi.getById(q.id);
      setSelectedQuotation(data);
      setFormData({
        customerId: data.customerId,
        eventId: data.eventId || '',
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
        discount: Number(data.discount),
        tax: Number(data.tax),
        notes: data.notes || '',
        items: data.items || []
      });
      setNewItemDesc('');
      setNewItemQty(1);
      setNewItemPrice(0);
      setNewItemVendor('');
      setIsEditOpen(true);
    } catch {
      addToast('Failed to load quotation details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (q: Quotation) => {
    setLoading(true);
    try {
      const data = await quotationApi.getById(q.id);
      setSelectedQuotation(data);
      setIsDetailOpen(true);
    } catch {
      addToast('Failed to fetch quotation items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemDesc || newItemPrice <= 0) return;
    const item: QuotationItem = {
      description: newItemDesc,
      quantity: newItemQty,
      unitPrice: newItemPrice,
      vendorId: newItemVendor || undefined
    };
    setFormData({
      ...formData,
      items: [...formData.items, item]
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setNewItemVendor('');
  };

  const handleRemoveItem = (idx: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx)
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - formData.discount + formData.tax;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      addToast('Please add at least one service item to the quotation.', 'error');
      return;
    }
    try {
      await quotationApi.create(formData);
      addToast('Quotation drafted successfully.', 'success');
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create quotation.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    if (formData.items.length === 0) {
      addToast('Please add at least one service item to the quotation.', 'error');
      return;
    }
    try {
      await quotationApi.update(selectedQuotation.id, formData);
      addToast('Quotation saved successfully.', 'success');
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update quotation.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await quotationApi.updateStatus(id, status);
      addToast(`Quotation marked as ${status}.`, 'success');
      setIsDetailOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update quotation status.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border border-blue-150';
      case 'DRAFT':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'REJECTED':
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border border-red-150';
      default:
        return 'bg-neutral-50 text-neutral-700';
    }
  };

  const columns = [
    { key: 'quotationNumber', header: 'Quotation No', render: (q: Quotation) => <span className="font-bold text-gold-600">{q.quotationNumber}</span> },
    { key: 'customer', header: 'Customer', render: (q: Quotation) => q.customer?.fullName || 'N/A' },
    { key: 'event', header: 'Event Code', render: (q: Quotation) => q.event?.eventCode || 'N/A' },
    { key: 'validUntil', header: 'Valid Until', render: (q: Quotation) => q.validUntil ? new Date(q.validUntil).toLocaleDateString() : 'N/A' },
    { key: 'totalAmount', header: 'Total Value', render: (q: Quotation) => <span className="font-bold">₹{Number(q.totalAmount).toLocaleString('en-IN')}</span> },
    { key: 'status', header: 'Status', render: (q: Quotation) => <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(q.status)}`}>{q.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (q: Quotation) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={() => handleOpenDetail(q)}>
            <Eye size={12} /> View
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleOpenEdit(q, e)}>
            <Edit2 size={12} /> Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Quotations Designer</h3>
          <p className="text-xs text-neutral-400 mt-1">Draft estimated budgets, line items services, and submit quotes proposal plans</p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Create Quotation
        </Button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm flex gap-4 max-w-xl">
        <Input
          placeholder="Search by quote number..."
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
          <option value="DRAFT">DRAFT</option>
          <option value="SENT">SENT</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Quotations ledger log" subtitle="Track quotation approvals status log">
          <Table
            columns={columns}
            data={quotations}
            loading={loading}
            emptyMessage="No quotations generated."
            onRowClick={handleOpenDetail}
          />
        </DashboardCard>
      )}

      {/* CREATE QUOTATION MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Quotation Proposal" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Select Customer *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Link Event Code (Optional)</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              >
                <option value="">-- Choose Event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.eventName} ({ev.eventCode})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
            <Input
              label="Discount (INR)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
            <Input
              label="Tax Amount (INR)"
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
            />
          </div>

          {/* ADD QUOTATION ITEM */}
          <div className="border border-cream-150 p-4 rounded bg-cream-50/20 space-y-3">
            <span className="font-bold text-primary-800 uppercase text-[10px] block">Add Service Item Entry</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full md:col-span-2"
                placeholder="Item / service description..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
              />
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full"
                placeholder="Qty"
                type="number"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
              />
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full"
                placeholder="Unit Price"
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-64"
                value={newItemVendor}
                onChange={(e) => setNewItemVendor(e.target.value)}
              >
                <option value="">-- Assign Vendor Partner --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName || v.name}</option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={handleAddItem} className="!py-1 text-xs">
                Add Row
              </Button>
            </div>

            {/* Item Rows Table */}
            {formData.items.length > 0 && (
              <div className="pt-2">
                <table className="min-w-full divide-y divide-cream-150 text-xs">
                  <thead>
                    <tr className="text-[10px] text-neutral-400 font-bold uppercase text-left">
                      <th className="py-1">Description</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Unit Price</th>
                      <th className="py-1 text-right">Total</th>
                      <th className="py-1 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {formData.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-primary-800">{it.description}</td>
                        <td className="py-2 text-center">{it.quantity}</td>
                        <td className="py-2 text-right">₹{it.unitPrice}</td>
                        <td className="py-2 text-right font-bold">₹{it.quantity * it.unitPrice}</td>
                        <td className="py-2 text-right">
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pricing calculations details */}
          <div className="p-4 bg-cream-50 border border-cream-150 rounded text-right space-y-1 text-xs">
            <p>Subtotal: <strong>₹{calculateSubtotal().toLocaleString('en-IN')}</strong></p>
            <p>Discount: <strong className="text-red-600">- ₹{formData.discount.toLocaleString('en-IN')}</strong></p>
            <p>Tax: <strong className="text-green-600">+ ₹{formData.tax.toLocaleString('en-IN')}</strong></p>
            <p className="text-sm font-bold text-primary-800 border-t border-cream-200 pt-1 mt-1">
              Grand Total: ₹{calculateTotal().toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Draft Quotation</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT QUOTATION MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Quotation details" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Select Customer *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Link Event Code (Optional)</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              >
                <option value="">-- Choose Event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.eventName} ({ev.eventCode})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
            <Input
              label="Discount (INR)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
            <Input
              label="Tax Amount (INR)"
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
            />
          </div>

          {/* service items lists */}
          <div className="border border-cream-150 p-4 rounded bg-cream-50/20 space-y-3">
            <span className="font-bold text-primary-800 uppercase text-[10px] block">Edit Service Items List</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full md:col-span-2"
                placeholder="Item / service description..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
              />
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full"
                placeholder="Qty"
                type="number"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
              />
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full"
                placeholder="Unit Price"
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-64"
                value={newItemVendor}
                onChange={(e) => setNewItemVendor(e.target.value)}
              >
                <option value="">-- Assign Vendor Partner --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName || v.name}</option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={handleAddItem} className="!py-1 text-xs">
                Add Row
              </Button>
            </div>

            <div className="pt-2">
              <table className="min-w-full divide-y divide-cream-150 text-xs">
                <thead>
                  <tr className="text-[10px] text-neutral-400 font-bold uppercase text-left">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit Price</th>
                    <th className="py-1 text-right">Total</th>
                    <th className="py-1 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {formData.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-primary-800">{it.description}</td>
                      <td className="py-2 text-center">{it.quantity}</td>
                      <td className="py-2 text-right">₹{Number(it.unitPrice)}</td>
                      <td className="py-2 text-right font-bold">₹{(it.quantity * Number(it.unitPrice))}</td>
                      <td className="py-2 text-right">
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-cream-50 border border-cream-150 rounded text-right space-y-1 text-xs">
            <p>Subtotal: <strong>₹{calculateSubtotal().toLocaleString('en-IN')}</strong></p>
            <p>Discount: <strong className="text-red-600">- ₹{formData.discount.toLocaleString('en-IN')}</strong></p>
            <p>Tax: <strong className="text-green-600">+ ₹{formData.tax.toLocaleString('en-IN')}</strong></p>
            <p className="text-sm font-bold text-primary-800 border-t border-cream-200 pt-1 mt-1">
              Grand Total: ₹{calculateTotal().toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* DETAILED PRINTABLE OVERVIEW MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Quotation Proposal Preview" size="lg">
        {selectedQuotation && (
          <div className="space-y-6">
            {/* PRINT WRAPPER AREA */}
            <div className="p-8 bg-white border border-cream-150 rounded text-xs space-y-6 print:border-0 print:p-0 print:m-0" id="quotation-print-area">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-cream-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary-800 font-serif">GK Event Management Co.</h2>
                  <p className="text-[9px] text-neutral-400">Premium Event Banquets, Catering & Stage Decorators</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Support Care: +91 12345 67890 | support@gkevents.com</p>
                </div>
                <div className="text-right">
                  <span className="font-bold block text-sm text-gold-600">{selectedQuotation.quotationNumber}</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${getStatusBadge(selectedQuotation.status)}`}>
                    {selectedQuotation.status}
                  </span>
                  <p className="text-[9px] text-neutral-400 mt-2">Date Drafted: {new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Client and Event */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-bold block uppercase text-[9px] mb-1">Prepared For</span>
                  <p className="font-bold text-primary-800">{selectedQuotation.customer?.fullName}</p>
                  <p>Phone: {selectedQuotation.customer?.phone}</p>
                  <p>Email: {selectedQuotation.customer?.email}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold block uppercase text-[9px] mb-1">Event Reference</span>
                  {selectedQuotation.event ? (
                    <>
                      <p className="font-bold text-primary-800">{selectedQuotation.event.eventName}</p>
                      <p>Event Code: {selectedQuotation.event.eventCode}</p>
                      <p>Proposed Date: {new Date(selectedQuotation.event.eventDate).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-neutral-400 italic">General gathered specifications</p>
                  )}
                </div>
              </div>

              {/* Items lists table */}
              <table className="min-w-full divide-y divide-cream-150 text-xs">
                <thead>
                  <tr className="text-[9px] text-neutral-400 font-bold uppercase text-left bg-cream-50/50">
                    <th className="px-3 py-2">Item Service / Description</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {selectedQuotation.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-primary-800 font-semibold">{it.description}</td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">₹{Number(it.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{Number(it.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Notes and Cost details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cream-100 text-xs">
                <div className="italic text-neutral-500 bg-cream-50/20 p-3 rounded">
                  Notes: {selectedQuotation.notes || 'This quote proposal is valid for 15 days from the drafted date. General Terms & Conditions apply.'}
                </div>
                <div className="text-right space-y-1.5 self-end">
                  <p>Subtotal: <strong>₹{Number(selectedQuotation.subtotal).toLocaleString('en-IN')}</strong></p>
                  <p>Discount: <strong className="text-red-600">- ₹{Number(selectedQuotation.discount).toLocaleString('en-IN')}</strong></p>
                  <p>Tax: <strong className="text-green-600">+ ₹{Number(selectedQuotation.tax).toLocaleString('en-IN')}</strong></p>
                  <p className="text-md font-bold text-primary-800 border-t border-cream-200 pt-1.5">
                    Grand Total: ₹{Number(selectedQuotation.totalAmount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Print and status updates controls */}
            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-cream-100 print:hidden">
              <Button variant="secondary" onClick={handlePrint} className="gap-1">
                <Printer size={14} /> Print Quote
              </Button>
              {selectedQuotation.status === 'DRAFT' && (
                <>
                  <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(selectedQuotation.id, 'REJECTED')}>
                    <X size={14} /> Reject
                  </Button>
                  <Button variant="gold" onClick={() => handleUpdateStatus(selectedQuotation.id, 'SENT')}>
                    <Check size={14} /> Mark Sent
                  </Button>
                </>
              )}
              {selectedQuotation.status === 'SENT' && (
                <>
                  <Button variant="danger" onClick={() => handleUpdateStatus(selectedQuotation.id, 'REJECTED')}>
                    Reject Quote
                  </Button>
                  <Button variant="gold" onClick={() => handleUpdateStatus(selectedQuotation.id, 'ACCEPTED')}>
                    Accept Quote
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CSS PRINT PRINTING LAYOUT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quotation-print-area, #quotation-print-area * {
            visibility: visible;
          }
          #quotation-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotationsPage;
