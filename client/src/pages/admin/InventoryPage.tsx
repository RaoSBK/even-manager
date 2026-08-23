import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { inventoryApi, InventoryItem, InventorySummary, InventoryTransaction } from '../../api/inventoryApi';
import {
  Search,
  Plus,
  Box,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  Package,
  ShoppingBag
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const CATEGORIES = [
  'Stage Decor',
  'Lighting',
  'Audio Equipment',
  'Catering Utensils',
  'Tables & Chairs',
  'Electrical',
  'Gifts',
  'Other'
];

export const InventoryPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQuantityOpen, setIsQuantityOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Form states
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<InventoryTransaction[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Stage Decor',
    description: '',
    quantity: 0,
    unit: 'pcs',
    minimumStock: 10,
    unitCost: 0
  });

  const [qtyForm, setQtyForm] = useState({
    quantity: 1,
    type: 'PURCHASE',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = {
        search,
        category: categoryFilter,
        status: statusFilter
      };
      const list = await inventoryApi.getAll(filters);
      setItems(list);

      const sum = await inventoryApi.getSummary();
      setSummary(sum);

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Stage Decor',
      description: '',
      quantity: 0,
      unit: 'pcs',
      minimumStock: 5,
      unitCost: 0
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category || 'Stage Decor',
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      minimumStock: item.minimumStock,
      unitCost: Number(item.unitCost)
    });
    setIsEditOpen(true);
  };

  const handleOpenQuantity = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setQtyForm({
      quantity: 10,
      type: 'PURCHASE',
      notes: 'Received new purchase shipment'
    });
    setIsQuantityOpen(true);
  };

  const handleOpenHistory = async (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setLoading(true);
    try {
      const logs = await inventoryApi.getTransactions(item.id);
      setHistoryLogs(logs);
      setIsHistoryOpen(true);
    } catch {
      addToast('Failed to load transaction history logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.create(formData);
      addToast('Inventory item added successfully.', 'success');
      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to add inventory item.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await inventoryApi.update(selectedItem.id, formData);
      addToast('Item properties saved successfully.', 'success');
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update item details.', 'error');
    }
  };

  const handleQtySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await inventoryApi.updateQuantity(selectedItem.id, qtyForm.quantity, qtyForm.type, qtyForm.notes);
      addToast('Inventory quantity adjusted successfully.', 'success');
      setIsQuantityOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to adjust stock quantity.', 'error');
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to deactivate/delete this inventory item?')) {
      return;
    }
    try {
      await inventoryApi.delete(id);
      addToast('Item removed successfully.', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to remove inventory item.', 'error');
    }
  };

  const columns = [
    { key: 'itemCode', header: 'Item Code', render: (i: InventoryItem) => <span className="font-bold text-gold-600">{i.itemCode}</span> },
    { key: 'name', header: 'Item Name', render: (i: InventoryItem) => <span className="font-semibold text-primary-800">{i.name}</span> },
    { key: 'category', header: 'Category' },
    {
      key: 'quantity',
      header: 'Stock Qty',
      render: (i: InventoryItem) => {
        const isLow = i.quantity <= i.minimumStock;
        return (
          <span className={`font-bold flex items-center gap-1 ${isLow ? 'text-red-600' : 'text-primary-800'}`}>
            {i.quantity} {i.unit || 'pcs'}
            {isLow && <AlertTriangle size={10} className="text-red-500 shrink-0" />}
          </span>
        );
      }
    },
    { key: 'minimumStock', header: 'Min Level', render: (i: InventoryItem) => `${i.minimumStock} ${i.unit || 'pcs'}` },
    { key: 'unitCost', header: 'Cost Price', render: (i: InventoryItem) => `₹${Number(i.unitCost).toLocaleString('en-IN')}` },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (i: InventoryItem) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleOpenQuantity(i, e)}>
            Stock +/-
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleOpenHistory(i, e)}>
            <History size={12} />
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs" onClick={(e) => handleOpenEdit(i, e)}>
            <Edit2 size={12} />
          </Button>
          <Button variant="secondary" className="!p-1.5 rounded text-xs text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteItem(i.id, e)}>
            <Trash2 size={12} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Inventory Control</h3>
          <p className="text-xs text-neutral-400 mt-1">Manage lighting, stages, decor items, and track stock depletion levels</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Add Item
        </Button>
      </div>

      {/* Warning Alert Banner */}
      {summary && summary.lowStock > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-luxury flex items-center gap-2">
          <AlertTriangle className="text-red-600 animate-pulse" size={16} />
          <span><strong>Low Stock Warning:</strong> There are currently {summary.lowStock} catalog items below their safety levels. Please restock immediately.</span>
        </div>
      )}

      {/* Summary Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-800">
              <Package size={20} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Total Items</span>
              <span className="text-md font-bold text-primary-800">{summary.totalInventory}</span>
            </div>
          </div>
          <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700">
              <Box size={20} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">In Stock</span>
              <span className="text-md font-bold text-green-700">{summary.available}</span>
            </div>
          </div>
          <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-700">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Low Stock</span>
              <span className="text-md font-bold text-yellow-700">{summary.lowStock}</span>
            </div>
          </div>
          <div className="bg-white border border-cream-150 p-4 rounded-luxury flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-700">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Out of Stock</span>
              <span className="text-md font-bold text-red-700">{summary.outOfStock}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search items by code or name..."
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
          </select>
        </div>
        <Button type="submit" variant="gold" className="self-end !py-2">Apply Filters</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Warehouse Stock Log" subtitle="Manage item entries, cost levels and thresholds">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage="No items currently in inventory."
          />
        </DashboardCard>
      )}

      {/* ADD ITEM MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Stock Item">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Item Name *"
            required
            placeholder="e.g. Led Spotlights 12W"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Category *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Input
              label="Unit Metric (e.g. pcs, sets) *"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Initial Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
            <Input
              label="Min Alert Level"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
            />
            <Input
              label="Unit Cost Price (INR)"
              type="number"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800">Item Description</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Register Item</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT ITEM MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Item details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Item Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Category *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Input
              label="Unit Metric *"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Alert Level"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
            />
            <Input
              label="Unit Cost Price (INR)"
              type="number"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800">Item Description</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ADJUST QUANTITY STOCK MODAL */}
      <Modal isOpen={isQuantityOpen} onClose={() => setIsQuantityOpen(false)} title="Adjust Stock Quantity Level">
        {selectedItem && (
          <form onSubmit={handleQtySubmit} className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-cream-50 border border-cream-100 rounded text-primary-800 space-y-1">
              <p>Item: <strong>{selectedItem.name}</strong></p>
              <p>Current Qty: <strong>{selectedItem.quantity} {selectedItem.unit || 'pcs'}</strong></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Adjustment Quantity *"
                type="number"
                required
                value={qtyForm.quantity}
                onChange={(e) => setQtyForm({ ...qtyForm, quantity: Number(e.target.value) })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-primary-800">Transaction Type *</label>
                <select
                  className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2.5 text-sm focus:outline-none"
                  value={qtyForm.type}
                  onChange={(e) => setQtyForm({ ...qtyForm, type: e.target.value })}
                >
                  <option value="PURCHASE">PURCHASE (+)</option>
                  <option value="RETURN">RETURNED (+)</option>
                  <option value="USAGE">USED (-)</option>
                  <option value="DAMAGE">DAMAGED (-)</option>
                  <option value="ADJUSTMENT">OVERRIDE (=)</option>
                </select>
              </div>
            </div>
            <Input
              label="Transaction Notes"
              placeholder="e.g. Audit adjust or vendor return"
              value={qtyForm.notes}
              onChange={(e) => setQtyForm({ ...qtyForm, notes: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsQuantityOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold">Update Stock</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* TRANSACTION HISTORY LOG MODAL */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Stock Ledger History" size="lg">
        {selectedItem && (
          <div className="space-y-4">
            <div className="border-b border-cream-100 pb-2">
              <h4 className="text-sm font-bold text-primary-800">Ledger Audit: {selectedItem.name}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">Showing last transaction log records</p>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {historyLogs.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">No logged transactions found for this item.</p>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="p-3 border border-cream-100 rounded bg-white flex justify-between items-center text-xs">
                    <div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mb-1 ${
                        log.type === 'PURCHASE' || log.type === 'RETURN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {log.type}
                      </span>
                      <p className="font-semibold text-neutral-700">{log.notes || 'Manual stock update'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold block">
                        {log.type === 'PURCHASE' || log.type === 'RETURN' ? '+' : '-'} {log.quantity}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsHistoryOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryPage;
