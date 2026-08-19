import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const PaymentsPage: React.FC = () => {
  const transactions = [
    { id: 'TXN48923', client: 'Rahul Kumar', amount: '₹1,50,000', method: 'UPI (GPay)', date: 'Aug 08, 2026', type: 'Credit', status: 'Success' },
    { id: 'TXN48924', client: 'Priya Sen', amount: '₹80,000', method: 'Net Banking', date: 'Aug 08, 2026', type: 'Credit', status: 'Success' },
    { id: 'TXN48925', client: 'Grand Decors Co.', amount: '₹35,000', method: 'Bank Transfer', date: 'Aug 07, 2026', type: 'Debit (Vendor)', status: 'Success' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Transactions & Payments</h3>
        <p className="text-xs text-neutral-400 mt-1">Review accounts receivable, client payments history, and vendor disbursements</p>
      </div>

      <DashboardCard title="Recent Transactions" subtitle="History of recent credits and debits">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Client / Vendor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 font-mono font-bold text-primary-800">{t.id}</td>
                  <td className="px-4 py-3">{t.client}</td>
                  <td className="px-4 py-3 font-bold">{t.amount}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.method}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      t.type.startsWith('Credit') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {t.status}
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

export default PaymentsPage;
