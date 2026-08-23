import { httpClient } from './httpClient';
import { Employee } from './employeeApi';
import { Task } from './taskApi';
import { EventDetails } from './eventApi';
import { Notification } from './notificationApi';

export interface WorkstationDashboardStats {
  employeeId: string;
  employeeName: string;
  role: string;
  attendanceStatus: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  stats: {
    assignedEvents: number;
    upcomingEvents: number;
    todayTasks: number;
    todayCompletedTasks: number;
    todayPendingTasks: number;
    totalTasks: number;
    totalCompletedTasks: number;
    taskProgressPercent: number;
    todayDutyHours: number;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  workingHours: number;
  createdAt: string;
}

export const employeeWorkstationApi = {
  getProfile: () =>
    httpClient.get<Employee>('/employee/profile'),

  updateProfile: (data: { name: string; email: string; mobile: string; address?: string; emergencyContact?: string }) =>
    httpClient.put<Employee>('/employee/profile', data),

  getDashboardStats: () =>
    httpClient.get<WorkstationDashboardStats>('/employee/dashboard'),

  getTasks: (filters: { search?: string; status?: string; priority?: string; eventId?: string; date?: string } = {}) =>
    httpClient.get<Task[]>('/employee/tasks', filters),

  updateTaskStatus: (id: string, status: string) =>
    httpClient.patch<Task>(`/employee/tasks/${id}/status`, { status }),

  getEvents: (filters: { filter?: 'upcoming' | 'today' | 'completed' | 'cancelled'; search?: string } = {}) =>
    httpClient.get<EventDetails[]>('/employee/events', filters),

  getTodayAttendance: () =>
    httpClient.get<AttendanceRecord | null>('/employee/attendance/today'),

  checkIn: () =>
    httpClient.post<AttendanceRecord>('/employee/attendance/check-in', {}),

  checkOut: () =>
    httpClient.post<AttendanceRecord>('/employee/attendance/check-out', {}),

  getAttendanceHistory: () =>
    httpClient.get<AttendanceRecord[]>('/employee/attendance/history'),

  getNotifications: () =>
    httpClient.get<Notification[]>('/employee/notifications'),

  markNotificationRead: (id: string) =>
    httpClient.patch<Notification>(`/employee/notifications/${id}/read`, {}),

  markAllNotificationsRead: () =>
    httpClient.post<{ message: string }>('/employee/notifications/mark-all-read', {})
};
