import { Router } from 'express';
import { HallController } from '../controllers/hall.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new HallController();

// Public hall browsing and availability
router.get('/availability', (req, res) => controller.getAvailability(req, res));
router.get('/', (req, res) => controller.getHalls(req, res));

// Admin overview with assigned managers (Must precede /:id to avoid route collision)
router.get('/admin/overview', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.getAdminOverview(req, res));

// Owner/Manager-assigned hall route (Must precede /:id to avoid route collision)
router.get('/my-hall', authMiddleware, roleMiddleware(['Owner', 'Hall_Manager', 'Manager', 'Admin']), (req, res) => controller.getMyHall(req, res));
router.patch('/my-hall/status', authMiddleware, roleMiddleware(['Owner', 'Hall_Manager', 'Manager', 'Admin']), (req, res) => controller.updateMyHallStatus(req, res));
router.post('/my-hall/toggle-date', authMiddleware, roleMiddleware(['Owner', 'Hall_Manager', 'Manager', 'Admin']), (req, res) => controller.toggleDateAvailability(req, res));

// Admin Hall Manager Management endpoints
router.post('/:id/manager', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.assignManager(req, res));
router.post('/:id/manager/reset-password', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.resetManagerPassword(req, res));
router.patch('/:id/manager/toggle-active', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.toggleManagerActive(req, res));
router.delete('/:id/manager', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.revokeManager(req, res));

// Hall calendar bookings (Admin, Employee, or Owner/Manager of this hall)
router.get('/:id/bookings', authMiddleware, roleMiddleware(['Admin', 'Employee', 'Owner', 'Hall_Manager', 'Manager']), (req, res) => controller.getHallBookings(req, res));

// Public single hall details
router.get('/:id', (req, res) => controller.getHallById(req, res));

// Admin hall management
router.post('/', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.createHall(req, res));
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.updateHall(req, res));
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.deleteHall(req, res));

export default router;
