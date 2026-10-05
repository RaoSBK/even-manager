import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { employeeApi, Employee, EmployeePayload } from '../../api/employeeApi';
import { eventApi } from '../../api/eventApi';
import {
  Search,
  UserPlus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Plus,
  Clock,
  ListTodo
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const DESIGNATIONS = [
  'Admin',
  'Event Manager',
  'Event Coordinator',
  'Catering Staff',
  'Decoration Staff',
  'Photographer',
  'Driver',
  'Other'
];

export const EmployeesPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  // Forms state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeePayload>({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: 'Event Coordinator',
    joiningDate: '',
    salary: 0,
    emergencyContact: '',
    address: '',
    status: 'ACTIVE',
    password: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    eventId: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [events, setEvents] = useState<any[]>([]);

  const fetchEmployees = async (query = '') => {
    setLoading(true);
    try {
      const data = await employeeApi.getAll(query);
      setEmployees(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsList = async () => {
    try {
      const data = await eventApi.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events list for task assignments', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchEventsList();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Events',
      designation: 'Event Coordinator',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 25000,
      emergencyContact: '',
      address: '',
      status: 'ACTIVE',
      password: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmployee(emp);
    setFormData({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      phone: emp.user?.mobile || '',
      department: emp.department || '',
      designation: emp.designation || 'Event Coordinator',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      salary: emp.salary ? Number(emp.salary) : 0,
      emergencyContact: emp.emergencyContact || '',
      address: emp.address || '',
      status: emp.status
    });
    setIsEditOpen(true);
  };

  const handleOpenProfile = async (emp: Employee) => {
    setLoading(true);
    try {
      const details = await employeeApi.getById(emp.id);
      setSelectedEmployee(details);
      setIsProfileOpen(true);
    } catch (err) {
      addToast('Failed to load employee profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeApi.create(formData);
      addToast('Employee registered successfully.', 'success');
      setIsAddOpen(false);
      fetchEmployees();
    } catch (err: any) {
      addToast(err.message || 'Failed to register employee.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      await employeeApi.update(selectedEmployee.id, formData);
      addToast('Employee details updated successfully.', 'success');
      setIsEditOpen(false);
      fetchEmployees();
    } catch (err: any) {
      addToast(err.message || 'Failed to update employee details.', 'error');
    }
  };

  const handleToggleActive = async (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = emp.user?.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this employee's account?`)) {
      return;
    }

    try {
      const res = await employeeApi.toggleActive(emp.id);
      addToast(res.message, 'success');
      fetchEmployees();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle account status.', 'error');
    }
  };

  const handleOpenAssignTask = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: new Date().toISOString().split('T')[0],
      eventId: ''
    });
    setIsAssignTaskOpen(true);
  };

  const handleOpenPasswordChange = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setIsPasswordOpen(true);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Current password, new password, and confirm password are required.');
      return;
    }

    if (newPassword.trim().length === 0) {
      setPasswordError('New password cannot be empty.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from the current password.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      const response = await employeeApi.changePassword(selectedEmployee.id, {
        currentPassword,
        newPassword,
        confirmPassword
      });
      addToast(response.message || 'Password changed successfully.', 'success');
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAssignTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (!taskForm.eventId) {
      addToast('Please select an event to assign the task to.', 'error');
      return;
    }

    try {
      await eventApi.createTask(taskForm.eventId, {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        assignedTo: selectedEmployee.id
      });
      addToast('Task assigned to employee successfully.', 'success');
      setIsAssignTaskOpen(false);
      handleOpenProfile(selectedEmployee);
    } catch (err: any) {
      addToast(err.message || 'Failed to assign task.', 'error');
    }
  };

  const columns = [
    { key: 'employeeCode', header: 'Emp Code', render: (emp: Employee) => <span className="font-bold text-gold-600">{emp.employeeCode}</span> },
    { key: 'name', header: 'Name', render: (emp: Employee) => <span className="font-semibold text-primary-800">{emp.user?.name || 'Staff Member'}</span> },
    { key: 'designation', header: 'Role/Designation' },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Status',
      render: (emp: Employee) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
          emp.status === 'ACTIVE'
            ? 'bg-green-50 text-green-700 border border-green-150'
            : emp.status === 'ON_LEAVE'
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
            : 'bg-red-50 text-red-700 border border-red-150'
        }`}>
          {emp.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (emp: Employee) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={() => handleOpenProfile(emp)}>
            <Eye size={14} />
          </Button>
          <Button variant="secondary" className="!p-1.5 !px-2 rounded" onClick={(e) => handleOpenEdit(emp, e)}>
            <Edit2 size={14} />
          </Button>
          <Button
            variant="secondary"
            className="!p-1.5 !px-2 rounded hover:bg-neutral-100"
            onClick={(e) => handleToggleActive(emp, e)}
          >
            {emp.user?.isActive ? <ToggleRight className="text-green-600" size={16} /> : <ToggleLeft className="text-neutral-400" size={16} />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-primary-800 font-serif">Staff & Employees</h3>
          <p className="text-xs text-neutral-400 mt-1">Manage event planners, coordinators, catering crews, and field staff</p>
        </div>
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto gap-2">
          <UserPlus size={16} /> Add Employee
        </Button>
      </div>

      {/* Search filters */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by code, role, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={18} />}
        />
        <Button type="submit" variant="gold" className="!py-2">Search</Button>
      </form>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-luxury text-sm">
          {error}
        </div>
      ) : (
        <DashboardCard title="Employee Directory" subtitle="List of all registered staff members">
          <Table
            columns={columns}
            data={employees}
            loading={loading}
            emptyMessage="No employees found."
            onRowClick={handleOpenProfile}
          />
        </DashboardCard>
      )}

      {/* ADD EMPLOYEE MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Employee">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Role/Designation</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.designation || 'Event Coordinator'}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                {DESIGNATIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
            <Input
              label="Salary (INR / month)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Number"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
            <Input
              label="Password (optional, default: employee123)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Register Staff</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Employee Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Role/Designation</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                {DESIGNATIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Salary (INR / month)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Employee Status</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON LEAVE</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>
          </div>
          <Input
            label="Emergency Contact Number"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* EMPLOYEE DETAIL PROFILE MODAL */}
      <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Employee Staff Profile" size="lg">
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Staff Info */}
            <div className="border-b border-cream-150 pb-4">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-md font-bold text-primary-800 font-serif flex items-center gap-2">
                  <Briefcase size={16} className="text-gold-500" /> Staff Personal Info
                </h5>
                <span className="text-xs font-bold text-gold-600 bg-cream-100 px-2.5 py-1 rounded">
                  {selectedEmployee.employeeCode}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Name</span>
                  <span className="text-primary-800 font-semibold">{selectedEmployee.user?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Email</span>
                  <span className="text-primary-800 flex items-center gap-1"><Mail size={12} /> {selectedEmployee.user?.email}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Phone</span>
                  <span className="text-primary-800 flex items-center gap-1"><Phone size={12} /> {selectedEmployee.user?.mobile}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Designation</span>
                  <span className="text-primary-800 font-semibold">{selectedEmployee.designation}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Department</span>
                  <span className="text-primary-800">{selectedEmployee.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Salary</span>
                  <span className="text-primary-800">₹{Number(selectedEmployee.salary || 0).toLocaleString('en-IN')}/mo</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Joining Date</span>
                  <span className="text-primary-800 flex items-center gap-1">
                    <Calendar size={12} /> {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Emergency Contact</span>
                  <span className="text-primary-800">{selectedEmployee.emergencyContact || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Account Access</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    selectedEmployee.user?.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedEmployee.user?.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              {selectedEmployee.address && (
                <div className="mt-3 text-sm">
                  <span className="text-xs text-neutral-400 block font-bold uppercase">Address</span>
                  <span className="text-primary-800 flex items-center gap-1"><MapPin size={12} /> {selectedEmployee.address}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-2 mb-4">
              <Button onClick={handleOpenPasswordChange} variant="secondary" className="!py-1.5 !px-3 rounded text-xs gap-1">
                Change Password
              </Button>
            </div>

            {/* ASSIGNED TASKS */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-md font-bold text-primary-800 font-serif flex items-center gap-2">
                  <ListTodo size={16} className="text-gold-500" /> Assigned Coordinator Tasks
                </h5>
                <Button onClick={handleOpenAssignTask} variant="secondary" className="!py-1 !px-3 rounded text-xs gap-1">
                  <Plus size={12} /> Assign Task
                </Button>
              </div>

              {!selectedEmployee.tasks || selectedEmployee.tasks.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No tasks currently assigned to this coordinator.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedEmployee.tasks.map((task: any) => (
                    <div key={task.id} className="p-3 bg-white border border-cream-150 rounded flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-primary-800 block">{task.title}</span>
                        {task.description && <span className="text-neutral-500 block mb-1">{task.description}</span>}
                        {task.event && <span className="text-[10px] text-gold-600 font-semibold block">Event: {task.event.eventName}</span>}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          task.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {task.status}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-neutral-400 block mt-1 flex items-center justify-end gap-1">
                            <Clock size={10} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal isOpen={isPasswordOpen} onClose={() => { setIsPasswordOpen(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }} title="Change Password" size="sm">
        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={passwordError && !passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword ? passwordError : undefined}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />

          {passwordError && (
            <p className="text-[11px] font-medium text-red-500 mt-0.5 leading-tight">{passwordError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsPasswordOpen(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }}>Cancel</Button>
            <Button type="submit" variant="gold" loading={passwordLoading}>Change Password</Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TASK MODAL */}
      <Modal isOpen={isAssignTaskOpen} onClose={() => setIsAssignTaskOpen(false)} title="Assign Task to Staff">
        <form onSubmit={handleAssignTaskSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Assign to Event *</label>
            <select
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              required
              value={taskForm.eventId}
              onChange={(e) => setTaskForm({ ...taskForm, eventId: e.target.value })}
            >
              <option value="">-- Select Event --</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.eventName} ({evt.eventCode})</option>
              ))}
            </select>
          </div>
          <Input
            label="Task Title *"
            required
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary-800 tracking-wide">Task Description</label>
            <textarea
              className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary-800 tracking-wide">Priority</label>
              <select
                className="w-full bg-cream-50/50 border border-cream-200 rounded-luxury px-4 py-3 text-sm focus:outline-none focus:bg-white"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <Input
              label="Due Date *"
              type="date"
              required
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAssignTaskOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold">Assign Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
