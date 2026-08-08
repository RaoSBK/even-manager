import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const VendorsPage: React.FC = () => {
  const vendors = [
    { id: 'VND01', name: 'Grand Decors Co.', service: 'Stage & Flower Decor', contact: 'Karan Singh', email: 'karan@decors.com', status: 'Active' },
    { id: 'VND02', name: 'Royal Caterers', service: 'Food & Dining Service', contact: 'Manoj Kumar', email: 'manoj@royalcaterers.com', status: 'Active' },
    { id: 'VND03', name: 'Star DJ & Sound', service: 'Audio/Visual Setup', contact: 'Aman Verma', email: 'aman@stardjsound.com', status: 'Suspended' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Vendors Management</h3>
        <p className="text-xs text-neutral-400 mt-1">Coordinate third-party decorators, caterers, florists, and production crews</p>
      </div>

      <DashboardCard title="Active Vendors" subtitle="Manage contracts and contact list of vendor partnerships">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Vendor Name</th>
                <th className="px-4 py-3">Service Category</th>
                <th className="px-4 py-3">Primary Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 text-gold-600 font-bold">{v.id}</td>
                  <td className="px-4 py-3 font-semibold">{v.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{v.service}</td>
                  <td className="px-4 py-3 text-xs">{v.contact}</td>
                  <td className="px-4 py-3 text-xs">{v.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-250' : 'bg-red-50 text-red-700 border border-red-250'
                    }`}>
                      {v.status}
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

export default VendorsPage;
