import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new SettingsController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.post('/', roleMiddleware(['Admin']), controller.update);

export default router;
