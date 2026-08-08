import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { CheckSquare, Sparkles, Clock, Award } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const todayTasks = [
    { id: 't1', title: 'Verify floral stage background setup', due: '11:00 AM', status: 'In Progress' },
    { id: 't2', title: 'Confirm catering food menu count', due: '02:00 PM', status: 'Completed' },
    { id: 't3', title: 'Meet with DJ for wedding playlist briefing', due: '05:00 PM', status: 'Pending' }
  ];

  const assignedEvents = [
    { id: 'E101', name: 'Sharma Marriage Reception', date: 'Aug 18, 2026', client: 'Rohit Sharma', role: 'Staff Lead' },
    { id: 'E102', name: 'Ananya Saree Function Ceremony', date: 'Aug 22, 2026', client: 'Ananya Roy', role: 'Decor Coordinator' }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-cream-200 rounded-luxury p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100'}
            alt={user?.name}
            className="w-14 h-14 rounded-full object-cover border border-cream-200"
          />
          <div>
            <h3 className="text-xl font-bold text-primary-800 font-serif">Welcome back, {user?.name}!</h3>
            <p className="text-xs text-neutral-500 mt-1">Employee ID: <span className="font-bold text-gold-600">{user?.id || 'EMP001'}</span></p>
          </div>
        </div>
        <div className="bg-gold-50 border border-gold-250 px-4 py-2 rounded-luxury text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attendance Status</p>
          <p className="text-sm font-bold text-gold-700 mt-0.5">Checked In (09:00 AM)</p>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Events"
          value="2"
          icon={<Sparkles className="text-gold-600" size={20} />}
          description="Upcoming events this week"
          color="gold"
        />
        <StatCard
          title="Today's Tasks"
          value="3"
          icon={<CheckSquare className="text-blue-800" size={20} />}
          description="1 Completed, 2 Pending"
          color="blue"
        />
        <StatCard
          title="Task Progress"
          value="33%"
          icon={<Award className="text-green-800" size={20} />}
          description="Catering check complete"
          color="green"
        />
        <StatCard
          title="Today's Duty Hours"
          value="8 Hrs"
          icon={<Clock className="text-primary-800" size={20} />}
          description="Shift ends at 06:00 PM"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks list */}
        <DashboardCard title="Today's Tasks Checklist" subtitle="Checklist of items to coordinate today">
          <div className="space-y-4">
            {todayTasks.map((t) => (
              <div key={t.id} className="flex justify-between items-center border border-cream-100 hover:border-gold-300 p-4 rounded-luxury transition-all bg-cream-50/10">
                <div>
                  <h4 className="font-bold text-sm text-primary-800">{t.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1">Due by: <span className="font-semibold">{t.due}</span></p>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'Completed' ? 'bg-green-50 text-green-700' : t.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700' : 'bg-neutral-50 text-neutral-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Assigned Events */}
        <DashboardCard title="My Upcoming Events" subtitle="Events assigned to your planning portfolio">
          <div className="space-y-4">
            {assignedEvents.map((ev) => (
              <div key={ev.id} className="flex justify-between items-center border border-cream-100 hover:border-gold-300 p-4 rounded-luxury transition-all bg-cream-50/10">
                <div>
                  <h4 className="font-bold text-sm text-primary-800 font-serif">{ev.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1">Client: <span className="font-semibold">{ev.client}</span></p>
                  <p className="text-xs text-gold-600 mt-0.5">Role: <span className="font-semibold">{ev.role}</span></p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {ev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default DashboardPage;
