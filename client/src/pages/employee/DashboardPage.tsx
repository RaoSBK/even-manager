import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { CheckSquare, Sparkles, Clock, Award } from 'lucide-react';
import { employeeWorkstationApi, WorkstationDashboardStats } from '../../api/employeeWorkstationApi';
import { Task } from '../../api/taskApi';
import { EventDetails } from '../../api/eventApi';
import { useNotifications } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [statsData, setStatsData] = useState<WorkstationDashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected details modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  const fetchDashboardData = async () => {
    try {
      const stats = await employeeWorkstationApi.getDashboardStats();
      setStatsData(stats);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayTasks = await employeeWorkstationApi.getTasks({ date: todayStr });
      setTasks(todayTasks);

      const upcomingEvents = await employeeWorkstationApi.getEvents({ filter: 'upcoming' });
      setEvents(upcomingEvents.slice(0, 5)); // show first 5 upcoming events
    } catch {
      addToast('Failed to load employee dashboard stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleStatus = async (task: Task) => {
    const nextStatusMap: Record<string, string> = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'TODO'
    };
    const nextStatus = nextStatusMap[task.status] || 'TODO';
    try {
      await employeeWorkstationApi.updateTaskStatus(task.id, nextStatus);
      addToast(`Task marked as ${nextStatus}.`, 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xs font-bold text-neutral-400">
        Syncing operational workplace dashboard...
      </div>
    );
  }

  const attendanceText = statsData?.checkInTime
    ? `Checked In (${new Date(statsData.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    : 'Checked Out';

  return (
    <div className="space-y-8 font-sans">
      {/* Header Welcome banner */}
      <div className="flex justify-between items-center bg-white border border-cream-200 rounded-luxury p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100'}
            alt={statsData?.employeeName || user?.name}
            className="w-14 h-14 rounded-full object-cover border border-cream-200"
          />
          <div>
            <h3 className="text-xl font-bold text-primary-800 font-serif">Welcome back, {statsData?.employeeName || user?.name}!</h3>
            <p className="text-xs text-neutral-500 mt-1">Employee ID: <span className="font-bold text-gold-600">{statsData?.employeeId || 'EMP-N/A'}</span></p>
          </div>
        </div>
        <div className="bg-gold-50 border border-gold-250 px-4 py-2 rounded-luxury text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attendance Status</p>
          <p className="text-sm font-bold text-gold-700 mt-0.5">{attendanceText}</p>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Events"
          value={String(statsData?.stats.assignedEvents || 0)}
          icon={<Sparkles className="text-gold-600" size={20} />}
          description={`${statsData?.stats.upcomingEvents || 0} upcoming portfolio events`}
          color="gold"
        />
        <StatCard
          title="Today's Tasks"
          value={String(statsData?.stats.todayTasks || 0)}
          icon={<CheckSquare className="text-blue-800" size={20} />}
          description={`${statsData?.stats.todayCompletedTasks || 0} Completed, ${statsData?.stats.todayPendingTasks || 0} Pending`}
          color="blue"
        />
        <StatCard
          title="Task Progress"
          value={`${statsData?.stats.taskProgressPercent || 0}%`}
          icon={<Award className="text-green-800" size={20} />}
          description="Overall tasks completion rate"
          color="green"
        />
        <StatCard
          title="Today's Duty Hours"
          value={`${statsData?.stats.todayDutyHours || 0} Hrs`}
          icon={<Clock className="text-primary-800" size={20} />}
          description="Clocked session time"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Checklist */}
        <DashboardCard title="Today's Tasks Checklist" subtitle="Checklist of items to coordinate today">
          {tasks.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-4">No tasks assigned for today.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center border border-cream-100 hover:border-gold-300 p-4 rounded-luxury transition-all bg-cream-50/10 cursor-pointer"
                  onClick={() => setSelectedTask(t)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === 'COMPLETED'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleStatus(t)}
                      className="rounded text-gold-600 focus:ring-gold-500 h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <h4 className={`font-bold text-sm ${t.status === 'COMPLETED' ? 'line-through text-neutral-300' : 'text-primary-800'}`}>
                        {t.title}
                      </h4>
                      {t.dueDate && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Due by: <span className="font-semibold">{new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'COMPLETED'
                        ? 'bg-green-50 text-green-700'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-neutral-50 text-neutral-500'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* My Upcoming Events */}
        <DashboardCard title="My Upcoming Events" subtitle="Events assigned to your planning portfolio">
          {events.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-4">No upcoming events portfolio.</p>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex justify-between items-center border border-cream-100 hover:border-gold-300 p-4 rounded-luxury transition-all bg-cream-50/10 cursor-pointer"
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div>
                    <h4 className="font-bold text-sm text-primary-800 font-serif">{ev.eventName}</h4>
                    {ev.customer && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Client: <span className="font-semibold">{ev.customer.fullName}</span>
                      </p>
                    )}
                    <p className="text-xs text-gold-600 mt-0.5">Type: <span className="font-semibold">{ev.eventType}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {new Date(ev.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* TASK DETAIL MODAL */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Checklist Task Details">
        {selectedTask && (
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Task Target</span>
              <p className="text-sm font-bold text-primary-800 mt-0.5">{selectedTask.title}</p>
            </div>
            {selectedTask.description && (
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Description</span>
                <p className="text-neutral-600 mt-1 p-2 bg-cream-50 rounded border border-cream-100 italic">{selectedTask.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Priority</span>
                <span className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold uppercase mt-1">
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Status</span>
                <span className="inline-block bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-bold uppercase mt-1">
                  {selectedTask.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EVENT DETAIL MODAL */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Assigned Event Details">
        {selectedEvent && (
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Event Name</span>
              <p className="text-sm font-bold text-primary-800 mt-0.5">{selectedEvent.eventName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Client</span>
                <p>{selectedEvent.customer?.fullName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Type</span>
                <p>{selectedEvent.eventType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Date</span>
                <p>{new Date(selectedEvent.eventDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Session</span>
                <p>{selectedEvent.startTime || '09:00 AM'} - {selectedEvent.endTime || '06:00 PM'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
