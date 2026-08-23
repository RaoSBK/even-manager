import { Router } from 'express';
import { TravelController } from '../controllers/travel.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new TravelController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin', 'Employee']), controller.create);
router.put('/:id', roleMiddleware(['Admin', 'Employee']), controller.update);
router.delete('/:id', roleMiddleware(['Admin']), controller.delete);

export default router;
