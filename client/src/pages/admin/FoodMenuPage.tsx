import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { getFoodItems, createFoodItem, updateFoodItem, deleteFoodItem, FoodItem } from '../../api/foodApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Plus, Edit, Trash2, Loader2, Utensils, Search, Filter, 
  CheckCircle, XCircle, AlertTriangle, X
} from 'lucide-react';

export const FoodMenuPage: React.FC = () => {
  const { addToast } = useNotifications();

  // State variables
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'VEG' | 'NON-VEG'>('ALL');
  
  // Modal/Form State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCategory, setFormCategory] = useState<'VEG' | 'NON-VEG'>('VEG');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getFoodItems();
      setItems(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load food menu items.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setModalMode('ADD');
    setSelectedItem(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('VEG');
    setFormActive(true);
    setShowModal(true);
  };

  const openEditModal = (item: FoodItem) => {
    setModalMode('EDIT');
    setSelectedItem(item);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormActive(item.active);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim() || !formPrice) {
      addToast('Please enter item name and price.', 'warning');
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('Please enter a valid price greater than 0.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        active: formActive
      };

      if (modalMode === 'ADD') {
        const newItem = await createFoodItem(payload);
        setItems(prev => [newItem, ...prev]);
        addToast(`${newItem.name} created successfully!`, 'success');
      } else if (modalMode === 'EDIT' && selectedItem) {
        const updated = await updateFoodItem(selectedItem.id, payload);
        setItems(prev => prev.map(item => item.id === selectedItem.id ? updated : item));
        addToast(`${updated.name} updated successfully!`, 'success');
      }
      setShowModal(false);
    } catch (err: any) {
      addToast(err.message || 'Error saving food item. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateDelete = (item: FoodItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFoodItem(itemToDelete.id);
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      addToast(`${itemToDelete.name} deleted successfully!`, 'success');
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete food item.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active status directly
  const handleToggleStatus = async (item: FoodItem) => {
    try {
      const updatedPayload = {
        name: item.name,
        category: item.category,
        price: item.price,
        active: !item.active
      };
      const updated = await updateFoodItem(item.id, updatedPayload);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      addToast(`Status of ${item.name} set to ${updated.active ? 'Active' : 'Disabled'}.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  // Filtered List
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Food Menu Management</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Manage food items available for customer bookings (Veg & Non-Veg categories)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs py-2.5 px-4 rounded-luxury shadow transition-all shrink-0 self-start sm:self-center"
        >
          <Plus size={16} />
          Add New Food Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-cream-200 p-4 rounded-luxury shadow-luxury">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2 pl-10 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          <div className="flex rounded-lg overflow-hidden border border-cream-200 text-xs font-bold bg-cream-50">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-gold-500 text-white shadow-inner'
                  : 'text-neutral-500 hover:bg-cream-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('VEG')}
              className={`px-3 py-1.5 transition-all ${
                categoryFilter === 'VEG'
                  ? 'bg-gold-500 text-white shadow-inner'
                  : 'text-neutral-500 hover:bg-cream-100'
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setCategoryFilter('NON-VEG')}
              className={`px-3 py-1.5 transition-all ${
                categoryFilter === 'NON-VEG'
                  ? 'bg-gold-500 text-white shadow-inner'
                  : 'text-neutral-500 hover:bg-cream-100'
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Food Items Table Card */}
      <DashboardCard title="Food Menu Listings" subtitle="Verify and modify food details, categories, and prices">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-primary-800">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs text-neutral-400">Loading food items catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-cream-200 rounded-luxury bg-cream-50/20 text-center p-6">
            <div className="w-12 h-12 bg-cream-100 text-neutral-400 rounded-full flex items-center justify-center mb-3">
              <Utensils size={20} />
            </div>
            <h4 className="font-bold text-sm text-primary-800">No Food Items Found</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
              {searchQuery || categoryFilter !== 'ALL'
                ? 'Try modifying your search or filter keywords to show matching menu items.'
                : 'Get started by clicking the "Add New Food Item" button above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full divide-y divide-cream-100 text-sm">
              <thead>
                <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                  <th className="px-4 py-3">Food Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/10 transition-all">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.category === 'VEG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-sm text-primary-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        item.category === 'VEG' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gold-600 font-bold text-sm">
                      ₹{item.price.toLocaleString('en-IN')}.00
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          item.active 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {item.active ? (
                          <>
                            <CheckCircle size={10} />
                            Enabled
                          </>
                        ) : (
                          <>
                            <XCircle size={10} />
                            Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => initiateDelete(item)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Edit/Add Slide-Over Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-md w-full p-6 sm:p-8 shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-500"></div>
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary-800 p-1.5 rounded-lg hover:bg-cream-50"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-primary-800 mb-6 flex items-center gap-2">
              <Utensils size={18} className="text-gold-500" />
              {modalMode === 'ADD' ? 'Add New Food Item' : 'Edit Food Item'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  Food Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 150"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs font-semibold text-primary-800 outline-none focus:border-gold-500 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                    formCategory === 'VEG' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold shadow-sm' 
                      : 'bg-cream-50 border-cream-200 text-neutral-500 hover:bg-cream-100'
                  }`}>
                    <input
                      type="radio"
                      name="formCategory"
                      value="VEG"
                      checked={formCategory === 'VEG'}
                      onChange={() => setFormCategory('VEG')}
                      className="sr-only"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Vegetarian
                  </label>
                  
                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                    formCategory === 'NON-VEG' 
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-extrabold shadow-sm' 
                      : 'bg-cream-50 border-cream-200 text-neutral-500 hover:bg-cream-100'
                  }`}>
                    <input
                      type="radio"
                      name="formCategory"
                      value="NON-VEG"
                      checked={formCategory === 'NON-VEG'}
                      onChange={() => setFormCategory('NON-VEG')}
                      className="sr-only"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Non-Veg
                  </label>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 border border-cream-200 rounded-lg bg-cream-50/50">
                <div>
                  <h4 className="text-xs font-bold text-primary-800">Status</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Toggle availability in customer booking forms</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-cream-100 hover:bg-cream-200 text-primary-800 font-bold text-xs py-3 rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving Item...
                    </>
                  ) : (
                    'Save Food Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-cream-200 rounded-luxury-lg max-w-sm w-full p-8 text-center shadow-luxury-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold font-serif text-primary-800 mb-2">
              Delete Menu Item?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-primary-800 font-semibold">{itemToDelete.name}</strong> from the food menu catalog? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="w-1/2 bg-cream-100 hover:bg-cream-200 text-primary-800 font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                No, Keep
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="w-1/2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenuPage;
