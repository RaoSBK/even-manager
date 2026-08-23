import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { invoiceApi, Invoice, InvoiceItem } from '../../api/invoiceApi';
import { bookingApi, BookingDetails } from '../../api/bookingApi';
import { customerApi, Customer } from '../../api/customerApi';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Printer
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const InvoicesPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected Invoice
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    bookingId: '',
    customerId: '',
    issueDate: '',
    dueDate: '',
    discount: 0,
    tax: 0,
    notes: '',
    items: [] as InvoiceItem[]
  });

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = { search, status: statusFilter };
      const list = await invoiceApi.getAll(filters);
      setInvoices(list);

      const bList = await bookingApi.getAll();
      setBookings(bList.filter(b => b.status !== 'CANCELLED'));

      const cList = await customerApi.getAll();
      setCustomers(cList);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch invoices records.');
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
      bookingId: '',
      customerId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discount: 0,
      tax: 0,
      notes: '',
      items: []
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setIsCreateOpen(true);
  };

  const handleOpenDetail = async (inv: Invoice) => {
    setLoading(true);
    try {
      const data = await invoiceApi.getById(inv.id);
      setSelectedInvoice(data);
      setIsDetailOpen(true);
    } catch {
      addToast('Failed to load invoice items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemDesc || newItemPrice <= 0) return;
    const item: InvoiceItem = {
      description: newItemDesc,
      quantity: newItemQty,
      unitPrice: newItemPrice
    };
    setFormData({
      ...formData,
      items: [...formData.items, item]
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
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
      addToast('Please add at least one line item to the invoice.', 'error');
      return;
    }
    try {
      await invoiceApi.create(formData);
      addToast('Invoice issued successfully.', 'success');
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to generate invoice.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await invoiceApi.updateStatus(id, status);
      addToast(`Invoice marked as ${status}.`, 'success');
      setIsDetailOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update invoice status.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'PARTIALLY_PAID':
        return 'bg-blue-50 text-blue-700 border border-blue-150';
      case 'ISSUED':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'OVERDUE':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-150';
      default:
        return 'bg-neutral-50 text-neutral-700';
    }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice No', render: (i: Invoice) => <span className="font-bold text-gold-600">{i.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (i: Invoice) => i.customer?.fullName || 'N/A' },
    { key: 'booking', header: 'Booking Ref', render: (i: Invoice) => i.booking?.bookingNumber || 'Direct' },
    { key: 'issueDate', header: 'Issued Date', render: (i: Invoice) => new Date(i.issueDate).toLocaleDateString() },
    { key: 'totalAmount', header: 'Grand Total', render: (i: Invoice) => <span className="font-bold">₹{Number(i.totalAmount).toLocaleString('en-IN')}</span> },
    { key: 'balanceAmount', header: 'Due Balance', render: (i: Invoice) => <span className="font-bold text-red-600">₹{Number(i.balanceAmount).toLocaleString('en-IN')}</span> },
    { key: 'status', header: 'Status', render: (i: Invoice) => <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(i.status)}`}>{i.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (i: Invoice) => (
        <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={() => handleOpenDetail(i)}>
          <Eye size={12} /> View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Invoices Manager</h3>
          <p className="text-xs text-neutral-400 mt-1">Issue official GST invoices, track payment receipts, and balance outstanding</p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Issue Invoice
        </Button>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm flex gap-4 max-w-xl">
        <Input
          placeholder="Search by invoice number..."
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
          <option value="ISSUED">ISSUED</option>
          <option value="PAID">PAID</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Invoices log" subtitle="Outstanding and paid billing statements">
          <Table
            columns={columns}
            data={invoices}
            loading={loading}
            emptyMessage="No invoices generated."
            onRowClick={handleOpenDetail}
          />
        </DashboardCard>
      )}

      {/* CREATE INVOICE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Issue Billing Invoice" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Select Booking Ref *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                required
                value={formData.bookingId}
                onChange={(e) => {
                  const bId = e.target.value;
                  const bObj = bookings.find(b => b.id === bId);
                  setFormData({
                    ...formData,
                    bookingId: bId,
                    customerId: bObj ? (bObj.customerId || '') : '',
                    items: bObj ? [{
                      description: `Event Hall Booking fee - ${bObj.hall?.name || 'Event Hall'} (${bObj.bookingNumber})`,
                      quantity: 1,
                      unitPrice: Number(bObj.totalAmount)
                    }] : []
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Direct Customer billing *</label>
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
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

          {/* ADD INVOICE ITEM */}
          <div className="border border-cream-150 p-4 rounded bg-cream-50/20 space-y-3">
            <span className="font-bold text-primary-800 uppercase text-[10px] block">Line Item entries</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                className="bg-white border border-cream-200 rounded px-3 py-1.5 text-xs focus:outline-none w-full md:col-span-2"
                placeholder="Description of service..."
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
                placeholder="Price"
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleAddItem} className="!py-1 text-xs">
              Add Row
            </Button>

            {/* Added Rows */}
            {formData.items.length > 0 && (
              <div className="pt-2">
                <table className="min-w-full divide-y divide-cream-150 text-xs">
                  <thead>
                    <tr className="text-[10px] text-neutral-400 font-bold uppercase text-left">
                      <th className="py-1">Description</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Unit Price</th>
                      <th className="py-1 text-right">Total</th>
                      <th className="py-1"></th>
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
            <Button type="submit" variant="gold">Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL OVERVIEW MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="GST Invoice Overview" size="lg">
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="p-8 bg-white border border-cream-150 rounded text-xs space-y-6 print:border-0 print:p-0 print:m-0" id="invoice-print-area">
              <div className="flex justify-between items-start border-b border-cream-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary-800 font-serif">GK Event Management Co.</h2>
                  <p className="text-[9px] text-neutral-400">Premium Event Banquets, Catering & Stage Decorators</p>
                  <p className="text-[10px] text-neutral-500 mt-1">GSTIN: 37AAAAA1111A1Z1</p>
                </div>
                <div className="text-right">
                  <span className="font-bold block text-sm text-gold-600">{selectedInvoice.invoiceNumber}</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${getStatusBadge(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                  <p className="text-[9px] text-neutral-400 mt-2">Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-bold block uppercase text-[9px] mb-1">Billed To</span>
                  <p className="font-bold text-primary-800">{selectedInvoice.customer?.fullName}</p>
                  <p>Phone: {selectedInvoice.customer?.phone}</p>
                  <p>Email: {selectedInvoice.customer?.email}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold block uppercase text-[9px] mb-1">Booking & Details</span>
                  {selectedInvoice.booking ? (
                    <>
                      <p>Booking ID: {selectedInvoice.booking.bookingNumber}</p>
                      <p>Hall: {selectedInvoice.booking.hall?.name || 'Event Hall'}</p>
                      <p>Event Date: {new Date(selectedInvoice.booking.eventDate).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-neutral-400 italic">Direct miscellaneous billing</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="min-w-full divide-y divide-cream-150 text-xs">
                <thead>
                  <tr className="text-[9px] text-neutral-400 font-bold uppercase text-left bg-cream-50/50">
                    <th className="px-3 py-2">Service Description</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {selectedInvoice.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-primary-800 font-semibold">{it.description}</td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">₹{Number(it.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{Number(it.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cost specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cream-100 text-xs">
                <div className="text-neutral-400 bg-cream-50/20 p-3 rounded">
                  Notes: This is a system-generated GST Invoice. Standard terms apply. Outward payments must clear before event entry setup.
                </div>
                <div className="text-right space-y-1.5 self-end">
                  <p>Subtotal: <strong>₹{Number(selectedInvoice.subtotal).toLocaleString('en-IN')}</strong></p>
                  <p>Discount: <strong className="text-red-600">- ₹{Number(selectedInvoice.discount).toLocaleString('en-IN')}</strong></p>
                  <p>Tax (CGST/SGST): <strong className="text-green-600">+ ₹{Number(selectedInvoice.tax).toLocaleString('en-IN')}</strong></p>
                  <p className="text-[11px] text-neutral-500">Collected Advance: ₹{Number(selectedInvoice.paidAmount).toLocaleString('en-IN')}</p>
                  <p className="text-sm font-bold text-primary-800 border-t border-cream-200 pt-1.5">
                    Balance Due: ₹{Number(selectedInvoice.balanceAmount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-cream-100 print:hidden">
              <Button variant="secondary" onClick={handlePrint} className="gap-1">
                <Printer size={14} /> Print Invoice
              </Button>
              {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                <>
                  <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(selectedInvoice.id, 'CANCELLED')}>
                    Cancel Invoice
                  </Button>
                  <Button variant="gold" onClick={() => handleUpdateStatus(selectedInvoice.id, 'PAID')}>
                    Mark Paid
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
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

export default InvoicesPage;
