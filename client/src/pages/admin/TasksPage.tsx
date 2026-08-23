import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { taskApi, Task } from '../../api/taskApi';
import { employeeApi, Employee } from '../../api/employeeApi';
import { eventApi, EventDetails } from '../../api/eventApi';
import {
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const TasksPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Task Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventId: '',
    assignedTo: '',
    priority: 'MEDIUM',
    dueDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = {
        search,
        status: statusFilter,
        priority: priorityFilter,
        assignedTo: assignedFilter
      };
      const list = await taskApi.getAll(filters);
      setTasks(list);

      const empList = await employeeApi.getAll();
      setEmployees(empList);

      const evList = await eventApi.getAll();
      setEvents(evList);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, assignedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      eventId: '',
      assignedTo: '',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskApi.create({ ...formData, priority: formData.priority as any });
      addToast('Operations task dispatched successfully.', 'success');
      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to dispatch task.', 'error');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatusMap: Record<string, string> = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'TODO'
    };
    const nextStatus = nextStatusMap[task.status] || 'TODO';
    try {
      await taskApi.update(task.id, { status: nextStatus as any });
      addToast(`Task marked as ${nextStatus}.`, 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle task status.', 'error');
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete operational checklist item?')) return;
    try {
      await taskApi.delete(id);
      addToast('Task deleted successfully.', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task.', 'error');
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
          onChange={() => handleToggleStatus(t)}
          className="rounded text-gold-600 focus:ring-gold-500 cursor-pointer h-4 w-4"
        />
      )
    },
    { key: 'title', header: 'Task Specification', render: (t: Task) => <span className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-neutral-300' : 'text-primary-800'}`}>{t.title}</span> },
    { key: 'event', header: 'Event', render: (t: Task) => t.event?.eventName || 'General Ops' },
    { key: 'assigned', header: 'Staff Assignee', render: (t: Task) => t.assigned?.user?.name || 'Unassigned' },
    { key: 'dueDate', header: 'Due Date', render: (t: Task) => t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A' },
    { key: 'priority', header: 'Priority', render: (t: Task) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getPriorityBadge(t.priority)}`}>{t.priority}</span> },
    { key: 'status', header: 'Status', render: (t: Task) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getStatusBadge(t.status)}`}>{t.status}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (t: Task) => (
        <Button variant="secondary" className="!p-1 text-xs text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteTask(t.id, e)}>
          <Trash2 size={12} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Operations & Checklist</h3>
          <p className="text-xs text-neutral-400 mt-1">Dispatches coordinator checklist targets, decor preparations, and audio alignments</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <Plus size={16} /> Dispatch Task
        </Button>
      </div>

      {/* Quick Filters */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-cream-150 p-4 rounded-luxury shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
        >
          <option value="">All Coordinators</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
          ))}
        </select>
        <Button type="submit" variant="gold" className="self-end !py-2">Apply Filters</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Task Dispatch Register" subtitle="Manage operational checkpoints logs">
          <Table
            columns={columns}
            data={tasks}
            loading={loading}
            emptyMessage="No operations tasks recorded."
          />
        </DashboardCard>
      )}

      {/* DISPATCH TASK MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Dispatch Operational Checklist Item">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
          <Input
            label="Task Name / Target *"
            required
            placeholder="e.g. Stage Carpet installation"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Assign Coordinator</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">-- Choose Coordinator --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Link Event Code</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              >
                <option value="">-- Choose Event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.eventName} ({ev.eventCode})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800">Task Priority *</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-xs focus:outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <Input
              label="Target Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800">Instructions / Notes</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded px-3 py-2 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Dispatch Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
