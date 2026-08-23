import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new NotificationController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.patch('/:id/read', roleMiddleware(['Admin', 'Employee']), controller.markRead);
router.post('/mark-all-read', roleMiddleware(['Admin', 'Employee']), controller.markAllRead);
router.delete('/clear-all', roleMiddleware(['Admin', 'Employee']), controller.clearAll);

export default router;
