import { Router } from 'express';
import { HallController } from '../controllers/hall.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new HallController();

// Get hall availability (requires auth)
router.get('/availability', authMiddleware, (req, res) => controller.getAvailability(req, res));

// CRUD
router.get('/', authMiddleware, (req, res) => controller.getHalls(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getHallById(req, res));
router.post('/', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.createHall(req, res));
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.updateHall(req, res));
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.deleteHall(req, res));

// Calendar feeds
router.get('/:id/bookings', authMiddleware, (req, res) => controller.getHallBookings(req, res));

export default router;
