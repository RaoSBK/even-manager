import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { employeeWorkstationApi } from '../../api/employeeWorkstationApi';
import { eventApi, EventDetails } from '../../api/eventApi';
import { Task } from '../../api/taskApi';
import { Search, Eye } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const TasksPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected details modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const filters = {
        search,
        status: statusFilter,
        priority: priorityFilter,
        eventId: eventFilter,
        date: dateFilter
      };
      const list = await employeeWorkstationApi.getTasks(filters);
      setTasks(list);

      const evs = await eventApi.getAll();
      setEvents(evs);
    } catch {
      addToast('Failed to load tasks list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, [statusFilter, priorityFilter, eventFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasksData();
  };

  const handleUpdateStatus = async (task: Task, nextStatus: string) => {
    try {
      await employeeWorkstationApi.updateTaskStatus(task.id, nextStatus);
      addToast(`Task marked as ${nextStatus}.`, 'success');
      setSelectedTask(null);
      fetchTasksData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'URGENT':
        return 'text-red-700 bg-red-50 border border-red-150';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border border-orange-150';
      case 'MEDIUM':
        return 'text-blue-700 bg-blue-50 border border-blue-150';
      default:
        return 'text-neutral-600 bg-neutral-50 border border-neutral-150';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'TODO':
        return 'bg-neutral-50 text-neutral-600 border border-neutral-150';
      default:
        return 'bg-red-50 text-red-700';
    }
  };

  const columns = [
    {
      key: 'checkbox',
      header: '',
      render: (t: Task) => (
        <input
          type="checkbox"
          checked={t.status === 'COMPLETED'}
          onChange={() => handleUpdateStatus(t, t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
          className="rounded text-gold-600 focus:ring-gold-500 cursor-pointer h-4 w-4"
        />
      )
    },
    { key: 'title', header: 'Task description', render: (t: Task) => <span className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-neutral-300' : 'text-primary-800'}`}>{t.title}</span> },
    { key: 'event', header: 'Event', render: (t: Task) => t.event?.eventName || 'General Duty' },
    { key: 'dueDate', header: 'Due Date', render: (t: Task) => t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A' },
    { key: 'priority', header: 'Priority', render: (t: Task) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getPriorityBadge(t.priority)}`}>{t.priority}</span> },
    { key: 'status', header: 'Status', render: (t: Task) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getStatusBadge(t.status)}`}>{t.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (t: Task) => (
        <Button variant="secondary" className="!p-1 text-xs" onClick={() => setSelectedTask(t)}>
          <Eye size={12} /> Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Operations checklist</h3>
        <p className="text-xs text-neutral-400 mt-1">Review coordinator checklist targets, check-in decor items, and submit status reports</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        <Input
          placeholder="Search task title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
        />
        <select
          className="bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none focus:bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <select
          className="bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none focus:bg-white"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="URGENT">URGENT</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <select
          className="bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none focus:bg-white"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.eventName}</option>
          ))}
        </select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <Button type="submit" variant="gold" className="self-end !py-2">Apply Filters</Button>
      </form>

      <DashboardCard title="My Work Assignments" subtitle="Checklist list trace">
        <Table
          columns={columns}
          data={tasks}
          loading={loading}
          emptyMessage="No tasks assigned to you."
          onRowClick={setSelectedTask}
        />
      </DashboardCard>

      {/* TASK DETAIL OVERVIEW MODAL */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Work Checklist Item Details">
        {selectedTask && (
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Task Title</span>
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
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase mt-1 ${getPriorityBadge(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Current Status</span>
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase mt-1 ${getStatusBadge(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
              </div>
            </div>
            <div className="border-t border-cream-100 pt-4 flex flex-wrap gap-2 justify-end">
              {selectedTask.status === 'TODO' && (
                <Button variant="gold" onClick={() => handleUpdateStatus(selectedTask, 'IN_PROGRESS')}>
                  Mark In Progress
                </Button>
              )}
              {selectedTask.status === 'IN_PROGRESS' && (
                <Button variant="gold" onClick={() => handleUpdateStatus(selectedTask, 'COMPLETED')}>
                  Mark Completed
                </Button>
              )}
              {selectedTask.status === 'COMPLETED' && (
                <Button variant="secondary" onClick={() => handleUpdateStatus(selectedTask, 'TODO')}>
                  Reopen Task
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TasksPage;
