import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const InventoryPage: React.FC = () => {
  const stock = [
    { item: 'Luxury Stage Sofas', category: 'Furniture', total: 10, allocated: 4, status: 'Available' },
    { item: 'Crystal Chandeliers', category: 'Decor Lighting', total: 15, allocated: 6, status: 'Available' },
    { item: 'Red Carpet Rolls', category: 'Floor Linens', total: 20, allocated: 20, status: 'Out of Stock' },
    { item: 'Gold Banquet Chairs', category: 'Seating', total: 500, allocated: 150, status: 'Available' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Asset & Inventory</h3>
        <p className="text-xs text-neutral-400 mt-1">Track furniture, staging materials, sound systems, and flower props stock levels</p>
      </div>

      <DashboardCard title="Warehouse Inventory Levels" subtitle="Current count of staging equipment and accessories">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Total Qty</th>
                <th className="px-4 py-3">Allocated Qty</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {stock.map((s, idx) => (
                <tr key={idx} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 font-semibold">{s.item}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.category}</td>
                  <td className="px-4 py-3 text-xs">{s.total}</td>
                  <td className="px-4 py-3 text-xs">{s.allocated}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-250' : 'bg-red-50 text-red-700 border border-red-250'
                    }`}>
                      {s.status}
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

export default InventoryPage;
