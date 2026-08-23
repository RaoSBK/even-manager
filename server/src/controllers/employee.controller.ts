import { Request, Response } from 'express';
import prisma from '../config/database';
import { TaskStatus, Priority, TravelStatus, AttendanceStatus, InvoiceStatus, PlanningStatus } from '@prisma/client';

export class EmployeeController {
  private getEmployee = async (userId: string) => {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { user: true }
    });
    if (!employee) {
      throw new Error('EMPLOYEE_RECORD_NOT_FOUND');
    }
    return employee;
  };

  private getTodayDateRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      res.status(200).json(employee);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { name, email, mobile, address, emergencyContact } = req.body;

      // Update User fields
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          name,
          email,
          mobile
        }
      });

      // Update Employee fields
      const updated = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          address,
          emergencyContact
        },
        include: { user: true }
      });

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { start: todayStart, end: todayEnd } = this.getTodayDateRange();

      // 1. Assigned events counts
      const assignedEventsCount = await prisma.event.count({
        where: {
          OR: [
            { tasks: { some: { assignedTo: employee.id } } },
            { eventPlans: { some: { responsibleEmployeeId: employee.id } } }
          ]
        }
      });

      const upcomingEventsCount = await prisma.event.count({
        where: {
          eventDate: { gte: todayStart },
          OR: [
            { tasks: { some: { assignedTo: employee.id } } },
            { eventPlans: { some: { responsibleEmployeeId: employee.id } } }
          ]
        }
      });

      // 2. Tasks counts
      const todayTasksCount = await prisma.task.count({
        where: {
          assignedTo: employee.id,
          dueDate: { gte: todayStart, lte: todayEnd }
        }
      });

      const todayCompletedTasksCount = await prisma.task.count({
        where: {
          assignedTo: employee.id,
          status: 'COMPLETED',
          dueDate: { gte: todayStart, lte: todayEnd }
        }
      });

      const totalTasksCount = await prisma.task.count({
        where: { assignedTo: employee.id }
      });

      const totalCompletedTasksCount = await prisma.task.count({
        where: { assignedTo: employee.id, status: 'COMPLETED' }
      });

      // 3. Attendance & Duty Hours today
      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          checkIn: { gte: todayStart, lte: todayEnd }
        }
      });

      let attendanceStatus = 'Checked Out';
      let checkInTime = null;
      let checkOutTime = null;
      let dutyHours = 0;

      if (todayAttendance) {
        checkInTime = todayAttendance.checkIn.toISOString();
        if (todayAttendance.checkOut) {
          checkOutTime = todayAttendance.checkOut.toISOString();
          dutyHours = (todayAttendance.checkOut.getTime() - todayAttendance.checkIn.getTime()) / (1000 * 60 * 60);
          attendanceStatus = 'Checked Out';
        } else {
          dutyHours = (new Date().getTime() - todayAttendance.checkIn.getTime()) / (1000 * 60 * 60);
          attendanceStatus = 'Checked In';
        }
      }

      res.status(200).json({
        employeeId: employee.employeeCode,
        employeeName: employee.user?.name,
        role: employee.designation,
        attendanceStatus,
        checkInTime,
        checkOutTime,
        stats: {
          assignedEvents: assignedEventsCount,
          upcomingEvents: upcomingEventsCount,
          todayTasks: todayTasksCount,
          todayCompletedTasks: todayCompletedTasksCount,
          todayPendingTasks: todayTasksCount - todayCompletedTasksCount,
          totalTasks: totalTasksCount,
          totalCompletedTasks: totalCompletedTasksCount,
          taskProgressPercent: totalTasksCount > 0 ? Math.round((totalCompletedTasksCount / totalTasksCount) * 100) : 0,
          todayDutyHours: Number(dutyHours.toFixed(2))
        }
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { search, status, priority, eventId, date } = req.query;

      const where: any = { assignedTo: employee.id };

      if (status) {
        where.status = status as TaskStatus;
      }
      if (priority) {
        where.priority = priority as Priority;
      }
      if (eventId) {
        where.eventId = eventId as string;
      }
      if (date) {
        const queryDate = new Date(date as string);
        const start = new Date(queryDate.setHours(0, 0, 0, 0));
        const end = new Date(queryDate.setHours(23, 59, 59, 999));
        where.dueDate = { gte: start, lte: end };
      }
      if (search) {
        where.title = { contains: search as string, mode: 'insensitive' };
      }

      const tasks = await prisma.task.findMany({
        where,
        include: { event: true },
        orderBy: { dueDate: 'asc' }
      });

      res.status(200).json(tasks);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { status } = req.body;
      const taskId = req.params.id as string;

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      if (task.assignedTo !== employee.id) {
        res.status(403).json({ message: 'Forbidden: You cannot modify this task' });
        return;
      }

      const nextStatus = status as TaskStatus;
      const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: nextStatus,
          completedAt
        },
        include: { event: true }
      });

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { filter, search } = req.query;

      const { start: todayStart } = this.getTodayDateRange();

      const where: any = {
        OR: [
          { tasks: { some: { assignedTo: employee.id } } },
          { eventPlans: { some: { responsibleEmployeeId: employee.id } } }
        ]
      };

      if (search) {
        where.eventName = { contains: search as string, mode: 'insensitive' };
      }

      if (filter === 'upcoming') {
        where.eventDate = { gte: todayStart };
        where.status = { not: 'CANCELLED' };
      } else if (filter === 'today') {
        const { start, end } = this.getTodayDateRange();
        where.eventDate = { gte: start, lte: end };
      } else if (filter === 'completed') {
        where.status = 'COMPLETED';
      } else if (filter === 'cancelled') {
        where.status = 'CANCELLED';
      }

      const events = await prisma.event.findMany({
        where,
        include: { customer: true, hallBookings: true },
        orderBy: { eventDate: 'asc' }
      });

      res.status(200).json(events);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getTodayAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { start, end } = this.getTodayDateRange();

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          checkIn: { gte: start, lte: end }
        }
      });

      res.status(200).json(attendance);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  checkIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { start, end } = this.getTodayDateRange();

      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          checkIn: { gte: start, lte: end }
        }
      });

      if (existing) {
        res.status(400).json({ message: 'ALREADY_CHECKED_IN' });
        return;
      }

      const now = new Date();
      // Determine if late (e.g. check in after 9:15 AM)
      const limit = new Date();
      limit.setHours(9, 15, 0, 0);
      const status = now > limit ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

      const record = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: start,
          checkIn: now,
          status
        }
      });

      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  checkOut = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const { start, end } = this.getTodayDateRange();

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          checkIn: { gte: start, lte: end }
        }
      });

      if (!attendance) {
        res.status(400).json({ message: 'NOT_CHECKED_IN' });
        return;
      }

      if (attendance.checkOut) {
        res.status(400).json({ message: 'ALREADY_CHECKED_OUT' });
        return;
      }

      const record = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: new Date()
        }
      });

      res.status(200).json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAttendanceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.getEmployee(req.user!.id);
      const records = await prisma.attendance.findMany({
        where: { employeeId: employee.id },
        orderBy: { date: 'desc' }
      });

      // Calculate working hours dynamically for frontend representation
      const mapped = records.map((r) => {
        let hrs = 0;
        if (r.checkIn) {
          const checkOutTime = r.checkOut ? new Date(r.checkOut) : new Date();
          hrs = (checkOutTime.getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60);
        }
        return {
          ...r,
          workingHours: Number(hrs.toFixed(2))
        };
      });

      res.status(200).json(mapped);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const list = await prisma.notification.findMany({
        where: {
          OR: [
            { userId: req.user!.id },
            { userId: null }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const notifId = req.params.id as string;
      const notif = await prisma.notification.findUnique({ where: { id: notifId } });
      if (!notif) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      if (notif.userId && notif.userId !== req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id: notifId },
        data: { read: true }
      });
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: req.user!.id,
          read: false
        },
        data: { read: true }
      });
      res.status(200).json({ message: 'ALL_MARKED_READ' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
export default EmployeeController;
