import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const PaymentsPage: React.FC = () => {
  const transactions = [
    { id: 'TXN48923', amount: '₹1,50,000', method: 'UPI (GPay)', date: 'Aug 08, 2026', type: 'Credit', status: 'Success' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Payments & Transactions</h3>
        <p className="text-xs text-neutral-400 mt-1">Check receipt logs, transactions history, and pay pending bills</p>
      </div>

      <DashboardCard title="Payment History" subtitle="List of credits processed under your account">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">Transaction ID</th>
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
                  <td className="px-4 py-3 font-bold text-green-700">{t.amount}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.method}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.date}</td>
                  <td className="px-4 py-3 text-xs">{t.type}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-50 text-green-700 border border-green-250 px-2 py-0.5 rounded text-[10px] font-bold">
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
