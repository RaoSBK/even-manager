import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const InvoicesPage: React.FC = () => {
  const invoices = [
    { id: 'INV-2026-001', event: 'Marriage Function', total: '₹2,50,000', paid: '₹1,50,000', due: '₹1,00,000', status: 'Partially Paid' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Invoices & Billing</h3>
        <p className="text-xs text-neutral-400 mt-1">Review event invoices and print payment statements</p>
      </div>

      <DashboardCard title="Event Billing Invoices" subtitle="Invoice summary for active contracts">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Contract Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Balance Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 font-mono font-bold text-gold-600">{inv.id}</td>
                  <td className="px-4 py-3 text-neutral-600">{inv.event}</td>
                  <td className="px-4 py-3 font-semibold">{inv.total}</td>
                  <td className="px-4 py-3 text-green-700">{inv.paid}</td>
                  <td className="px-4 py-3 text-red-600 font-bold">{inv.due}</td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-250 px-2 py-0.5 rounded text-[10px] font-bold">
                      {inv.status}
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

export default InvoicesPage;
