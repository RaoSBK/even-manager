import { Router } from 'express';
import { HallController } from '../controllers/hall.controller';
import { authMiddleware } from '../app';

const router = Router();
const controller = new HallController();

// Get hall availability (requires auth)
router.get('/availability', authMiddleware, (req, res) => controller.getAvailability(req, res));

export default router;
