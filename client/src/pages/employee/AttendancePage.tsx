import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { employeeWorkstationApi, AttendanceRecord } from '../../api/employeeWorkstationApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { Clock, Play, Square } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { addToast } = useNotifications();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendanceData = async () => {
    try {
      const today = await employeeWorkstationApi.getTodayAttendance();
      setTodayRecord(today);

      const logs = await employeeWorkstationApi.getAttendanceHistory();
      setHistory(logs);
    } catch {
      addToast('Failed to load attendance logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await employeeWorkstationApi.checkIn();
      addToast('Clock-in registered successfully.', 'success');
      fetchAttendanceData();
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || 'Failed to check in.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!window.confirm('Are you sure you want to clock out for today?')) return;
    setActionLoading(true);
    try {
      await employeeWorkstationApi.checkOut();
      addToast('Clock-out registered successfully.', 'success');
      fetchAttendanceData();
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || 'Failed to check out.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-50 text-green-700 border border-green-150';
      case 'LATE':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-150';
      case 'HALF_DAY':
        return 'bg-orange-50 text-orange-700 border border-orange-150';
      default:
        return 'bg-red-50 text-red-700 border border-red-150';
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => new Date(r.date).toLocaleDateString() },
    { key: 'checkIn', header: 'Clock In', render: (r: AttendanceRecord) => new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { key: 'checkOut', header: 'Clock Out', render: (r: AttendanceRecord) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--' },
    { key: 'workingHours', header: 'Duty Hours', render: (r: AttendanceRecord) => `${r.workingHours} Hrs` },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${getStatusBadge(r.status)}`}>{r.status}</span> }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-2xl font-bold text-primary-800 font-serif">Attendance Tracker</h3>
        <p className="text-xs text-neutral-400 mt-1">Clock in, clock out, and review monthly attendance logs and leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clock In / Out Panel */}
        <DashboardCard title="Daily Attendance Console" subtitle="Submit clock-in and trace work hours" className="md:col-span-2">
          {loading ? (
            <p className="text-xs text-neutral-400">Loading daily status...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-cream-50/20 border border-cream-150 p-4 rounded-luxury">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Current Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${todayRecord && !todayRecord.checkOut ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-sm font-bold text-primary-800">
                      {todayRecord ? (todayRecord.checkOut ? 'Clocked Out' : 'Active Clock In') : 'No clocked shift today'}
                    </span>
                  </div>
                </div>

                {todayRecord && (
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-neutral-400 block">CLOCK IN</span>
                      <span>{new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block">CLOCK OUT</span>
                      <span>{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCheckIn}
                  disabled={!!todayRecord || actionLoading}
                  variant="gold"
                  className="flex-1 py-3 gap-2"
                >
                  <Play size={16} /> Clock In Shift
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!todayRecord || !!todayRecord.checkOut || actionLoading}
                  variant="secondary"
                  className="flex-1 py-3 gap-2 border border-cream-300 text-neutral-600"
                >
                  <Square size={16} /> Clock Out Shift
                </Button>
              </div>
            </div>
          )}
        </DashboardCard>

        {/* Shift Details Info Card */}
        <div className="bg-white border border-cream-150 p-6 rounded-luxury shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-primary-800 flex items-center gap-1.5"><Clock size={16} className="text-gold-600" /> General Day Shift</h4>
            <p className="text-xs text-neutral-400">Our default business hours are from 09:00 AM to 06:00 PM. Clock-ins after 09:15 AM will automatically mark your attendance status as "LATE".</p>
          </div>
          <div className="border-t border-cream-100 pt-4 mt-4 text-[10px] text-neutral-400">
            Ensure you check out at the end of your shift to log hours accurately.
          </div>
        </div>
      </div>

      {/* History Ledger Table */}
      <DashboardCard title="Attendance Logs History" subtitle="Verification logs and monthly audit tracker">
        <Table
          columns={columns}
          data={history}
          loading={loading}
          emptyMessage="No attendance logs found in history."
        />
      </DashboardCard>
    </div>
  );
};

export default AttendancePage;
