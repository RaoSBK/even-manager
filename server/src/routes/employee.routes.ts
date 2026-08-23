import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new EmployeeController();

router.use(authMiddleware);
router.use(roleMiddleware(['Employee', 'Admin']));

// Workstation profiles
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

// Workstation dashboards
router.get('/dashboard', controller.getDashboardStats);

// Tasks management checklist
router.get('/tasks', controller.getTasks);
router.patch('/tasks/:id/status', controller.updateTaskStatus);

// Assigned events registry
router.get('/events', controller.getEvents);

// Daily attendance clock
router.get('/attendance/today', controller.getTodayAttendance);
router.post('/attendance/check-in', controller.checkIn);
router.post('/attendance/check-out', controller.checkOut);
router.get('/attendance/history', controller.getAttendanceHistory);

// User-specific notification inbox
router.get('/notifications', controller.getNotifications);
router.patch('/notifications/:id/read', controller.markNotificationRead);
router.post('/notifications/mark-all-read', controller.markAllNotificationsRead);

export default router;
