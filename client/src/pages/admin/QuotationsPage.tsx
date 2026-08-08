import React from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';

export const QuotationsPage: React.FC = () => {
  const quotations = [
    { id: 'QT901', client: 'Siddharth Roy', event: 'Birthday Ceremony', amount: '₹85,000', date: 'Aug 02, 2026', status: 'Approved' },
    { id: 'QT902', client: 'Priya Joshi', event: 'Wedding Decoration', amount: '₹4,50,000', date: 'Aug 05, 2026', status: 'Sent' },
    { id: 'QT903', client: 'Amit Khanna', event: 'Saree Function', amount: '₹1,50,000', date: 'Aug 07, 2026', status: 'Draft' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Quotations & Proposals</h3>
        <p className="text-xs text-neutral-400 mt-1">Review event price quotes, draft budgets, and client approvals status</p>
      </div>

      <DashboardCard title="Event Quotations" subtitle="List of estimates and proposals submitted to clients">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100 text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 font-bold uppercase tracking-wider text-left bg-cream-50/50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Estimated Budget</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-primary-800 font-medium">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-cream-50/20 transition-all">
                  <td className="px-4 py-3 text-gold-600 font-bold">{q.id}</td>
                  <td className="px-4 py-3 font-semibold">{q.client}</td>
                  <td className="px-4 py-3 text-neutral-600">{q.event}</td>
                  <td className="px-4 py-3 font-semibold">{q.amount}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{q.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-250' : q.status === 'Sent' ? 'bg-blue-50 text-blue-700 border border-blue-250' : 'bg-neutral-50 text-neutral-700 border border-neutral-250'
                    }`}>
                      {q.status}
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

export default QuotationsPage;
