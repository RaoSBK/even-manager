import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const InvoicesPage: React.FC = () => {
  const invoices = [
    { id: 'INV-2026-001', client: 'Rahul Kumar', event: 'Marriage Function', total: '₹2,50,000', paid: '₹1,50,000', balance: '₹1,00,000', status: 'Partially Paid' },
    { id: 'INV-2026-002', client: 'Ankita Verma', event: 'Birthday Ceremony', total: '₹1,10,000', paid: '₹1,10,000', balance: '₹0', status: 'Paid' },
    { id: 'INV-2026-003', client: 'Vikram Seth', event: 'Corporate Meeting', total: '₹2,50,000', paid: '₹0', balance: '₹2,50,000', status: 'Unpaid' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Invoices & Billing</h3>
        <p className="text-xs text-neutral-400 mt-1">Generate invoices, trace pending balances, and record payments receipts</p>
      </div>

      <DashboardCard title="Client Invoices" subtitle="Accounts billing and collections summary">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Due Balance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 font-mono font-bold text-gold-600">{inv.id}</td>
                  <td className="px-4 py-3 font-semibold">{inv.client}</td>
                  <td className="px-4 py-3 text-neutral-600">{inv.event}</td>
                  <td className="px-4 py-3 font-semibold">{inv.total}</td>
                  <td className="px-4 py-3 text-green-700">{inv.paid}</td>
                  <td className="px-4 py-3 text-red-600">{inv.balance}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-250' : inv.status === 'Partially Paid' ? 'bg-yellow-50 text-yellow-700 border border-yellow-250' : 'bg-red-50 text-red-700 border border-red-250'
                    }`}>
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
